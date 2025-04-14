import { ActionIcon, Group, Loader, Tooltip } from "@mantine/core";
import type { UseListStateHandlers } from "@mantine/hooks";
import { IconFilter, IconFilterOff } from "@tabler/icons-react";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import ColumnPicker from "~/components/table/ColumnPicker";
import type { TableName } from "~/lib/server/db/enums";
import type { Column, InitialCellStyleProps } from "~/lib/table/types";
import SearchTool from "./SearchTool";

interface ToolbarProps {
  p?: number;
  h?: number;
  zIndex?: number;
  table: TableName;
  tools?: ReactNode[];
  loading?: boolean;
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
  showFilter: boolean;
  setShowFilter: Dispatch<SetStateAction<boolean>>;
  visibleColumns: string[];
  setVisibleColumns: Dispatch<SetStateAction<string[]>>;
  columnState: Column<any>[];
  columnHandlers: UseListStateHandlers<Column<any>>;
  resetColumns: () => void;
  columnStyles?: InitialCellStyleProps[];
}
export default function Toolbar({
  p = 12,
  h = 54,
  zIndex,
  table,
  tools,
  loading,
  search,
  setSearch,
  showFilter,
  setShowFilter,
  visibleColumns,
  setVisibleColumns,
  columnState,
  columnHandlers,
  resetColumns,
  columnStyles,
}: ToolbarProps) {
  return (
    <Group justify="space-between" p={p} h={h}>
      <Group>
        {tools}
        <Loader size="sm" display={loading ? undefined : "none"} />
      </Group>
      <Group justify="flex-end" gap={2}>
        <SearchTool zIndex={zIndex} value={search} setValue={setSearch} />
        <Tooltip zIndex={zIndex} withArrow label="Show/Hide Filters">
          <ActionIcon
            variant="subtle"
            color="gray"
            onClick={() => setShowFilter((s) => !s)}
          >
            {showFilter ? <IconFilterOff /> : <IconFilter />}
          </ActionIcon>
        </Tooltip>
        <ColumnPicker
          zIndex={zIndex}
          table={table}
          visibleColumns={visibleColumns}
          setVisibleColumns={setVisibleColumns}
          columnState={columnState}
          columnHandlers={columnHandlers}
          resetColumns={resetColumns}
          columnStyles={columnStyles}
        />
      </Group>
    </Group>
  );
}
