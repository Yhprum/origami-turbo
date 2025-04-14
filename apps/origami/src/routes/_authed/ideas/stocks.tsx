import { createFileRoute } from "@tanstack/react-router";
import StockIdeasTable, {
  stockIdeasQueryOptions,
} from "~/components/tables/stockIdeas/StockIdeasTable";
import { getColumnStyles } from "~/lib/functions/preferences";
import { TableName } from "~/lib/server/db/enums";

export const Route = createFileRoute("/_authed/ideas/stocks")({
  loader: async ({ context }) => {
    context.queryClient.ensureQueryData(stockIdeasQueryOptions);
    return await getColumnStyles({ data: TableName.STOCK_IDEAS });
  },
  component: StockIdeas,
});

function StockIdeas() {
  const styles = Route.useLoaderData();
  return <StockIdeasTable styles={styles} />;
}
