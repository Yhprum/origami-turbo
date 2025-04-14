import type { CSSProperties, JSX } from "react";
import type { Styler } from "~/lib/utils/styler";

interface AccessorColumn<T> {
  header: string;
  data: keyof T;
  sticky?: boolean;
  group?: string;
  Cell?: (cell: CellProps<T>) => JSX.Element;
  format?: (value: any) => any;
  disableSort?: boolean;
  sortFn?: (sort: SortProps) => (a: any, b: any) => number;
  filterType?: string;
  style?: Styler | CSSProperties | undefined;
}

interface DisplayColumn<T> {
  header: string;
  id: string;
  sticky?: boolean;
  group?: string;
  Cell: (cell: CellProps<T>) => JSX.Element;
  style?: Styler | CSSProperties | undefined;
}

export type ColumnDef<T> = AccessorColumn<T> | DisplayColumn<T>;

export type Row<T> = T & { expanded: boolean };
export type Column<T> = ColumnDef<T> & {
  accessorKey: string;
  filterValues: T[keyof T][];
};

export type InitialCellStyleProps =
  | { column: string; style: CSSProperties }
  | {
      column: string;
      style: CSSProperties[];
      type: string;
      to: string | number;
    };

interface CellProps<T> {
  value: any;
  row: Row<T>;
  isTransaction: boolean;
  parent?: any;
}

export interface SortProps {
  header: string;
  direction: number;
}

export interface FilterProps {
  header: string;
  type: string;
  value: number | string | boolean | (string | number)[];
}
