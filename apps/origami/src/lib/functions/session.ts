import { createServerFn } from "@tanstack/react-start";
import { getWebRequest } from "@tanstack/react-start/server";
import { auth } from "~/lib/auth";

export const fetchUser = createServerFn({ method: "GET" }).handler(async () => {
  const req = getWebRequest();
  if (!req) return null;

  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return null;

  return {
    id: Number(session.user.id),
    email: session.user.email,
    name: session.user.name,
    cash: session.user.cash,
    yield: session.user.yield,
  };
});

export const listSessions = createServerFn({ method: "GET" }).handler(
  async () => {
    const req = getWebRequest();
    if (!req) return { currentSession: undefined, sessions: [] };

    const currentSession = await auth.api.getSession({ headers: req.headers });
    const sessions = await auth.api.listSessions({ headers: req.headers });

    return {
      currentSession: currentSession?.session,
      sessions,
    };
  }
);
