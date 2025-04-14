import { queryOptions } from "@tanstack/react-query";
import { Fragment, useMemo } from "react";
import ExportButton from "~/components/ExportButton";
import MemoizedRow from "~/components/table/MemoizedRow";
import Table from "~/components/table/Table";
import TableHead from "~/components/table/TableHead";
import Toolbar from "~/components/table/Toolbar";
import GainLoss from "~/components/table/td/GainLoss";
import NotesCell from "~/components/table/td/NotesCell";
import { StickyTh, symbolCell } from "~/components/table/td/cells";
import { getClosedHoldings } from "~/lib/functions/holding";
import { useQuery } from "~/lib/hooks/useQuery";
import useTable from "~/lib/hooks/useTable";
import { TableName } from "~/lib/server/db/enums";
import type { FormattedClosedSecurity } from "~/lib/server/formatters/types";
import renderCell from "~/lib/table/renderCell";
import { stringCompare } from "~/lib/table/sorts";
import type { ColumnDef, InitialCellStyleProps } from "~/lib/table/types";
import { sum } from "~/lib/utils";
import { currency, date, percent, twoDecimals } from "~/lib/utils/formatter";
import { gainLoss } from "~/lib/utils/styler";
import ClosedStockActions from "./ClosedStockActions";

export const closedStockHoldingsQueryOptions = queryOptions({
  queryKey: ["closed", "stocks"] as ReadonlyArray<unknown>,
  queryFn: getClosedHoldings,
  initialData: [],
});

export default function ClosedStocksTable({
  styles,
}: { styles?: InitialCellStyleProps[] }) {
  const { data, isPending, isFetching, setData } = useQuery(
    closedStockHoldingsQueryOptions
  );

  const columnDefs: ColumnDef<FormattedClosedSecurity>[] = useMemo(
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
        Cell: ({ row, isTransaction, parent }) => (
          <ClosedStockActions
            row={row}
            setData={setData}
            isTransaction={isTransaction}
            parent={parent}
          />
        ),
      },
      { header: "Buy Date", data: "date", format: date, filterType: "date" },
      { header: "Holding Period", data: "holdingPeriod", format: twoDecimals },
      { header: "Quantity", data: "shares" },
      { header: "PurchasePrice", data: "purchasePrice", format: currency },
      { header: "Sale Price", data: "sellPrice", format: currency },
      { header: "Sale Proceeds", data: "proceeds", format: currency },
      { header: "Est. Cum Yield", data: "estCumYield", format: currency },
      { header: "Total Cost", data: "cost", format: currency },
      {
        header: "Gain/Loss",
        data: "gainLoss",
        format: currency,
        style: gainLoss,
      },
      { header: "Cap Gain", data: "capGain", format: percent, style: gainLoss },
      { header: "Cum Yield", data: "cumYield", format: percent },
      { header: "Cum Gain", data: "cumGain", format: percent, style: gainLoss },
      { header: "Est. IRR", data: "estIRR", format: percent, style: gainLoss },
      {
        header: "Maturity Date",
        data: "maturityDate",
        format: date,
        filterType: "date",
      },
      {
        header: "Sell Date",
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
    TableName.CLOSED_STOCKS,
    data,
    columnDefs,
    { styles: styles }
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
              switch (column.accessorKey as keyof FormattedClosedSecurity) {
                case "symbol":
                  return <StickyTh key={column.accessorKey}>Totals</StickyTh>;
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
    </Fragment>
  );
}
