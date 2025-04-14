import { Button } from "@mantine/core";
import { IconFolderPlus, IconUpload } from "@tabler/icons-react";
import { queryOptions } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Fragment, useMemo, useState } from "react";
import ExportButton from "~/components/ExportButton";
import AdditionalIncomeModal from "~/components/modals/AdditionalIncomeModal";
import UpdateTransactionModal from "~/components/modals/UpdateTransactionsModal";
import MemoizedRow from "~/components/table/MemoizedRow";
import Table from "~/components/table/Table";
import TableHead from "~/components/table/TableHead";
import Toolbar from "~/components/table/Toolbar";
import AdditionalIncomeCell from "~/components/table/td/AdditionalIncomeCell";
import DividendCell from "~/components/table/td/DividendCell";
import GainLoss from "~/components/table/td/GainLoss";
import NotesCell from "~/components/table/td/NotesCell";
import TargetCell from "~/components/table/td/TargetCell";
import {
  StickyCell,
  StickyTh,
  bondRatingCell,
  symbolCell,
  tagCell,
} from "~/components/table/td/cells";
import {
  getHoldings,
  rebuildHolding,
  updateHolding,
} from "~/lib/functions/holding";
import { useQuery } from "~/lib/hooks/useQuery";
import useTable from "~/lib/hooks/useTable";
import { AssetClass, TableName } from "~/lib/server/db/enums";
import type {
  FormattedBond,
  FormattedStock,
} from "~/lib/server/formatters/types";
import renderCell from "~/lib/table/renderCell";
import { ratingCompare, stringCompare } from "~/lib/table/sorts";
import type { ColumnDef, InitialCellStyleProps } from "~/lib/table/types";
import { inputDate, sum } from "~/lib/utils";
import { setModifiedField, setModifiedResponse } from "~/lib/utils/dataEditor";
import {
  abbreviate,
  currency,
  date,
  percent,
  target,
  twoDecimals,
} from "~/lib/utils/formatter";
import { gainLoss } from "~/lib/utils/styler";
import StockActions from "./StockActions";
import UpdateUserPopover from "./UpdateUserPopover";

export const stockHoldingsQueryOptions = queryOptions({
  queryKey: ["holdings", "stocks"] as ReadonlyArray<unknown>,
  queryFn: getHoldings,
  initialData: [],
});

