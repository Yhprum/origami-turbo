import {
  Anchor,
  Button,
  Checkbox,
  Container,
  Group,
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
import { loginSchema } from "~/lib/schemas/session";
import { useForm } from "~/lib/utils/form";

export const Route = createFileRoute("/_unauthed/login")({
  component: LoginComponent,
});

export function LoginComponent() {
  const [loading, setLoading] = useState(false);
  const form = useForm({
    schema: loginSchema,
  });

  async function onSubmit(data: typeof loginSchema.infer) {
    setLoading(true);
    await authClient.signIn.email({
      ...data,
      callbackURL: "/",
      fetchOptions: {
        onError: ({ error }) => {
          notifications.show({
            color: "red",
            title: "Login Error",
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
        Welcome back!
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        Don't have an account yet?{" "}
        <Anchor component={Link} href="/register">
          Create account
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
          <Group justify="space-between" mt="lg">
            <Checkbox label="Keep me logged in" />
            <Anchor component={Link} href="/forgot-password" size="sm">
              Forgot password?
            </Anchor>
          </Group>
          <Button fullWidth mt="xl" size="md" type="submit" loading={loading}>
            Login
          </Button>
        </form>
      </Paper>
    </Container>
  );
}
