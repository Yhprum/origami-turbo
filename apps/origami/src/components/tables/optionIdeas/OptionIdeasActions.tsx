import {
  ActionIcon,
  Button,
  type ComboboxItem,
  Menu,
  Popover,
  Select,
} from "@mantine/core";
import {
  IconEdit,
  IconMenu2,
  IconTrash,
  IconZoomMoney,
} from "@tabler/icons-react";
import classes from "~/lib/css/ActionsTd.module.css";
import { deleteIdea } from "~/lib/functions/idea";
import { updateOptionIdea } from "~/lib/functions/optionIdea";
import useOptionSelect from "~/lib/hooks/useOptionSelect";
import { updateOptionIdeaValuesSchema } from "~/lib/schemas/optionIdea";
import { deleteItem, setModifiedResponse } from "~/lib/utils/dataEditor";
import { useForm } from "~/lib/utils/form";
import { currency, date } from "~/lib/utils/formatter";

export default function OptionIdeasActions({ row, setData, setModal, setRow }) {
  const form = useForm({
    mode: "controlled",
    schema: updateOptionIdeaValuesSchema,
    mutationFn: (values) =>
      updateOptionIdea({ data: { ...values.data, id: row.id } }),
    onSuccess: (response) => {
      setModifiedResponse(response, row.id, setData);
      form.reset();
    },
  });
  const { strikes, expiries } = useOptionSelect(
    form.values.symbol,
    Number(form.values.strike),
    Number(form.values.expiry)
  );

  function compare() {
    setModal("compare");
    setRow(row);
  }

  function ContractPopover() {
    return (
      <Popover
        onOpen={() => form.setFieldValue("symbol", row.symbol)}
        withinPortal={false}
      >
        <Popover.Dropdown>
          <form
            onSubmit={form.onSubmit((data) => form.mutation.mutate({ data }))}
          >
            <Select
              mb={5}
              label="Expiry"
              placeholder="Select Expiry Date"
              data={expiries.map((expiry) => ({
                label: date(expiry) as string,
                value: String(expiry),
              }))}
              comboboxProps={{ withinPortal: false }}
              {...form.getInputProps("expiry")}
            />
            <Select
              mb={5}
              label="Strike"
              placeholder="Select Strike Price"
              data={strikes.map((strike) => ({
                label: currency(strike) as string,
                value: String(strike),
              }))}
              searchable
              nothingFoundMessage="No options"
              filter={({ options, search }) =>
                (options as ComboboxItem[]).filter((option) =>
                  option.label.startsWith(search)
                )
              }
              {...form.getInputProps("strike")}
              comboboxProps={{ withinPortal: false }}
              disabled={!strikes.length}
            />
            <Button
              fullWidth
              size="sm"
              type="submit"
              loading={form.mutation.isPending}
            >
              Update
            </Button>
          </form>
        </Popover.Dropdown>
        <Popover.Target>
          <Menu.Item leftSection={<IconEdit size={18} />}>Edit</Menu.Item>
        </Popover.Target>
      </Popover>
    );
  }

  function deleteOptionIdea(idea) {
    deleteIdea({ data: idea.id }).then(() => deleteItem(idea.id, setData));
  }

  return (
    <td>
      <Menu
        position="right-start"
        shadow="md"
        transitionProps={{ transition: "scale-x" }}
        width={200}
        withArrow
        closeOnItemClick={false}
      >
        <Menu.Target>
          <ActionIcon
            variant="subtle"
            color="grey"
            size="sm"
            className={classes.actionButton}
          >
            <IconMenu2 />
          </ActionIcon>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Label>Actions</Menu.Label>
          <ContractPopover />
          <Menu.Item
            leftSection={<IconZoomMoney size={18} />}
            onClick={() => compare()}
          >
            Compare
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item
            color="red"
            leftSection={<IconTrash size={18} />}
            onClick={() => deleteOptionIdea(row)}
          >
            Delete
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </td>
  );
}
