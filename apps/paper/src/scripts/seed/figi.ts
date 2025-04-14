import db from "@/db";
import { stocks } from "@/db/schema";
import { and, eq, isNull, sql } from "drizzle-orm";

const missingFigis = await db
  .select({
    figi: stocks.figi,
    symbol: stocks.symbol,
    type: stocks.type,
    id: stocks.id,
  })
  .from(stocks)
  .where(
    and(
      sql`${stocks.type} != 'PFD'`,
      sql`${stocks.type} != 'SP'`,
      isNull(stocks.figi)
    )
  );

const nonPreferreds = missingFigis.filter(
  (stock) => stock.type !== "PFD" && stock.type !== "SP"
);

for (let i = 0; i < nonPreferreds.length; i += 100) {
  const batch = nonPreferreds.slice(i, i + 100);
  const figiResponse = await fetch("https://api.openfigi.com/v3/mapping", {
    method: "POST",
    body: JSON.stringify(
      batch.map((stock) => ({
        idType: "TICKER",
        idValue: stock.symbol.replace(".", "/"),
        exchCode: "US",
      }))
    ),
    // @ts-expect-error: idk
    headers: {
      "Content-Type": "application/json",
      "X-OPENFIGI-APIKEY": Bun.env.FIGI_API_KEY,
    },
  });

  const figiData = await figiResponse.json();

  for (let i = 0; i < figiData.length; i++) {
    if (figiData[i].data) {
      await db
        .update(stocks)
        .set({ figi: figiData[i].data[0].figi })
        .where(eq(stocks.id, batch[i].id));
    } else {
      console.log(batch[i].symbol);
    }
  }
}

const preferreds = missingFigis.filter((stock) => stock.type === "PFD");

for (let i = 0; i < preferreds.length; i += 100) {
  const batch = preferreds.slice(i, i + 100);
  const figiResponse = await fetch("https://api.openfigi.com/v3/mapping", {
    method: "POST",
    body: JSON.stringify(
      batch.map((stock) => ({
        idType: "BASE_TICKER",
        securityType2: "Preferred Stock",
        idValue: stock.symbol,
      }))
    ),
    // @ts-expect-error: idk
    headers: {
      "Content-Type": "application/json",
      "X-OPENFIGI-APIKEY": Bun.env.FIGI_API_KEY,
    },
  });

  const figiData = await figiResponse.json();

  for (let i = 0; i < figiData.length; i++) {
    if (figiData[i].data) {
      await db
        .update(stocks)
        .set({ figi: figiData[i].data[0].figi })
        .where(eq(stocks.id, batch[i].id));
    }
  }
}
