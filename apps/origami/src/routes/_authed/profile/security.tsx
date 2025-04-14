import { Divider, Stack } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import PasswordResetForm from "~/components/forms/PasswordResetForm";
import SessionList from "~/components/forms/SessionList";
import { listSessions } from "~/lib/functions/session";

export const Route = createFileRoute("/_authed/profile/security")({
  loader: async () => await listSessions(),
  component: Security,
});

function Security() {
  const { sessions, currentSession } = Route.useLoaderData();
  return (
    <Stack gap="xl" py="lg">
      <PasswordResetForm />
      <Divider />
      <SessionList sessions={sessions} currentSession={currentSession} />
    </Stack>
  );
}
