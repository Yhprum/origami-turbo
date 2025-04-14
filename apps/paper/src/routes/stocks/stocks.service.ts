import db from "@/db";
import { dividends, splits, stocks } from "@/db/schema";
import { REVALIDATE_TIME } from "@/lib/constants";
import { getQuote } from "@/lib/sources/schwab";
import { getEvents } from "@/lib/sources/yahoo";
import { eq, inArray } from "drizzle-orm";

export async function find(symbol: string) {
  const stock = await db.query.stocks.findFirst({
    where: eq(stocks.symbol, symbol.toUpperCase()),
    with: {
      dividends: {
        columns: {
          date: true,
          amount: true,
        },
      },
      splits: {
        columns: {
          date: true,
          numerator: true,
          denominator: true,
        },
      },
    },
  });
  if (stock) {
    if (!stock.fetchedEvents) {
      const events = await fetchEvents(symbol);
      stock.dividends = events.dividends;
      stock.splits = events.splits;
    }
    if (stock.updatedAt < Date.now() - REVALIDATE_TIME) {
      const updatedStock = await revalidate(symbol);
      return { ...stock, ...updatedStock };
    }
  }

  return stock;
}

export async function findMany(symbols: string[]) {
  const stocksResult = await db.query.stocks.findMany({
    where: inArray(
      stocks.symbol,
      symbols.map((symbol) => symbol.toUpperCase())
    ),
    with: {
      dividends: {
        columns: {
          date: true,
          amount: true,
        },
      },
      splits: {
        columns: {
          date: true,
          numerator: true,
          denominator: true,
        },
      },
    },
  });

  return Promise.all(
    stocksResult.map(async (stock) => {
      if (!stock.fetchedEvents) {
        const events = await fetchEvents(stock.symbol);
        stock.dividends = events.dividends;
        stock.splits = events.splits;
      }
      if (stock.updatedAt < Date.now() - REVALIDATE_TIME) {
        const updatedStock = await revalidate(stock.symbol);
        if (updatedStock) return { ...stock, ...updatedStock };
      }
      return stock;
    })
  );
}

async function fetchEvents(symbol: string) {
  const events = await getEvents(symbol);

  await db.transaction(async (tx) => {
    const stock = await tx.query.stocks.findFirst({
      where: eq(stocks.symbol, symbol.toUpperCase()),
      columns: {
        id: true,
      },
    });
    if (!stock) return;

    // Insert dividends
    if (events.dividends.length > 0) {
      await tx.insert(dividends).values(
        events.dividends.map((dividend) => ({
          stockId: stock.id,
          ...dividend,
        }))
      );
    }

    // Insert splits
    if (events.splits.length > 0) {
      await tx.insert(splits).values(
        events.splits.map((split) => ({
          stockId: stock.id,
          ...split,
        }))
      );
    }

    await tx
      .update(stocks)
      .set({ fetchedEvents: true })
      .where(eq(stocks.id, stock.id));
  });

  return events;
}

async function revalidate(symbol: string) {
  console.log("revalidating", symbol);
  const quoteResponse = await getQuote(symbol);
  if (!quoteResponse) return null;

  const updatedStock = await db
    .update(stocks)
    .set(quoteResponse)
    .where(eq(stocks.symbol, symbol.toUpperCase()))
    .returning();

  return updatedStock[0];
}
