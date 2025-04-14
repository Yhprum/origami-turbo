import type { Selectable } from "kysely";
import type { OpenOrder } from "~/lib/server/db/schema";
import { getSummary } from "~/lib/server/external/symbolAPI";
import { getNextDividendDate } from "./dividends";
import type { FormattedOpenOrder } from "./types";

export const formatOpenOrders = async (data: Selectable<OpenOrder>[]) => {
  const holdings: Promise<FormattedOpenOrder>[] = data.map(async (holding) => {
    // TODO: add support for mutual funds
    const symbol = await getSummary(holding.symbol);
    const fields = {} as FormattedOpenOrder;

    fields.id = holding.id;
    fields.holding = holding.holdingId;
    fields.symbol = holding.symbol;
    fields.gtc = holding.gtc.getTime();
    fields.buySell = holding.buy ? "B" : "S";
    fields.limitStop = holding.ordertype;
    fields.quantity = holding.quantity;

    fields.orderPrice = Number(holding.price);

    if (!symbol || !symbol.price) return fields;

    fields.price = symbol.price;
    fields.priceDelta =
      !holding.buy && holding.ordertype === "L"
        ? fields.orderPrice / fields.price
        : fields.price / fields.orderPrice;

    fields.midpoint =
      symbol.fiftyTwoWeekHigh && symbol.fiftyTwoWeekLow
        ? (symbol.fiftyTwoWeekHigh + symbol.fiftyTwoWeekLow) / 2
        : symbol.price;
    fields.value = symbol.price * holding.quantity;
    const { estExDivDate, exDivIsEst } = getNextDividendDate(
      symbol.exDividendDate
    );
    fields.exDividendDate = estExDivDate?.getTime();
    fields.exDivIsEst = exDivIsEst;

    return fields;
  });
  return Promise.all(holdings);
};
