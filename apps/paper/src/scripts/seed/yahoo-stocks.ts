import db from "@/db";
import { stocks } from "@/db/schema";

// Get yahoo cookie + crumb
const cookieResponse = await fetch("https://finance.yahoo.com", {
  headers: { Accept: "text/html" },
});
const cookie = cookieResponse.headers.get("set-cookie")?.match("A1=[^;]*")?.[0];

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

const sectors = [
  "Basic Materials",
  "Communication Services",
  "Consumer Cyclical",
  "Consumer Defensive",
  "Energy",
  "Financial Services",
  "Healthcare",
  "Industrials",
  "Real Estate",
  "Technology",
  "Utilities",
];

let count = 0;
let total = 0;
// Fetch stocks
for (const sector of sectors) {
  count = 0;
  total = 0;
  do {
    const response = await fetch(
      `https://query2.finance.yahoo.com/v1/finance/screener?crumb=${crumb}`,
      {
        method: "POST",
        // @ts-ignore: idk still
        headers: {
          Cookie: cookie,
        },
        body: JSON.stringify({
          size: 200,
          offset: count,
          sortType: "DESC",
          sortField: "intradaymarketcap",
          quoteType: "EQUITY",
          topOperator: "AND",
          query: {
            operator: "AND",
            operands: [
              {
                operator: "EQ",
                operands: ["region", "us"],
              },
              {
                operator: "EQ",
                operands: ["sector", sector],
              },
            ],
          },
        }),
      }
    );
    const data = await response.json();

    const list = data.finance.result[0].quotes;
    await db
      .insert(stocks)
      .values(
        list.map((stock: any) => ({
          symbol: stock.symbol.replace(/-([^P])/, ".$1").replace(/-P/, "-"),
          name: stock.shortName,
          sector,
          type: "common",
          price: stock.regularMarketPrice,
          rate: stock.dividendYield / 100,
          fiftyTwoWeekHigh: stock.fiftyTwoWeekHigh,
          fiftyTwoWeekLow: stock.fiftyTwoWeekLow,
          forwardPE: stock.forwardPE,
          marketCap: stock.marketCap,
          dayChange: stock.regularMarketChange,
          dayChangePercent: stock.regularMarketChangePercent / 100,
          exDividendDate: stock.dividendDate ? stock.dividendDate * 1000 : null,
          earningsDate: stock.earningsTimestampStart
            ? stock.earningsTimestampStart * 1000
            : null,
        }))
      )
      .onConflictDoNothing();

    if (!total) total = data.finance.result[0].total;
    count += 200;
    console.log(count, total);
  } while (count < total);
}

// Fetch ETFs
count = 0;
total = 0;
do {
  const response = await fetch(
    `https://query2.finance.yahoo.com/v1/finance/screener?crumb=${crumb}`,
    {
      method: "POST",
      // @ts-ignore: idk still
      headers: {
        Cookie: cookie,
      },
      body: JSON.stringify({
        size: 200,
        offset: count,
        sortField: "fundnetassets",
        sortType: "DESC",
        quoteType: "ETF",
        topOperator: "AND",
        query: { operator: "EQ", operands: ["region", "us"] },
      }),
    }
  );
  const data = await response.json();

  const list = data.finance.result[0].quotes;
  await db
    .insert(stocks)
    .values(
      list.map((stock: any) => ({
        symbol: stock.symbol,
        name: stock.shortName,
        type: "etf",
        price: stock.regularMarketPrice,
        rate: stock.dividendRate,
        fiftyTwoWeekHigh: stock.fiftyTwoWeekHigh,
        fiftyTwoWeekLow: stock.fiftyTwoWeekLow,
        forwardPE: stock.forwardPE,
        marketCap: stock.marketCap,
        dayChange: stock.regularMarketChange,
        dayChangePercent: stock.regularMarketChangePercent / 100,
        exDividendDate: stock.dividendDate ? stock.dividendDate * 1000 : null,
      }))
    )
    .onConflictDoNothing();

  if (!total) total = data.finance.result[0].total;
  count += 200;
  console.log(count, total);
} while (count < total);
