import { ActionIcon } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { authClient } from "~/lib/authClient";

export default function RevokeSessionButton({ token }: { token: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onClick() {
    setLoading(true);
    await authClient.revokeSession({ token });
    router.invalidate();
    setLoading(false);
  }

  return (
    <ActionIcon color="red" onClick={onClick} loading={loading}>
      <IconTrash size={18} />
    </ActionIcon>
  );
}
