import { isDefined, notFound } from "@/lib/utils";
import { Elysia } from "elysia";
import { stocksParams, stocksQuery } from "./stocks.schema";
import * as StocksService from "./stocks.service";
import { formattedStock } from "./stocks.utils";

const stocksController = new Elysia()
  .get(
    "/stocks/:symbol",
    async ({ params }) => {
      const { symbol } = params;

      const stock = await StocksService.find(symbol);
      if (!isDefined(stock)) return notFound();

      return formattedStock(stock);
    },
    { params: stocksParams }
  )
  .get(
    "/stocks",
    async ({ query }) => {
      const symbols = query.symbols?.split(",");
      if (!symbols || symbols.length === 0) return [];

      const stocks = await StocksService.findMany(symbols);
      return stocks.map(formattedStock);
    },
    { query: stocksQuery }
  );

export default stocksController;
