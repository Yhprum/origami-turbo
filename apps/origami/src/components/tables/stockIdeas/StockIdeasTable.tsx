import { queryOptions } from "@tanstack/react-query";
import { Fragment, useMemo } from "react";
import ExportButton from "~/components/ExportButton";
import SymbolSelect from "~/components/SymbolSelect";
import MemoizedRow from "~/components/table/MemoizedRow";
import Table from "~/components/table/Table";
import TableHead from "~/components/table/TableHead";
import Toolbar from "~/components/table/Toolbar";
import NotesCell from "~/components/table/td/NotesCell";
import TargetCell from "~/components/table/td/TargetCell";
import {
  IdeaSymbolCell,
  exDividendDateCell,
} from "~/components/table/td/cells";
import { createIdea, getStockIdeas, updateIdea } from "~/lib/functions/idea";
import { useQuery } from "~/lib/hooks/useQuery";
import useTable from "~/lib/hooks/useTable";
import { IdeaType, TableName } from "~/lib/server/db/enums";
import type { FormattedStockIdea } from "~/lib/server/formatters/types";
import renderCell from "~/lib/table/renderCell";
import { stringCompare } from "~/lib/table/sorts";
import type { ColumnDef, InitialCellStyleProps } from "~/lib/table/types";
import { setModifiedField } from "~/lib/utils/dataEditor";
import {
  abbreviate,
  currency,
  date,
  percent,
  target,
  twoDecimals,
} from "~/lib/utils/formatter";
import { gainLoss } from "~/lib/utils/styler";
import StockIdeaActions from "./StockIdeaActions";

export const stockIdeasQueryOptions = queryOptions({
  queryKey: ["ideas", "stocks"] as ReadonlyArray<unknown>,
  queryFn: getStockIdeas,
  initialData: [],
});

export default function StockIdeasTable({
  styles,
}: { styles?: InitialCellStyleProps[] }) {
  const { data, isPending, isFetching, setData } = useQuery(
    stockIdeasQueryOptions
  );

  async function addIdea(symbol: string) {
    const data = await createIdea({ data: { type: IdeaType.STOCK, symbol } });
    setData((oldData) => [...oldData, data]);
  }

  const editIdea = (holding, field, value, row) => {
    updateIdea({ data: { id: holding.id, field, value } }).then(() => {
      setModifiedField(field, value, row.id, setData);
      setModifiedField("updatedAt", new Date(), row.id, setData);
      if (field === "target")
        setModifiedField(
          "ratio",
          value ? row.price / value : null,
          row.id,
          setData
        );
    });
  };

  const columnDefs: ColumnDef<FormattedStockIdea>[] = useMemo(
    () => [
      {
        header: "Symbol",
        data: "symbol",
        Cell: ({ value, row }) => <IdeaSymbolCell value={value} row={row} />,
        sortFn: stringCompare,
      },
      {
        header: "Actions",
        id: "actions",
        disableSort: true,
        Cell: ({ row }) => <StockIdeaActions row={row} setData={setData} />,
      },
      { header: "Last Updated", data: "updatedAt", format: date },
      { header: "Stock Price", data: "price", format: currency },
      {
        header: "Price Target",
        data: "target",
        Cell: ({ value, row, isTransaction }) => (
          <TargetCell
            bg={target(value, row.price, "buy")}
            defaultValue={value}
            updateValue={(newValue) => editIdea(row, "target", newValue, row)}
            isTransaction={isTransaction}
          />
        ),
      },
      { header: "Price/Target", data: "ratio", format: twoDecimals },
      {
        header: "Day Change",
        data: "dayChangePercent",
        format: percent,
        style: gainLoss,
      },
      { header: "PE", data: "forwardPE", format: twoDecimals },
      { header: "PEG", data: "peg", format: twoDecimals },
      { header: "Yield", data: "rate", format: percent },
      { header: "52 Week High", data: "fiftyTwoWeekHigh", format: currency },
      { header: "52 Week Low", data: "fiftyTwoWeekLow", format: currency },
      { header: "Market Cap", data: "marketCap", format: abbreviate },
      {
        header: "Est. Ex-Div Date",
        data: "exDividendDate",
        Cell: ({ value, row }) => exDividendDateCell(value, row),
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
            isIdea
          />
        ),
        sortFn: stringCompare,
      },
    ],
    []
  );

  const { rows, columns, headerProps, toolbarProps } = useTable(
    TableName.STOCK_IDEAS,
    data,
    columnDefs,
    { styles }
  );

  return (
    <Fragment>
      <Toolbar
        tools={[
          <SymbolSelect
            key="add"
            size="xs"
            placeholder="Add Symbol"
            onChange={(symbol) => addIdea(symbol)}
            clearOnSelect
          />,
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
    </Fragment>
  );
}
