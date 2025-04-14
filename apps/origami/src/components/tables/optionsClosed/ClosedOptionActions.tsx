import { ActionIcon, Menu } from "@mantine/core";
import {
  IconMenu2,
  IconPencilDollar,
  IconTableExport,
} from "@tabler/icons-react";
import classes from "~/lib/css/ActionsTd.module.css";
import { updateHolding } from "~/lib/functions/holding";
import { deleteItem } from "~/lib/utils/dataEditor";

export default function ClosedOptionActions({
  row,
  setData,
  setSelected,
  setModal,
  isTransaction,
}) {
  return !isTransaction ? (
    <td>
      <Menu
        position="right-start"
        shadow="md"
        transitionProps={{ transition: "scale-x" }}
        width={200}
        withArrow
        closeOnItemClick={false}
        zIndex={150}
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
            leftSection={<IconPencilDollar size={18} />}
            onClick={() => {
              setModal("transactions");
              setSelected(row.id);
            }}
          >
            Update Transactions
          </Menu.Item>
          <Menu.Item
            leftSection={<IconTableExport size={18} />}
            onClick={() =>
              updateHolding({
                data: { id: row.id, field: "closed", value: false },
              }).then(() => deleteItem(row.id, setData))
            }
          >
            Move to Open Options Table
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </td>
  ) : (
    <td />
  );
}
