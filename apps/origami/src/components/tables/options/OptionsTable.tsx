import {
  Box,
  Button,
  CloseButton,
  SegmentedControl,
  Text,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconFolderPlus } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { Fragment, useEffect, useMemo, useState } from "react";
import ExportButton from "~/components/ExportButton";
import AddOptionModal from "~/components/modals/AddOptionModal";
import CompareModal from "~/components/modals/CompareModal";
import RollModal from "~/components/modals/RollModal";
import UpdateTransactionModal from "~/components/modals/UpdateTransactionsModal";
import MemoizedRow from "~/components/table/MemoizedRow";
import Table from "~/components/table/Table";
import TableHead from "~/components/table/TableHead";
import Toolbar from "~/components/table/Toolbar";
import DividendCell from "~/components/table/td/DividendCell";
import GainLoss from "~/components/table/td/GainLoss";
import NotesCell from "~/components/table/td/NotesCell";
import {
  StickyCell,
  StickyTh,
  exDividendDateCell,
  symbolCell,
  tagCell,
} from "~/components/table/td/cells";
import { rebuildHolding } from "~/lib/functions/holding";
import {
  getCoveredCallRollData,
  getOptionHoldings,
} from "~/lib/functions/option";
import { deleteTransaction } from "~/lib/functions/transaction";
import { useQuery } from "~/lib/hooks/useQuery";
import useTable from "~/lib/hooks/useTable";
import { TableName } from "~/lib/server/db/enums";
import type {
  FormattedCoveredCall,
  FormattedCoveredCallRollData,
} from "~/lib/server/formatters/types";
import renderCell from "~/lib/table/renderCell";
import { stringCompare } from "~/lib/table/sorts";
import type { ColumnDef, InitialCellStyleProps } from "~/lib/table/types";
import { deepCopy, inputDate, sum } from "~/lib/utils";
import { setModifiedResponse } from "~/lib/utils/dataEditor";
import { currency, date, percent } from "~/lib/utils/formatter";
import { gainLoss } from "~/lib/utils/styler";
import CoveredCallActions from "./CoveredCallActions";

import { queryOptions } from "@tanstack/react-query";
export const optionHoldingsQueryOptions = queryOptions({
  queryKey: ["holdings", "options"] as ReadonlyArray<unknown>,
  queryFn: getOptionHoldings,
  initialData: [],
});

