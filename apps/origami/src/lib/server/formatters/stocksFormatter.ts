import type { Selectable } from "kysely";
import type { OpenOrder, Transaction } from "~/lib/server/db/schema";
import { getSummary } from "~/lib/server/external/symbolAPI";
import { earnedDividend, stockSplit, sum } from "~/lib/utils";
import {
  annualDividend,
  getForwardDividendYield,
  getNextDividendDate,
  getTTMDividendYield,
} from "./dividends";
import type {
  FormattedStock,
  FormattedTransaction,
  SecurityWithIncome,
} from "./types";
import { stockType } from "./utils";
const ONE_YEAR = 1000 * 60 * 60 * 24 * 365;

export async function formatStocks(
  data: (SecurityWithIncome & {
    open: Selectable<OpenOrder>[];
  })[]
) {
  const holdings: Promise<FormattedStock>[] = data.map(async (holding) => {
    const symbol = await getSummary(holding.symbol);
    const dividends = symbol?.dividends ?? [];
    const rate = symbol ? getTTMDividendYield(dividends, symbol.price) : 0;

    for (let i = 0; i < holding.transactions.length; i++) {
      symbol?.splits?.forEach((split) => {
        if (stockSplit(holding.transactions[i].date, split)) {
          holding.transactions[i].quantity *=
            split.numerator / split.denominator;
          holding.transactions[i].price /= split.numerator / split.denominator;
        }
      });
    }

    let transactions: Selectable<Transaction>[] = [];
    let soldShares = 0;
    for (const transaction of holding.transactions) {
      if (transaction.quantity < 0) soldShares -= transaction.quantity;
      else transactions.push(transaction);
    }

    transactions = transactions.sort((a, b) =>
      new Date(a.date) < new Date(b.date) ? -1 : 1
    );
    transactions = transactions.filter((transaction) => {
      if (soldShares >= transaction.quantity) {
        soldShares -= transaction.quantity;
        transaction.quantity = 0;
        return false;
      }
      transaction.quantity -= soldShares;
      soldShares = 0;
      return true;
    });
    const formattedTransactions = transactions.map((transaction) =>
      formatTransaction(transaction, symbol, rate)
    );

    const fields = {} as FormattedStock;

    fields.id = holding.id;
    fields.symbol = holding.symbol;
    fields.tags = holding.tags;
    fields.holdingType = holding.type;
    fields.category = holding.category;
    fields.transactions = formattedTransactions;
    fields.notes = holding.notes || "";
    fields.buyTarget = holding.buyTarget;
    fields.sellTarget = holding.sellTarget;
    fields.shares = formattedTransactions.reduce(
      (sum, transaction) => sum + transaction.shares,
      0
    );
    fields.date =
      formattedTransactions
        .filter((transaction) => transaction.shares > 0)
        .reduce(
          (sum, transaction) => sum + transaction.shares * transaction.date,
          0
        ) / fields.shares;
    fields.holdingPeriod = (Date.now() - fields.date) / ONE_YEAR;
    fields.cost = formattedTransactions.reduce(
      (sum, transaction) => sum + transaction.cost,
      0
    );
    fields.purchasePrice = fields.cost / fields.shares;

    fields.additionalIncome = holding.income;
    fields.additionalIncomeTotal = holding.income.reduce(
      (sum, cur) => sum + cur.amount,
      0
    );

    if (!symbol || !symbol.price) return fields;

    fields.type = stockType(symbol.type);
    fields.price = symbol.price;
    fields.fiftyTwoWeekHigh = symbol.fiftyTwoWeekHigh;
    fields.fiftyTwoWeekLow = symbol.fiftyTwoWeekLow;
    fields.forwardPE = symbol.forwardPE;
    fields.marketCap = symbol.marketCap;
    fields.dayChange = symbol.dayChange;
    fields.dayChangePercent = symbol.dayChangePercent ?? 0;
    fields.sector = symbol.sector || fields.type;
    fields.value = symbol.price * fields.shares;
    fields.capGain = (fields.value - fields.cost) / fields.cost;
    fields.dayBalanceChange = (symbol.dayChange ?? 0) * fields.shares;
    fields.earningsDate =
      symbol.earningsDate && symbol.earningsDate > Date.now()
        ? symbol.earningsDate
        : null;

    const { estExDivDate } = getNextDividendDate(symbol.exDividendDate);
    fields.exDividendDate = estExDivDate?.getTime();
    // fields.nextDividendDate = dividends.n;
    const latestDividend =
      dividends.length && dividends.sort((a, b) => b.date - a.date)[0].amount;
    fields.rate = rate;
    fields.forwardYield = getForwardDividendYield(dividends, symbol.price);
    fields.dividendsEarned = dividends.length
      ? dividends
          .map((div) => {
            const amount =
              formattedTransactions
                .filter((transaction) => earnedDividend(transaction.date, div))
                .map((transaction) => transaction.shares)
                .reduce(sum, 0) * div.amount;
            return { date: div.date, amount };
          })
          .filter((div) => div.amount > 0)
      : [];
    fields.estCumYield = fields.dividendsEarned.reduce(
      (sum, div) => sum + div.amount,
      0
    );
    const income = fields.estCumYield + fields.additionalIncomeTotal;

    fields.gainLoss = fields.value + income - fields.cost;
    fields.cumYield = income / fields.cost;
    fields.cumGain = fields.gainLoss / fields.cost;
    fields.annualIncome = fields.rate * fields.value;
    fields.curYield = fields.annualIncome / fields.value;
    fields.estIRR =
      ((fields.value + income) / fields.cost) **
        (365 / (fields.holdingPeriod * 365)) -
      1;

    fields.openOrderType = holding.open.length
      ? holding.open[0].buy
        ? "buy"
        : "sell"
      : null;

    return fields;
  });
  return Promise.all(holdings);
}

