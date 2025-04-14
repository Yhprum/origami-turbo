import type { Insertable, Selectable } from "kysely";
import type { Holding, Security } from "plaid";
import { db } from "~/lib/server/db";
import { AssetClass, HoldingType } from "~/lib/server/db/enums";
import type { Connection, Transaction } from "~/lib/server/db/schema";
import { yyyymmdd } from "~/lib/utils/formatter";
import { plaidClient } from ".";

type PlaidHolding = {
  symbol: string;
  type: HoldingType;
  total: number;
  holdingData?: Holding;
  transactions: {
    quantity: number;
    price: number;
    date: string;
    type: AssetClass;
  }[];
};

export async function importHoldings(
  userId: string,
  account: Selectable<Connection>
) {
  if (!account.accessToken)
    throw new Error("Missing access token for Plaid account");
  const securities: Record<string, Security> = {};
  const tempHoldings: {
    [key: string]: PlaidHolding;
  } = {};

  const holdingsResponse = await plaidClient.investmentsHoldingsGet({
    access_token: account.accessToken,
    // options: { account_ids: ["vr79kJpznDfYA4yQrOBNTjnZOq1JdefVQmyXB"] },
  });
  for (const security of holdingsResponse.data.securities)
    securities[security.security_id] = security;

  for (const holding of holdingsResponse.data.holdings) {
    const security = securities[holding.security_id];
    if (
      !security.type ||
      !security.ticker_symbol ||
      !["equity", "etf"].includes(security.type)
    )
      continue;
    tempHoldings[holding.security_id] = {
      symbol: security.ticker_symbol,
      type: HoldingType.STOCK,
      total: 0,
      holdingData: holding,
      transactions: [],
    };
  }

  let allProcessed = false;
  let offset = 0;
  let holdings: PlaidHolding[] = [];
  while (!allProcessed) {
    const { data } = await plaidClient.investmentsTransactionsGet({
      access_token: account.accessToken,
      start_date: yyyymmdd(Date.now() - 1000 * 60 * 60 * 24 * 366 * 2),
      end_date: yyyymmdd(Date.now()),
      options: { offset },
      // options: { account_ids: ["vr79kJpznDfYA4yQrOBNTjnZOq1JdefVQmyXB"], offset },
    });
    for (const security of data.securities)
      securities[security.security_id] = security;
    for (const transaction of data.investment_transactions) {
      if (
        !["buy", "sell"].includes(transaction.type) ||
        !transaction.security_id
      )
        continue;
      const security = securities[transaction.security_id];
      if (
        !security.type ||
        !security.ticker_symbol ||
        !["equity", "etf"].includes(security.type)
      )
        continue;
      if (!tempHoldings[transaction.security_id]) {
        tempHoldings[transaction.security_id] = {
          symbol: security.ticker_symbol,
          type: HoldingType.STOCK,
          total: 0,
          transactions: [],
        };
      }
      tempHoldings[transaction.security_id].total += transaction.quantity;
      tempHoldings[transaction.security_id].transactions.push({
        quantity: transaction.quantity,
        price: transaction.price,
        date: transaction.date,
        type: AssetClass.STOCK,
      });
    }

    offset += 100;
    if (offset >= data.total_investment_transactions) {
      allProcessed = true;
    }
  }

  for (const holding of Object.values(tempHoldings)) {
    if (
      holding?.holdingData &&
      holding.total !== holding.holdingData.quantity
    ) {
      const missingQuantity = holding.holdingData.quantity - holding.total;
      if (missingQuantity) {
        const cost = holding.transactions.reduce(
          (prev, cur) => prev + cur.quantity * cur.price,
          0
        );
        const missingCost =
          ((holding.holdingData.cost_basis ?? cost) - cost) / missingQuantity;
        holding.transactions.push({
          quantity: missingQuantity,
          price: missingCost,
          date: yyyymmdd(Date.now()), // TODO: backdate and account for splits?
          type: AssetClass.STOCK,
        });
        holding.total += missingQuantity;
      }
    }
    if (holding) holdings.push(holding);
  }

  holdings = holdings.filter((holding) => holding.total >= 0);

  const holdingIds = await db
    .insertInto("Holding")
    .values(
      Object.values(holdings).map((holding) => ({
        symbol: holding.symbol,
        type: holding.type,
        closed: holding.total === 0,
        userId: userId,
        connectionId: account.id,
      }))
    )
    .returning(["id"])
    .execute();

  const transactionsToAdd: Insertable<Transaction>[] = [];
  holdingIds.forEach((holding, i) => {
    transactionsToAdd.push(
      ...holdings[i].transactions.map((transaction) => ({
        symbol: holdings[i].symbol,
        type: transaction.type,
        quantity: transaction.quantity,
        price: transaction.price,
        date: new Date(transaction.date),
        holdingId: holding.id,
        userId: userId,
      }))
    );
  });

  const result = await db
    .insertInto("Transaction")
    .values(transactionsToAdd)
    .returning("id")
    .execute();
  return result.length;
}
