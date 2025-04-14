import { createFileRoute } from "@tanstack/react-router";
import PreferredStockIdeasTable, {
  preferredStockIdeasQueryOptions,
} from "~/components/tables/preferredStockIdeas/PreferredStocksTable";
import { getColumnStyles } from "~/lib/functions/preferences";
import { TableName } from "~/lib/server/db/enums";

export const Route = createFileRoute("/_authed/ideas/preferred-stocks")({
  loader: async ({ context }) => {
    context.queryClient.ensureQueryData(preferredStockIdeasQueryOptions);
    return await getColumnStyles({ data: TableName.PREFERRED_STOCK_IDEAS });
  },
  component: PreferredStockIdeas,
});

function PreferredStockIdeas() {
  const styles = Route.useLoaderData();
  return <PreferredStockIdeasTable styles={styles} />;
}
