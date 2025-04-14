import { createFileRoute } from "@tanstack/react-router";
import ClosedOptionsTable, {
  closedOptionHoldingsQueryOptions,
} from "~/components/tables/optionsClosed/ClosedOptionsTable";
import { getColumnStyles } from "~/lib/functions/preferences";
import { TableName } from "~/lib/server/db/enums";

export const Route = createFileRoute("/_authed/holdings/options/closed")({
  loader: async ({ context }) => {
    context.queryClient.ensureQueryData(closedOptionHoldingsQueryOptions);
    return await getColumnStyles({ data: TableName.CLOSED_OPTIONS });
  },
  component: RouteComponent,
});

function RouteComponent() {
  const styles = Route.useLoaderData();
  return <ClosedOptionsTable styles={styles} />;
}
