import { redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import type { Selectable } from "kysely";
import {
  addOptionTransactionSchema,
  rollCoveredCallSchema,
} from "~/lib/schemas/option";
import { db } from "~/lib/server/db";
import { AssetClass, HoldingType } from "~/lib/server/db/enums";
import { withTags } from "~/lib/server/db/helpers";
import type { Holding } from "~/lib/server/db/schema";
import { formatClosedCoveredCalls } from "~/lib/server/formatters/closedCoveredCallFormatter";
import {
  formatCoveredCallRollData,
  formatCoveredCalls,
} from "~/lib/server/formatters/coveredCallFormatter";
import { formatStockForOptionIdea } from "~/lib/server/formatters/stocksFormatter";
import type { FormattedCoveredCall } from "~/lib/server/formatters/types";
import { getContractSymbol } from "~/lib/server/formatters/utils";
import logger from "~/lib/server/logger";
import { relationsById } from "~/lib/server/utils/db";
import { buildHolding } from "~/lib/server/utils/transactions";
import { closest } from "~/lib/utils";
import { serverFunctionStandardValidator } from "~/lib/utils/form";
import { authMiddleware } from "./middleware";
import { getExpiries, getOptionChain } from "./symbol";

export const getOptionHoldings = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const coveredCalls = await db
      .selectFrom("Holding")
      .selectAll()
      .select(withTags)
      .where("userId", "=", context.user.id)
      .where("type", "=", HoldingType.COVERED_CALL)
      .where("closed", "!=", true)
      .execute();
    if (!coveredCalls.length) return [];

    const transactions = await db
      .selectFrom("Transaction")
      .selectAll()
      .where(
        "holdingId",
        "in",
        coveredCalls.map((h) => h.id)
      )
      .execute();

    const transactionsById = relationsById(transactions);
    const portfolio = coveredCalls.map((holding) => ({
      ...holding,
      transactions: transactionsById[holding.id] ?? [],
    }));
    const formattedCoveredCalls = await formatCoveredCalls(portfolio);
    return formattedCoveredCalls.sort((a, b) =>
      a.symbol.localeCompare(b.symbol)
    );
  });

export const getClosedOptionHoldings = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const coveredCalls = await db
      .selectFrom("Holding")
      .selectAll()
      .select(withTags)
      .where("userId", "=", context.user.id)
      .where("type", "=", HoldingType.COVERED_CALL)
      .where("closed", "=", true)
      .execute();
    if (!coveredCalls.length) return [];

    const transactions = await db
      .selectFrom("Transaction")
      .selectAll()
      .where(
        "holdingId",
        "in",
        coveredCalls.map((h) => h.id)
      )
      .execute();

    const transactionsById = relationsById(transactions);
    const portfolio = coveredCalls.map((holding) => ({
      ...holding,
      transactions: transactionsById[holding.id] ?? [],
    }));
    const formattedCoveredCalls = await formatClosedCoveredCalls(portfolio);
    return formattedCoveredCalls.sort((a, b) =>
      a.symbol.localeCompare(b.symbol)
    );
  });

// TODO: types
export const createOptionTransaction = createServerFn({ method: "POST" })
  .validator(serverFunctionStandardValidator(addOptionTransactionSchema))
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    const contract =
      data.contract ||
      getContractSymbol(
        data.symbol,
        data.strike,
        data.expiry,
        data.type.toLowerCase() as "call" | "put"
      );
    await db
      .insertInto("Transaction")
      .values({
        quantity: data.quantity,
        price: data.price,
        holdingId: data.holding,
        date: new Date(data.date),
        userId: context.user.id,
        symbol: contract,
        type: data.type,
      })
      .execute();
    logger.info(
      `User ${context.user.id} has placed an option order for ${contract}`
    );

    const option = await db
      .selectFrom("Holding")
      .selectAll()
      .select(withTags)
      .where("id", "=", data.holding)
      .where("userId", "=", context.user.id)
      .executeTakeFirstOrThrow();
    const transactions = await db
      .selectFrom("Transaction")
      .selectAll()
      .where("holdingId", "=", option.id)
      .execute();

    const formattedOption = await formatCoveredCalls([
      { ...option, transactions },
    ]);
    return formattedOption[0];
  });

export const createCoveredCallHolding = createServerFn({ method: "POST" })
  .validator((d) => d)
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    const contract =
      data.contract ??
      getContractSymbol(
        data.symbol,
        data.call.strike,
        Number.parseInt(data.call.expiry),
        "call"
      );

    let holdingId: number = data.holding;
    if (!holdingId) {
      const newHolding = await db
        .insertInto("Holding")
        .values({
          type: data.type,
          symbol: data.symbol,
          userId: context.user.id,
        })
        .returning("id")
        .executeTakeFirstOrThrow();

      if (data.tags.length)
        await db
          .insertInto("HoldingTag")
          .values(
            data.tags
              .split(",")
              .map((tag) => ({ holdingId: newHolding.id, tagId: Number(tag) }))
          )
          .execute();
      holdingId = newHolding.id;
    }

    await db
      .insertInto("Transaction")
      .values([
        {
          quantity: Number(data.call.quantity),
          price: Number(data.call.price),
          date: new Date(data.call.date),
          holdingId,
          userId: context.user.id,
          symbol: contract,
          type: AssetClass.CALL,
        },
        {
          quantity: Number(data.stock.quantity),
          price: Number(data.stock.price),
          date: new Date(data.stock.date),
          holdingId,
          userId: context.user.id,
          symbol: data.symbol,
          type: AssetClass.STOCK,
        },
      ])
      .execute();
    logger.info(
      `User ${context.user.id} has placed a covered call order for ${contract}`
    );
    throw redirect({ to: "/holdings/options" });
  });

