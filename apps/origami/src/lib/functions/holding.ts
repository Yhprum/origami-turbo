import { redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { type } from "arktype";
import { authMiddleware } from "~/lib/functions/middleware";
import { createHoldingSchema } from "~/lib/schemas/holding";
import { db } from "~/lib/server/db";
import { HoldingType } from "~/lib/server/db/enums";
import { withTags } from "~/lib/server/db/helpers";
import { formatBonds } from "~/lib/server/formatters/bondsFormatter";
import { formatClosedBonds } from "~/lib/server/formatters/closedBondsFormatter";
import { formatClosedStocks } from "~/lib/server/formatters/closedStocksFormatter";
import { formatStocks } from "~/lib/server/formatters/stocksFormatter";
import type {
  FormattedBond,
  FormattedClosedSecurity,
  FormattedStock,
} from "~/lib/server/formatters/types";
import logger from "~/lib/server/logger";
import { relationsById } from "~/lib/server/utils/db";
import { buildHolding } from "~/lib/server/utils/transactions";
import { serverFunctionStandardValidator } from "~/lib/utils/form";

export const getHoldings = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const holdings = await db
      .selectFrom("Holding")
      .selectAll()
      .select(withTags)
      .where("userId", "=", context.user.id)
      .where("closed", "!=", true)
      .where("type", "in", [
        HoldingType.STOCK,
        HoldingType.BOND,
        HoldingType.MUTUAL_FUND,
      ])
      .execute();
    if (!holdings.length) return [];

    const transactions = await db
      .selectFrom("Transaction")
      .selectAll()
      .where(
        "holdingId",
        "in",
        holdings.map((h) => h.id)
      )
      .execute();
    const income = await db
      .selectFrom("Income")
      .selectAll()
      .where(
        "holdingId",
        "in",
        holdings.map((h) => h.id)
      )
      .execute();
    const open = await db
      .selectFrom("OpenOrder")
      .selectAll()
      .where(
        "holdingId",
        "in",
        holdings.map((h) => h.id)
      )
      .$narrowType<{ holdingId: number }>()
      .execute();

    const transactionsById = relationsById(transactions);
    const incomeById = relationsById(income);
    const openOrdersById = relationsById(open);

    const portfolio = holdings.map((holding) => ({
      ...holding,
      transactions: transactionsById[holding.id] ?? [],
      income: incomeById[holding.id] ?? [],
      open: openOrdersById[holding.id] ?? [],
    }));

    const stockHoldings = portfolio.filter(
      (h) => h.type === HoldingType.STOCK || h.type === HoldingType.MUTUAL_FUND
    );
    const bondHoldings = portfolio.filter((h) => h.type === HoldingType.BOND);
    const formattedHoldings = await Promise.all([
      formatStocks(stockHoldings),
      formatBonds(bondHoldings),
    ]);

    return formattedHoldings
      .flat()
      .sort((a, b) => a.symbol.localeCompare(b.symbol)) as (FormattedStock &
      FormattedBond)[];
  });

export const getHolding = createServerFn({ method: "GET" })
  .validator(serverFunctionStandardValidator(type("number")))
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    const holding = await db
      .selectFrom("Holding")
      .select(["id", "symbol", "type"])
      .where("id", "=", data)
      .where("userId", "=", context.user.id)
      .executeTakeFirst();

    if (!holding) throw new Error("Holding not found");
    return holding;
  });

export const getClosedHoldings = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const closedHoldings = await db
      .selectFrom("Holding")
      .selectAll()
      .select(withTags)
      .where("userId", "=", context.user.id)
      .where("type", "in", [
        HoldingType.STOCK,
        HoldingType.BOND,
        HoldingType.MUTUAL_FUND,
      ])
      .execute();
    if (!closedHoldings.length) return [];

    const transactions = await db
      .selectFrom("Transaction")
      .selectAll()
      .where(
        "holdingId",
        "in",
        closedHoldings.map((h) => h.id)
      )
      .execute();
    const income = await db
      .selectFrom("Income")
      .selectAll()
      .where(
        "holdingId",
        "in",
        closedHoldings.map((h) => h.id)
      )
      .execute();

    const transactionsById = relationsById(transactions);
    const incomeById = relationsById(income);

    const portfolio = closedHoldings.map((holding) => ({
      ...holding,
      transactions: transactionsById[holding.id] ?? [],
      income: incomeById[holding.id] ?? [],
    }));

    const stockHoldings = portfolio.filter(
      (h) => h.type === HoldingType.STOCK || h.type === HoldingType.MUTUAL_FUND
    );
    const bondHoldings = portfolio.filter((h) => h.type === HoldingType.BOND);
    const formattedHoldings = await Promise.all([
      formatClosedStocks(stockHoldings),
      formatClosedBonds(bondHoldings),
    ]);

    return formattedHoldings
      .flat()
      .filter((holding): holding is FormattedClosedSecurity => holding !== null)
      .sort((a, b) => a.symbol.localeCompare(b.symbol));
  });

