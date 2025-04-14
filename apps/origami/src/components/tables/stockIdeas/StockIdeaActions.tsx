import { ActionIcon, Menu } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconDeviceMobile, IconMenu2, IconTrash } from "@tabler/icons-react";
import classes from "~/lib/css/ActionsTd.module.css";
import { deleteIdea } from "~/lib/functions/idea";
import { createOptionIdea } from "~/lib/functions/optionIdea";
import { deleteItem } from "~/lib/utils/dataEditor";

export default function StockIdeaActions({ row, setData }) {
  function deleteOrder() {
    deleteIdea({ data: row.id }).then(() => deleteItem(row.id, setData));
  }

  function addOptionIdea() {
    createOptionIdea({ data: { symbol: row.symbol } }).then(() =>
      notifications.show({
        title: row.symbol,
        message: "Idea added successfully",
      })
    );
  }

  return (
    <td>
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
            leftSection={<IconDeviceMobile size={18} />}
            onClick={addOptionIdea}
          >
            Add to Option Ideas
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item
            color="red"
            leftSection={<IconTrash size={18} />}
            onClick={deleteOrder}
          >
            Delete Idea
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </td>
  );
}
