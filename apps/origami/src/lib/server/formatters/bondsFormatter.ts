import type { Selectable } from "kysely";
import type { PaperAPI } from "paper-api";
import type { Idea, Transaction } from "~/lib/server/db/schema";
import paper from "~/lib/server/paper";
import { RATE } from "~/lib/server/utils/math";
import type {
  FormattedBond,
  FormattedTransaction,
  SecurityWithIncome,
} from "./types";
const ONE_YEAR = 1000 * 60 * 60 * 24 * 365;

export const formatBonds = async (data: SecurityWithIncome[]) => {
  const holdings: Promise<FormattedBond>[] = data.map(async (holding) => {
    const { data } = await paper.bonds({ cusip: holding.symbol }).get();
    const symbol = data;

    let transactions: Selectable<Transaction>[] = [];
    let soldShares = 0;
    for (const transaction of holding.transactions) {
      if (transaction.quantity < 0) soldShares -= transaction.quantity;
      else transactions.push(transaction);
    }

    transactions = transactions.sort((a, b) => (a.date < b.date ? -1 : 1));
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
      formatTransaction(transaction, symbol, symbol?.rate ?? 0)
    );
    const fields = {} as FormattedBond;

    fields.id = holding.id;
    fields.symbol = holding.name ?? holding.symbol;
    fields.cusip = holding.symbol;
    fields.bond = true;
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
    fields.soldShares = formattedTransactions
      .filter((transaction) => transaction.shares < 0)
      .reduce((sum, transaction) => sum + transaction.shares, 0);
    fields.date =
      formattedTransactions
        .filter((transaction) => transaction.shares > 0)
        .reduce(
          (sum, transaction) => sum + transaction.shares * transaction.date,
          0
        ) /
      (fields.shares - fields.soldShares);
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

    if (!symbol) return fields;

    fields.price = symbol.price;
    fields.standardAndPoorRating = symbol.standardAndPoorRating.value;
    fields.standardAndPoorChange = symbol.standardAndPoorRating.change;
    fields.moodyRating = symbol.moodyRating.value;
    fields.moodyChange = symbol.moodyRating.change;
    fields.maturityDate = symbol.maturityDate;
    fields.yearsToMaturity = (fields.maturityDate - Date.now()) / ONE_YEAR;
    fields.ytm =
      (RATE(
        fields.yearsToMaturity * 2,
        (symbol.rate / 2) * 1000,
        fields.price * -1,
        1000
      ) ?? 0) * 2;
    fields.callDate = symbol.callDate;
    fields.yieldToCall = fields.callDate
      ? (RATE(
          ((fields.callDate - Date.now()) / ONE_YEAR) * 2,
          (symbol.rate / 2) * 1000,
          fields.price * -1,
          1000
        ) ?? 0) * 2
      : null;

    fields.type = bondType(symbol.type);
    fields.sector = bondSector(symbol.sector);
    fields.value = fields.price * fields.shares;
    fields.capGain = (fields.value - fields.cost) / fields.cost;

    fields.rate = symbol.rate;
    fields.annualIncome = fields.rate * fields.shares * 1000;
    fields.estCumYield =
      fields.annualIncome * ((Date.now() - fields.date) / ONE_YEAR);
    const income = fields.estCumYield + fields.additionalIncomeTotal;

    fields.gainLoss = fields.value + income - fields.cost;
    fields.cumYield = income / fields.cost;
    fields.cumGain = fields.gainLoss / fields.cost;
    fields.curYield = fields.annualIncome / fields.value;
    fields.estIRR =
      ((fields.value + income) / fields.cost) **
        (365 / (fields.holdingPeriod * 365)) -
      1;
    fields.maxReturn =
      (fields.annualIncome *
        ((fields.maturityDate - Date.now()) / 1000 / 60 / 60 / 24)) /
        365 +
      fields.shares * 1000 -
      fields.value;
    fields.returnOnValue = fields.maxReturn / fields.value;

    return fields;
  });
  return Promise.all(holdings);
};

