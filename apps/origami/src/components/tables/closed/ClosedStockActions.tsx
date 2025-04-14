import { CloseButton, Text } from "@mantine/core";
import { modals } from "@mantine/modals";
import { deleteTransaction } from "~/lib/functions/transaction";
import type { FormattedClosedSecurity } from "~/lib/server/formatters/types";
import type { Row } from "~/lib/table/types";
import { type MutatorCallback, deleteItem } from "~/lib/utils/dataEditor";
import { currency } from "~/lib/utils/formatter";

interface ClosedStockActionsProps {
  row: Row<FormattedClosedSecurity>;
  setData: MutatorCallback<FormattedClosedSecurity[]>;
  isTransaction: boolean;
  parent: any;
}
export default function ClosedStockActions({
  row,
  setData,
  isTransaction,
  parent,
}: ClosedStockActionsProps) {
  const openDeleteModal = () => {
    modals.openConfirmModal({
      title: "Confirm Deletion",
      children: (
        <Text size="sm">
          Delete sale of {Math.abs(row.shares)} shares at{" "}
          {currency(row.sellPrice)}? (This will re-open the position)
        </Text>
      ),
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () =>
        deleteTransaction({ data: row.id }).then(() =>
          deleteItem(parent.id, setData)
        ),
    });
  };

  return isTransaction && row.shares < 0 ? (
    <td>
      <CloseButton onClick={openDeleteModal} />
    </td>
  ) : (
    <td />
  );
}
