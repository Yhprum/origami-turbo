import { Divider, Stack } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import ChangeEmailForm from "~/components/forms/ChangeEmailForm";
import ChangeNameForm from "~/components/forms/ChangeNameForm";
import ThemeChanger from "~/components/forms/ThemeChanger";

export const Route = createFileRoute("/_authed/profile/")({
  component: Profile,
});

function Profile() {
  return (
    <Stack gap="xl" py="lg">
      <ChangeNameForm />
      <Divider />
      <ChangeEmailForm />
      <Divider />
      <ThemeChanger />
    </Stack>
  );
}
