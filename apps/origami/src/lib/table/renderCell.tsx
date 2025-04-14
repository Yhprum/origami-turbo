import { Skeleton } from "@mantine/core";
import { Fragment } from "react";
import type { Column, Row } from "~/lib/table/types";

// TODO: type row generic
export default function <T>(
  row: Row<any>,
  column: Column<T>,
  isLoading = false,
  isTransaction = false,
  parent?: Row<T>
) {
  return isLoading && !row[column.accessorKey] ? (
    <td key={column.accessorKey}>
      <Skeleton height={20} />
    </td>
  ) : column.Cell ? (
    <Fragment key={column.accessorKey}>
      {column.Cell({
        value: row[column.accessorKey],
        row,
        isTransaction,
        parent,
      })}
    </Fragment>
  ) : (
    <td
      key={column.accessorKey}
      style={
        column.style instanceof Function
          ? column.style({ value: row[column.accessorKey], row })
          : column.style
      }
    >
      {"format" in column && column.format
        ? column.format(row[column.accessorKey])
        : row[column.accessorKey]}
    </td>
  );
}
