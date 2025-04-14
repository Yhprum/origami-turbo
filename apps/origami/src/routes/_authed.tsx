import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import Sidebar from "~/components/sidebar/Sidebar";
import classes from "./layout.module.css";

export const Route = createFileRoute("/_authed")({
  beforeLoad: async ({ context }) => {
    if (!context.user) {
      throw redirect({ to: "/login" });
    }
    return { user: context.user };
  },
  component: AuthedLayout,
});

function AuthedLayout() {
  const context = Route.useRouteContext();
  return (
    <div className={classes.root}>
      <Sidebar user={context.user} />
      <main className={classes.main}>
        <Outlet />
      </main>
    </div>
  );
}
