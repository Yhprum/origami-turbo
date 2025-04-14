import {
  ActionIcon,
  Button,
  CloseButton,
  Indicator,
  Menu,
  NumberInput,
  Popover,
  Text,
  TextInput,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import {
  IconBrandYahoo,
  IconCashBanknote,
  IconFolderOpen,
  IconMenu2,
  IconPackage,
  IconPencilDollar,
  IconPlus,
  IconSun,
  IconTrash,
} from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import classes from "~/lib/css/ActionsTd.module.css";
import { deleteHolding, updateHolding } from "~/lib/functions/holding";
import {
  createTransaction,
  deleteTransaction,
} from "~/lib/functions/transaction";
import { createTransactionSchema } from "~/lib/schemas/transaction";
import type { AssetClass } from "~/lib/server/db/enums";
import type {
  FormattedBond,
  FormattedStock,
} from "~/lib/server/formatters/types";
import type { Row } from "~/lib/table/types";
import { currentInputDate, yahooSymbol } from "~/lib/utils";
import {
  type MutatorCallback,
  deleteItem,
  setModifiedResponse,
} from "~/lib/utils/dataEditor";
import { useForm } from "~/lib/utils/form";
import { currency } from "~/lib/utils/formatter";

interface StockActionsProps {
  row: Row<FormattedStock & FormattedBond>;
  setData: MutatorCallback<(FormattedStock & FormattedBond)[]>;
  setModal: (modal: string) => void;
  setSelected: (selected: number) => void;
  isTransaction: boolean;
  parent: any;
}
export default function StockActions({
  row,
  setData,
  setModal,
  setSelected,
  isTransaction,
  parent,
}: StockActionsProps) {
  const [load, setLoad] = useState(false);
  const [formOpened, setFormOpened] = useState(false);

  const createTransactionServerFn = useServerFn(createTransaction);
  const form = useForm({
    initialValues: {
      date: currentInputDate(),
      holding: row.id,
      type: row.holdingType as AssetClass,
      symbol: row.symbol,
    },
    schema: createTransactionSchema,
    mutationFn: createTransactionServerFn,
    onSuccess: (data, variables) => {
      if (!data) return;
      setModifiedResponse(data, row.id, setData);
      form.reset();
      setFormOpened(false);
      notifications.show({
        title: "Transaction added",
        message: `${variables.data.quantity} shares of ${row.symbol} at ${currency(variables.data.price)}`,
      });
    },
  });

  const openDeleteModal = (row, type: "holding" | "transaction") => {
    modals.openConfirmModal({
      title: "Confirm Deletion",
      children:
        type === "holding" ? (
          <Text size="sm">
            Delete Holding for {row.symbol} and {row.transactions.length}{" "}
            Transaction(s)?
          </Text>
        ) : (
          <Text size="sm">
            Delete Transaction for {row.shares} shares at{" "}
            {currency(row.purchasePrice)}?
          </Text>
        ),
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () =>
        type === "holding"
          ? removeHolding(row)
          : deleteTransaction({
              data: { id: row.id, options: { build: true } },
            }).then(
              (data: any) =>
                data && setModifiedResponse(data, parent.id, setData)
            ),
    });
  };

  function closeHolding(holding) {
    updateHolding({
      data: { id: holding.id, field: "closed", value: true },
    }).then(() => deleteItem(holding.id, setData));
  }

  function removeHolding(holding) {
    deleteHolding({ data: { id: holding.id, cascade: true } }).then(() =>
      deleteItem(holding.id, setData)
    );
  }

  return !isTransaction ? (
    load ? (
      <td>
        <div className={classes.row}>
          <Popover
            opened={formOpened}
            onChange={setFormOpened}
            width={200}
            position="right-start"
            withArrow
            shadow="md"
          >
            <Popover.Target>
              <ActionIcon
                variant="subtle"
                color="grey"
                size="sm"
                className={classes.actionButton}
                onClick={() => setFormOpened((o) => !o)}
              >
                <IconPlus />
              </ActionIcon>
            </Popover.Target>
            <Popover.Dropdown>
              <form
                onSubmit={form.onSubmit((data) =>
                  form.mutation.mutate({ data })
                )}
              >
                <NumberInput
                  label="Quantity"
                  placeholder="Quantity"
                  required
                  {...form.getInputProps("quantity")}
                />
                <NumberInput
                  label="Price"
                  placeholder="Price"
                  leftSection="$"
                  decimalScale={2}
                  required
                  {...form.getInputProps("price")}
                />
                <TextInput
                  label="Date"
                  placeholder="Date"
                  type="date"
                  required
                  {...form.getInputProps("date")}
                />
                <Button
                  fullWidth
                  type="submit"
                  mt={8}
                  loading={form.mutation.isPending}
                >
                  Add Transaction
                </Button>
              </form>
            </Popover.Dropdown>
          </Popover>
          <Indicator
            m="auto"
            zIndex={0}
            inline
            color="blue"
            size={6}
            disabled={row.shares !== 0}
          >
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
                {row.shares === 0 && (
                  <Menu.Item
                    color="blue"
                    leftSection={<IconPackage size={18} />}
                    onClick={() => closeHolding(row)}
                  >
                    Close
                  </Menu.Item>
                )}
                <Menu.Item
                  component={Link}
                  to={`/open?holding=${row.id}`}
                  leftSection={<IconFolderOpen size={18} />}
                >
                  Add Open Order
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconCashBanknote size={18} />}
                  onClick={() => {
                    setModal("income");
                    setSelected(row.id);
                  }}
                >
                  Add Additional Income
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconPencilDollar size={18} />}
                  onClick={() => {
                    setModal("transactions");
                    setSelected(row.id);
                  }}
                >
                  Update Transactions
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  color="red"
                  leftSection={<IconTrash size={18} />}
                  onClick={() => openDeleteModal(row, "holding")}
                >
                  Delete Holding
                </Menu.Item>
                <Menu.Divider />
                {row.bond ? (
                  <Menu.Item
                    leftSection={<IconSun size={18} />}
                    component="a"
                    href={`https://www.finra.org/finra-data/fixed-income/bond?cusip=${row.cusip}`}
                    target="_blank"
                  >
                    View on Finra
                  </Menu.Item>
                ) : (
                  <Menu.Item
                    leftSection={<IconBrandYahoo size={18} />}
                    component="a"
                    href={`https://finance.yahoo.com/quote/${yahooSymbol(row.symbol)}`}
                    target="_blank"
                  >
                    View on Yahoo Finance
                  </Menu.Item>
                )}
              </Menu.Dropdown>
            </Menu>
          </Indicator>
        </div>
      </td>
    ) : (
      <td onMouseOver={() => setLoad(true)}>
        <div className={classes.row}>
          <IconPlus className={classes.unloaded} size={20} />
          <Indicator
            m="auto"
            zIndex={0}
            inline
            color="blue"
            size={6}
            disabled={row.shares !== 0}
          >
            <IconMenu2 className={classes.unloaded} size={20} />
          </Indicator>
        </div>
      </td>
    )
  ) : (
    <td>
      <CloseButton
        mx="auto"
        onClick={() => openDeleteModal(row, "transaction")}
      />
    </td>
  );
}
