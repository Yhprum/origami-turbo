import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/charts")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Charts</div>;
}
