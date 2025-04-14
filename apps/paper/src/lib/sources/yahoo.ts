import yahooFinance from "yahoo-finance2";
import type { QuoteField } from "yahoo-finance2/dist/esm/src/modules/quote";

const YAHOO_QUOTE_FIELDS: QuoteField[] = [
  "regularMarketPrice",
  "regularMarketChange",
  "regularMarketChangePercent",
  "marketCap",
  "fiftyTwoWeekLow",
  "fiftyTwoWeekHigh",
  "forwardPE",
  "earningsTimestamp",
  "earningsTimestampStart",
  "earningsTimestampEnd",
  "trailingAnnualDividendYield",
];

const YAHOO_CHART_URL = "https://query2.finance.yahoo.com/v8/finance/chart";

export async function yahooQuote(symbol: string) {
  const quoteResponse = await yahooFinance.quoteCombine(symbol, {
    fields: YAHOO_QUOTE_FIELDS,
  });
  return {
    name: quoteResponse.longName,
    price: quoteResponse.regularMarketPrice,
    marketCap: quoteResponse.marketCap,
    yearLow: quoteResponse.fiftyTwoWeekLow,
    yearHigh: quoteResponse.fiftyTwoWeekHigh,
    pe: quoteResponse.forwardPE,
    change: quoteResponse.regularMarketChange,
    changesPercentage: quoteResponse.regularMarketChangePercent ?? 0,
    earningsAnnouncement: quoteResponse.earningsTimestamp,
  };
}

export async function getPrice(symbol: string) {
  const yahooSymbol = symbol.replace("-", "-P").replace(".", "-");
  const response = await fetch(
    `${YAHOO_CHART_URL}/${yahooSymbol}?interval=1d&period1=0&period2=${Date.now()}`
  );
  const data = await response.json();
  return data.chart.result?.[0].meta.regularMarketPrice;
}

export async function getEvents(symbol: string) {
  const yahooSymbol = symbol.replace("-", "-P").replace(".", "-");
  try {
    const response = await fetch(
      `${YAHOO_CHART_URL}/${yahooSymbol}?interval=1d&period1=0&period2=${Date.now()}&events=div|split`
    );
    const data = await response.json();

    const dividends: { date: number; amount: number }[] = Object.values(
      data.chart.result?.[0].events?.dividends ?? []
    );
    const splits: { date: number; numerator: number; denominator: number }[] =
      Object.values(data.chart.result?.[0].events?.splits ?? []);

    return {
      dividends: dividends.map((item) => ({
        date: item.date * 1000,
        amount: item.amount,
      })),
      splits: splits.map((item) => ({
        date: item.date * 1000,
        numerator: item.numerator,
        denominator: item.denominator,
      })),
    };
  } catch (e) {
    return { dividends: [], splits: [] };
  }
}

const store = { cookie: "", crumb: "", expiresAt: 0 };
export async function getYahooAuth() {
  if (store.expiresAt > Date.now()) return store;

  const cookieResponse = await fetch("https://finance.yahoo.com", {
    headers: { Accept: "text/html" },
  });
  const cookie = cookieResponse.headers
    .get("set-cookie")
    ?.match("A1=[^;]*")?.[0];

  const crumbResponse = await fetch(
    "https://query2.finance.yahoo.com/v1/test/getcrumb",
    {
      // @ts-ignore: idk
      headers: {
        Cookie: cookie,
        "User-Agent": "Mozilla/5.0",
      },
    }
  );
  const crumb = await crumbResponse.text();

  if (cookie) {
    store.cookie = cookie;
    store.crumb = crumb;
    store.expiresAt = Date.now() + 86400000;
  }
  return store;
}
