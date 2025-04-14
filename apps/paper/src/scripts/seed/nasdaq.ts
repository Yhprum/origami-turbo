import db from "@/db";
import { stocks } from "@/db/schema";

interface NasdaqStock {
  data: {
    filters: null;
    records: {
      totalrecords: number;
      limit: number;
      offset: number;
      data: {
        asOf: null;
        headers: {
          fundType: string;
          symbol: string;
          companyName: string;
          lastSalePrice: string;
          netChange: string;
          percentageChange: string;
        };
        rows: {
          fundType: string;
          symbol: string;
          companyName: string;
          lastSalePrice: string | null;
          netChange: string | null;
          percentageChange: string | null;
          deltaIndicator: string | null;
        }[];
      };
    };
  };
  message: null;
  status: { rCode: 200; bCodeMessage: null; developerMessage: null };
}

let total = 1;
let offset = 0;
const limit = 1000;

while (offset < total + limit) {
  const response = await fetch(
    `https://api.nasdaq.com/api/screener/mutualfunds?limit=${limit}&offset=${offset}&fundtype=MF`
  );

  const data: NasdaqStock = await response.json();

  total = data.data.records.totalrecords;
  offset += limit;

  console.log(
    "inserting",
    data.data.records.data.rows.filter((row) => row.lastSalePrice !== null)
  );
  console.log(`${offset} / ${total}`);

  await db
    .insert(stocks)
    .values(
      data.data.records.data.rows
        .filter((row) => row.lastSalePrice !== null)
        .map((row) => ({
          symbol: row.symbol,
          name: row.companyName,
          type: "OEF" as const,
          price: row.lastSalePrice
            ? Number(row.lastSalePrice.replace(/[^0-9\.-]+/g, ""))
            : 0,
          dayChange: row.netChange
            ? Number(row.netChange.replace(/[^0-9\.-]+/g, ""))
            : null,
          dayChangePercent: row.percentageChange
            ? Number(row.percentageChange.replace(/[^0-9\.-]+/g, "")) / 100
            : null,
          source: "nasdaq" as const,
        }))
    )
    .onConflictDoNothing();
}
