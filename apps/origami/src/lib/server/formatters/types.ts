import type { Selectable } from "kysely";
import type { Holding, Income, Transaction } from "~/lib/server/db/schema";

type Tag = { id: number; name: string; color: string };

export type Security = Selectable<Holding> & {
  transactions: Selectable<Transaction>[];
  tags: Tag[];
};

export type SecurityWithIncome = Security & {
  income: Selectable<Income>[];
};

export interface FormattedBond {
  id: number;
  symbol: string;
  cusip: string;
  bond: boolean;
  holdingType: string;
  category: string | null;
  sector: string | null;
  tags: Tag[];
  transactions: FormattedTransaction[];
  notes: string | null;
  buyTarget: number | null;
  sellTarget: number | null;
  shares: number;
  soldShares: number;
  date: number;
  holdingPeriod: number;
  cost: number;
  purchasePrice: number;
  additionalIncome: Selectable<Income>[];
  additionalIncomeTotal: number;
  price: number;
  standardAndPoorRating: string | null;
  standardAndPoorChange: number;
  moodyRating: string | null;
  moodyChange: number;
  maturityDate: number;
  yearsToMaturity: number;
  ytm: number;
  callDate: number | null;
  yieldToCall: number | null;
  type: string;
  value: number;
  capGain: number;
  rate: number;
  annualIncome: number;
  estCumYield: number;
  gainLoss: number;
  cumYield: number;
  cumGain: number;
  curYield: number;
  estIRR: number;
  maxReturn: number;
  returnOnValue: number;
  openOrderType: "buy" | "sell" | null;
}

export interface FormattedStock {
  id: number;
  symbol: string;
  type: string;
  tags: Tag[];
  holdingType: string;
  category: string | null;
  transactions: FormattedTransaction[];
  notes: string | null;
  buyTarget: number | null;
  sellTarget: number | null;
  shares: number;
  date: number;
  holdingPeriod: number;
  cost: number;
  purchasePrice: number;
  price: number;
  fiftyTwoWeekHigh: number | null;
  fiftyTwoWeekLow: number | null;
  forwardPE: number | null;
  marketCap: number | null;
  dayChange: number | null;
  dayChangePercent: number;
  sector: string | null;
  value: number;
  capGain: number;
  dayBalanceChange: number;
  earningsDate: number | null;
  exDividendDate?: number;
  nextDividendDate: string | null;
  latestDividend: number;
  rate: number;
  forwardYield: number;
  dividendsEarned: DividendsEarned[];
  estCumYield: number;
  additionalIncome: Selectable<Income>[];
  additionalIncomeTotal: number;
  gainLoss: number;
  cumYield: number;
  cumGain: number;
  annualIncome: number;
  curYield: number;
  estIRR: number;
  openOrderType: "buy" | "sell" | null;
}

export interface StockEvents {
  dividends: {
    x: string;
    n: string;
    d: Dividend[];
  };
  splits: {
    date: number;
    numerator: number;
    denominator: number;
  }[];
}

export interface Dividend {
  date: number;
  amount: number;
}

export interface DividendsEarned {
  date: number;
  amount: number;
}

export interface FormattedTransaction {
  id: number;
  date: number;
  shares: number;
  purchasePrice: number;
  cost: number;
  holdingPeriod: number;
  estCumYield: number;
  value: number;
  dayBalanceChange?: number;
  capGain: number;
  gainLoss: number | null;
  cumYield: number | null;
  cumGain: number | null;
  annualIncome: number;
  curYield: number | null;
  estIRR: number | null;
}

export type FormattedSecurity = FormattedStock | FormattedBond;

export interface FormattedClosedSecurity {
  shares: number;
  id: number;
  symbol: string;
  type: string;
  holdingType: string;
  category: string | null;
  transactions: FormattedClosedTransaction[];
  notes: string | null;
  date: number;
  sellDate: number;
  holdingPeriod: number;
  cost: number;
  purchasePrice: number;
  proceeds: number;
  sellPrice: number;
  capGain: number;
  dividends?: Dividend[];
  exDividendDate?: string;
  nextDividendDate?: string;
  latestDividend?: number;
  dividendsEarned: any[];
  estCumYield: number;
  additionalIncome: any[];
  additionalIncomeTotal: number;
  gainLoss: number;
  cumYield: number;
  cumGain: number;
  estIRR: number;
  maturityDate?: number;
  annualIncome?: number;
}

export interface FormattedClosedTransaction {
  id: number;
  date: number;
  shares: number;
  purchasePrice: number | null;
  sellPrice: number | null;
  holdingPeriod?: number;
  estCumYield: number;
  cost: number | null;
  proceeds: number | null;
  cumYield?: number | null;
  estIRR?: number | null;
}

