import { queryOptions } from "@tanstack/react-query";
import { Fragment, useMemo, useState } from "react";
import ExportButton from "~/components/ExportButton";
import UpdateTransactionModal from "~/components/modals/UpdateTransactionsModal";
import MemoizedRow from "~/components/table/MemoizedRow";
import Table from "~/components/table/Table";
import TableHead from "~/components/table/TableHead";
import Toolbar from "~/components/table/Toolbar";
import DividendCell from "~/components/table/td/DividendCell";
import GainLoss from "~/components/table/td/GainLoss";
import NotesCell from "~/components/table/td/NotesCell";
import { StickyTh, symbolCell } from "~/components/table/td/cells";
import { rebuildHolding } from "~/lib/functions/holding";
import { getClosedOptionHoldings } from "~/lib/functions/option";
import { useQuery } from "~/lib/hooks/useQuery";
import useTable from "~/lib/hooks/useTable";
import { TableName } from "~/lib/server/db/enums";
import renderCell from "~/lib/table/renderCell";
import { stringCompare } from "~/lib/table/sorts";
import type { ColumnDef, InitialCellStyleProps } from "~/lib/table/types";
import { inputDate, sum } from "~/lib/utils";
import { setModifiedResponse } from "~/lib/utils/dataEditor";
import { currency, date, percent, twoDecimals } from "~/lib/utils/formatter";
import { gainLoss } from "~/lib/utils/styler";
import ClosedOptionActions from "./ClosedOptionActions";

export const closedOptionHoldingsQueryOptions = queryOptions({
  queryKey: ["closed", "options"] as ReadonlyArray<unknown>,
  queryFn: getClosedOptionHoldings,
  initialData: [],
});

export default function ClosedOptionsTable({
  styles,
}: { styles?: InitialCellStyleProps[] }) {
  const [modal, setModal] = useState("");
  const [selected, setSelected] = useState<number>();

  const { data, isPending, isFetching, setData } = useQuery(
    closedOptionHoldingsQueryOptions
  );

  const columnDefs: ColumnDef<any>[] = useMemo(
    () => [
      {
        header: "Symbol",
        data: "symbol",
        sticky: true,
        Cell: ({ row, isTransaction }) =>
          symbolCell(row.expanded, setExpanded, row, isTransaction, true),
        sortFn: stringCompare,
      },
      {
        header: "Actions",
        id: "actions",
        disableSort: true,
        Cell: ({ row, isTransaction }) => (
          <ClosedOptionActions
            row={row}
            setData={setData}
            setSelected={setSelected}
            setModal={setModal}
            isTransaction={isTransaction}
          />
        ),
      },
      { header: "Type", data: "type", sortFn: stringCompare },
      { header: "Buy Date", data: "date", format: date, filterType: "date" },
      { header: "Holding Period", data: "holdingPeriod", format: twoDecimals },
      { header: "Quantity", data: "shares" },
      { header: "Purchase Price", data: "purchasePrice", format: currency },
      { header: "Sale Price", data: "sellPrice", format: currency },
      {
        header: "Share Gain",
        data: "shareGain",
        format: currency,
        style: gainLoss,
      },
      { header: "Option Cost", data: "optionCost", format: currency },
      { header: "Option Proceeds", data: "optionProceeds", format: currency },
      {
        header: "Option Gain",
        data: "optionGain",
        format: currency,
        style: gainLoss,
      },
      {
        header: "Est. Cum Yield",
        data: "estCumYield",
        Cell: ({ value, row, isTransaction }) => (
          <DividendCell value={value} row={row} isTransaction={isTransaction} />
        ),
      },
      {
        header: "Gain/Loss",
        data: "gainLoss",
        format: currency,
        style: gainLoss,
      },
      { header: "Net Invest", data: "netInvest", format: currency },
      {
        header: "Gain %",
        data: "gainPercent",
        format: percent,
        style: gainLoss,
      },
      { header: "IRR", data: "irr", format: percent, style: gainLoss },
      { header: "Last Strike", data: "lastStrike", format: twoDecimals },
      {
        header: "Last Expiry",
        data: "lastExpiry",
        format: date,
        filterType: "date",
      },
      {
        header: "Close Date",
        data: "sellDate",
        format: date,
        filterType: "date",
      },
      {
        header: "Notes",
        data: "notes",
        Cell: ({ value, row, isTransaction }) => (
          <NotesCell
            value={value}
            row={row}
            setData={setData}
            isTransaction={isTransaction}
          />
        ),
        sortFn: stringCompare,
      },
    ],
    []
  );

  const { rows, columns, setExpanded, headerProps, toolbarProps } = useTable(
    TableName.CLOSED_OPTIONS,
    data,
    columnDefs,
    { styles }
  );

  return (
    <Fragment>
      <Toolbar
        tools={[
          <ExportButton
            key="export"
            title="closed"
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
            <Fragment key={row.id}>
              <MemoizedRow row={row} columns={columns} isLoading={isPending}>
                {columns.map((column) => renderCell(row, column, isPending))}
              </MemoizedRow>
              {row.expanded &&
                row.transactions.map((transaction) => (
                  <MemoizedRow
                    key={transaction.id}
                    row={transaction}
                    columns={columns}
                    isLoading={isPending}
                  >
                    {columns.map((column) =>
                      renderCell(transaction, column, isPending, true, row)
                    )}
                  </MemoizedRow>
                ))}
            </Fragment>
          ))}
        </tbody>
        <tfoot>
          <tr>
            {columns.map((column) => {
              const totalValue = rows.map((item) => item.value).reduce(sum, 0);
              switch (column.accessorKey) {
                case "symbol":
                  return <StickyTh key={column.accessorKey}>Totals</StickyTh>;
                case "value":
                  return (
                    <td key={column.accessorKey}>{currency(totalValue)}</td>
                  );
                case "estCumYield":
                  return (
                    <td key={column.accessorKey}>
                      {currency(
                        rows.map((item) => item.estCumYield).reduce(sum, 0)
                      )}
                    </td>
                  );
                case "cost":
                  return (
                    <td key={column.accessorKey}>
                      {currency(rows.map((item) => item.cost).reduce(sum, 0))}
                    </td>
                  );
                case "gainLoss":
                  return (
                    <GainLoss
                      key={column.accessorKey}
                      value={rows.map((item) => item.gainLoss).reduce(sum, 0)}
                    />
                  );
                case "annualIncome":
                  return (
                    <td key={column.accessorKey}>
                      {currency(
                        rows.map((item) => item.annualIncome).reduce(sum, 0)
                      )}
                    </td>
                  );
                default:
                  return <td key={column.accessorKey} />;
              }
            })}
          </tr>
        </tfoot>
      </Table>
      <UpdateTransactionModal
        show={modal === "transactions"}
        onClose={() => {
          setModal("");
          if (selected)
            rebuildHolding({ data: { id: selected, closed: true } }).then(
              (data) => setModifiedResponse(data, selected, setData)
            );
        }}
        transactions={
          data
            .find((item) => item.id === selected)
            ?.transactions?.map((t) => ({
              id: t.id,
              type: t.type,
              date: inputDate(t.date),
              quantity: t.shares,
              price: t.purchasePrice ?? t.sellPrice,
            })) ?? []
        }
      />
    </Fragment>
  );
}
