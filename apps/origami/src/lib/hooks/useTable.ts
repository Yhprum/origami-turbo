import { useDebouncedValue, useDidUpdate, useListState } from "@mantine/hooks";
import { useCallback, useMemo, useState } from "react";
import type { TableName } from "~/lib/server/db/enums";
import { isFiltered, itemFilter, tagFilter } from "~/lib/table/filters";
import { numberCompare } from "~/lib/table/sorts";
import type {
  Column,
  ColumnDef,
  FilterProps,
  InitialCellStyleProps,
  Row,
  SortProps,
} from "~/lib/table/types";
import { deepCopy, escapeRegExp } from "~/lib/utils";

interface initialState {
  sort?: SortProps[];
  filter?: FilterProps[];
  showFilter?: boolean;
  styles?: InitialCellStyleProps[];
}
export default function useTable<T extends Record<string, any>>(
  name: TableName,
  data: T[],
  columnDefs: ColumnDef<T>[],
  initialState: initialState = {}
) {
  const [sort, setSort] = useState<SortProps[]>(initialState.sort ?? []);
  const [expanded, setExpanded] = useState<number>();
  const [filters, setFilters] = useState<FilterProps[]>(
    initialState.filter ?? []
  );
  const [showFilter, setShowFilter] = useState(
    initialState.showFilter ?? false
  );
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 250);
  const [columnState, columnHandlers] = useListState(
    initialColumnState(columnDefs, initialState.styles)
  );
  const [visibleColumns, setVisibleColumns] = useState(
    columnDefs.map(accessorKey)
  );

  useDidUpdate(resetColumns, [columnDefs]);

  // Create temp list of columns by data/id for quick access
  const columnsByAccessor = useMemo(() => {
    const accesors: Record<string, ColumnDef<T>> = {};
    for (const column of columnDefs)
      accesors[accessorKey(column) as string] = column;
    return accesors;
  }, [columnDefs]);

  // Sort and filter the data
  const processedData: Row<T>[] = useMemo(() => {
    let memoizedData = data;

    // Filter based on global search and column filters array
    const searchRegex = new RegExp(escapeRegExp(debouncedSearch), "i");
    if (filters.length || debouncedSearch) {
      memoizedData = memoizedData.filter((row) => {
        if (debouncedSearch) {
          if (!Object.values(row).some((value) => searchRegex.test(value)))
            return false;
        }
        if (!filters.every((filter) => getFilterFn(filter.type)(row, filter)))
          return false;
        return true;
      });
    }

    // Sort based on column sort array
    if (sort.length) {
      memoizedData = memoizedData.toSorted((a, b) => {
        let value = 0;
        for (const sortItem of sort) {
          const column = columnsByAccessor[sortItem.header];
          if ("id" in column) continue;

          const sortFn = column.sortFn ?? numberCompare;
          value = sortFn(sortItem)(a, b);
          if (value !== 0) break;
        }
        return value;
      });
    }

    return memoizedData.map((row) => ({
      ...row,
      expanded: expanded === row.id,
    }));
  }, [data, sort, expanded, filters, debouncedSearch]);

  // Update the column sort array when header is clicked
  const sortTable = useCallback(
    (header: string, shift: boolean) => {
      const column = columnsByAccessor[header];
      if ("id" in column || column.disableSort) return;

      setSort((oldSort) => {
        let newSort = deepCopy(oldSort);
        let sortIndex = newSort.findIndex((s) => s.header === header);
        if (sortIndex !== -1) {
          if (!shift) {
            newSort = [newSort[sortIndex]];
            sortIndex = 0;
          }
          if (newSort[sortIndex].direction === -1) {
            newSort.splice(sortIndex, 1);
          } else {
            newSort[sortIndex] = { header, direction: -1 };
          }
        } else {
          if (shift) {
            newSort = [...newSort, { header, direction: 1 }];
          } else {
            newSort = [{ header, direction: 1 }];
          }
        }
        return newSort;
      });
    },
    [columnsByAccessor]
  );

  // Update the column filter array when column filter is updated
  const updateFilter = (
    header: string,
    value: FilterProps["value"] | undefined,
    type: string
  ) => {
    const filterIndex = filters.findIndex((f) => f.header === header);
    if (filterIndex !== -1) {
      setFilters((f) => {
        const newFilter = deepCopy(f);
        if (value && isFiltered(value)) {
          newFilter[filterIndex] = { header, value, type };
        } else {
          newFilter.splice(filterIndex, 1);
        }
        return newFilter;
      });
    } else if (value && isFiltered(value)) {
      setFilters((f) => [...deepCopy(f), { header, value, type }]);
    }
  };

  // Filter hidden columns from state and build column groups
  const { columns, groups } = useMemo(() => {
    const columns = columnState
      .filter((column) => visibleColumns.includes(accessorKey(column)))
      .map((column) => ({
        ...column,
        accessorKey: accessorKey(column),
        filterValues:
          "filterType" in column && column.filterType === "checkbox"
            ? [...new Set(data.flatMap((r) => r[accessorKey(column)]))].sort()
            : "filterType" in column && column.filterType === "tags"
              ? [
                  ...new Set(
                    data.flatMap((r) =>
                      r[accessorKey(column)].map((tag) => tag.name)
                    )
                  ),
                ].sort()
              : [],
      })) as Column<T>[];
    let groups: { group?: string; colSpan: number; key: string }[] = [];
    let i = -1;
    let currentGroup: string | undefined = "";
    for (const col of columns) {
      if (col.group !== currentGroup) {
        groups[++i] = {
          group: col.group,
          colSpan: 1,
          key: `${col.group || "empty group"}${i}`,
        };
        currentGroup = col.group;
      } else {
        groups[i].colSpan++;
      }
    }
    if (groups.length === 1 && !groups[0].group) groups = [];
    return { columns, groups };
  }, [columnState, visibleColumns, data]);

  // Reset columns to initial state
  function resetColumns() {
    setVisibleColumns(columnDefs.map(accessorKey));
    columnHandlers.setState(
      initialColumnState(columnDefs, initialState.styles)
    );
  }

  return {
    rows: processedData,
    columns,
    setExpanded,
    headerProps: {
      groups,
      filters,
      showFilter,
      updateFilter,
      sort,
      sortTable,
    },
    toolbarProps: {
      table: name,
      search,
      setSearch,
      showFilter,
      setShowFilter,
      visibleColumns,
      setVisibleColumns,
      columnState,
      columnHandlers,
      resetColumns,
      columnStyles: initialState.styles,
    },
  };
}

