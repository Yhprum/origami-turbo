import { Button, Checkbox, Popover } from "@mantine/core";
import { useDidUpdate } from "@mantine/hooks";
import { IconFilter } from "@tabler/icons-react";
import { useEffect, useState } from "react";

interface CheckboxFilterProps {
  accessor: string;
  values: any[];
  updateFilter: (
    header: string,
    value: string | string[],
    type: string
  ) => void;
  filterType: string;
}
export default function CheckboxFilter({
  accessor,
  values,
  updateFilter,
  filterType,
}: CheckboxFilterProps) {
  const [filterValue, setFilterValue] = useState<string[]>(
    filterType === "tags" ? [] : values
  );
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!touched) setFilterValue(filterType === "tags" ? [] : values);
  }, [values]);

  const allChecked = filterValue.length === values.length;
  const indeterminate =
    filterValue.length > 0 && filterValue.length < values.length;

  useDidUpdate(
    () =>
      updateFilter(
        accessor,
        filterType === "tags"
          ? filterValue
          : values.filter((v) => !filterValue.includes(v)),
        filterType
      ),
    [filterValue]
  );

  const onChange = (value: string[]) => {
    setTouched(true);
    setFilterValue(value);
  };

  return (
    <Popover width={200} shadow="lg" position="bottom" withinPortal>
      <Popover.Target>
        <Button
          variant={
            (filterType === "tags" && filterValue.length === 0) ||
            (filterType === "checkbox" && allChecked)
              ? "light"
              : "filled"
          }
          fullWidth
          p={2}
          size="xs"
          leftSection={<IconFilter />}
        >
          {filterValue.length}
        </Button>
      </Popover.Target>
      <Popover.Dropdown>
        <Checkbox
          checked={allChecked}
          fw="bold"
          indeterminate={indeterminate}
          onChange={() => onChange(allChecked ? [] : values)}
          label="Select All"
        />
        <Checkbox.Group value={filterValue} onChange={onChange}>
          {values.map((option) => (
            <Checkbox mt={3} label={option} key={option ?? ""} value={option} />
          ))}
        </Checkbox.Group>
      </Popover.Dropdown>
    </Popover>
  );
}
