import { db } from "~/lib/server/db";
import { HoldingType } from "~/lib/server/db/enums";
import { withTags } from "~/lib/server/db/helpers";
import { formatBonds } from "~/lib/server/formatters/bondsFormatter";
import { formatClosedBonds } from "~/lib/server/formatters/closedBondsFormatter";
import { formatClosedCoveredCalls } from "~/lib/server/formatters/closedCoveredCallFormatter";
import { formatClosedStocks } from "~/lib/server/formatters/closedStocksFormatter";
import { formatCoveredCalls } from "~/lib/server/formatters/coveredCallFormatter";
import { formatStocks } from "~/lib/server/formatters/stocksFormatter";

export const buildHolding = async (holdingId: number, closed = false) => {
  const holding = await db
    .selectFrom("Holding")
    .selectAll()
    .select(withTags)
    .where("id", "=", holdingId)
    .executeTakeFirstOrThrow();
  const transactions = await db
    .selectFrom("Transaction")
    .selectAll()
    .where("holdingId", "=", holding.id)
    .execute();
  const income = await db
    .selectFrom("Income")
    .selectAll()
    .where("holdingId", "=", holding.id)
    .execute();

  const holdingInfo = {
    ...holding,
    transactions: transactions,
    income: income,
  };

  switch (holding.type) {
    case HoldingType.BOND:
      return (
        await (closed ? formatClosedBonds : formatBonds)([holdingInfo])
      )[0];
    case HoldingType.COVERED_CALL:
      return (
        await (closed ? formatClosedCoveredCalls : formatCoveredCalls)([
          holdingInfo,
        ])
      )[0];
    default:
      const open = await db
        .selectFrom("OpenOrder")
        .selectAll()
        .where("holdingId", "=", holdingInfo.id)
        .execute();
      return (
        await (closed ? formatClosedStocks : formatStocks)([
          { ...holdingInfo, open },
        ])
      )[0];
  }
};
