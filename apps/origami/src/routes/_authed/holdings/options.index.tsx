import { createFileRoute } from "@tanstack/react-router";
import OptionsTable, {
  optionHoldingsQueryOptions,
} from "~/components/tables/options/OptionsTable";
import { getColumnStyles } from "~/lib/functions/preferences";
import { TableName } from "~/lib/server/db/enums";

export const Route = createFileRoute("/_authed/holdings/options/")({
  loader: async ({ context }) => {
    context.queryClient.ensureQueryData(optionHoldingsQueryOptions);
    return await getColumnStyles({ data: TableName.COVERED_CALLS });
  },
  component: OptionHoldings,
});

function OptionHoldings() {
  const styles = Route.useLoaderData();
  return <OptionsTable styles={styles} />;
}
