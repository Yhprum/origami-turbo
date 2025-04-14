import db from "@/db";
import { stocks } from "@/db/schema";
import { polygonClient } from "@/lib/sources/polygon";

const exchanges = ["XNAS"];

for (const exchange of exchanges) {
  const response = await polygonClient.reference.tickers({
    market: "stocks",
    exchange,
    limit: 1000,
  });
  console.log(response.results.length);

  await db
    .insert(stocks)
    .values(
      response.results.map((result) => ({
        figi: result.composite_figi,
        symbol: result.ticker.replace("p", "-"),
        name: result.name,
        type: parseTickerType(result.type ?? "OTHER") as any,
        price: 0,
        marketIdentifierCode: result.primary_exchange,
        source: "polygon" as const,
      }))
    )
    .onConflictDoNothing();
}

function parseTickerType(type: string) {
  if (type === "FUND") return "CEF";
  return type;
}
