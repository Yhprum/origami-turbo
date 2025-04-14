import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import OpenOrdersTable from "~/components/tables/openOrders/OpenOrdersTable";

const addOptionSearchSchema = z.object({
  holdingId: z.number().optional(),
});

export const Route = createFileRoute("/_authed/orders")({
  validateSearch: addOptionSearchSchema,
  component: RouteComponent,
});

function RouteComponent() {
  const searchParams = Route.useSearch();
  return <OpenOrdersTable holdingId={searchParams.holdingId} />;
}
