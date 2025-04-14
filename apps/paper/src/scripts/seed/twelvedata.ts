import db from "@/db";
import { stocks } from "@/db/schema";

interface TwelveDataStock {
  symbol: string;
  name: string;
  currency: string;
  exchange: string;
  mic_code: string;
  country: string;
  type: TwelveDataTickerType;
  figi_code: string;
  cfi_code: string;
  isin: string;
}

const stockResponse = await fetch(
  "https://api.twelvedata.com/stocks?source=docs&country=United States"
);

const { data: stockData } = await stockResponse.json();
console.log(stockData.length);

// batch insert 1000 at a time
// https://github.com/drizzle-team/drizzle-orm/pull/3816
for (let i = 0; i < stockData.length; i += 100) {
  const batch = stockData.slice(i, i + 100);
  await db
    .insert(stocks)
    .values(
      batch.map((result: TwelveDataStock) => ({
        figi: result.figi_code || null,
        symbol: result.symbol.replace(".PR.", "-"),
        name: result.name,
        type: parseTickerType(result.type),
        price: 0,
        marketIdentifierCode: result.mic_code,
        source: "twelveData",
      }))
    )
    .onConflictDoNothing();
}

const etfResponse = await fetch(
  "https://api.twelvedata.com/etfs?source=docs&country=United States"
);

const { data: etfData } = await etfResponse.json();
console.log(etfData.length);

// batch insert 1000 at a time
// https://github.com/drizzle-team/drizzle-orm/pull/3816
for (let i = 0; i < etfData.length; i += 100) {
  const batch = etfData.slice(i, i + 100);
  await db
    .insert(stocks)
    .values(
      batch.map((result: TwelveDataStock) => ({
        figi: result.figi_code || null,
        symbol: result.symbol,
        name: result.name,
        type: "ETF",
        price: 0,
        marketIdentifierCode: result.mic_code,
        source: "twelveData",
      }))
    )
    .onConflictDoNothing();
}

const tickerTypes = [
  "Agricultural Product",
  "American Depositary Receipt",
  "Bond",
  "Bond Fund",
  "Closed-end Fund",
  "Common Stock",
  "Depositary Receipt",
  "Digital Currency",
  "Energy Resource",
  "ETF",
  "Exchange-Traded Note",
  "Global Depositary Receipt",
  "Index",
  "Industrial Metal",
  "Limited Partnership",
  "Livestock",
  "Mutual Fund",
  "Physical Currency",
  "Precious Metal",
  "Preferred Stock",
  "REIT",
  "Right",
  "Structured Product",
  "Trust",
  "Unit",
  "Warrant",
] as const;

type TwelveDataTickerType = (typeof tickerTypes)[number];

function parseTickerType(type: (typeof tickerTypes)[number]) {
  switch (type) {
    case "Common Stock":
      return "CS";
    case "Preferred Stock":
      return "PFD";
    case "ETF":
      return "ETF";
    case "Exchange-Traded Note":
      return "ETN";
    case "Global Depositary Receipt":
      return "GDR";
    case "American Depositary Receipt":
      return "ADRC";
    case "Bond":
      return "BOND";
    case "Bond Fund":
      return "BOND";
    case "Mutual Fund":
      return "OEF";
    case "Right":
      return "RIGHT";
    case "Warrant":
      return "WARRANT";
    case "Unit":
      return "UNIT";
    case "Structured Product":
      return "SP";
    default:
      return "OTHER";
  }
}
