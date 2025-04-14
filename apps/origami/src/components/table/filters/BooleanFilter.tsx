import { Box, Switch } from "@mantine/core";
import type { FilterProps } from "~/lib/table/types";

interface BooleanFilterProps {
  filter?: FilterProps;
  accessor: string;
  updateFilter: (
    header: string,
    value: boolean | undefined,
    type: string
  ) => void;
}
export default function BooleanFilter({
  filter,
  accessor,
  updateFilter,
}: BooleanFilterProps) {
  return (
    <Box h={31.2}>
      <Switch
        checked={filter?.value === true}
        onChange={(e) =>
          updateFilter(accessor, e.currentTarget.checked, "boolean")
        }
      />
    </Box>
  );
}
