import {
  ActionIcon,
  Button,
  Menu,
  NumberInput,
  Popover,
  TextInput,
} from "@mantine/core";
import { IconEdit, IconMenu2, IconPlus, IconTrash } from "@tabler/icons-react";
import classes from "~/lib/css/ActionsTd.module.css";
import { createHolding } from "~/lib/functions/holding";
import { deleteOpenOrder } from "~/lib/functions/order";
import { createTransaction } from "~/lib/functions/transaction";
import { createOpenOrderSchema } from "~/lib/schemas/holding";
import { AssetClass, HoldingType } from "~/lib/server/db/enums";
import type { FormattedOpenOrder } from "~/lib/server/formatters/types";
import { currentInputDate } from "~/lib/utils";
import { deleteItem } from "~/lib/utils/dataEditor";
import { useForm } from "~/lib/utils/form";

export default function OpenOrderActions({ row, setData, setModal, setRow }) {
  const form = useForm({
    initialValues: {
      type: HoldingType.STOCK,
      symbol: row.symbol,
      withTransaction: true,
      transaction: {
        quantity: Math.abs(row.quantity) * (row.buySell ? 1 : -1),
        date: currentInputDate(),
        type: AssetClass.STOCK,
      },
      holding: row.holding,
    },
    schema: createOpenOrderSchema,
    mutationFn: (values) => {
      if (values.data.holding) {
        return createTransaction({
          data: {
            ...values.data.transaction,
            price: Number(values.data.transaction.price),
            type: AssetClass.STOCK,
            symbol: values.data.symbol,
            holding: values.data.holding,
          },
        });
      }
      return createHolding(values);
    },
    onSuccess: () =>
      deleteOpenOrder(row.id).then(() => deleteItem(row.id, setData)),
  });

  const deleteOrder = (order: FormattedOpenOrder) =>
    deleteOpenOrder({ data: order.id }).then(() =>
      deleteItem(order.id, setData)
    );

  const addTransactionForm = (
    <form onSubmit={form.onSubmit((data) => form.mutation.mutate({ data }))}>
      <NumberInput
        label="Quantity"
        placeholder="Quantity"
        required
        {...form.getInputProps("transaction.quantity")}
      />
      <NumberInput
        label="Execution Price"
        placeholder="Price"
        leftSection="$"
        decimalScale={2}
        required
        {...form.getInputProps("transaction.price")}
      />
      <TextInput
        label="Execution Date"
        placeholder="Date"
        type="date"
        required
        {...form.getInputProps("transaction.date")}
      />
      <Button fullWidth type="submit" mt={8} loading={form.mutation.isPending}>
        Add to {form.values.holding ? null : "New "}Holding
      </Button>
    </form>
  );

  return (
    <td>
      <div className={classes.row}>
        <Popover width={200} position="right-start" withArrow shadow="md">
          <Popover.Target>
            <ActionIcon
              variant="subtle"
              color="grey"
              size="sm"
              className={classes.actionButton}
            >
              <IconPlus />
            </ActionIcon>
          </Popover.Target>
          <Popover.Dropdown>{addTransactionForm}</Popover.Dropdown>
        </Popover>
        <Menu
          position="right-start"
          shadow="md"
          transitionProps={{ transition: "scale-x" }}
          width={200}
          withArrow
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
            <Menu.Item
              leftSection={<IconEdit size={18} />}
              onClick={() => {
                setRow(row);
                setModal("add");
              }}
            >
              Edit
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item
              color="red"
              leftSection={<IconTrash size={18} />}
              onClick={() => deleteOrder(row)}
            >
              Delete Order
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </div>
    </td>
  );
}
