import { redirect } from "@tanstack/react-router";
import { createMiddleware } from "@tanstack/react-start";
import { fetchUser } from "~/lib/functions/session";

export const authMiddleware = createMiddleware().server(async ({ next }) => {
  const user = await fetchUser();
  if (!user) {
    throw redirect({ to: "/login" });
  }
  return next({ context: { user } });
});
