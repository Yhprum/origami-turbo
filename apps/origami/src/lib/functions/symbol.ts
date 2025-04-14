import { createServerFn } from "@tanstack/react-start";
import { type } from "arktype";
import { validateBond as isValidBond } from "~/lib/server/external/figi";
import { getChartingPrices } from "~/lib/server/external/symbolAPI";
import paper from "~/lib/server/paper";
import { serverFunctionStandardValidator } from "~/lib/utils/form";

// const symbols: StockSearchResult[] = _symbols as StockSearchResult[];

export const searchStock = createServerFn({ method: "GET" })
  .validator(serverFunctionStandardValidator(type("string")))
  .handler(async ({ data }) => {
    const response = await paper.search.get({ query: { query: data } });
    return response.data;
  });

export const searchMutualFund = createServerFn({ method: "GET" })
  .validator(serverFunctionStandardValidator(type("string")))
  .handler(async ({ data }) => {
    const response = await paper.search.get({
      query: { query: data, type: "OEF" },
    });
    return response.data;
  });

export const getExpiries = createServerFn({ method: "GET" })
  .validator(serverFunctionStandardValidator(type("string")))
  .handler(async ({ data }) => {
    const response = await paper.option({ symbol: data }).expirations.get();
    return response.data ?? [];
  });

export const getOptionChain = createServerFn({ method: "GET" })
  .validator(
    serverFunctionStandardValidator(type({ symbol: "string", date: "number" }))
  )
  .handler(async ({ data }) => {
    const response = await paper
      .option({ symbol: data.symbol })
      .expirations({ expiration: data.date })
      .chain.get();
    return response.data;
  });

export const validateBond = createServerFn({ method: "GET" })
  .validator(serverFunctionStandardValidator(type("string")))
  .handler(async ({ data }) => isValidBond(data));

export const getIndices = createServerFn({ method: "GET" }).handler(
  async () => {
    const symbols = ["^GSPC", "^IXIC", "^DJI"];
    const indices = (await getChartingPrices(symbols)).sort(
      (a, b) => symbols.indexOf(a.symbol) - symbols.indexOf(b.symbol)
    );
    return indices;
  }
);
