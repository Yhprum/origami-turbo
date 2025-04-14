import type { Column, FilterProps, SortProps } from "~/lib/table/types";
import SpreadsheetTh from "./SpreadsheetTh";

interface TableHeadProps<T> {
  columns: Column<T>[];
  groups: {
    group?: string;
    colSpan: number;
    key: string;
  }[];
  filters: FilterProps[];
  showFilter: boolean;
  updateFilter: (
    header: string,
    value: FilterProps["value"] | undefined,
    type: string
  ) => void;
  sort: SortProps[];
  sortTable: (header: string, shift: boolean) => void;
}
export default function TableHead<T>({
  columns,
  groups,
  filters,
  showFilter,
  updateFilter,
  sort,
  sortTable,
}: TableHeadProps<T>) {
  return (
    <thead>
      {groups.length !== 0 && (
        <tr>
          {groups.map((group) => (
            <th key={group.key} colSpan={group.colSpan}>
              {group.group}
            </th>
          ))}
        </tr>
      )}
      <tr>
        {columns.map((column) => (
          <SpreadsheetTh
            key={column.accessorKey}
            column={column}
            showFilter={showFilter}
            filter={filters.find((f) => f.header === column.accessorKey)}
            updateFilter={updateFilter}
            sort={sort.find((s) => s.header === column.accessorKey)}
            sortTable={sortTable}
          />
        ))}
      </tr>
    </thead>
  );
}
