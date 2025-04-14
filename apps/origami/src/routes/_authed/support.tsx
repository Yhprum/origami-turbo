import {
  Box,
  Button,
  NativeSelect,
  Stack,
  TextInput,
  Textarea,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createFileRoute } from "@tanstack/react-router";
import { contactUs } from "~/lib/functions/support";
import { contactUsSchema } from "~/lib/schemas/support";
import { useForm } from "~/lib/utils/form";

export const Route = createFileRoute("/_authed/support")({
  component: SupportPage,
});

function SupportPage() {
  const form = useForm({
    initialValues: { topic: "Question" },
    schema: contactUsSchema,
    mutationFn: contactUs,
    onSuccess: () => {
      notifications.show({
        title: "Message sent",
        message: "We will try to get back to you as soon as we can",
      });
      form.reset();
    },
  });

  return (
    <Box maw={800} p="lg">
      <Title order={2}>Contact Us</Title>
      <form onSubmit={form.onSubmit((data) => form.mutation.mutate({ data }))}>
        <Stack>
          <NativeSelect
            label="Topic"
            data={["Question", "Report a Problem", "Suggestion", "Other"]}
            mt="sm"
            required
            key={form.key("topic")}
            {...form.getInputProps("topic")}
          />
          <TextInput
            label="Subject"
            required
            key={form.key("subject")}
            {...form.getInputProps("subject")}
          />
          <Textarea
            label="Message"
            description="Provide as much detail as possible to help us understand your request"
            autosize
            minRows={8}
            required
            key={form.key("message")}
            {...form.getInputProps("message")}
          />
          <Button mt="sm" type="submit" loading={form.mutation.isPending}>
            Submit
          </Button>
        </Stack>
      </form>
    </Box>
  );
}
