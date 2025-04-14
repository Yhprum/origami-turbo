import { Button } from "@mantine/core";
import { IconFolderPlus } from "@tabler/icons-react";
import { queryOptions } from "@tanstack/react-query";
import { Fragment, useMemo, useState } from "react";
import ExportButton from "~/components/ExportButton";
import AddOpenOrderModal from "~/components/modals/AddOpenOrderModal";
import MemoizedRow from "~/components/table/MemoizedRow";
import Table from "~/components/table/Table";
import TableHead from "~/components/table/TableHead";
import Toolbar from "~/components/table/Toolbar";
import { exDividendDateCell } from "~/components/table/td/cells";
import { getOpenOrders } from "~/lib/functions/order";
import { useQuery } from "~/lib/hooks/useQuery";
import useTable from "~/lib/hooks/useTable";
import { TableName } from "~/lib/server/db/enums";
import type { FormattedOpenOrder } from "~/lib/server/formatters/types";
import renderCell from "~/lib/table/renderCell";
import type { ColumnDef } from "~/lib/table/types";
import { currency, date, twoDecimals } from "~/lib/utils/formatter";
import OpenOrderActions from "./OpenOrderActions";

export const openOrdersQueryOptions = queryOptions({
  queryKey: ["orders"] as ReadonlyArray<unknown>,
  queryFn: getOpenOrders,
  initialData: {
    orders: [],
    styles: undefined,
  },
});

export default function OpenOrdersTable({ holdingId }: { holdingId?: number }) {
  const [selectedHolding, setSelectedHolding] = useState<number>();
  const [modal, setModal] = useState("");

  const { data, isPending, isFetching, setData } = useQuery(
    openOrdersQueryOptions
  );

  const columnDefs: ColumnDef<FormattedOpenOrder>[] = useMemo(
    () => [
      { header: "Symbol", data: "symbol" },
      {
        header: "Actions",
        id: "actions",
        disableSort: true,
        Cell: ({ row }) => (
          <OpenOrderActions
            row={row}
            setData={setData}
            setModal={setModal}
            setRow={setSelectedHolding}
          />
        ),
      },
      {
        header: "GTC Date",
        data: "gtc",
        format: date,
        style: ({ value }) =>
          new Date(value).getTime() < Date.now()
            ? { backgroundColor: "var(--mantine-color-red-3)" }
            : {},
        filterType: "date",
      },
      { header: "Buy/Sell", data: "buySell", filterType: "checkbox" },
      { header: "Quantity", data: "quantity" },
      { header: "Limit/Stop", data: "limitStop", filterType: "checkbox" },
      { header: "Order Price", data: "orderPrice", format: currency },
      { header: "Current Price", data: "price", format: currency },
      { header: "Price Delta", data: "priceDelta", format: twoDecimals },
      {
        header: "Ex-Dividend Date",
        data: "exDividendDate",
        Cell: ({ value, row }) => exDividendDateCell(value, row),
        filterType: "date",
      },
      { header: "Order Value", data: "value", format: currency },
      {
        header: "52 Week High/Low Midpoint",
        data: "midpoint",
        format: currency,
      },
    ],
    []
  );

  const { rows, columns, headerProps, toolbarProps } = useTable(
    TableName.OPEN_ORDERS,
    data.orders,
    columnDefs,
    {
      styles: data.styles,
    }
  );

  const openModal = () => {
    setSelectedHolding(undefined);
    setModal("add");
  };

  return (
    <Fragment>
      <Toolbar
        tools={[
          <Button
            key="add"
            mr={4}
            color="gray"
            variant="outline"
            size="xs"
            onClick={() => openModal()}
            leftSection={<IconFolderPlus size={18} />}
          >
            Add Open Order
          </Button>,
          <ExportButton
            key="export"
            title="orders"
            headers={columns.map((c) => c.accessorKey)}
            data={rows}
          />,
        ]}
        loading={isFetching}
        {...toolbarProps}
      />
      <Table>
        <TableHead columns={columns} {...headerProps} />
        <tbody>
          {rows.map((row) => (
            <MemoizedRow
              key={row.id}
              row={row}
              columns={columns}
              isLoading={isPending}
            >
              {columns.map((column) => renderCell(row, column, isPending))}
            </MemoizedRow>
          ))}
        </tbody>
      </Table>
      <AddOpenOrderModal
        show={modal === "add"}
        setModal={(modal) => setModal(modal)}
        setData={setData}
        holdingId={holdingId}
        row={selectedHolding}
      />
    </Fragment>
  );
}
