import type { FilterProps } from "~/lib/table/types";

export const itemFilter = (row, filter: FilterProps) =>
  Array.isArray(filter.value) &&
  !filter.value.includes(row[filter.header] as string | number);

export const tagFilter = (row, filter: FilterProps) =>
  Array.isArray(filter.value) &&
  filter.value.some((value) =>
    row[filter.header].map((tag) => tag.name).includes(value)
  );

export const isFiltered = (value: FilterProps["value"] | undefined) =>
  (value || value === 0) && (!Array.isArray(value) || value.length);
