import { createFileRoute } from "@tanstack/react-router";
import OptionsIdeasTable, {
  optionIdeasQueryOptions,
} from "~/components/tables/optionIdeas/OptionsIdeasTable";
import { getColumnStyles } from "~/lib/functions/preferences";
import { TableName } from "~/lib/server/db/enums";

export const Route = createFileRoute("/_authed/ideas/options")({
  loader: async ({ context }) => {
    context.queryClient.ensureQueryData(optionIdeasQueryOptions);
    return await getColumnStyles({ data: TableName.OPTION_IDEAS });
  },
  component: OptionIdeas,
});

function OptionIdeas() {
  const styles = Route.useLoaderData();
  return <OptionsIdeasTable styles={styles} />;
}
