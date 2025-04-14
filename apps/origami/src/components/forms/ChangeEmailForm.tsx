import { Box, Button, TextInput, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useServerFn } from "@tanstack/react-start";
import { changeEmail } from "~/lib/functions/user";
import { changeEmailSchema } from "~/lib/schemas/user";
import { useForm } from "~/lib/utils/form";

export default function ChangeEmailForm() {
  const changeEmailServerFn = useServerFn(changeEmail);
  const form = useForm({
    schema: changeEmailSchema,
    mutationFn: changeEmailServerFn,
    onSuccess: () => {
      notifications.show({
        title: "Email Updated",
        message: "",
      });
      form.reset();
    },
  });

  return (
    <Box maw={500} px="lg">
      <Title order={4}>Change Email</Title>
      <form onSubmit={form.onSubmit((data) => form.mutation.mutate({ data }))}>
        <TextInput
          label="New Email"
          key={form.key("email")}
          {...form.getInputProps("email")}
        />
        <Button mt="sm" type="submit" loading={form.mutation.isPending}>
          Change Email
        </Button>
      </form>
    </Box>
  );
}
