import cache from "~/lib/server/kv";
import logger from "~/lib/server/logger";
import paper from "~/lib/server/paper";
import { cacheMarketTime } from "~/lib/server/utils/market";
const PEG_HASH = "peg";

const YAHOO_API_BASE = "https://query2.finance.yahoo.com";
const YAHOO_PRICES_URL = `${YAHOO_API_BASE}/v7/finance/spark`;
const YAHOO_TIMESERIES_URL = `${YAHOO_API_BASE}/ws/fundamentals-timeseries/v1/finance/timeseries`;

export async function getSummary(symbol: string) {
  const { data } = await paper.stocks({ symbol }).get();
  return data;
}

export async function getChartingPrices(symbols: string[], interval = "1m") {
  const yahooSymbols = symbols.map((symbol) =>
    symbol.replace("-", "-P").replace(".", "-")
  );

  try {
    const groups: string[][] = [];
    while (yahooSymbols.length) {
      groups.push(yahooSymbols.splice(0, 20));
    }
    const responses = await Promise.all(
      groups.map((group) =>
        fetch(
          `${YAHOO_PRICES_URL}?symbols=${group.join(",")}&range=1d&interval=${interval}`
        )
      )
    );
    const data = await Promise.all(
      responses.map((response) => response.json())
    );

    return data
      .flatMap((datum) => datum.spark.result)
      .map((result) => {
        const chart = result.response[0];

        const symbol = chart.meta.symbol.replace("-P", "-");
        const previousClose = chart.meta.previousClose;
        if (!chart.timestamp) {
          return {
            symbol,
            dates: ["9:30"],
            prices: [previousClose],
            previousClose,
            gain: 0,
          };
        }
        const dates = chart.timestamp.map((timestamp) => {
          const date = new Date(timestamp * 1000);
          return `${date.getHours()}:${date.getMinutes().toString().padStart(2, "0")}`;
        });

        const prices = chart.indicators.quote[0].close;
        const gain = prices[prices.length - 1] - previousClose;
        if (dates[0] !== "9:30") {
          dates.unshift("9:30");
          prices.unshift(previousClose);
        }
        for (let i = 0; i < prices.length; i++) {
          if (prices[i] === null) {
            if (i === 0) prices[i] = previousClose;
            else prices[i] = prices[i - 1];
          }
        }

        return { symbol, dates, prices, previousClose, gain };
      });
  } catch (e) {
    logger.error(e, "symbolAPI.getChartingPrices()");
    return [];
  }
}

export async function getPeg(symbol: string) {
  const cached: number = await cache.get(PEG_HASH, symbol);
  if (cached) return cached;

  const yahooSymbol = symbol.replace("-", "-P").replace(".", "-");
  try {
    const response = await fetch(
      `${YAHOO_TIMESERIES_URL}/${yahooSymbol}?type=trailingPegRatio&period1=0&period2=${Math.trunc(Date.now() / 1000)}`
    );
    const json = await response.json();
    const peg =
      json.timeseries?.result?.[0]?.trailingPegRatio?.[0]?.reportedValue?.raw;

    if (peg) cache.set(PEG_HASH, symbol, peg, cacheMarketTime(60 * 60));
    return peg;
  } catch (e) {
    logger.error(e, "symbolAPI.peg()");
  }
}
