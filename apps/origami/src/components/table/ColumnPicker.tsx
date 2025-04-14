import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import {
  ActionIcon,
  Box,
  Button,
  Divider,
  Popover,
  Switch,
  Tooltip,
} from "@mantine/core";
import type { UseListStateHandlers } from "@mantine/hooks";
import { IconColumns, IconGripVertical } from "@tabler/icons-react";
import { type Dispatch, type SetStateAction, useState } from "react";
import CustomizeTableModal from "~/components/modals/CustomizeTableModal";
import type { TableName } from "~/lib/server/db/enums";
import type { Column, InitialCellStyleProps } from "~/lib/table/types";
import classes from "./ColumnPicker.module.css";

interface ColumnPickerProps {
  zIndex?: number;
  table: TableName;
  visibleColumns: string[];
  setVisibleColumns: Dispatch<SetStateAction<string[]>>;
  columnState: Column<any>[];
  columnHandlers: UseListStateHandlers<Column<any>>;
  resetColumns: () => void;
  columnStyles?: InitialCellStyleProps[];
}
export default function ColumnPicker({
  zIndex,
  table,
  visibleColumns,
  setVisibleColumns,
  columnState,
  columnHandlers,
  resetColumns,
  columnStyles,
}: ColumnPickerProps) {
  const [show, setShow] = useState(false);
  const items = columnState.map((column, index) => (
    <Draggable
      key={column.accessorKey}
      index={index}
      draggableId={column.accessorKey}
    >
      {(provided) => (
        <Box
          mt={3}
          className={classes.checkboxRow}
          ref={provided.innerRef}
          {...provided.draggableProps}
        >
          <Switch
            classNames={{
              label: classes.checkboxLabel,
              labelWrapper: classes.checkboxLabelWrapper,
            }}
            label={column.header}
            key={column.accessorKey}
            value={column.accessorKey}
          />
          <div {...provided.dragHandleProps} className={classes.dragHandle}>
            <IconGripVertical stroke={1.5} />
          </div>
        </Box>
      )}
    </Draggable>
  ));

  return (
    <Popover
      zIndex={zIndex}
      width={300}
      shadow="lg"
      position="bottom"
      withinPortal
      classNames={{ dropdown: classes.popoverDropdown }}
    >
      <Popover.Target>
        <Tooltip zIndex={zIndex} withArrow label="Customize Columns">
          <ActionIcon variant="subtle" color="gray" p={0}>
            <IconColumns />
          </ActionIcon>
        </Tooltip>
      </Popover.Target>
      <Popover.Dropdown p={8}>
        <Button variant="subtle" size="xs" fullWidth onClick={resetColumns}>
          Restore Defaults
        </Button>
        <Button
          variant="subtle"
          size="xs"
          fullWidth
          onClick={() => setShow(true)}
        >
          Customize Column Colors
        </Button>
        <Button.Group>
          <Button
            fullWidth
            disabled={visibleColumns.length === 0}
            onClick={() => setVisibleColumns([])}
          >
            Hide All
          </Button>
          <Button
            fullWidth
            disabled={visibleColumns.length === columnState.length}
            onClick={() =>
              setVisibleColumns(columnState.map((column) => column.accessorKey))
            }
          >
            Show All
          </Button>
        </Button.Group>
        <Divider my="xs" />
        <DragDropContext
          onDragEnd={({ destination, source }) =>
            columnHandlers.reorder({
              from: source.index,
              to: destination?.index || 0,
            })
          }
        >
          <Switch.Group
            value={visibleColumns}
            onChange={(value) => setVisibleColumns(value)}
          >
            <Droppable droppableId="dnd-list" direction="vertical">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {items}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </Switch.Group>
        </DragDropContext>
      </Popover.Dropdown>
      <CustomizeTableModal
        show={show}
        setShow={setShow}
        table={table}
        columnDefs={columnState}
        columnStyles={columnStyles}
      />
    </Popover>
  );
}
