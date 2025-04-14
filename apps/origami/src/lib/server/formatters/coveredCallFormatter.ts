import type { Selectable } from "kysely";
import type { PaperAPI } from "paper-api";
import { AssetClass } from "~/lib/server/db/enums";
import type { Holding, Transaction } from "~/lib/server/db/schema";
import { getSummary } from "~/lib/server/external/symbolAPI";
import paper from "~/lib/server/paper";
import { earnedDividend, sum } from "~/lib/utils";
import { getNextDividendDate } from "./dividends";
import type {
  FormattedCoveredCall,
  FormattedCoveredCallRollData,
  Security,
} from "./types";
import { contractToDetails, getClosestOption } from "./utils";
const ONE_YEAR = 1000 * 60 * 60 * 24 * 365;

export async function formatCoveredCalls(data: Security[]) {
  const coveredCalls: Promise<FormattedCoveredCall>[] = data.map(async (cc) => {
    const optionTransactions = cc.transactions.filter(
      (transaction) => transaction.type === AssetClass.CALL
    );
    const stockTransactions = cc.transactions.filter(
      (transaction) => transaction.type === AssetClass.STOCK
    );

    const { openOptions, closedOptions } = partitionOptions(optionTransactions);
    const latestCall =
      openOptions[0] ??
      optionTransactions.reduce(
        (latest, cur) =>
          !latest || (cur.quantity < 0 && cur.date > latest.date)
            ? cur
            : latest,
        optionTransactions[0]
      );
    const callDetails = contractToDetails(latestCall.symbol);
    const [symbol, { data: call }] = await Promise.all([
      getSummary(cc.symbol),
      paper.option({ symbol: latestCall.symbol }).get(),
    ]);

    const fields = {} as FormattedCoveredCall;

    fields.id = cc.id;
    fields.symbol = cc.symbol;
    // fields.name = cc.name;
    // fields.type = cc.type;
    fields.type = "Covered Call";
    fields.tags = cc.tags;
    fields.notes = cc.notes;
    // TODO: make expiration field consistent for holdings and ideas
    fields.expireDate = callDetails.expiry.getTime();
    fields.expiration = callDetails.expiry.getTime();
    fields.strike = callDetails.strike;

    if (!symbol || !symbol.price) return fields;

    fields.price = symbol.price;
    fields.dayChangePercent = symbol.dayChangePercent ?? 0;
    fields.sector = symbol.sector;
    fields.earningsDate =
      symbol.earningsDate && symbol.earningsDate > Date.now()
        ? symbol.earningsDate
        : null;

    fields.contractSymbol = latestCall.symbol;
    fields.daysToExpiry = Math.ceil(
      (new Date(callDetails.expiry).getTime() - Date.now()) /
        1000 /
        60 /
        60 /
        24 +
        1
    );

    fields.quarterlyDividend = fields.annualDividend / 4;

    const { estExDivDate, exDivIsEst } = getNextDividendDate(
      symbol.exDividendDate
    );
    fields.exDividendDate = estExDivDate?.getTime();
    fields.exDivIsEst = exDivIsEst;

    fields.divPaymentsToExpiry =
      estExDivDate && estExDivDate < new Date(fields.expireDate)
        ? fields.quarterlyDividend *
          (1 +
            Math.floor(
              ((fields.expireDate - estExDivDate.getTime()) / ONE_YEAR) *
                fields.annualDividend
            ))
        : 0;

    // Calculate transactions
    fields.stockShares = stockTransactions.reduce(
      (total, transaction) => total + transaction.quantity,
      0
    );
    const optionsSold =
      optionTransactions.reduce(
        (total, transaction) => total + transaction.quantity,
        0
      ) * -1;
    fields.weightedDate =
      stockTransactions
        .filter((transaction) => transaction.quantity > 0)
        .reduce(
          (sum, transaction) =>
            sum + transaction.quantity * new Date(transaction.date).getTime(),
          0
        ) / fields.stockShares;
    fields.holdingPeriod =
      (Date.now() - fields.weightedDate) / 1000 / 60 / 60 / 24 / 365;
    fields.cost = stockTransactions.reduce(
      (sum, transaction) => sum + transaction.quantity * transaction.price,
      0
    );
    fields.avgCostPerShare = fields.cost / fields.stockShares;

    fields.openOptions = openOptions;
    fields.sharesCovered = optionsSold * 100;

    fields.sortedStockTransactions = stockTransactions.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    fields.sortedOptionTransactions = optionTransactions.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    fields.latestCall = latestCall;

    fields.openDate = optionsSold
      ? openOptions.reduce(
          (sum, cur) => sum + cur.date.getTime() * -1 * cur.quantity,
          0
        ) / optionsSold
      : null;
    // TODO: stock price when you bought sold recent call
    fields.stockPriceAtOpen = fields.sortedStockTransactions[0]
      ? Number(fields.sortedStockTransactions[0].price)
      : null;
    fields.currCallAtOpen = optionsSold
      ? openOptions.reduce(
          (sum, cur) => sum + cur.price * -1 * cur.quantity,
          0
        ) / optionsSold
      : null;

    fields.dividendsEarned = symbol.dividends
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

    // COVERED CALL
    fields.closedCCs =
      closedOptions.reduce((sum, cur) => sum + cur.price * cur.quantity, 0) *
      -1 *
      100;
    fields.shareGain =
      (fields.price - fields.avgCostPerShare) * fields.stockShares;

    fields.percentItmOtm = 1 - fields.strike / fields.price;

    if (!call) return fields;
    fields.bid = call.bid;
    fields.ask = call.ask;
    fields.mark = (call.bid + call.ask) / 2;
    fields._mark = fields.mark;

    const delta = call.delta;
    fields.netValuePerShare = fields.price - fields.mark;
    fields.netValue = fields.netValuePerShare * fields.stockShares;
    fields.value = fields.netValuePerShare * fields.stockShares;
    // fields.dayBalanceChange = (fields.price / (1 + fields.dayChangePercent / 100) * fields.dayChangePercent / 100) * fields.sharesCovered;
    fields.dayBalanceChange =
      fields.dayChangePercent *
      fields.price *
      fields.sharesCovered *
      (1 - delta);
    fields.effDivPA = fields.annualDividend / fields.netValuePerShare;

    fields.putBWs = 0; // TODO
    fields.openCCGain =
      ((fields.currCallAtOpen ?? fields.mark) - fields.mark) *
      fields.sharesCovered;
    fields.gainLoss =
      fields.shareGain +
      fields.estCumYield +
      fields.openCCGain +
      fields.closedCCs +
      fields.putBWs;

    fields.netInvestPerShare =
      fields.avgCostPerShare -
      (fields.currCallAtOpen ?? fields.mark) -
      (fields.closedCCs - fields.putBWs) / fields.stockShares;

    // Max. Returns
    fields.maxGainPerShare =
      fields.strike - fields.netValuePerShare + fields.divPaymentsToExpiry;
    fields.maxGain = fields.maxGainPerShare * fields.sharesCovered;
    fields.maxReturn = fields.maxGainPerShare / fields.netValuePerShare;
    fields.maxReturnPA = (fields.maxReturn * 365) / fields.daysToExpiry;

    // P.A Returns
    fields.pftNoChg =
      (Math.min(fields.price, fields.strike) + fields.divPaymentsToExpiry) /
        fields.netValuePerShare -
      1;
    fields.pa = (fields.pftNoChg * 365) / fields.daysToExpiry;

    const ccBasis = fields.price - fields.mark;
    fields.paAtExDiv =
      fields.divPaymentsToExpiry && fields.price > fields.strike
        ? ((fields.strike / ccBasis - 1) * 365) / fields.daysToExpiry
        : fields.pa;

    // Protection
    fields.percentToBE = fields.netInvestPerShare / fields.price - 1;
    fields.downPT =
      1 - (fields.netValuePerShare - fields.divPaymentsToExpiry) / fields.price;

    return fields;
  });

  return Promise.all(coveredCalls);
}

