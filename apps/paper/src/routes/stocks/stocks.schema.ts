import { t } from "elysia";

export const stocksParams = t.Object({
  symbol: t.String({ description: "stock ticker symbol" }),
});

export const stocksQuery = t.Object({
  symbols: t.String({ description: "comma separated list of symbols" }),
});
