import { ActionIcon, Modal, NumberInput, Text, TextInput } from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconTrash } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import type { z } from "zod";
import {
  deleteTransaction,
  updateTransaction,
} from "~/lib/functions/transaction";
import useLoaders from "~/lib/hooks/useLoaders";
import type { updateTransactionSchema } from "~/lib/schemas/transaction";
import type { AssetClass } from "~/lib/server/db/enums";
import { enumToWords } from "~/lib/utils";
import { deleteItem } from "~/lib/utils/dataEditor";
import classes from "./UpdateTransactionsModal.module.css";

interface UpdateTransactionModalProps {
  transactions: {
    id: number;
    type: AssetClass;
    date: string;
    quantity: number;
    price: number;
  }[];
  show: boolean;
  onClose: () => void;
}
export default function UpdateTransactionModal({
  transactions,
  show,
  onClose,
}: UpdateTransactionModalProps) {
  const [items, setItems] = useState(transactions);
  useEffect(() => {
    if (!show) return;
    setItems(transactions);
  }, [transactions, show]);

  const { updateLoader, renderLoader } = useLoaders();

  function update(data: z.infer<typeof updateTransactionSchema>) {
    if (!data.value) return;
    updateLoader(data.id, "loading");
    updateTransaction({ data })
      .then((ok) => updateLoader(data.id, ok ? "done" : "error"))
      .catch(() => updateLoader(data.id, "error"));
  }

  function confirmDelete(id: number) {
    modals.openConfirmModal({
      title: "Confirm Deletion",
      children: (
        <Text size="sm">
          Delete transaction? This action is not reversable.
        </Text>
      ),
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () =>
        deleteTransaction({ data: { id } }).then(() =>
          deleteItem(id, setItems)
        ),
    });
  }

  return (
    <Modal
      title="Update Transactions"
      size="lg"
      opened={show}
      onClose={onClose}
    >
      <table className={classes.table}>
        <thead>
          <tr>
            <th>Type</th>
            <th>Date</th>
            <th>Quantity</th>
            <th>Price</th>
            <th />
            <th />
          </tr>
        </thead>
        <tbody>
          {items.map((transaction) => (
            <tr key={transaction.id}>
              <td className={classes.typeColumn}>
                {enumToWords(transaction.type)}
              </td>
              <td>
                <TextInput
                  label="Date"
                  placeholder="Date"
                  type="date"
                  defaultValue={transaction.date}
                  onBlur={(e) =>
                    update({
                      id: transaction.id,
                      field: "date",
                      value: new Date(e.target.value),
                    })
                  }
                />
              </td>
              <td>
                <NumberInput
                  label="Quantity"
                  placeholder="Quantity"
                  defaultValue={transaction.quantity}
                  onBlur={(e) =>
                    update({
                      id: transaction.id,
                      field: "quantity",
                      value: Number(e.target.value),
                    })
                  }
                />
              </td>
              <td>
                <NumberInput
                  label="Price"
                  placeholder="Price"
                  defaultValue={transaction.price}
                  onBlur={(e) =>
                    update({
                      id: transaction.id,
                      field: "price",
                      value: Number(e.target.value),
                    })
                  }
                />
              </td>
              <td className={classes.deleteCell}>
                <ActionIcon
                  color="red"
                  size="input-sm"
                  onClick={() => confirmDelete(transaction.id)}
                >
                  <IconTrash />
                </ActionIcon>
              </td>
              <td className={classes.deleteCell}>
                {renderLoader(transaction.id)}
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan={4} className={classes.noTransactionsText}>
                You Have No Transactions to Edit
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </Modal>
  );
}