export default function OptionsTable({
  styles,
}: { styles?: InitialCellStyleProps[] }) {
  const [fetchedRollData, setFetchedRollData] = useState<boolean | "fetching">(
    false
  );
  const [mode, setMode] = useState("View");
  const [modal, setModal] = useState("");
  const [option, setOption] = useState<any>();
  const [formData, setFormData] = useState({});

  const { data, isPending, isFetching, setData } = useQuery(
    optionHoldingsQueryOptions
  );
  const isAnyLoading = isPending || fetchedRollData === "fetching";

  // TODO: useQuery
  useEffect(() => {
    if (mode !== "Roll" || fetchedRollData !== false) return;
    setFetchedRollData("fetching");
    getCoveredCallRollData({ data: { openOptions: data } })
      .then((data) => {
        setFetchedRollData(true);
        setData((oldData) =>
          oldData.map((row) => ({
            ...row,
            ...data.find((d) => d.id === row.id),
          }))
        );
      })
      .catch(() => {
        setFetchedRollData(false);
        setMode("View");
      });
  }, [mode, data, fetchedRollData]);

  const openDeleteModal = (transaction, row) => {
    modals.openConfirmModal({
      title: "Confirm Deletion",
      children: (
        <Text size="sm">
          Delete transaction for {transaction.quantity} {transaction.symbol} at{" "}
          {currency(transaction.price)}?
        </Text>
      ),
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () =>
        deleteTransaction({
          data: { id: transaction.id, options: { build: true } },
        }).then(
          (data) =>
            // TODO: make data defined if build === true
            data && setModifiedResponse(data, row.id, setData)
        ),
    });
  };

  function updateRollOption(contractSymbol: string) {
    if (!option) return;
    getCoveredCallRollData({
      data: { openOptions: [option], id: option.id, to: contractSymbol },
    }).then((data) => {
      setModal("");
      setData((oldData) => {
        const newData = deepCopy(oldData);
        const holdingIndex = newData.findIndex((item) => item.id === option.id);
        newData[holdingIndex] = { ...newData[holdingIndex], ...data[0] };
        return newData;
      });
    });
  }

  const columnDefs: ColumnDef<
    FormattedCoveredCall & Partial<FormattedCoveredCallRollData>
  >[] = useMemo(
    () => [
      {
        header: "Symbol",
        data: "symbol",
        group: "Buy Data",
        sticky: true,
        Cell: ({ row, isTransaction }) =>
          symbolCell(row.expanded, setExpanded, row, isTransaction),
        sortFn: stringCompare,
      },
      {
        header: "Actions",
        id: "actions",
        group: "Buy Data",
        disableSort: true,
        Cell: ({ row, isTransaction }) => (
          <CoveredCallActions
            row={row}
            setData={setData}
            setOption={setOption}
            setFormData={setFormData}
            setModal={setModal}
            isTransaction={isTransaction}
          />
        ),
      },
      {
        header: "Tags",
        data: "tags",
        group: "Buy Data",
        disableSort: true,
        Cell: ({ value, isTransaction }) => tagCell(value, isTransaction),
        filterType: "tags",
      },
      {
        header: "Day Change (Stock)",
        data: "dayChangePercent",
        group: "Buy Data",
        format: percent,
        style: gainLoss,
      },
      {
        header: "Day Change (Stock + Option)",
        data: "dayBalanceChange",
        group: "Buy Data",
        format: currency,
        style: gainLoss,
      },
      {
        header: "Avg Buy Date",
        data: "weightedDate",
        group: "Buy Data",
        format: date,
        filterType: "date",
      },
      {
        header: "Shares Covered",
        data: "sharesCovered",
        group: "Buy Data",
        Cell: ({ value, row }) => (
          <td>
            {value === row.stockShares
              ? value
              : `${value} / ${row.stockShares}`}
          </td>
        ),
      },
      {
        header: "Stock Price",
        data: "price",
        group: "Current Info",
        format: currency,
      },
      {
        header: "Current Call Mark",
        data: "mark",
        group: "Current Info",
        format: currency,
      },
      {
        header: "Net Value per Share",
        data: "netValuePerShare",
        group: "Value & Cost",
        format: currency,
      },
      {
        header: "Net Value",
        data: "netValue",
        group: "Value & Cost",
        format: currency,
      },
      {
        header: "Share Basis",
        data: "avgCostPerShare",
        group: "Value & Cost",
        format: currency,
      },
      {
        header: "Net Invest per Share",
        data: "netInvestPerShare",
        group: "Value & Cost",
        format: currency,
        style: ({ value, row }) =>
          value > row.price
            ? { backgroundColor: "var(--mantine-color-red-2)" }
            : {},
      },
      {
        header: "Share +/-",
        data: "shareGain",
        group: "Return Data",
        format: currency,
        style: gainLoss,
      },
      {
        header: "Closed CCs +/-",
        data: "closedCCs",
        group: "Return Data",
        format: currency,
        style: gainLoss,
      },
      {
        header: "Put B/Ws",
        data: "putBWs",
        group: "Return Data",
        format: currency,
      },
      {
        header: "Divs Received",
        data: "estCumYield",
        group: "Return Data",
        Cell: ({ value, row, isTransaction }) => (
          <DividendCell value={value} row={row} isTransaction={isTransaction} />
        ),
      },
      {
        header: "Open CC +/-",
        data: "openCCGain",
        group: "Return Data",
        format: currency,
      },
      {
        header: "Gain/Loss",
        data: "gainLoss",
        group: "Return Data",
        format: currency,
        style: gainLoss,
      },
      {
        header: "Qrtly Div/Sh",
        data: "quarterlyDividend",
        group: "Dividends",
        format: currency,
      },
      {
        header: "Eff Div pa",
        data: "effDivPA",
        group: "Dividends",
        format: percent,
      },
      {
        header: "Expire Date",
        data: "expireDate",
        group: "Expiry & Strike",
        format: date,
        filterType: "date",
      },
      {
        header: "Strike",
        data: "strike",
        group: "Expiry & Strike",
        format: currency,
        style: ({ value, row }) =>
          value > row.price ? { color: "var(--mantine-color-red-8)" } : {},
      },
      {
        header: "Days To Expiry",
        data: "daysToExpiry",
        group: "Expiry & Strike",
      },
      {
        header: "Max $$/Sh",
        data: "maxGainPerShare",
        group: "Max Returns",
        format: currency,
      },
      {
        header: "Max $$",
        data: "maxGain",
        group: "Max Returns",
        format: currency,
        style: { whiteSpace: "nowrap" },
      },
      {
        header: "MX",
        data: "maxReturn",
        group: "Max Returns",
        format: percent,
      },
      {
        header: "MX PA",
        data: "maxReturnPA",
        group: "Max Returns",
        format: percent,
      },
      {
        header: "Profit No Change",
        data: "pftNoChg",
        group: "Per Annum Returns",
        format: percent,
      },
      { header: "PA", data: "pa", group: "Per Annum Returns", format: percent },
      {
        header: "PA at ex-div",
        data: "paAtExDiv",
        group: "Per Annum Returns",
        format: percent,
      },
      {
        header: "% to Break Even",
        data: "percentToBE",
        group: "Protection",
        format: percent,
      },
      {
        header: "Down PT",
        data: "downPT",
        group: "Protection",
        format: percent,
      },
      {
        header: "% ITM/OTM",
        data: "percentItmOtm",
        group: "Protection",
        format: percent,
      },
      {
        header: "Open Date",
        data: "openDate",
        group: "CURRENT POSITIONS",
        format: date,
        filterType: "date",
      },
      {
        header: "Stock Price",
        data: "stockPriceAtOpen",
        group: "CURRENT POSITIONS",
        format: currency,
      },
      {
        header: "Curr. Call at Open",
        data: "currCallAtOpen",
        group: "CURRENT POSITIONS",
        format: currency,
      },
      {
        header: "Contract Symbol",
        data: "contractSymbol",
        group: "Option Data",
        sortFn: stringCompare,
      },
      {
        header: "Ex-Dividend Date",
        data: "exDividendDate",
        group: "Option Data",
        Cell: ({ value, row }) => exDividendDateCell(value, row),
      },
      { header: "Bid", data: "bid", group: "Option Data", format: currency },
      { header: "Ask", data: "ask", group: "Option Data", format: currency },
      { header: "Mark", data: "_mark", group: "Option Data", format: currency },
      {
        header: "Div pmts To Expiry",
        data: "divPaymentsToExpiry",
        group: "Option Data",
        format: (value) => Math.floor(value),
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

  const rollColumDefs: ColumnDef<
    FormattedCoveredCall & Partial<FormattedCoveredCallRollData>
  >[] = useMemo(
    () => [
      {
        header: "Symbol",
        data: "symbol",
        group: "Roll Data",
        sticky: true,
        Cell: ({ value }) => <StickyCell>{value}</StickyCell>,
        sortFn: stringCompare,
      },
      {
        header: "Actions",
        id: "actions",
        group: "Buy Data",
        disableSort: true,
        Cell: ({ row, isTransaction }) => (
          <CoveredCallActions
            row={row}
            setData={setData}
            setOption={setOption}
            setFormData={setFormData}
            setModal={setModal}
            isTransaction={isTransaction}
          />
        ),
      },
      {
        header: "Roll Expiry",
        data: "rollExpiry",
        format: date,
        filterType: "date",
      },
      { header: "Roll Strike", data: "rollStrike", format: currency },
      { header: "Roll Mark", data: "rollMark", format: currency },
      { header: "Roll Spread %", data: "rollSpreadPercent", format: percent },
      { header: "Roll Divs/sh", data: "rollDivsPerShare", format: currency },
      { header: "Current Max $$", data: "currentMaxGain", format: currency },
      { header: "Roll Max $$", data: "rollMaxGain", format: currency },
      { header: "Net Roll Max $$", data: "netMaxGain", format: currency },
      { header: "Net Roll Max PA", data: "netMaxPa", format: percent },
      { header: "Current NC $$", data: "currentNcGain", format: currency },
      { header: "Roll NC $$", data: "rollNcGain", format: currency },
      { header: "Net Roll NC $$", data: "netNcGain", format: currency },
      { header: "Net Roll NC PA", data: "netNcPa", format: percent },
      { header: "Ex-Div PA", data: "exDivPa", format: percent },
      { header: "Roll Premium Dr (Cr)", data: "rollPremium", format: currency },
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
    TableName.COVERED_CALLS,
    data,
    mode === "View" ? columnDefs : rollColumDefs,
    { styles }
  );

  const transactions = useMemo(() => {
    if (typeof option !== "number") return [];
    const current = data.find((item) => item.id === option);
    if (!current) return [];
    return (
      [
        ...current.sortedStockTransactions,
        ...current.sortedOptionTransactions,
      ].map((t) => ({
        id: t.id,
        type: t.type,
        date: inputDate(t.date),
        quantity: t.quantity,
        price: t.price,
      })) ?? []
    );
  }, [option, data]);

  return (
    <Fragment>
      <Toolbar
        tools={[
          <Button
            key="add"
            component={Link}
            to="/holdings/options/add"
            mr={4}
            color="gray"
            variant="outline"
            size="xs"
            leftSection={<IconFolderPlus size={18} />}
          >
            Add Position
          </Button>,
          <SegmentedControl
            key="mode"
            size="xs"
            data={["View", "Roll"]}
            value={mode}
            onChange={setMode}
          />,
          <ExportButton
            key="export"
            title="holdings"
            headers={columns.map((c) => c.accessorKey)}
            data={rows}
          />,
        ]}
        loading={isAnyLoading || isFetching}
        {...toolbarProps}
      />
      <Table>
        <TableHead columns={columns} {...headerProps} />
        <tbody>
          {rows.map((row) => (
            <Fragment key={row.id}>
              <MemoizedRow row={row} columns={columns} isLoading={isAnyLoading}>
                {columns.map((column) => renderCell(row, column, isAnyLoading))}
              </MemoizedRow>
              {mode === "View" && row.expanded && (
                <Fragment>
                  <tr>
                    <th>Transaction</th>
                    <th />
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Date</th>
                  </tr>
                  {[
                    ...row.sortedStockTransactions,
                    ...row.sortedOptionTransactions,
                  ].map((transaction) => (
                    <Box
                      component="tr"
                      key={transaction.id}
                      fw={
                        row?.openOptions
                          ?.flat()
                          .map((fields) => fields.id)
                          .includes(transaction.id)
                          ? "bold"
                          : undefined
                      }
                    >
                      <td>{transaction.type}</td>
                      <td>
                        <CloseButton
                          onClick={() => openDeleteModal(transaction, row)}
                        />
                      </td>
                      <td>{transaction.quantity}</td>
                      <td>{currency(Number(transaction.price))}</td>
                      <td>{date(transaction.date)}</td>
                      <td>{transaction.symbol}</td>
                    </Box>
                  ))}
                </Fragment>
              )}
            </Fragment>
          ))}
        </tbody>
        <tfoot>
          <tr>
            {columns.map((column) => {
              switch (column.accessorKey) {
                case "symbol":
                  return <StickyTh key={column.accessorKey}>Totals</StickyTh>;
                case "dayBalanceChange":
                  return (
                    <GainLoss
                      key={column.accessorKey}
                      value={data
                        .map((item) => item.dayBalanceChange)
                        .reduce(sum, 0)}
                    />
                  );
                case "netValue":
                  return (
                    <td key={column.accessorKey}>
                      {currency(
                        data.map((item) => item.netValue).reduce(sum, 0)
                      )}
                    </td>
                  );
                case "closedCCs":
                  return (
                    <GainLoss
                      key={column.accessorKey}
                      value={data.map((item) => item.closedCCs).reduce(sum, 0)}
                    />
                  );
                case "putBWs":
                  return (
                    <td key={column.accessorKey}>
                      {currency(data.map((item) => item.putBWs).reduce(sum, 0))}
                    </td>
                  );
                case "gainLoss":
                  return (
                    <GainLoss
                      key={column.accessorKey}
                      value={data.map((item) => item.gainLoss).reduce(sum, 0)}
                    />
                  );
                default:
                  return <td key={column.accessorKey} />;
              }
            })}
          </tr>
        </tfoot>
      </Table>
      <CompareModal
        show={modal === "compare"}
        current={option}
        setModal={setModal}
        onSelect={updateRollOption}
        plusMs={1000 * 60 * 60 * 24 * 60}
      />
      <RollModal
        show={modal === "roll"}
        option={option}
        closeModal={() => setModal("")}
        setData={setData}
      />
      <AddOptionModal
        show={modal === "add"}
        closeModal={() => setModal("")}
        formData={formData}
        setData={setData}
        holding={option}
      />
      <UpdateTransactionModal
        show={modal === "transactions"}
        onClose={() => {
          setModal("");
          if (option)
            rebuildHolding({ data: { id: option } }).then((data) =>
              setModifiedResponse(data, option, setData)
            );
        }}
        transactions={transactions}
      />
    </Fragment>
  );
}
