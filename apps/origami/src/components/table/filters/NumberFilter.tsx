import {
  ActionIcon,
  Button,
  NativeSelect,
  NumberInput,
  Popover,
} from "@mantine/core";
import { useDebouncedValue, useDidUpdate } from "@mantine/hooks";
import { IconFilter } from "@tabler/icons-react";
import { Fragment, useState } from "react";
import { isFiltered } from "~/lib/table/filters";
import type { FilterProps } from "~/lib/table/types";
import { deepCopy } from "~/lib/utils";

interface NumberFilterProps {
  filter?: FilterProps;
  accessor: string;
  updateFilter: (
    header: string,
    value: FilterProps["value"] | undefined,
    type: string
  ) => void;
}
export default function NumberFilter({
  filter,
  accessor,
  updateFilter,
}: NumberFilterProps) {
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

  function setArrayValue(index: number, value: string | number) {
    setFilterValue((oldValues) => {
      const newValues = Array.isArray(oldValues) ? deepCopy(oldValues) : [];
      newValues[index] = value.toString();
      return newValues;
    });
  }

  const filterOptions = [
    { label: "Filter Type", value: "", disabled: true },
    { label: "Greater Than", value: "gt" },
    { label: "Greater Than or Equal To", value: "gte" },
    { label: "Less Than", value: "lt" },
    { label: "Less Than or Equal To", value: "lte" },
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
            <NumberInput
              mt="sm"
              value={filterValue?.[0]}
              onChange={(value) => setArrayValue(0, value)}
              {...selectProps[filterType][0]}
            />
            <NumberInput
              mt="sm"
              value={filterValue?.[1]}
              onChange={(value) => setArrayValue(1, value)}
              {...selectProps[filterType][1]}
            />
          </Fragment>
        ) : (
          <NumberInput
            mt="sm"
            value={filterValue}
            onChange={setFilterValue}
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
