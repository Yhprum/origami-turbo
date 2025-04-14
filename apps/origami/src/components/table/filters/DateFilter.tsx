import {
  ActionIcon,
  Button,
  NativeSelect,
  Popover,
  TextInput,
} from "@mantine/core";
import { useDebouncedValue, useDidUpdate } from "@mantine/hooks";
import { IconFilter } from "@tabler/icons-react";
import { Fragment, useState } from "react";
import { isFiltered } from "~/lib/table/filters";
import type { FilterProps } from "~/lib/table/types";
import { deepCopy, inputDate } from "~/lib/utils";

interface DateFilterProps {
  filter?: FilterProps;
  accessor: string;
  updateFilter: (
    header: string,
    value: FilterProps["value"] | undefined,
    type: string
  ) => void;
}
export default function DateFilter({
  filter,
  accessor,
  updateFilter,
}: DateFilterProps) {
  const [filterType, setFilterType] = useState(filter?.type ?? "");
  const [filterValue, setFilterValue] = useState<
    FilterProps["value"] | undefined
  >(filter?.value);
  const [debounced] = useDebouncedValue(filterValue, 250);

  useDidUpdate(
    () => updateFilter(accessor, debounced, filterType),
    [debounced]
  );

  function changeFilterType(type: string) {
    setFilterValue("");
    setFilterType(type);
  }

  function setArrayValue(index: number, value: number) {
    setFilterValue((oldValues) => {
      const newValues = Array.isArray(oldValues) ? deepCopy(oldValues) : [];
      newValues[index] = value;
      return newValues;
    });
  }

  const filterOptions = [
    { label: "Filter Type", value: "", disabled: true },
    { label: "After", value: "gt" },
    { label: "After or Equal To", value: "gte" },
    { label: "Before", value: "lt" },
    { label: "Before or Equal To", value: "lte" },
    { label: "Equal To", value: "eq" },
    { label: "Between", value: "btwn" },
  ];

  const selectProps = {
    "": { display: "none" },
    gt: { placeholder: "minimum", leftSection: ">" },
    gte: { placeholder: "minimum (inclusive)", leftSection: "≥" },
    lt: { placeholder: "maximum", leftSection: "<" },
    lte: { placeholder: "minimum", leftSection: "≤" },
    eq: { placeholder: "minimum", leftSection: "=" },
    btwn: [
      { placeholder: "minimum", leftSection: ">" },
      { placeholder: "maximum", leftSection: "<" },
    ],
  };

  return (
    <Popover
      withArrow
      zIndex={450}
      width={200}
      shadow="lg"
      position="bottom"
      withinPortal
    >
      <Popover.Target>
        <ActionIcon
          variant={isFiltered(filterValue) ? "filled" : "subtle"}
          color="grey"
        >
          <IconFilter />
        </ActionIcon>
      </Popover.Target>
      <Popover.Dropdown>
        <NativeSelect
          data={filterOptions}
          value={filterType}
          onChange={(e) => changeFilterType(e.target.value)}
        />
        {filterType === "btwn" ? (
          <Fragment>
            <TextInput
              type="date"
              mt="sm"
              value={filterValue?.[0] ? inputDate(filterValue[0]) : ""}
              onChange={(e) =>
                setArrayValue(0, new Date(e.target.value).getTime())
              }
              {...selectProps[filterType][0]}
            />
            <TextInput
              type="date"
              mt="sm"
              value={filterValue?.[1] ? inputDate(filterValue[1]) : ""}
              onChange={(e) =>
                setArrayValue(1, new Date(e.target.value).getTime())
              }
              {...selectProps[filterType][1]}
            />
          </Fragment>
        ) : (
          <TextInput
            type="date"
            mt="sm"
            value={filterValue ? inputDate(filterValue as number) : ""}
            onChange={(e) => setFilterValue(new Date(e.target.value).getTime())}
            {...selectProps[filterType]}
          />
        )}
        {filterType !== "" ? (
          <Button
            fullWidth
            variant="outline"
            mt="sm"
            onClick={() => changeFilterType("")}
          >
            Clear
          </Button>
        ) : null}
      </Popover.Dropdown>
    </Popover>
  );
}
