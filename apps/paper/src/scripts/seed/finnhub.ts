import db from "@/db";
import { stocks } from "@/db/schema";

interface FinnhubStock {
  currency: string;
  description: string;
  displaySymbol: string;
  figi: string;
  isin: string | null;
  mic: string;
  shareClassFIGI: string;
  symbol: string;
  symbol2: string;
  type: string;
}

const response = await fetch(
  `https://finnhub.io/api/v1/stock/symbol?exchange=US&token=${Bun.env.FINNHUB_API_KEY}`
);

const data = await response.json();

await db
  .insert(stocks)
  .values(
    data.map((result: FinnhubStock) => ({
      figi: result.figi,
      symbol: result.symbol,
      name: result.description,
      type: result.type,
      price: 0,
      marketIdentifierCode: result.mic,
      source: "finnhub",
    }))
  )
  .onConflictDoNothing();