export default function StocksTable({
  userData,
  styles,
}: {
  userData: {
    cash: number;
    yield: number;
  };
  styles?: InitialCellStyleProps[];
}) {
  const [user, setUser] = useState(userData);
  const [modal, setModal] = useState("");
  const [selected, setSelected] = useState<number>();

  const { data, isPending, isFetching, setData } = useQuery(
    stockHoldingsQueryOptions
  );

  function editHolding(holding: any, field: any, value: any, row: any) {
    updateHolding({ data: { id: holding.id, field, value } }).then(() =>
      setModifiedField(field, value, row.id, setData)
    );
  }

  const columnDefs: ColumnDef<FormattedStock & FormattedBond>[] = useMemo(
    () => [
      {
        header: "Symbol",
        data: "symbol",
        sticky: true,
        Cell: ({ row, isTransaction }) =>
          symbolCell(row.expanded, setExpanded, row, isTransaction),
        sortFn: stringCompare,
      },
      {
        header: "Actions",
        id: "actions",
        disableSort: true,
        Cell: ({ row, isTransaction, parent }) => (
          <StockActions
            row={row}
            setData={setData}
            setModal={setModal}
            setSelected={setSelected}
            isTransaction={isTransaction}
            parent={parent}
          />
        ),
      },
      {
        header: "Tags",
        data: "tags",
        disableSort: true,
        Cell: ({ value, isTransaction }) => tagCell(value, isTransaction),
        filterType: "tags",
      },
      {
        header: "Type",
        data: "type",
        sortFn: stringCompare,
        filterType: "checkbox",
      },
      {
        header: "Sell Target",
        data: "sellTarget",
        Cell: ({ value, row, isTransaction }) => (
          <TargetCell
            bg={target(value, row.price, "sell")}
            defaultValue={value}
            updateValue={(newValue) =>
              editHolding(row, "sellTarget", newValue, row)
            }
            isTransaction={isTransaction}
          />
        ),
      },
      {
        header: "Buy Target",
        data: "buyTarget",
        Cell: ({ value, row, isTransaction }) => (
          <TargetCell
            bg={target(value, row.price, "buy")}
            defaultValue={value}
            updateValue={(newValue) =>
              editHolding(row, "buyTarget", newValue, row)
            }
            isTransaction={isTransaction}
          />
        ),
      },
      {
        header: "Day Change $$",
        data: "dayChange",
        format: currency,
        style: gainLoss,
      },
      {
        header: "Day Change Percent",
        data: "dayChangePercent",
        format: percent,
        style: gainLoss,
      },
      {
        header: "Day Balance Change",
        data: "dayBalanceChange",
        format: currency,
        style: gainLoss,
      },
      { header: "Rate", data: "rate", format: percent },
      {
        header: "Forward Dividend Yield",
        data: "forwardYield",
        format: percent,
      },
      { header: "Buy Date", data: "date", format: date, filterType: "date" },
      { header: "Holding Period", data: "holdingPeriod", format: twoDecimals },
      { header: "Quantity", data: "shares", format: twoDecimals },
      { header: "Current Price", data: "price", format: currency },
      { header: "Value", data: "value", format: currency },
      {
        header: "Est. Cum Yield",
        data: "estCumYield",
        Cell: ({ value, row, isTransaction }) => (
          <DividendCell value={value} row={row} isTransaction={isTransaction} />
        ),
      },
      {
        header: "Additional Income",
        data: "additionalIncomeTotal",
        Cell: ({ value, row, isTransaction }) => (
          <AdditionalIncomeCell
            value={value}
            row={row}
            setData={setData}
            isTransaction={isTransaction}
          />
        ),
      },
      { header: "Cost/Share", data: "purchasePrice", format: currency },
      { header: "Cost", data: "cost", format: currency },
      {
        header: "Gain/Loss",
        data: "gainLoss",
        format: currency,
        style: gainLoss,
      },
      { header: "Cap Gain", data: "capGain", format: percent, style: gainLoss },
      { header: "Cum Yield", data: "cumYield", format: percent },
      { header: "Cum Gain", data: "cumGain", format: percent, style: gainLoss },
      { header: "Annual Income", data: "annualIncome", format: currency },
      { header: "Current Yield", data: "curYield", format: percent },
      { header: "Yield to Maturity", data: "ytm", format: percent },
      {
        header: "Maturity Date",
        data: "maturityDate",
        format: date,
        filterType: "date",
        style: ({ value }) =>
          value < Date.now() ? { color: "var(--mantine-color-red-8)" } : {},
      },
      {
        header: "Years to Maturity",
        data: "yearsToMaturity",
        format: twoDecimals,
      },
      {
        header: "Call Date",
        data: "callDate",
        format: date,
        filterType: "date",
      },
      { header: "Yield to Call at Par", data: "yieldToCall", format: percent },
      { header: "Est. IRR", data: "estIRR", format: percent, style: gainLoss },
      {
        header: "Sector",
        data: "sector",
        sortFn: stringCompare,
        filterType: "checkbox",
      },
      { header: "52 Week High", data: "fiftyTwoWeekHigh", format: currency },
      { header: "52 Week Low", data: "fiftyTwoWeekLow", format: currency },
      { header: "Market Cap", data: "marketCap", format: abbreviate },
      { header: "Forward P/E", data: "forwardPE", format: twoDecimals },
      { header: "Max Bond Return", data: "maxReturn", format: currency },
      {
        header: "Absolute Return on Value",
        data: "returnOnValue",
        format: percent,
      },
      {
        header: "Moody Rating",
        data: "moodyRating",
        Cell: ({ value, row }) => bondRatingCell(value, row.moodyChange),
        sortFn: ratingCompare,
        filterType: "checkbox",
      },
      {
        header: "S&P Rating",
        data: "standardAndPoorRating",
        Cell: ({ value, row }) =>
          bondRatingCell(value, row.standardAndPoorChange),
        sortFn: ratingCompare,
        filterType: "checkbox",
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
    TableName.STOCKS,
    data,
    columnDefs,
    { styles }
  );

  return (
    <Fragment>
      <Toolbar
        tools={[
          <Button
            key="add"
            component={Link}
            to="/holdings/add"
            mr={4}
            color="gray"
            variant="outline"
            size="xs"
            leftSection={<IconFolderPlus size={18} />}
          >
            Add Holding
          </Button>,
          <Button
            key="import"
            component={Link}
            to="/profile/accounts"
            mr={4}
            variant="subtle"
            size="compact-sm"
            leftSection={<IconUpload size={20} />}
          >
            Import
          </Button>,
          <ExportButton
            key="export"
            title="holdings"
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
        <tbody>
          <tr>
            {columns.map((column) => {
              switch (column.accessorKey) {
                case "symbol":
                  return <StickyCell key={column.accessorKey}>Cash</StickyCell>;
                case "actions":
                  return (
                    <td key={column.accessorKey}>
                      <UpdateUserPopover user={user} setUser={setUser} />
                    </td>
                  );
                case "value":
                  return (
                    <td key={column.accessorKey}>{currency(user.cash)}</td>
                  );
                case "rate":
                  return (
                    <td key={column.accessorKey}>{percent(user.yield)}</td>
                  );
                case "annualIncome":
                  return (
                    <td key={column.accessorKey}>
                      {currency(user.cash * user.yield)}
                    </td>
                  );
                default:
                  return <td key={column.accessorKey} />;
              }
            })}
          </tr>
        </tbody>
        <tfoot>
          <tr>
            {columns.map((column) => {
              const totalValue = rows.map((item) => item.value).reduce(sum, 0);
              const totalBalanceChange = rows
                .map((item) => item.dayBalanceChange ?? 0)
                .reduce(sum, 0);
              const cashIncome = user.cash * user.yield;
              switch (column.accessorKey) {
                case "symbol":
                  return <StickyTh key={column.accessorKey}>Totals</StickyTh>;
                case "dayChangePercent":
                  return (
                    <GainLoss
                      key={column.accessorKey}
                      value={totalBalanceChange / totalValue}
                      format="percent"
                    />
                  );
                case "dayBalanceChange":
                  return (
                    <GainLoss
                      key={column.accessorKey}
                      value={totalBalanceChange}
                    />
                  );
                case "value":
                  return (
                    <td key={column.accessorKey}>
                      {currency(totalValue + user.cash)}
                    </td>
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
                        rows.map((item) => item.annualIncome).reduce(sum, 0) +
                          cashIncome
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
      <AdditionalIncomeModal
        show={modal === "income"}
        setModal={setModal}
        holding={selected}
        setData={setData}
      />
      <UpdateTransactionModal
        show={modal === "transactions"}
        onClose={() => {
          setModal("");
          if (selected)
            rebuildHolding({ data: { id: selected } }).then((data) =>
              setModifiedResponse(data, selected, setData)
            );
        }}
        transactions={
          data
            .find((item: any) => item.id === selected)
            ?.transactions?.map((t: any) => ({
              id: t.id,
              type: AssetClass.STOCK,
              date: inputDate(t.date),
              quantity: t.shares,
              price: t.purchasePrice,
            })) ?? []
        }
      />
    </Fragment>
  );
}