function partitionOptions(transactions: Selectable<Transaction>[]) {
  const open: Selectable<Transaction>[] = [];
  const closed: Selectable<Transaction>[] = [];
  const contracts: Record<string, Selectable<Transaction>[]> = {};
  for (const t of transactions) {
    if (contracts[t.symbol]) contracts[t.symbol].push(t);
    else contracts[t.symbol] = [t];
  }
  Object.values(contracts).forEach((transactions) =>
    transactions.reduce((sum, cur) => sum + cur.quantity, 0) === 0
      ? closed.push(...transactions)
      : open.push(...transactions)
  );
  return { openOptions: open, closedOptions: closed };
}

type PaperOption =
  PaperAPI["_routes"]["option"][":symbol"]["get"]["response"]["200"];

export async function formatCoveredCallRollData(
  data: (Selectable<Holding> & { contractSymbol?: string })[],
  openOption: FormattedCoveredCall[],
  preferences = { strikePercent: 1, plusMonths: 2 }
) {
  const coveredCalls: Promise<FormattedCoveredCallRollData>[] = data.map(
    async (cc) => {
      const fields = {} as FormattedCoveredCallRollData;
      const option = openOption.find(
        (o) => o.id === cc.id
      ) as FormattedCoveredCall;
      const target = {
        strike: option.strike * preferences.strikePercent,
        expiry:
          new Date(option.expireDate).getTime() +
          1000 * 60 * 60 * 24 * 30 * preferences.plusMonths,
      };
      let rollOption: PaperOption | undefined;
      if (cc.contractSymbol) {
        const details = contractToDetails(cc.contractSymbol);
        const chain = (
          await paper
            .option({ symbol: details.symbol })
            .expirations({ expiration: details.expiry.getTime() })
            .chain.get()
        ).data;
        if (!chain) throw new Error("No Options Found");
        const optionsOfType =
          details.type === "call"
            ? chain.options.filter((item) => item.type === "call")
            : chain.options.filter((item) => item.type === "put");

        rollOption = optionsOfType.find(
          (option) => option.strike === details.strike
        );
      } else {
        rollOption = await getClosestOption(cc.symbol, target, "call", true);
      }
      if (!rollOption) return fields;

      const daysToRollExpiry = Math.ceil(
        (rollOption.expiry - Date.now()) / 1000 / 60 / 60 / 24 + 1
      );

      fields.id = option.id;
      fields.rollStrike = rollOption.strike;
      fields.rollExpiry = rollOption.expiry;
      fields.rollMark = ((rollOption.ask ?? 0) + (rollOption.bid ?? 0)) / 2;
      fields.rollSpreadPercent =
        ((rollOption.ask ?? 0) - (rollOption.bid ?? 0)) / fields.rollMark;
      fields.rollPremium = option.mark - fields.rollMark;
      fields.currentMaxGain = option.maxGain;
      fields.rollDivsPerShare =
        option.exDividendDate && option.exDividendDate < fields.rollExpiry
          ? option.quarterlyDividend *
            (1 +
              Math.floor(
                ((fields.rollExpiry - option.exDividendDate) / ONE_YEAR) *
                  option.annualDividend
              ))
          : 0;
      fields.currentNcGain =
        Math.min(option.price, option.strike) * option.sharesCovered -
        option.netValue +
        option.divPaymentsToExpiry * option.sharesCovered;
      fields.rollNcGain =
        Math.min(option.price, rollOption.strike) * option.sharesCovered -
        option.netValue +
        (fields.rollDivsPerShare - fields.rollPremium) * option.sharesCovered;
      fields.netNcGain = fields.rollNcGain - fields.currentNcGain;

      fields.netNcPa =
        ((fields.netNcGain /
          (option.netValue + fields.rollPremium * option.sharesCovered)) *
          365) /
        daysToRollExpiry;
      fields.exDivPa =
        fields.rollDivsPerShare > 0 && option.price > fields.rollStrike
          ? ((fields.rollStrike /
              (option.netValuePerShare + fields.rollPremium - 1)) *
              365) /
            daysToRollExpiry
          : fields.netNcPa;
      fields.rollMaxGain =
        (fields.rollStrike -
          option.netValuePerShare -
          fields.rollPremium +
          fields.rollDivsPerShare) *
        option.sharesCovered;
      fields.netMaxGain = fields.rollMaxGain - option.maxGain;
      fields.netMaxPa =
        ((fields.netMaxGain /
          option.sharesCovered /
          (option.netValuePerShare + fields.rollPremium)) *
          365) /
        daysToRollExpiry;

      return fields;
    }
  );

  return Promise.all(coveredCalls);
}
