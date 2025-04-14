import { createFileRoute } from "@tanstack/react-router";
import BondIdeasTable, {
  bondIdeasQueryOptions,
} from "~/components/tables/bondIdeas/BondIdeasTable";
import { getColumnStyles } from "~/lib/functions/preferences";
import { TableName } from "~/lib/server/db/enums";

export const Route = createFileRoute("/_authed/ideas/bonds")({
  loader: async ({ context }) => {
    context.queryClient.ensureQueryData(bondIdeasQueryOptions);
    return await getColumnStyles({ data: TableName.BOND_IDEAS });
  },
  component: BondIdeas,
});

function BondIdeas() {
  const styles = Route.useLoaderData();
  return <BondIdeasTable styles={styles} />;
}
