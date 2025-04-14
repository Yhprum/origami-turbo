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
import {
  IconCirclePlus,
  IconCircleX,
  IconFolderOpen,
  IconMenu2,
  IconPackage,
  IconPencilDollar,
  IconRotate,
  IconSkull,
  IconTableExport,
  IconTrash,
  IconZoomMoney,
} from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { Fragment } from "react";
import classes from "~/lib/css/ActionsTd.module.css";
import { deleteHolding, updateHolding } from "~/lib/functions/holding";
import { createOptionTransaction } from "~/lib/functions/option";
import { createTransaction } from "~/lib/functions/transaction";
import { AssetClass } from "~/lib/server/db/enums";
import { contractToDetails } from "~/lib/server/formatters/utils";
import { currentInputDate } from "~/lib/utils";
import { deleteItem, setModifiedResponse } from "~/lib/utils/dataEditor";
import { yyyymmdd } from "~/lib/utils/formatter";

export default function CoveredCallActions({
  row,
  setData,
  setOption,
  setFormData,
  setModal,
  isTransaction,
}) {
  const openDeleteModal = (row, type) => {
    modals.openConfirmModal({
      title: `Confirm ${type === "expire" ? "Expiration" : "Deletion"}`,
      children:
        type === "holding" ? (
          <Text size="sm">
            Delete Holding for {row.symbol} and{" "}
            {row.sortedStockTransactions.length +
              row.sortedOptionTransactions.length}{" "}
            Transaction(s)?
          </Text>
        ) : (
          <Text size="sm">
            Expire {row.sharesCovered / 100} option(s) at $0?
          </Text>
        ),
      labels: {
        confirm: type === "expire" ? "Expire" : "Delete",
        cancel: "Cancel",
      },
      confirmProps: { color: "red" },
      onConfirm: () => (type === "holding" ? removeHolding(row) : expire()),
    });
  };

  const roll = () => {
    setModal("roll");
    setOption(row);
  };

  const open = () => {
    setFormData({
      fields: [
        { field: "quantity", value: row.stockShares / -100 },
        { field: "holding", value: row.id },
        { field: "symbol", value: row.symbol },
        { field: "type", value: AssetClass.CALL },
      ],
      symbol: row.symbol,
      type: "Open",
    });
    setOption(row);
    setModal("add");
  };

  const close = () => {
    setFormData({
      fields: [
        { field: "quantity", value: row.stockShares / 100 },
        { field: "expiry", value: yyyymmdd(row.expireDate) },
        { field: "strike", value: row.strike },
        { field: "holding", value: row.id },
        { field: "contract", value: row.contractSymbol },
        { field: "type", value: AssetClass.CALL },
      ],
      type: "Close",
    });
    setOption(row);
    setModal("add");
  };

  const expire = () => {
    const data = {
      holding: row.id,
      quantity: row.sharesCovered / 100,
      price: 0,
      date: row.expireDate,
      contract: row.contractSymbol,
      type: AssetClass.CALL,
    };
    createOptionTransaction({ data }).then((data) =>
      setModifiedResponse(data, row.id, setData)
    );
  };

  function removeHolding(holding) {
    deleteHolding({ data: { id: holding.id, cascade: true } }).then(() =>
      deleteItem(holding.id, setData)
    );
  }

  const assign = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const callData = {
      holding: row.id,
      quantity: Number.parseInt(formData.get("quantity") as string),
      price: 0,
      date: row.expireDate,
      contract: row.contractSymbol,
      type: AssetClass.CALL,
    };
    createOptionTransaction({ data: callData });

    const closed =
      Number.parseInt(formData.get("quantity") as string) ===
      row.sharesCovered / 100;
    const stockData = {
      quantity: Number.parseInt(formData.get("quantity") as string) * 100 * -1,
      price: contractToDetails(row.openOptions[0].symbol).strike,
      date: (
        new FormData(e.target).get("date") ?? currentInputDate()
      ).toString(),
      holding: row.id,
      symbol: row.symbol,
      type: AssetClass.STOCK,
      closed,
    };
    const response = await createTransaction({ data: stockData });
    if (!response?.data) return;
    if (closed) {
      deleteItem(row.id, setData);
    } else {
      setModifiedResponse(response.data, row.id, setData);
    }
  };

  const closeStock = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      quantity: row.stockShares * -1,
      price: Number.parseFloat(formData.get("price") as string),
      date: (formData.get("date") ?? currentInputDate()).toString(),
      holding: row.id,
      symbol: row.symbol,
      type: AssetClass.STOCK,
      closed: true,
    };
    createTransaction({ data }).then(() => deleteItem(row.id, setData));
  };

  const compare = () => {
    setOption(row);
    setModal("compare");
  };

  const sellPopover = (target) => (
    <Popover withinPortal={false}>
      <Popover.Dropdown>
        <form onSubmit={closeStock}>
          <NumberInput
            label="Closing Stock Price"
            placeholder="Price"
            leftSection="$"
            decimalScale={2}
            name="price"
            required
          />
          <TextInput
            label="Date"
            placeholder="Date"
            type="date"
            defaultValue={currentInputDate()}
            name="date"
            required
          />
          <Button size="sm" type="submit">
            Sell Stock
          </Button>
        </form>
      </Popover.Dropdown>
      <Popover.Target>{target}</Popover.Target>
    </Popover>
  );

  const assignPopover = (target) => (
    <Popover withinPortal={false}>
      <Popover.Dropdown>
        <form onSubmit={assign}>
          <TextInput
            label="Date"
            placeholder="Date"
            type="date"
            defaultValue={currentInputDate()}
            name="date"
            required
          />
          <NumberInput
            label="Options to Assign"
            placeholder="Quantity"
            defaultValue={row.sharesCovered / 100}
            min={1}
            max={row.sharesCovered / 100}
            name="quantity"
            required
          />
          <Button size="sm" type="submit">
            Assign
          </Button>
        </form>
      </Popover.Dropdown>
      <Popover.Target>{target}</Popover.Target>
    </Popover>
  );

  const expired = row.daysToExpiry <= 0;

  return !isTransaction ? (
    <td>
      <Indicator inline color="red" size={6} disabled={!expired}>
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
              leftSection={<IconCirclePlus size={18} />}
              component={Link}
              to="/holdings/options/add"
              search={{ holding: row.id, contract: row.contractSymbol }}
            >
              Add to holding
            </Menu.Item>
            {row.openOptions.length ? (
              <Fragment>
                <Menu.Item
                  leftSection={<IconRotate size={18} />}
                  onClick={roll}
                >
                  Roll
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconCircleX size={18} />}
                  onClick={close}
                >
                  Close Option
                </Menu.Item>
                {expired && (
                  <Menu.Item
                    leftSection={<IconSkull size={18} />}
                    onClick={() => openDeleteModal(row, "expire")}
                  >
                    Expire Worthless
                  </Menu.Item>
                )}
                {assignPopover(
                  <Menu.Item
                    color="blue"
                    leftSection={<IconPackage size={18} />}
                  >
                    Assign at Strike Price
                  </Menu.Item>
                )}
              </Fragment>
            ) : row.stockShares ? (
              <Fragment>
                <Menu.Item
                  leftSection={<IconFolderOpen size={18} />}
                  onClick={open}
                >
                  Open Option
                </Menu.Item>
                {sellPopover(
                  <Menu.Item
                    color="blue"
                    leftSection={<IconPackage size={18} />}
                  >
                    Close Stock
                  </Menu.Item>
                )}
              </Fragment>
            ) : (
              <Menu.Item
                leftSection={<IconTableExport size={18} />}
                onClick={() =>
                  updateHolding({
                    data: { id: row.id, field: "closed", value: true },
                  }).then(() => deleteItem(row.id, setData))
                }
              >
                Move to Closed Options Table
              </Menu.Item>
            )}
            <Menu.Divider />
            <Menu.Item
              leftSection={<IconPencilDollar size={18} />}
              onClick={() => {
                setModal("transactions");
                setOption(row.id);
              }}
            >
              Update Transactions
            </Menu.Item>
            <Menu.Item
              leftSection={<IconZoomMoney size={18} />}
              onClick={compare}
            >
              Compare Roll Options
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item
              color="red"
              leftSection={<IconTrash size={18} />}
              onClick={() => openDeleteModal(row, "holding")}
            >
              Delete Holding
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Indicator>
    </td>
  ) : (
    <td>
      <CloseButton
        mx="auto"
        onClick={() => openDeleteModal(row, "transaction")}
      />
    </td>
  );
}
