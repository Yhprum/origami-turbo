import equal from "fast-deep-equal";
import { type ReactNode, memo } from "react";
import type { Column } from "~/lib/table/types";

interface Props {
  children: ReactNode;
  row: any;
  columns: Column<any>[];
  isLoading?: boolean;
}
function MemoizedRow(props: Props) {
  return <tr>{props.children}</tr>;
}

export default memo(
  MemoizedRow,
  (a, b) =>
    a.isLoading === b.isLoading &&
    equal(a.row, b.row) &&
    equal(a.columns, b.columns)
);