function formatTransaction(
  transaction: Selectable<Transaction>,
  symbol: Awaited<ReturnType<typeof getSummary>>,
  rate: number
) {
  const fields = {
    id: transaction.id,
    date: transaction.date.getTime(),
    shares: transaction.quantity,
    purchasePrice: transaction.price,
    cost: transaction.price * transaction.quantity,
    holdingPeriod: (Date.now() - transaction.date.getTime()) / ONE_YEAR,
  } as unknown as FormattedTransaction;

  if (!symbol || !symbol.price) return fields;

  fields.value = symbol.price * transaction.quantity;
  fields.dayBalanceChange =
    (symbol.dayChange ?? 0) * symbol.price * transaction.quantity;
  fields.capGain = (fields.value - fields.cost) / fields.cost;

  fields.estCumYield = symbol.dividends
    ? transaction.quantity *
      symbol.dividends
        .filter((dividend) => earnedDividend(transaction.date, dividend))
        .map((dividend) => dividend.amount)
        .reduce(sum, 0)
    : 0;
  fields.gainLoss = fields.value + fields.estCumYield - fields.cost;
  fields.cumYield = fields.estCumYield / fields.cost;
  fields.cumGain = fields.gainLoss / fields.cost;
  fields.annualIncome = rate * fields.value;
  fields.curYield = fields.annualIncome / fields.value;
  fields.estIRR =
    ((fields.value + fields.estCumYield) / fields.cost) **
      (365 / (fields.holdingPeriod * 365)) -
    1;

  return fields;
}

export async function formatStockForOptionIdea(symbol: string) {
  const summary = await getSummary(symbol);

  return {
    price: summary?.price ?? 0,
    exDividendDate: getNextDividendDate(summary?.exDividendDate).estExDivDate,
    annualDividend: annualDividend(
      summary?.exDividendDate,
      summary?.dividends ?? []
    ),
  };
}
