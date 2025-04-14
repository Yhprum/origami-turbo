import { Box, Button, TextInput, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useServerFn } from "@tanstack/react-start";
import { changeName } from "~/lib/functions/user";
import { changeNameSchema } from "~/lib/schemas/user";
import { useForm } from "~/lib/utils/form";

export default function ChangeNameForm() {
  const changeNameServerFn = useServerFn(changeName);
  const form = useForm({
    schema: changeNameSchema,
    mutationFn: changeNameServerFn,
    onSuccess: () => {
      notifications.show({
        title: "Name Updated",
        message: "",
      });
      form.reset();
    },
  });

  return (
    <Box maw={500} px="lg">
      <Title order={4}>Change Display Name</Title>
      <form onSubmit={form.onSubmit((data) => form.mutation.mutate({ data }))}>
        <TextInput
          label="New Name"
          key={form.key("name")}
          {...form.getInputProps("name")}
        />
        <Button mt="sm" type="submit" loading={form.mutation.isPending}>
          Change Name
        </Button>
      </form>
    </Box>
  );
}
