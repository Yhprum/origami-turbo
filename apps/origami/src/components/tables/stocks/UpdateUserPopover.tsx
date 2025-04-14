import { Button, NumberInput, Popover } from "@mantine/core";
import { useServerFn } from "@tanstack/react-start";
import { type Dispatch, type SetStateAction, useState } from "react";
import { updateUser } from "~/lib/functions/user";
import { updateUserSchema } from "~/lib/schemas/user";
import { useForm } from "~/lib/utils/form";

interface Props {
  user: { cash: number; yield: number };
  setUser: Dispatch<
    SetStateAction<{
      cash: number;
      yield: number;
    }>
  >;
}
export default function UpdateUserPopover({ user, setUser }: Props) {
  const [opened, setOpened] = useState(false);

  const updateUserServerFn = useServerFn(updateUser);
  const form = useForm({
    mode: "uncontrolled",
    initialValues: { cash: user.cash, yield: user.yield * 100 },
    schema: updateUserSchema,
    mutationFn: updateUserServerFn,
    onSuccess: (_data, variables) => {
      setUser({ cash: variables.data.cash, yield: variables.data.yield / 100 });
      setOpened(false);
    },
  });

  return (
    <Popover
      width={200}
      position="right"
      withArrow
      shadow="md"
      opened={opened}
      onChange={setOpened}
    >
      <Popover.Target>
        <Button
          variant="subtle"
          size="compact-xs"
          onClick={() => setOpened((o) => !o)}
        >
          edit
        </Button>
      </Popover.Target>
      <Popover.Dropdown>
        <form
          onSubmit={form.onSubmit((data) => form.mutation.mutate({ data }))}
        >
          <NumberInput
            label="Cash"
            leftSection="$"
            key={form.key("cash")}
            {...form.getInputProps("cash")}
          />
          <NumberInput
            label="Rate"
            min={0}
            step={0.01}
            suffix="%"
            key={form.key("yield")}
            {...form.getInputProps("yield")}
          />
          <Button
            type="submit"
            fullWidth
            mt={8}
            loading={form.mutation.isPending}
          >
            Update Cash/Yield
          </Button>
        </form>
      </Popover.Dropdown>
    </Popover>
  );
}
