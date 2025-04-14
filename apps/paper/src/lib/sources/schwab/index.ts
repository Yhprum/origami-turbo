import type { options } from "@/db/schema";
import {
  AssetMainType,
  type OptionChain,
  type QuoteResponse,
} from "@/lib/sources/schwab/types";
import { isOptionContract } from "@/lib/utils";
import { getSchwabAuthToken } from "@/routes/token/token.service";

const BASE_URL = "https://api.schwabapi.com/marketdata/v1";

export async function getQuotes(symbols: string[]) {
  const response: QuoteResponse = await schwabFetch(
    `${BASE_URL}/quotes?symbols=${symbols.map((symbol) => toSchwabSymbol(symbol))}`
  );

  const stocks = [];
  const options = [];

  for (const quote of Object.values(response)) {
    if ("assetMainType" in quote) {
      if (quote.assetMainType === AssetMainType.EQUITY)
        stocks.push({
          symbol: quote.symbol,
          name: quote.reference?.description,
          price: quote.regular?.regularMarketLastPrice ?? 0,
          change: quote.regular?.regularMarketNetChange ?? 0,
          changesPercentage:
            (quote.regular?.regularMarketPercentChange ?? 0) / 100,
          yearHigh: quote.quote?.["52WeekHigh"],
          yearLow: quote.quote?.["52WeekLow"],
          exDividendDate: quote.fundamental?.divExDate
            ? new Date(quote.fundamental.divExDate).getTime()
            : undefined,
          pe: quote.fundamental?.peRatio,
          marketCap: null,
          earningsAnnouncement: null,
        });
      else if (quote.assetMainType === AssetMainType.OPTION)
        options.push({
          contract: quote.symbol,
          type: quote.reference?.contractType === "P" ? "put" : "call",
          strike: quote.reference?.strikePrice,
          expiry: new Date(
            quote.reference?.expirationYear ?? 0,
            (quote.reference?.expirationMonth ?? 0) - 1,
            quote.reference?.expirationDay ?? 0
          ),
          bid: quote.quote?.bidPrice ?? null,
          ask: quote.quote?.askPrice ?? null,
          delta: quote.quote?.delta ?? 0,
          openInterest: quote.quote?.openInterest ?? 0,
          volatility: quote.quote?.volatility ?? 0,
        });
    }
  }
  return { stocks, options };
}

export async function getQuote(symbol: string) {
  const response: QuoteResponse = await schwabFetch(
    `${BASE_URL}/quotes?symbols=${toSchwabSymbol(symbol)}`
  );
  const quote = response[toSchwabSymbol(symbol)];
  if ("assetMainType" in quote) {
    if (quote.assetMainType === AssetMainType.EQUITY)
      return {
        // symbol: quote.symbol,
        // name: quote.reference?.description,
        price: quote.regular?.regularMarketLastPrice ?? 0,
        dayChange: quote.regular?.regularMarketNetChange ?? 0,
        dayChangePercent:
          (quote.regular?.regularMarketPercentChange ?? 0) / 100,
        fiftyTwoWeekHigh: quote.quote?.["52WeekHigh"],
        fiftyTwoWeekLow: quote.quote?.["52WeekLow"],
        exDividendDate: quote.fundamental?.divExDate
          ? new Date(quote.fundamental.divExDate).getTime()
          : undefined,
        forwardPE: quote.fundamental?.peRatio,
        marketCap: null,
        earningsDate: null,
      };
    if (quote.assetMainType === AssetMainType.MUTUAL_FUND)
      return {
        // symbol: quote.symbol,
        // name: quote.reference?.description,
        price: quote.quote?.lastPrice ?? 0,
        dayChange: quote.quote?.netChange ?? 0,
        dayChangePercent: (quote.quote?.netPercentChange ?? 0) / 100,
        fiftyTwoWeekHigh: quote.quote?.["52WeekHigh"],
        fiftyTwoWeekLow: quote.quote?.["52WeekLow"],
        exDividendDate: quote.fundamental?.divExDate
          ? new Date(quote.fundamental.divExDate).getTime()
          : undefined,
        forwardPE: quote.fundamental?.peRatio,
        marketCap: null,
        earningsDate: null,
      };
  }
}

export async function getOptionChain(symbol: string) {
  const today = new Date().toISOString().split("T")[0];
  const response: OptionChain = await schwabFetch(
    `${BASE_URL}/chains?symbol=${toSchwabSymbol(symbol)}&fromDate=${today}`
  );

  const optionResponses: Omit<typeof options.$inferInsert, "stockId">[] = [];

  if (response.callExpDateMap) {
    for (const callMap of Object.values(response.callExpDateMap)) {
      for (const [call] of Object.values(callMap)) {
        if (
          call.symbol &&
          call.putCall &&
          call.strikePrice &&
          call.expirationDate
        )
          optionResponses.push({
            contractSymbol: call.symbol.replaceAll(" ", ""),
            type: call.putCall.toLowerCase() as "call" | "put",
            strike: call.strikePrice,
            expiry: new Date(call.expirationDate).getTime(),
            bid: call.bid ?? 0,
            ask: call.ask ?? 0,
            delta: call.delta ?? 0,
            gamma: call.gamma ?? 0,
            theta: call.theta ?? 0,
            vega: call.vega ?? 0,
            openInterest: call.openInterest ?? 0,
            impliedVolatility: call.volatility ?? 0,
          });
      }
    }
  }

  if (response.putExpDateMap) {
    for (const putMap of Object.values(response.putExpDateMap)) {
      for (const [put] of Object.values(putMap)) {
        if (put.symbol && put.putCall && put.strikePrice && put.expirationDate)
          optionResponses.push({
            contractSymbol: put.symbol.replaceAll(" ", ""),
            type: put.putCall.toLowerCase() as "call" | "put",
            strike: put.strikePrice,
            expiry: new Date(put.expirationDate).getTime(),
            bid: put.bid ?? 0,
            ask: put.ask ?? 0,
            delta: put.delta ?? 0,
            gamma: put.gamma ?? 0,
            theta: put.theta ?? 0,
            vega: put.vega ?? 0,
            openInterest: put.openInterest ?? 0,
            impliedVolatility: put.volatility ?? 0,
          });
      }
    }
  }

  return optionResponses;
}

function toSchwabSymbol(symbol: string) {
  if (isOptionContract(symbol)) {
    const [symbolPart, contractPart] = symbol.split(/(\d.*)/);
    return `${symbolPart.toUpperCase()}  ${contractPart.toUpperCase()}`;
  }

  return symbol.replace("-", "/PR").toUpperCase();
}

async function schwabFetch(url: string) {
  const accessToken = await getSchwabAuthToken();
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (response.status === 401) {
    throw new Error("Schwab token expired");
  }

  return response.json();
}
