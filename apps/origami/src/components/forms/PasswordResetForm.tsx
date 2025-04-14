import { Box, Button, PasswordInput, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useServerFn } from "@tanstack/react-start";
import { changePassword } from "~/lib/functions/user";
import { changePasswordSchema } from "~/lib/schemas/user";
import { useForm } from "~/lib/utils/form";

export default function PasswordResetForm() {
  const changePasswordServerFn = useServerFn(changePassword);
  const form = useForm({
    schema: changePasswordSchema,
    mutationFn: changePasswordServerFn,
    onSuccess: () => {
      notifications.show({
        title: "Password Updated",
        message: "",
      });
      form.reset();
    },
  });

  return (
    <Box maw={500} px="lg">
      <Title order={4}>Change Password</Title>
      <form onSubmit={form.onSubmit((data) => form.mutation.mutate({ data }))}>
        <PasswordInput
          label="Old Password"
          key={form.key("oldPassword")}
          {...form.getInputProps("oldPassword")}
        />
        <PasswordInput
          label="New Password"
          key={form.key("password")}
          {...form.getInputProps("password")}
        />
        <PasswordInput
          label="Confirm New Password"
          key={form.key("confirm")}
          {...form.getInputProps("confirm")}
        />
        <Button mt="sm" type="submit" loading={form.mutation.isPending}>
          Change Password
        </Button>
      </form>
    </Box>
  );
}
