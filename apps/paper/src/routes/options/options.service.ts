import db from "@/db";
import { options, stocks } from "@/db/schema";
import { getOptionChain } from "@/lib/sources/schwab";
import { eq, sql } from "drizzle-orm";
import { parseContractSymbol } from "./options.utils";

export async function find(contractSymbol: string) {
  const { expiry } = parseContractSymbol(contractSymbol.toUpperCase());
  if (new Date(expiry) < new Date(Date.now() - 86400000)) {
    return null;
  }

  const contract = await db.query.options.findFirst({
    where: eq(options.contractSymbol, contractSymbol),
  });

  if (!contract) {
    const { symbol } = parseContractSymbol(contractSymbol.toUpperCase());
    const options = await fetchOptions(symbol);
    return options.find(
      (option) => option.contractSymbol === contractSymbol.toUpperCase()
    );
  }
  return contract;
}

export async function findExpirations(symbol: string) {
  const stock = await db.query.stocks.findFirst({
    where: eq(stocks.symbol, symbol.toUpperCase()),
  });
  if (!stock) return null;

  if (
    !stock?.optionExpirations ||
    !stock.lastOptionsUpdate ||
    stock.lastOptionsUpdate < Date.now() - 86400000
  ) {
    const options = await fetchOptions(symbol);
    const expirations = [...new Set(options.map((option) => option.expiry))];
    await db
      .update(stocks)
      .set({ optionExpirations: expirations, lastOptionsUpdate: Date.now() })
      .where(eq(stocks.symbol, symbol.toUpperCase()));
    return expirations;
  }
  return stock?.optionExpirations;
}

export async function findContracts(symbol: string, expiration: number) {
  const stock = await db.query.stocks.findFirst({
    where: eq(stocks.symbol, symbol.toUpperCase()),
    columns: {
      price: true,
      optionExpirations: true,
    },
    with: {
      options: {
        where: eq(options.expiry, expiration),
      },
    },
  });

  if (stock?.options.length === 0) {
    return {
      price: stock.price,
      optionExpirations: stock.optionExpirations,
      options: await fetchOptions(symbol),
    };
  }

  return stock;
}

async function fetchOptions(symbol: string) {
  const optionsResponse = await getOptionChain(symbol);
  if (!optionsResponse || optionsResponse.length === 0) return [];

  const stock = await db.query.stocks.findFirst({
    where: eq(stocks.symbol, symbol.toUpperCase()),
    columns: {
      id: true,
    },
  });
  if (!stock) return [];
  return await db
    .insert(options)
    .values(
      optionsResponse.map((option) => ({
        ...option,
        stockId: stock.id,
      }))
    )
    .onConflictDoUpdate({
      target: options.contractSymbol,
      set: {
        bid: sql`excluded.bid`,
        ask: sql`excluded.ask`,
        impliedVolatility: sql`excluded.impliedVolatility`,
        openInterest: sql`excluded.openInterest`,
      },
    })
    .returning();
}
