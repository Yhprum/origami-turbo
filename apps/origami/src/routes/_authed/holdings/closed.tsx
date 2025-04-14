import { createFileRoute } from "@tanstack/react-router";
import ClosedStocksTable, {
  closedStockHoldingsQueryOptions,
} from "~/components/tables/closed/ClosedStocksTable";
import { getColumnStyles } from "~/lib/functions/preferences";
import { TableName } from "~/lib/server/db/enums";

export const Route = createFileRoute("/_authed/holdings/closed")({
  loader: async ({ context }) => {
    context.queryClient.ensureQueryData(closedStockHoldingsQueryOptions);
    return await getColumnStyles({ data: TableName.CLOSED_STOCKS });
  },
  component: RouteComponent,
});

function RouteComponent() {
  const styles = Route.useLoaderData();
  return <ClosedStocksTable styles={styles} />;
}
