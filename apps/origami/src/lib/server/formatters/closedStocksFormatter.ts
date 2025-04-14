import type { Selectable } from "kysely";
import type { Transaction } from "~/lib/server/db/schema";
import { getSummary } from "~/lib/server/external/symbolAPI";
import { earnedDividend, stockSplit, sum } from "~/lib/utils";
import type {
  Dividend,
  FormattedClosedSecurity,
  FormattedClosedTransaction,
  SecurityWithIncome,
} from "./types";
import { stockType } from "./utils";
const ONE_YEAR = 1000 * 60 * 60 * 24 * 365;

export const formatClosedStocks = async (data: SecurityWithIncome[]) => {
  const holdings = data.map(async (holding) => {
    const symbol = await getSummary(holding.symbol);
    if (!symbol) return null;

    for (let i = 0; i < holding.transactions.length; i++) {
      symbol.splits.forEach((split) => {
        if (stockSplit(holding.transactions[i].date, split)) {
          holding.transactions[i].quantity *=
            split.numerator / split.denominator;
          holding.transactions[i].price /= split.numerator / split.denominator;
        }
      });
    }

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
      formatTransaction(transaction, symbol.dividends)
    );
    const sellTransactions = soldTransactions.map((transaction) =>
      formatTransaction(transaction, symbol.dividends)
    );

    fields.id = holding.id;
    fields.symbol = holding.symbol;
    fields.type = stockType(symbol.type);
    fields.holdingType = holding.type;
    fields.category = holding.category;
    fields.transactions = [...buyTransactions, ...sellTransactions];
    fields.notes = holding.notes;
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
      (sum, transaction) => sum + (transaction.cost ?? 0),
      0
    );
    fields.purchasePrice = fields.cost / fields.shares;
    fields.proceeds = sellTransactions.reduce(
      (sum, transaction) => sum + (transaction.proceeds ?? 0),
      0
    );
    fields.sellPrice = fields.proceeds / fields.shares;

    fields.capGain = (fields.proceeds - fields.cost) / fields.cost;
    fields.dividendsEarned = symbol.dividends
      .map((div) => {
        const amount =
          fields.transactions
            .filter((transaction) => earnedDividend(transaction.date, div))
            .map((transaction) => transaction.shares)
            .reduce(sum, 0) * div.amount;
        return { date: div.date, amount };
      })
      .filter((div) => div.amount > 0);
    fields.estCumYield = fields.dividendsEarned.reduce(
      (sum, div) => sum + div.amount,
      0
    );
    fields.additionalIncome = holding.income;
    fields.additionalIncomeTotal = holding.income.reduce(
      (sum, cur) => sum + cur.amount,
      0
    );
    const income = fields.estCumYield + fields.additionalIncomeTotal;

    fields.gainLoss = fields.proceeds + income - fields.cost;
    fields.cumYield = income / fields.cost;
    fields.cumGain = fields.gainLoss / fields.cost;
    fields.estIRR =
      ((fields.proceeds + income) / fields.cost) ** (1 / fields.holdingPeriod) -
      1;

    return fields;
  });
  return Promise.all(holdings);
};

const formatTransaction = (
  transaction: Selectable<Transaction>,
  divs: Dividend[]
) => {
  const price = transaction.price;
  const fields = {
    id: transaction.id,
    date: transaction.date.getTime(),
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
  } as FormattedClosedTransaction;
  fields.cost = transaction.quantity > 0 ? price * transaction.quantity : null;
  fields.proceeds =
    transaction.quantity < 0 ? price * transaction.quantity * -1 : null;

  if (fields.cost) fields.cumYield = fields.estCumYield / fields.cost;

  return fields;
};
