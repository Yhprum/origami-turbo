import db from "@/db";
import { stocks } from "@/db/schema";
import { sanitizeSymbol } from "@/lib/utils";
import { and, eq, like, or } from "drizzle-orm";
import { Elysia } from "elysia";
import { searchQuery } from "./search.schema";

const searchController = new Elysia().get(
  "/search",
  async ({ query }) => {
    const searchQuery = sanitizeSymbol(query.query.trim());
    if (!searchQuery) return [];

    const results = await db.query.stocks.findMany({
      columns: {
        symbol: true,
        name: true,
        type: true,
        marketCap: true,
      },
      where: and(
        query.type ? eq(stocks.type, query.type) : undefined,
        or(
          like(stocks.symbol, `${searchQuery}%`),
          like(stocks.name, `${searchQuery}%`)
        )
      ),
    });

    return results
      .sort((a, b) => {
        // Sort by symbol match first
        const aSymbolMatch = a.symbol.startsWith(searchQuery.toUpperCase());
        const bSymbolMatch = b.symbol.startsWith(searchQuery.toUpperCase());

        // Check for base symbol matches (before . or -)
        const aBaseMatch =
          a.symbol.split(/[.-]/)[0] === searchQuery.toUpperCase();
        const bBaseMatch =
          b.symbol.split(/[.-]/)[0] === searchQuery.toUpperCase();

        // Prioritize base symbol matches
        if (aBaseMatch && !bBaseMatch) return -1;
        if (!aBaseMatch && bBaseMatch) return 1;

        // Then handle regular symbol matches
        if (aSymbolMatch && !bSymbolMatch) return -1;
        if (!aSymbolMatch && bSymbolMatch) return 1;
        if (aSymbolMatch && bSymbolMatch) {
          if (a.symbol.length === b.symbol.length) {
            // Sort by market cap if symbols are same length
            return (b.marketCap ?? 0) - (a.marketCap ?? 0);
          }
          return a.symbol.length - b.symbol.length;
        }

        // Then sort by name match
        const aNameMatch = a.name
          ?.toLowerCase()
          .startsWith(searchQuery.toLowerCase());
        const bNameMatch = b.name
          ?.toLowerCase()
          .startsWith(searchQuery.toLowerCase());
        if (aNameMatch && !bNameMatch) return -1;
        if (!aNameMatch && bNameMatch) return 1;
        if (aNameMatch && bNameMatch && a.name && b.name) {
          return a.name.length - b.name.length;
        }

        // Sort by market cap if names are same length
        return (b.marketCap ?? 0) - (a.marketCap ?? 0);
      })
      .slice(0, query.limit ?? 5)
      .map((result) => ({
        symbol: result.symbol,
        name: result.name,
        type: result.type,
      }));
  },
  { query: searchQuery }
);

export default searchController;
