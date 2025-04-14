import type { Selectable } from "kysely";
import type { Transaction } from "~/lib/server/db/schema";
import paper from "~/lib/server/paper";
import type { FormattedClosedSecurity, SecurityWithIncome } from "./types";
const ONE_YEAR = 1000 * 60 * 60 * 24 * 365;

export const formatClosedBonds = async (data: SecurityWithIncome[]) => {
  const holdings = data.map(async (holding) => {
    const fields = {} as FormattedClosedSecurity;

    let transactions: Selectable<Transaction>[] = [];
    const soldTransactions: Selectable<Transaction>[] = [];
    holding.transactions.forEach((transaction) =>
      transaction.quantity < 0
        ? soldTransactions.push(transaction)
        : transactions.push(transaction)
    );
    let soldShares = soldTransactions.reduce(
      (sum, transaction) => sum + Math.abs(transaction.quantity),
      0
    );
    if (soldShares === 0) return null;
    fields.shares = soldShares;

    transactions = transactions.sort((a, b) => (a.date < b.date ? -1 : 1));
    transactions = transactions.filter((transaction) => {
      if (soldShares >= transaction.quantity) {
        soldShares -= transaction.quantity;
        return true;
      }
      if (soldShares > 0) {
        transaction.quantity = soldShares;
        soldShares = 0;
        return true;
      }
      return false;
    });
    const buyTransactions = transactions.map((transaction) =>
      formatTransaction(transaction)
    );
    const sellTransactions = soldTransactions.map((transaction) =>
      formatTransaction(transaction)
    );

    fields.id = holding.id;
    fields.symbol = holding.name ?? holding.symbol;
    fields.holdingType = holding.type;
    fields.category = holding.category;
    fields.transactions = [...buyTransactions, ...sellTransactions];
    fields.notes = holding.notes || "";
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
    fields.capGain = (fields.proceeds - fields.cost) / fields.cost;

    fields.additionalIncome = holding.income;
    fields.additionalIncomeTotal = holding.income.reduce(
      (sum, cur) => sum + cur.amount,
      0
    );

    const { data: symbol } = await paper.bonds({ cusip: holding.symbol }).get();
    if (!symbol) return fields;

    const rate = symbol.rate;

    fields.maturityDate = new Date(symbol.maturityDate).getTime();
    fields.annualIncome = rate * fields.shares * 1000;
    fields.estCumYield =
      fields.annualIncome * ((fields.sellDate - fields.date) / ONE_YEAR);
    const income = fields.estCumYield + fields.additionalIncomeTotal;

    fields.gainLoss = fields.proceeds + income - fields.cost;
    fields.cumYield = income / fields.cost;
    fields.cumGain = fields.gainLoss / fields.cost;
    fields.estIRR =
      ((fields.proceeds + income) / fields.cost) **
        (365 / (fields.holdingPeriod * 365)) -
      1;

    fields.type = symbol.type;

    return fields;
  });
  return Promise.all(holdings);
};

const formatTransaction = (transaction: Selectable<Transaction>) => {
  const price = transaction.price;
  const fields: any = {
    id: transaction.id,
    date: transaction.date,
    shares: transaction.quantity,
    purchasePrice: transaction.quantity > 0 ? price : null,
    sellPrice: transaction.quantity < 0 ? price : null,
  };
  fields.cost = transaction.quantity > 0 ? price * transaction.quantity : null;
  fields.proceeds =
    transaction.quantity < 0 ? price * transaction.quantity * -1 : null;

  // fields.estCumYield = ((fields.annualIncome / 2) * (Date.now() - fields.date) * 1000 * 60 * 60 * 24) / (365 / 2);
  // fields.cumYield = fields.estCumYield / fields.cost;
  // fields.estIRR = ((fields.proceeds + fields.estCumYield) / fields.cost) ** (365 / (fields.holdingPeriod * 365)) - 1;

  return fields;
};
