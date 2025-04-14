import type { Selectable } from "kysely";
import type { Idea } from "~/lib/server/db/schema";
import { getSummary } from "~/lib/server/external/symbolAPI";
import paper from "~/lib/server/paper";
import { annualDividend, getNextDividendDate } from "./dividends";
import type { FormattedOptionIdea } from "./types";
import {
  contractToDetails,
  getClosestOption,
  getContractSymbol,
} from "./utils";
const ONE_YEAR = 1000 * 60 * 60 * 24 * 365;

export const formatOptionIdeas = async (data: Selectable<Idea>[]) => {
  const ideas: Promise<FormattedOptionIdea>[] = data.map(async (idea) => {
    const details = contractToDetails(idea.symbol);
    const callSymbol = getContractSymbol(
      details.symbol,
      details.strike,
      details.expiry,
      "call"
    );
    const putSymbol = getContractSymbol(
      details.symbol,
      details.strike,
      details.expiry,
      "put"
    );
    const protectivePutDetails = await getClosestOption(
      details.symbol,
      { strike: details.strike * 0.88, expiry: details.expiry.getTime() },
      "put"
    );
    const protectivePutSymbol = protectivePutDetails
      ? getContractSymbol(
          details.symbol,
          protectivePutDetails.strike,
          protectivePutDetails.expiry,
          "put"
        )
      : null;

    const [symbol, { data: call }, { data: put }, protectivePut] =
      await Promise.all([
        getSummary(details.symbol),
        paper.option({ symbol: callSymbol }).get(),
        paper.option({ symbol: putSymbol }).get(),
        protectivePutSymbol
          ? paper.option({ symbol: protectivePutSymbol }).get()
          : null,
      ]);

    const fields = {} as FormattedOptionIdea;

    fields.id = idea.id;
    fields.symbol = details.symbol;
    fields.type = idea.type;
    fields.notes = idea.notes;
    fields.expireDate = details.expiry.getTime();
    fields.strike = details.strike;

    if (!symbol) return fields;
    fields.price = symbol.price;
    fields.dayChangePercent = symbol.dayChangePercent ?? 0;

    fields.contractSymbol = callSymbol;
    fields.daysToExpiry = Math.ceil(
      (details.expiry.getTime() - Date.now()) / 1000 / 60 / 60 / 24 + 1
    );
    fields.openDate = Date.now();

    fields.latestDividend =
      symbol.dividends.length &&
      symbol.dividends.sort((a, b) => b.date - a.date)[0].amount;
    fields.annualDividend = annualDividend(
      symbol.exDividendDate,
      symbol.dividends
    );
    fields.quarterlyDividend = fields.annualDividend / 4;

    const { estExDivDate, exDivIsEst } = getNextDividendDate(
      symbol.exDividendDate
    );
    fields.exDividendDate = estExDivDate?.getTime();
    fields.exDivIsEst = exDivIsEst;

    fields.divPaymentsToExpiry =
      estExDivDate && estExDivDate < new Date(fields.expireDate)
        ? (1 +
            Math.floor(
              (fields.expireDate - estExDivDate.getTime()) / (ONE_YEAR / 4)
            )) *
          fields.quarterlyDividend
        : 0;

    if (!call || !put) return fields;
    fields.callBid = call.bid;
    fields.callAsk = call.ask;
    fields.bidAskCall = `${call.bid}${String.fromCharCode(160)}-${String.fromCharCode(160)}${call.ask}`;
    fields.callMark = (call.bid + call.ask) / 2;

    fields.putBid = put.bid;
    fields.putAsk = put.ask;
    fields.putMark = (put.bid + put.ask) / 2;

    // COVERED CALL
    fields.ccBasis = fields.price - fields.callMark;
    fields.effDivPA = fields.annualDividend / fields.ccBasis;

    // Max. Returns
    fields.mxGain = fields.strike - fields.ccBasis + fields.divPaymentsToExpiry;
    fields.mx = fields.mxGain / fields.ccBasis;
    fields.mxPA = (fields.mx * 365) / fields.daysToExpiry;

    // P.A Returns
    fields.pftNoChg =
      (Math.min(fields.price, fields.strike) + fields.divPaymentsToExpiry) /
        fields.ccBasis -
      1;
    fields.pa = (fields.pftNoChg * 365) / fields.daysToExpiry;
    fields.paAtExDiv =
      fields.divPaymentsToExpiry && fields.price > fields.strike
        ? ((fields.strike / fields.ccBasis - 1) * 365) / fields.daysToExpiry
        : fields.pa;

    // Protection
    fields.downPT =
      1 - (fields.ccBasis - fields.divPaymentsToExpiry) / fields.price;
    fields.itm = fields.strike / fields.price;

    fields.paPlusPT = fields.pa + fields.downPT;
    fields.beLow = fields.ccBasis;
    fields.beHigh = fields.strike + fields.callMark;

    // PUT WRITE
    fields.pwBasis = fields.strike - fields.putMark;
    fields.mxGainPut = fields.putMark;
    fields.mxPut = fields.mxGainPut / fields.pwBasis;
    fields.mxPAPut = (fields.mxPut * 365) / fields.daysToExpiry;
    fields.pftNoChgPut =
      Math.min(fields.price, fields.strike) / fields.pwBasis - 1;
    fields.paPut = (fields.pftNoChgPut * 365) / fields.daysToExpiry;
    fields.downPTPut = 1 - fields.pwBasis / fields.price;

    fields.skewMkr = fields.pa - fields.paPut;

    if (!protectivePut?.data) return fields;
    // Protective Put
    fields.ppStrike = protectivePut.data.strike;
    fields.ppContractSymbol = protectivePutSymbol as string;
    fields.ppBid = protectivePut.data.bid;
    fields.ppAsk = protectivePut.data.ask;
    fields.ppMark = (protectivePut.data.ask + protectivePut.data.bid) / 2;
    fields.ppBasis = fields.ccBasis + fields.ppMark;
    fields.ppMaxGain = fields.mxGain - fields.ppMark;
    fields.ppMX = fields.ppMaxGain / fields.ppBasis;
    fields.ppMxPa = (fields.ppMX * 365) / fields.daysToExpiry;
    fields.ppPftNoChg =
      (Math.min(fields.price, fields.strike) + fields.divPaymentsToExpiry) /
        fields.ppBasis -
      1;
    fields.ppPA = (fields.ppPftNoChg * 365) / fields.daysToExpiry;
    fields.ppMaxLoss = fields.ppStrike - fields.ppBasis;
    fields.ppMaxLossPercent = fields.ppMaxLoss / fields.ppBasis;
    fields.ppPaAtExDiv =
      fields.divPaymentsToExpiry && fields.price > fields.strike
        ? ((fields.strike / fields.ppBasis - 1) * 365) / fields.daysToExpiry
        : fields.pa;
    fields.ppPaDiff = fields.ppPA - fields.ppPaAtExDiv;

    // Bull Put Spread
    fields.bpsMark = fields.putMark - fields.ppMark;
    fields.bpsMX = fields.bpsMark / (fields.strike - fields.bpsMark);
    fields.bpsMxPa = (fields.bpsMX * 365) / fields.daysToExpiry;
    fields.bpsMaxLoss = fields.ppStrike + fields.bpsMark - fields.strike;
    fields.bpsCC = fields.ccBasis - fields.putMark + fields.ppMark;
    fields.bpsPaStrike =
      ((fields.strike / fields.bpsCC - 1) * 365) / fields.daysToExpiry;
    fields.bpsDownside = fields.strike / fields.price - 1;
    fields.bpsBasis = (fields.bpsCC + fields.strike) / 2;
    fields.bpsProtection = fields.bpsBasis / fields.price - 1;
    fields.bpsInvest = fields.bpsCC * 100;
    fields.bpsMaxGain = (fields.strike - fields.bpsCC) * 100;
    fields.bpsGainPercent = fields.bpsMaxGain / fields.bpsInvest;
    fields.bpsBasis = (fields.strike + fields.bpsCC) / 2;
    fields.bpsExposure = fields.bpsInvest + fields.strike * 100;
    fields.bpsMaxLossAssigned = (fields.strike + fields.bpsCC) / 2;

    return fields;
  });

  return Promise.all(ideas);
};