export interface FormattedCoveredCall {
  id: number;
  symbol: string;
  type: "Covered Call";
  tags: Tag[];
  notes: string | null;
  expireDate: number;
  expiration: number;
  strike: number;
  price: number;
  dayChangePercent: number;
  sector: string | null;
  earningsDate: number | null;
  contractSymbol: string;
  daysToExpiry: number;
  dividends: Dividend[];
  exDividendDate?: number;
  nextDividendDate: string;
  exDivIsEst: boolean;
  annualDividend: number;
  quarterlyDividend: number;
  divPaymentsToExpiry: number;
  bid: number;
  ask: number;
  mark: number;
  _mark: number;
  stockShares: number;
  weightedDate: number;
  holdingPeriod: number;
  cost: number;
  avgCostPerShare: number;
  openOptions: Selectable<Transaction>[];
  sharesCovered: number;
  sortedStockTransactions: Selectable<Transaction>[];
  sortedOptionTransactions: Selectable<Transaction>[];
  latestCall: Selectable<Transaction>;
  openDate: number | null;
  stockPriceAtOpen: number | null;
  currCallAtOpen: number | null;
  dividendsEarned: DividendsEarned[];
  estCumYield: number;
  netValuePerShare: number;
  netValue: number;
  value: number;
  dayBalanceChange: number;
  shareGain: number;
  effDivPA: number;
  closedCCs: number;
  putBWs: number;
  openCCGain: number;
  gainLoss: number;
  netInvestPerShare: number;
  maxGainPerShare: number;
  maxGain: number;
  maxReturn: number;
  maxReturnPA: number;
  pftNoChg: number;
  pa: number;
  paAtExDiv: number | null;
  percentToBE: number;
  downPT: number;
  percentItmOtm: number;
}

export interface FormattedCoveredCallRollData {
  id: number;
  rollStrike: number;
  rollExpiry: number;
  rollMark: number;
  rollSpreadPercent: number;
  rollPremium: number;
  currentMaxGain: number;
  rollDivsPerShare: number;
  currentNcGain: number;
  rollNcGain: number;
  netNcGain: number;
  exDivPa: number;
  netNcPa: number;
  rollMaxGain: number;
  netMaxGain: number;
  netMaxPa: number;
}

export interface FormattedOpenOrder {
  id: number;
  holding: number | null;
  symbol: string;
  gtc: number;
  buySell: string;
  limitStop: string;
  quantity: number;
  orderPrice: number;
  price: number;
  priceDelta: number;
  midpoint: number;
  value: number;
  exDividendDate?: number;
  exDivIsEst: boolean;
}

export interface FormattedOptionIdea {
  id: number;
  symbol: string;
  type: string;
  notes: string | null;
  expireDate: number;
  strike: number;
  price: number;
  dayChangePercent: number;
  contractSymbol: string;
  daysToExpiry: number;
  openDate: number;
  exDividendDate?: number;
  exDivIsEst: boolean;
  latestDividend: number;
  annualDividend: number;
  quarterlyDividend: number;
  divPaymentsToExpiry: number;
  callBid: number;
  callAsk: number;
  bidAskCall: string;
  callMark: number;
  putBid: number;
  putAsk: number;
  putMark: number;
  ccBasis: number;
  effDivPA: number;
  mxGain: number;
  mx: number;
  mxPA: number;
  pftNoChg: number;
  pa: number;
  paAtExDiv: number;
  downPT: number;
  itm: number;
  paPlusPT: number;
  beLow: number;
  beHigh: number;
  pwBasis: number;
  mxGainPut: number;
  mxPut: number;
  mxPAPut: number;
  pftNoChgPut: number;
  paPut: number;
  downPTPut: number;
  skewMkr: number;

  ppStrike: number;
  ppContractSymbol: string;
  ppBid: number;
  ppAsk: number;
  ppMark: number;
  ppBasis: number;
  ppMaxGain: number;
  ppMX: number;
  ppMxPa: number;
  ppPftNoChg: number;
  ppPA: number;
  ppMaxLoss: number;
  ppMaxLossPercent: number;
  ppPaAtExDiv: number;
  ppPaDiff: number;

  bpsMark: number;
  bpsMX: number;
  bpsMxPa: number;
  bpsMaxLoss: number;
  bpsCC: number;
  bpsPaStrike: number;
  bpsGainPercent: number;
  bpsDownside: number;
  bpsProtection: number;
  bpsInvest: number;
  bpsMaxGain: number;
  bpsBasis: number;
  bpsMaxLossAssigned: number;
  bpsExposure: number;
}

export interface FormattedStockIdea {
  id: number;
  symbol: string;
  type: string;
  notes: string | null;
  updatedAt: Date;
  price: number;
  dayChangePercent: number;
  fiftyTwoWeekHigh: number | null;
  fiftyTwoWeekLow: number | null;
  forwardPE: number | null;
  marketCap: number | null;
  earningsDate: number | null;
  rate: number;
  exDividendDate?: number;
  exDivIsEst: boolean;
  target: number | null;
  ratio: number | null;
  peg: number;
}