export const rollCoveredCall = createServerFn({ method: "POST" })
  .validator(serverFunctionStandardValidator(rollCoveredCallSchema))
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    const closeContract = getContractSymbol(
      data.holding.symbol,
      data.close.strike,
      data.close.expiry,
      "call"
    );
    const openContract = getContractSymbol(
      data.holding.symbol,
      data.open.strike,
      data.open.expiry,
      "call"
    );

    const transactions = await db
      .insertInto("Transaction")
      .values([
        {
          quantity: data.close.quantity,
          price: data.close.price,
          holdingId: data.holding.id,
          date: new Date(data.close.date),
          userId: context.user.id,
          symbol: closeContract,
          type: AssetClass.CALL,
        },
        {
          quantity: data.open.quantity,
          price: data.open.price,
          holdingId: data.holding.id,
          date: new Date(data.open.date),
          userId: context.user.id,
          symbol: openContract,
          type: AssetClass.CALL,
        },
      ])
      .returning("id")
      .execute();

    if (transactions.length === 2) {
      const holding = await buildHolding(data.holding.id);
      logger.info(
        `User ${context.user.id} has rolled covered call ${closeContract} to ${openContract}`
      );
      return holding;
    }
    throw new Error("Error when rolling option");
  });

export const getCoveredCallRollData = createServerFn({ method: "POST" })
  .validator(
    (d: { openOptions: FormattedCoveredCall[]; id?: number; to?: string }) => d
  )
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    let holdings: (Selectable<Holding> & { contractSymbol?: string })[];
    if (data.id && data.to) {
      holdings = [
        {
          ...(await db
            .selectFrom("Holding")
            .selectAll()
            .where("id", "=", data.id)
            .where("userId", "=", context.user.id)
            .executeTakeFirstOrThrow()),
          contractSymbol: data.to.toString(),
        },
      ];
    } else {
      holdings = await db
        .selectFrom("Holding")
        .selectAll()
        .where("userId", "=", context.user.id)
        .where("type", "=", HoldingType.COVERED_CALL)
        .where("closed", "=", false)
        .execute();
    }

    const rollData = await formatCoveredCallRollData(
      holdings,
      data.openOptions
    );
    return rollData;
  });

export const compareOptions = createServerFn({ method: "POST" })
  .validator((d: { symbol: string; target: number }) => d)
  .middleware([authMiddleware])
  .handler(async ({ data }) => {
    const expiries = await getExpiries({ data: data.symbol });
    const expiry = expiries.reduce(closest(data.target));

    const expireIndex = expiries.indexOf(expiry);
    const chains = await Promise.all([
      getOptionChain({
        data: { symbol: data.symbol, date: expiry },
      }),
      getOptionChain({
        data: { symbol: data.symbol, date: expiries[expireIndex - 1] },
      }),
      getOptionChain({
        data: { symbol: data.symbol, date: expiries[expireIndex + 1] },
      }),
    ]);

    const ideaDetails = await formatStockForOptionIdea(data.symbol);
    return chains
      .flatMap((chain) => chain?.options ?? [])
      .filter((option) => option !== null && option !== undefined)
      .map((option) => toCompareOption(option, ideaDetails, option.type));
  });

interface IdeaDetails {
  price: number;
  exDividendDate: Date | null;
  annualDividend: number;
}
const toCompareOption = (
  item: {
    type: "put" | "call";
    strike: number;
    contractSymbol: string;
    bid: number;
    ask: number;
    expiry: number;
    impliedVolatility: number;
    openInterest: number;
    delta: number;
  },
  stock: IdeaDetails,
  type: "call" | "put"
) => {
  const daysToExpiry = Math.ceil(
    (item.expiry - Date.now()) / 1000 / 60 / 60 / 24 + 1
  );
  let pa: number;
  let downPT: number;
  if (type === "call") {
    const divPaymentsToExpiry =
      stock.exDividendDate && stock.exDividendDate.getTime() < item.expiry
        ? (stock.annualDividend / 4) *
          (1 +
            Math.floor(
              ((item.expiry - stock.exDividendDate.getTime()) /
                1000 /
                60 /
                60 /
                24 /
                365) *
                stock.annualDividend
            ))
        : 0;
    const ccBasis = stock.price - ((item.bid ?? 0) + (item.ask ?? 0)) / 2;
    const pftNoChg =
      (Math.min(stock.price, item.strike) + divPaymentsToExpiry) / ccBasis - 1;
    pa = (pftNoChg * 365) / daysToExpiry;
    downPT = 1 - (ccBasis - divPaymentsToExpiry) / stock.price;
  } else {
    const pwBasis = item.strike - ((item.bid ?? 0) + (item.ask ?? 0)) / 2;
    const pftNoChgPut = Math.min(stock.price, item.strike) / pwBasis - 1;
    pa = (pftNoChgPut * 365) / daysToExpiry;
    downPT = 1 - pwBasis / stock.price;
  }
  const iv = item.impliedVolatility;
  const paPlusPT = pa + downPT;
  return { ...item, pa, downPT, paPlusPT, iv, expireDate: item.expiry, type };
};
