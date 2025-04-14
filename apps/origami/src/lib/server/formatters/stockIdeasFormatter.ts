import type { Selectable } from "kysely";
import type { Idea } from "~/lib/server/db/schema";
import { getPeg, getSummary } from "~/lib/server/external/symbolAPI";
import { getNextDividendDate, getTTMDividendYield } from "./dividends";
import type { FormattedStockIdea } from "./types";

export const formatStockIdeas = async (data: Selectable<Idea>[]) => {
  const ideas: Promise<FormattedStockIdea>[] = data.map(async (idea) => {
    const [symbol, peg] = await Promise.all([
      getSummary(idea.symbol),
      getPeg(idea.symbol),
    ]);

    const fields = {} as FormattedStockIdea;

    fields.id = idea.id;
    fields.symbol = idea.symbol;
    fields.type = idea.type;
    fields.notes = idea.notes;
    fields.updatedAt = idea.updatedAt;

    fields.peg = peg;

    if (!symbol || !symbol.price) return fields;

    fields.price = symbol.price;
    fields.dayChangePercent = symbol.dayChangePercent ?? 0;
    fields.fiftyTwoWeekHigh = symbol.fiftyTwoWeekHigh;
    fields.fiftyTwoWeekLow = symbol.fiftyTwoWeekLow;
    fields.forwardPE = symbol.forwardPE;
    fields.marketCap = symbol.marketCap;
    fields.earningsDate =
      symbol.earningsDate && symbol.earningsDate > Date.now()
        ? symbol.earningsDate
        : null;

    fields.rate = getTTMDividendYield(symbol.dividends, symbol.price);

    const { estExDivDate, exDivIsEst } = getNextDividendDate(
      symbol.exDividendDate
    );
    fields.exDividendDate = estExDivDate?.getTime();
    fields.exDivIsEst = exDivIsEst;

    fields.target = idea.target;
    fields.ratio = idea.target ? fields.price / idea.target : null;

    return fields;
  });

  return Promise.all(ideas);
};
