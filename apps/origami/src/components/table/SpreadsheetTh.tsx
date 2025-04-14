import { ActionIcon, Box, Collapse, Group, rem } from "@mantine/core";
import {
  IconChevronDown,
  IconChevronUp,
  IconFilterOff,
  IconSelector,
} from "@tabler/icons-react";
import cx from "clsx";
import { memo } from "react";
import type { Column, FilterProps, SortProps } from "~/lib/table/types";
import classes from "./SpreadsheetTh.module.css";
import BooleanFilter from "./filters/BooleanFilter";
import CheckboxFilter from "./filters/CheckboxFilter";
import DateFilter from "./filters/DateFilter";
import NumberFilter from "./filters/NumberFilter";

interface Props<T> {
  column: Column<T>;
  sort?: SortProps;
  sortTable: (header: string, shift: boolean) => void;
  showFilter: boolean;
  filter?: FilterProps;
  updateFilter: (
    header: string,
    value: FilterProps["value"] | undefined,
    type: string
  ) => void;
}
function SpreadsheetTh<T>({
  column,
  sort,
  sortTable,
  showFilter,
  filter,
  updateFilter,
}: Props<T>) {
  return (
    <th className={cx({ [classes.sticky]: column.sticky })}>
      <Group
        align="flex-end"
        wrap="nowrap"
        gap={0}
        onClick={(e) => sortTable(column.accessorKey, e.shiftKey)}
      >
        <Box mr="auto">{column.header}</Box>
        {!("id" in column) && !column.disableSort ? (
          <Box mt="auto">
            {sort?.direction === 1 ? (
              <IconChevronDown style={{ width: rem(16), height: rem(16) }} />
            ) : sort?.direction === -1 ? (
              <IconChevronUp style={{ width: rem(16), height: rem(16) }} />
            ) : (
              <IconSelector
                style={{ width: rem(16), height: rem(16) }}
                className={classes.selector}
              />
            )}
          </Box>
        ) : undefined}
      </Group>
      <Collapse in={showFilter}>
        {"data" in column ? (
          column.filterType === "checkbox" || column.filterType === "tags" ? (
            <CheckboxFilter
              accessor={column.accessorKey}
              values={column.filterValues}
              updateFilter={updateFilter}
              filterType={column.filterType}
            />
          ) : column.filterType === "boolean" ? (
            <BooleanFilter
              accessor={column.accessorKey}
              filter={filter}
              updateFilter={updateFilter}
            />
          ) : column.filterType === "date" ? (
            <DateFilter
              accessor={column.accessorKey}
              filter={filter}
              updateFilter={updateFilter}
            />
          ) : (
            <NumberFilter
              accessor={column.accessorKey}
              filter={filter}
              updateFilter={updateFilter}
            />
          )
        ) : (
          <ActionIcon disabled variant="subtle" color="grey">
            <IconFilterOff />
          </ActionIcon>
        )}
      </Collapse>
    </th>
  );
}

const typedMemo: <T>(c: T) => T = memo;
export default typedMemo(SpreadsheetTh);