// Translate string value to filter function
function getFilterFn(filterType: string) {
  switch (filterType) {
    case "checkbox":
      return itemFilter;
    case "tags":
      return tagFilter;
    case "boolean":
      return (row, filter: FilterProps) => row[filter.header];
    case "gt":
      return (row, filter: FilterProps) => row[filter.header] > filter.value;
    case "gte":
      return (row, filter: FilterProps) => row[filter.header] >= filter.value;
    case "lt":
      return (row, filter: FilterProps) => row[filter.header] < filter.value;
    case "lte":
      return (row, filter: FilterProps) => row[filter.header] <= filter.value;
    case "eq":
      return (row, filter: FilterProps) => row[filter.header] === filter.value;
    case "btwn":
      return (row, filter: FilterProps) =>
        (!filter.value[0] || row[filter.header] > filter.value[0]) &&
        (!filter.value[1] || row[filter.header] < filter.value[1]);
    default:
      return () => true;
  }
}

// Build initial state of columns by applying styles
function initialColumnState<T>(
  columnDefs: ColumnDef<T>[],
  styles?: InitialCellStyleProps[]
) {
  const columns = columnDefs.map((column) => ({
    ...column,
    accessorKey: accessorKey(column),
    filterValues: [],
  })) as Column<any>[];
  if (!styles?.length) return columns;

  for (const column of columnDefs) {
    const style = styles.find((style) => style.column === accessorKey(column));
    if (!style) continue;

    if ("type" in style) {
      switch (style.type) {
        case "gt":
          column.style = ({ value, row }) =>
            value > (typeof style.to === "string" ? row?.[style.to] : style.to)
              ? style.style[0]
              : style.style[1];
          break;
        case "gte":
          column.style = ({ value, row }) =>
            value >= (typeof style.to === "string" ? row?.[style.to] : style.to)
              ? style.style[0]
              : style.style[1];
          break;
        case "lt":
          column.style = ({ value, row }) =>
            value < (typeof style.to === "string" ? row?.[style.to] : style.to)
              ? style.style[0]
              : style.style[1];
          break;
        case "lte":
          column.style = ({ value, row }) =>
            value <= (typeof style.to === "string" ? row?.[style.to] : style.to)
              ? style.style[0]
              : style.style[1];
          break;
        case "eq":
          column.style = ({ value, row }) =>
            value ===
            (typeof style.to === "string" ? row?.[style.to] : style.to)
              ? style.style[0]
              : style.style[1];
          break;
      }
    } else {
      column.style = style.style;
    }
  }

  return columns;
}

// Grab key of column: `data` for data columns and `id` for display columns
function accessorKey<T>(column: ColumnDef<T>) {
  if ("data" in column) return column.data as string;
  return column.id;
}