type PaperBond =
  PaperAPI["_routes"]["bonds"][":cusip"]["get"]["response"]["200"];

const formatTransaction = (
  transaction: Selectable<Transaction>,
  symbol: PaperBond | null,
  rate: number
) => {
  const fields = {
    id: transaction.id,
    date: transaction.date.getTime(),
    shares: transaction.quantity,
    purchasePrice: transaction.price,
    cost: transaction.price * transaction.quantity,
    holdingPeriod:
      (Date.now() - new Date(transaction.date).getTime()) / ONE_YEAR,
  } as unknown as FormattedTransaction;
  if (!symbol) return fields;

  fields.value = symbol.price * transaction.quantity;
  fields.capGain = (fields.value - fields.cost) / fields.cost;

  fields.annualIncome = rate * transaction.quantity * 1000;
  fields.estCumYield =
    fields.annualIncome * ((Date.now() - fields.date) / ONE_YEAR);
  fields.gainLoss = fields.value + fields.estCumYield - fields.cost;
  fields.cumYield = fields.estCumYield / fields.cost;
  fields.cumGain = fields.gainLoss / fields.cost;
  fields.curYield = fields.annualIncome / fields.value;
  fields.estIRR =
    ((fields.value + fields.estCumYield) / fields.cost) **
      (365 / (fields.holdingPeriod * 365)) -
    1;

  return fields;
};

export const formatBondIdeas = async (data: Selectable<Idea>[]) => {
  if (!data.length) return [];

  const { data: bonds } = await paper.bonds.get({
    query: { cusips: data.map((idea) => idea.symbol).join(",") },
  });
  if (!bonds) return [];

  return Promise.all(
    data.map(async (idea) => {
      const bond = bonds.find(
        (bond) =>
          bond.cusip.localeCompare(idea.symbol, undefined, {
            sensitivity: "base",
          }) === 0
      );
      if (!bond) {
        return {
          id: idea.id,
          symbol: "",
          type: "data missing",
          cusip: idea.symbol,
          notes: idea.notes || "",
        };
      }
      return {
        id: idea.id,
        notes: idea.notes || "",
        symbol: bond.symbol,
        cusip: bond.cusip,
        type: bondType(bond.type),
        company: bond.name,
        rate: bond.rate,
        ytm: bond.yield,
        standardAndPoorRating: bond.standardAndPoorRating.value,
        standardAndPoorChange: bond.standardAndPoorRating.change,
        moodyRating: bond.moodyRating.value,
        moodyChange: bond.moodyRating.change,
        maturity: bond.maturityDate,
        callDate: bond.callDate,
        price: bond.price,
        tradeDate: bond.lastSaleDate,
      };
    })
  );
};

function bondType(type: string | null) {
  switch (type) {
    case "AGCY":
      return "Agency Bond";
    case "CHRC":
      return "Church Bond";
    case "CORP":
      return "Corporate Bond";
    case "ELN ":
      return "Equity Linked Note";

    default:
      return `${type ? `${type} ` : ""}Bond`;
  }
}

function bondSector(sector: string | null) {
  switch (sector) {
    case "AGNC":
      return "Agency";
    case "FUNN":
      return "Recreation/Leisure";

    // Unconfirmed sectors
    case "AGENCY":
      return "Agency";
    case "BANKS":
      return "Banks";
    case "CONSUMGD":
      return "Consumer Goods";
    case "ELECTRIC":
      return "Electric Power";
    case "ENERGY":
      return "Energy Company";
    case "GASDISTR":
      return "Gas Distribution";
    case "INDFINCL":
      return "Indepdendent Finance";
    case "MANUFACT":
      return "Manufacturing";
    case "OFFMUNI":
      return "Official and Muni";
    case "OTHFINCL":
      return "Other Financial";
    case "SERVICE":
      return "Service Company";
    case "SOVERGRN":
      return "Sovereign";
    case "SPRA":
      return "Supranational";
    case "TELEPHON":
      return "Telephone";
    case "TRANSPRT":
      return "Transportation";

    default:
      return `${sector ? `${sector} ` : ""}Bond`;
  }
}
