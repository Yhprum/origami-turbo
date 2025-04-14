import { Button } from "@mantine/core";
import { useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { authClient } from "~/lib/authClient";

export default function RevokeAllSessionsButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onClick() {
    setLoading(true);
    await authClient.revokeSessions();
    router.invalidate();
    setLoading(false);
  }

  return (
    <Button onClick={onClick} loading={loading}>
      Revoke All Sessions
    </Button>
  );
}