export const updateHolding = createServerFn({ method: "POST" })
  .validator(
    serverFunctionStandardValidator(
      type({
        id: "number",
        field: "string",
        value: "string | string[] | boolean",
      })
    )
  )
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    if (
      !["buyTarget", "sellTarget", "notes", "category", "closed"].includes(
        data.field
      )
    )
      throw new Error("Invalid Field");
    await db
      .updateTable("Holding")
      .set({ [data.field]: data.value === "" ? null : data.value })
      .where("id", "=", data.id)
      .where("userId", "=", context.user.id)
      .execute();
    logger.info(
      `User ${context.user.id} has updated field ${data.field} for holding ${data.id}`
    );
    return { ok: true };
  });

export const createHolding = createServerFn({ method: "POST" })
  .validator(serverFunctionStandardValidator(createHoldingSchema))
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    const holding = await db
      .insertInto("Holding")
      .values({
        type: data.type,
        symbol: data.symbol,
        name: data.name,
        userId: context.user.id,
        category: data.category,
      })
      .returning("id")
      .executeTakeFirstOrThrow();

    if (data.tags.length)
      await db
        .insertInto("HoldingTag")
        .values(
          data.tags.map((tag) => ({
            holdingId: holding.id,
            tagId: Number(tag),
          }))
        )
        .execute();

    if (data.withTransaction) {
      await db
        .insertInto("Transaction")
        .values({
          quantity: data.transaction.quantity,
          price: data.transaction.price,
          date: new Date(data.transaction.date),
          holdingId: holding.id,
          userId: context.user.id,
          symbol: data.symbol,
          type: data.transaction.type,
        })
        .execute();
    }
    logger.info(
      `User ${context.user.id} has created a new holding for ${data.symbol}`
    );

    throw redirect({
      to: "/holdings/stocks",
    });
  });

export const deleteHolding = createServerFn({ method: "POST" })
  .validator(
    serverFunctionStandardValidator(
      type({ id: "number", cascade: "boolean = false" })
    )
  )
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    if (data.cascade)
      await db
        .deleteFrom("Transaction")
        .where("holdingId", "=", data.id)
        .where("userId", "=", context.user.id)
        .execute();
    await db
      .deleteFrom("Holding")
      .where("id", "=", data.id)
      .where("userId", "=", context.user.id)
      .execute();
    logger.info(`User ${context.user.id} has deleted holding ${data.id}`);
    return { ok: true };
  });

export const tagHolding = createServerFn({ method: "POST" })
  .validator(
    serverFunctionStandardValidator(
      type({ holdingId: "number", tagId: "number" })
    )
  )
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    const isValid = await db
      .selectFrom("User")
      .innerJoin("Holding", "Holding.userId", "User.id")
      .innerJoin("Tag", "Tag.userId", "User.id")
      .select("User.id")
      .where("Holding.id", "=", data.holdingId)
      .where("Tag.id", "=", data.tagId)
      .where("User.id", "=", context.user.id)
      .executeTakeFirst();
    if (!isValid) return false;

    const result = await db
      .insertInto("HoldingTag")
      .values(data)
      .executeTakeFirst();
    return Number(result.numInsertedOrUpdatedRows) === 1;
  });

export const untagHolding = createServerFn({ method: "POST" })
  .validator(
    serverFunctionStandardValidator(
      type({ holdingId: "number", tagId: "number" })
    )
  )
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    const result = await db
      .deleteFrom("HoldingTag")
      .where("holdingId", "=", data.holdingId)
      .where("tagId", "=", data.tagId)
      .where(({ exists, selectFrom }) =>
        exists(
          selectFrom("Holding")
            .select("id")
            .where("id", "=", data.holdingId)
            .where("userId", "=", context.user.id)
        )
      )
      .executeTakeFirst();

    return Number(result.numDeletedRows) === 1;
  });

export const rebuildHolding = createServerFn({ method: "POST" })
  .validator(
    serverFunctionStandardValidator(
      type({ id: "number", closed: "boolean = false" })
    )
  )
  .handler(async ({ data }) => {
    return buildHolding(data.id, data.closed);
  });
