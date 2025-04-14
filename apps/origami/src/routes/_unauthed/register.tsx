import {
  Anchor,
  Button,
  Checkbox,
  Container,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { authClient } from "~/lib/authClient";
import { registerSchema } from "~/lib/schemas/session";
import { useForm } from "~/lib/utils/form";

export const Route = createFileRoute("/_unauthed/register")({
  component: RegisterComponent,
});

function RegisterComponent() {
  const [loading, setLoading] = useState(false);
  const form = useForm({
    schema: registerSchema,
  });

  async function onSubmit(data: typeof registerSchema.infer) {
    setLoading(true);
    await authClient.signUp.email({
      ...data,
      name: data.email.split("@")[0],
      callbackURL: "/",
      fetchOptions: {
        onError: ({ error }) => {
          notifications.show({
            color: "red",
            title: "Registration Error",
            message: error.message,
          });
        },
      },
    });
    setLoading(false);
  }

  return (
    <Container size={420} my={40}>
      <Title ta="center" fw={900}>
        Create Your Account
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        Already have an account yet?{" "}
        <Anchor component={Link} href="/login">
          Login
        </Anchor>
      </Text>
      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form
          // onSubmit={form.onSubmit((data) => form.mutation.mutate({ data }))}
          onSubmit={form.onSubmit(onSubmit)}
        >
          <TextInput
            label="Email address"
            placeholder="hello@gmail.com"
            size="md"
            {...form.getInputProps("email")}
          />
          <PasswordInput
            label="Password"
            placeholder="Your password"
            mt="md"
            size="md"
            {...form.getInputProps("password")}
          />
          <Checkbox
            label="Keep me logged in"
            mt="lg"
            {...form.getInputProps("remember")}
          />
          <Button fullWidth mt="xl" size="md" type="submit" loading={loading}>
            Register
          </Button>
        </form>
      </Paper>
    </Container>
  );
}
