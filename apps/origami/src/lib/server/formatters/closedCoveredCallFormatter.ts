import type { Selectable } from "kysely";
import { AssetClass } from "~/lib/server/db/enums";
import type { Transaction } from "~/lib/server/db/schema";
import { getSummary } from "~/lib/server/external/symbolAPI";
import { earnedDividend, sum } from "~/lib/utils";
import type { Dividend, Security } from "./types";
import { contractToDetails } from "./utils";
const ONE_YEAR = 1000 * 60 * 60 * 24 * 365;

export async function formatClosedCoveredCalls(data: Security[]) {
  const coveredCalls: Promise<any>[] = data.map(async (cc) => {
    const optionTransactions = cc.transactions.filter(
      (transaction) => transaction.type === AssetClass.CALL
    );
    const stockTransactions = cc.transactions.filter(
      (transaction) => transaction.type === AssetClass.STOCK
    );

    const symbol = await getSummary(cc.symbol);
    const dividends = symbol?.dividends ?? [];

    const fields: any = {};

    fields.id = cc.id;
    fields.symbol = cc.symbol;
    // fields.name = cc.name;
    // fields.type = cc.type;
    fields.type = "Covered Call";
    fields.notes = cc.notes;

    const transactions: Selectable<Transaction>[] = [];
    const soldTransactions: Selectable<Transaction>[] = [];
    stockTransactions.forEach((transaction) =>
      transaction.quantity < 0
        ? soldTransactions.push(transaction)
        : transactions.push(transaction)
    );
    const soldShares = soldTransactions.reduce(
      (sum, transaction) => sum + Math.abs(transaction.quantity),
      0
    );
    if (soldShares === 0) return null;
    fields.shares = soldShares;

    const buyTransactions = transactions.map((transaction) =>
      formatStockTransaction(transaction, dividends)
    );
    const sellTransactions = soldTransactions.map((transaction) =>
      formatStockTransaction(transaction, dividends)
    );
    const optionBuyTransactions = optionTransactions
      .filter((t) => t.quantity > 0)
      .map((transaction) => formatOptionTransaction(transaction));
    const optionSellTransactions = optionTransactions
      .filter((t) => t.quantity <= 0)
      .map((transaction) => formatOptionTransaction(transaction));
    fields.transactions = [
      ...buyTransactions,
      ...sellTransactions,
      ...optionBuyTransactions,
      ...optionSellTransactions,
    ];

    fields.date =
      buyTransactions.reduce(
        (sum, transaction) =>
          sum + transaction.shares * new Date(transaction.date).getTime(),
        0
      ) / fields.shares;
    fields.sellDate =
      sellTransactions.reduce(
        (sum, transaction) =>
          sum +
          Math.abs(transaction.shares) * new Date(transaction.date).getTime(),
        0
      ) / fields.shares;
    fields.holdingPeriod = (fields.sellDate - fields.date) / ONE_YEAR;
    fields.cost = buyTransactions.reduce(
      (sum, transaction) => sum + transaction.cost,
      0
    );
    fields.purchasePrice = fields.cost / fields.shares;
    fields.proceeds = sellTransactions.reduce(
      (sum, transaction) => sum + transaction.proceeds,
      0
    );
    fields.sellPrice = fields.proceeds / fields.shares;
    fields.shareGain = fields.proceeds - fields.cost;

    fields.optionCost =
      optionBuyTransactions.reduce(
        (sum, transaction) => sum + transaction.cost,
        0
      ) * 100;
    fields.optionProceeds =
      optionSellTransactions.reduce(
        (sum, transaction) => sum + transaction.proceeds,
        0
      ) * 100;
    fields.optionGain = fields.optionProceeds - fields.optionCost;

    fields.capGain = (fields.proceeds - fields.cost) / fields.cost;
    fields.dividendsEarned = dividends
      .map((div) => {
        const amount =
          stockTransactions
            .filter((transaction) => earnedDividend(transaction.date, div))
            .map((transaction) => transaction.quantity)
            .reduce(sum, 0) * div.amount;
        return { date: div.date, amount };
      })
      .filter((div) => div.amount > 0);
    fields.estCumYield = fields.dividendsEarned.reduce(
      (sum, div) => sum + div.amount,
      0
    );

    fields.gainLoss = fields.shareGain + fields.optionGain + fields.estCumYield;
    fields.netInvest =
      fields.purchasePrice * soldShares - fields.optionProceeds;
    fields.gainPercent = fields.gainLoss / fields.netInvest;

    fields.irr = fields.gainPercent / fields.holdingPeriod;

    const latestOption = optionTransactions.reduce(
      (latest, cur) =>
        !latest || (cur.quantity < 0 && cur.date > latest.date) ? cur : latest,
      optionTransactions[0]
    );
    const optionDetails = contractToDetails(latestOption.symbol);
    fields.lastStrike = optionDetails.strike;
    fields.lastExpiry = optionDetails.expiry;

    return fields;
  });

  return Promise.all(coveredCalls);
}

const formatStockTransaction = (
  transaction: Selectable<Transaction>,
  divs: Dividend[]
) => {
  const price = transaction.price;
  const fields = {
    id: transaction.id,
    type: transaction.type,
    date: transaction.date,
    shares: transaction.quantity,
    purchasePrice: transaction.quantity > 0 ? price : null,
    sellPrice: transaction.quantity < 0 ? price : null,
    holdingPeriod:
      (Date.now() - new Date(transaction.date).getTime()) / ONE_YEAR,
    estCumYield: divs
      ? transaction.quantity *
        divs
          .filter((div) => earnedDividend(transaction.date, div))
          .map((div) => div.amount)
          .reduce(sum, 0)
      : 0,
  } as any;
  fields.cost = transaction.quantity > 0 ? price * transaction.quantity : null;
  fields.proceeds =
    transaction.quantity < 0 ? price * transaction.quantity * -1 : null;

  fields.cumYield = fields.estCumYield / fields.cost;
  fields.estIRR =
    ((fields.proceeds + fields.estCumYield) / fields.cost) **
      (365 / (fields.holdingPeriod * 365)) -
    1;

  return fields;
};

const formatOptionTransaction = (transaction: Selectable<Transaction>) => {
  const price = transaction.price;
  const fields = {
    id: transaction.id,
    type: transaction.type,
    date: transaction.date,
    shares: transaction.quantity,
    purchasePrice: transaction.quantity > 0 ? price : null,
    sellPrice: transaction.quantity < 0 ? price : null,
    holdingPeriod:
      (Date.now() - new Date(transaction.date).getTime()) / ONE_YEAR,
  } as any;
  fields.cost = transaction.quantity > 0 ? price * transaction.quantity : null;
  fields.proceeds =
    transaction.quantity < 0 ? price * transaction.quantity * -1 : null;

  return fields;
};
