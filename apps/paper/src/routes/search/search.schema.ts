import { tickerTypes } from "@/lib/constants";
import { t } from "elysia";

export const searchQuery = t.Object({
  query: t.String({ description: "ticker symbol or company name" }),
  type: t.Optional(
    t.Union(
      Object.entries(tickerTypes).map(([key, value]) =>
        t.Literal(key, { description: value })
      ),
      { description: "type of stock to search for" }
    )
  ),
  limit: t.Optional(
    t.Integer({ description: "number of search results to return" })
  ),
});
