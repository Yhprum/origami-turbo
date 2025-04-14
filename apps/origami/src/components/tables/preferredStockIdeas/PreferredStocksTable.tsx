import { Text } from "@mantine/core";
import { queryOptions } from "@tanstack/react-query";
import { Fragment, useMemo } from "react";
import ExportButton from "~/components/ExportButton";
import MemoizedRow from "~/components/table/MemoizedRow";
import Table from "~/components/table/Table";
import TableHead from "~/components/table/TableHead";
import Toolbar from "~/components/table/Toolbar";
import {
  addPreferredStockIdea,
  deletePreferredStockIdea,
  getPreferredStockIdeas,
} from "~/lib/functions/preferredStock";
import { useQuery } from "~/lib/hooks/useQuery";
import useTable from "~/lib/hooks/useTable";
import { TableName } from "~/lib/server/db/enums";
import type { PreferredStock } from "~/lib/server/external/types";
import renderCell from "~/lib/table/renderCell";
import {
  numberOrStringCompare,
  ratingCompare,
  stringCompare,
} from "~/lib/table/sorts";
import type { ColumnDef, InitialCellStyleProps } from "~/lib/table/types";
import { setModifiedField } from "~/lib/utils/dataEditor";
import { currency, date, dateOrString, percent } from "~/lib/utils/formatter";
import FavoriteButton from "./FavoriteButton";

export const preferredStockIdeasQueryOptions = queryOptions({
  queryKey: ["ideas", "preferredStocks"] as ReadonlyArray<unknown>,
  queryFn: getPreferredStockIdeas,
  initialData: [],
});

export default function PreferredStockIdeasTable({
  styles,
}: {
  styles?: InitialCellStyleProps[];
}) {
  const { data, isPending, isFetching, setData } = useQuery(
    preferredStockIdeasQueryOptions
  );

  const columnDefs: ColumnDef<PreferredStock>[] = useMemo(
    () => [
      {
        header: "★",
        data: "favorite",
        Cell: ({ value, row }) => (
          <td>
            <FavoriteButton
              active={value}
              onClick={() => addFavorite(value, row)}
            />
          </td>
        ),
        filterType: "boolean",
      },
      {
        header: "Symbol",
        data: "Symbol",
        Cell: ({ value }) => (
          <td>
            <a
              href={`https://www.quantumonline.com/SearchDD.cfm?sopt=symbol&tickersymbol=${value}`}
              target="_blank"
              rel="noreferrer"
            >
              {value}
            </a>
          </td>
        ),
        sortFn: stringCompare,
      },
      {
        header: "Preferred Stock Name",
        data: "Preferred Stock Name",
        sortFn: stringCompare,
      },
      {
        header: "IPO Date",
        data: "IPO Date",
        format: date,
        filterType: "date",
      },
      { header: "Div Rate", data: "Div Rate", format: percent },
      { header: "Last Price", data: "Last Price", format: currency },
      { header: "Volume", data: "Volume" },
      { header: "Yield", data: "Yield", format: percent },
      { header: "YTC", data: "YTC", format: percent },
      { header: "YTM", data: "YTM", format: percent },
      {
        header: "Ex-Div Date",
        data: "Ex-Div Date",
        format: date,
        filterType: "date",
      },
      {
        header: "Call Date",
        data: "Call Date",
        format: dateOrString,
        sortFn: numberOrStringCompare,
        filterType: "date",
      },
      {
        header: "Maturity Date",
        data: "Maturity Date",
        format: dateOrString,
        sortFn: numberOrStringCompare,
        filterType: "date",
      },
      { header: "Liquid Price", data: "Liquid Price", format: currency },
      {
        header: "Moody's",
        data: "Moody's",
        sortFn: ratingCompare,
        filterType: "checkbox",
      },
      {
        header: "S&P",
        data: "S&P",
        sortFn: ratingCompare,
        filterType: "checkbox",
      },
      {
        header: "Exchange",
        data: "Exchange",
        sortFn: stringCompare,
        filterType: "checkbox",
      },
      {
        header: "Status",
        data: "Status",
        sortFn: stringCompare,
        filterType: "checkbox",
      },
    ],
    []
  );

  const { rows, columns, headerProps, toolbarProps } = useTable(
    TableName.PREFERRED_STOCK_IDEAS,
    data,
    columnDefs,
    {
      sort: [{ header: "favorite", direction: 1 }],
      styles,
    }
  );

  function addFavorite(value: boolean, row: any) {
    setModifiedField("favorite", !value, row.id, setData);
    if (value) deletePreferredStockIdea({ data: row.Symbol });
    else addPreferredStockIdea({ data: row.Symbol });
  }

  return (
    <Fragment>
      <Toolbar
        tools={[
          <Text key="count" c="dimmed">
            {isFetching ? "Loading..." : `${rows.length} Rows returned`}
          </Text>,
          <ExportButton
            key="export"
            title="bond-ideas"
            headers={columns.map((c) => c.accessorKey)}
            data={rows}
          />,
        ]}
        loading={isPending}
        {...toolbarProps}
      />
      <Table>
        <TableHead columns={columns} {...headerProps} />
        <tbody>
          {rows.map((row) => (
            <MemoizedRow
              key={row.Symbol}
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
