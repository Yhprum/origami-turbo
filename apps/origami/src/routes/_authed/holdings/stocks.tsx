import { createFileRoute } from "@tanstack/react-router";
import StocksTable, {
  stockHoldingsQueryOptions,
} from "~/components/tables/stocks/StocksTable";
import { getColumnStyles } from "~/lib/functions/preferences";
import { TableName } from "~/lib/server/db/enums";

export const Route = createFileRoute("/_authed/holdings/stocks")({
  loader: async ({ context }) => {
    context.queryClient.ensureQueryData(stockHoldingsQueryOptions);
    return await getColumnStyles({ data: TableName.STOCKS });
  },
  component: StockHoldings,
});

function StockHoldings() {
  const { user } = Route.useRouteContext();
  const styles = Route.useLoaderData();
  return (
    <StocksTable
      userData={{ cash: user.cash ?? 0, yield: user.yield ?? 0 }}
      styles={styles}
    />
  );
}
