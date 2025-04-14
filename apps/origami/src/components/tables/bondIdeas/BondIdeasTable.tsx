import { Button, CloseButton, TextInput } from "@mantine/core";
import { useInputState } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { queryOptions, useMutation } from "@tanstack/react-query";
import { Fragment, useMemo } from "react";
import ExportButton from "~/components/ExportButton";
import MemoizedRow from "~/components/table/MemoizedRow";
import Table from "~/components/table/Table";
import TableHead from "~/components/table/TableHead";
import Toolbar from "~/components/table/Toolbar";
import NotesCell from "~/components/table/td/NotesCell";
import { bondRatingCell } from "~/components/table/td/cells";
import { createBondIdea, getBondIdeas } from "~/lib/functions/bondIdea";
import { deleteIdea } from "~/lib/functions/idea";
import { useQuery } from "~/lib/hooks/useQuery";
import useTable from "~/lib/hooks/useTable";
import { TableName } from "~/lib/server/db/enums";
import renderCell from "~/lib/table/renderCell";
import { ratingCompare, stringCompare } from "~/lib/table/sorts";
import type { ColumnDef, InitialCellStyleProps } from "~/lib/table/types";
import { deepCopy } from "~/lib/utils";
import { deleteItem } from "~/lib/utils/dataEditor";
import { currency, date, percent } from "~/lib/utils/formatter";

export const bondIdeasQueryOptions = queryOptions({
  queryKey: ["ideas", "bonds"] as ReadonlyArray<unknown>,
  queryFn: getBondIdeas,
  initialData: [],
});

export default function BondIdeasTable({
  styles,
}: { styles?: InitialCellStyleProps[] }) {
  const [cusip, setCusip] = useInputState("");

  const { data, isPending, isFetching, setData } = useQuery(
    bondIdeasQueryOptions
  );

  const columnDefs: ColumnDef<any>[] = useMemo(
    () => [
      { header: "Symbol", data: "symbol", sortFn: stringCompare },
      { header: "Cusip", data: "cusip", sortFn: stringCompare },
      { header: "Type", data: "type", filterType: "checkbox" },
      {
        header: "Issuer Name",
        data: "company",
        Cell: ({ value, row }) => (
          <td>
            <a
              href={`https://www.finra.org/finra-data/fixed-income/bond?cusip=${row.cusip}`}
              target="_blank"
              rel="noreferrer"
            >
              {value}
            </a>
          </td>
        ),
        sortFn: stringCompare,
      },
      { header: "Coupon", data: "rate", format: percent },
      {
        header: "Maturity",
        data: "maturity",
        format: date,
        filterType: "date",
      },
      {
        header: "Call Date",
        data: "callDate",
        format: date,
        filterType: "date",
      },
      {
        header: "Moody's®",
        data: "moodyRating",
        Cell: ({ value, row }) => bondRatingCell(value, row.moodyChange),
        sortFn: ratingCompare,
        filterType: "checkbox",
      },
      {
        header: "S&P",
        data: "standardAndPoorRating",
        Cell: ({ value, row }) =>
          bondRatingCell(value, row.standardAndPoorChange),
        sortFn: ratingCompare,
        filterType: "checkbox",
      },
      { header: "Last Sale", data: "price", format: currency },
      { header: "Yield", data: "ytm", format: percent },
      {
        header: "Last Sale Date",
        data: "tradeDate",
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
            isIdea
          />
        ),
        sortFn: stringCompare,
      },
      {
        header: "Actions",
        id: "delete",
        disableSort: true,
        Cell: ({ row }) => (
          <td>
            <CloseButton onClick={() => deleteBondIdea(row)} />
          </td>
        ),
      },
    ],
    []
  );

  const { rows, columns, headerProps, toolbarProps } = useTable(
    TableName.BOND_IDEAS,
    data,
    columnDefs,
    { styles }
  );

  const addIdeaMutation = useMutation({
    mutationFn: createBondIdea,
    onSuccess: (data) => {
      setData((oldData) => [data, ...deepCopy(oldData)]);
      setCusip("");
    },
    onError: (e: Error) => {
      notifications.show({
        title: "CUSIP Error",
        message: e.message,
        color: "red",
      });
    },
  });

  function deleteBondIdea(idea) {
    deleteIdea({ data: idea.id }).then(() => deleteItem(idea.id, setData));
  }

  return (
    <Fragment>
      <Toolbar
        tools={[
          <TextInput
            key="cusip"
            size="xs"
            placeholder="Add Cusip"
            value={cusip}
            onChange={setCusip}
            error={addIdeaMutation.isError}
            onFocus={(e) => {
              addIdeaMutation.reset();
              e.target.select();
            }}
          />,
          <Button
            key="add"
            size="xs"
            onClick={() => addIdeaMutation.mutate({ data: cusip })}
            loading={addIdeaMutation.isPending}
          >
            Add
          </Button>,
          <ExportButton
            key="export"
            title="bond-ideas"
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
