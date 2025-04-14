import { Table as MantineTable, ScrollArea } from "@mantine/core";
import cx from "clsx";
import classes from "./Table.module.css";

interface Props {
  children: any;
  striped?: boolean;
  hover?: boolean;
  inBox?: boolean;
}

export default function Table({
  children,
  striped = true,
  hover = true,
  inBox = true,
}: Props) {
  const table = (
    <MantineTable
      className={cx(classes.table, {
        [classes.striped]: striped,
        [classes.hover]: hover,
      })}
    >
      {children}
    </MantineTable>
  );
  return inBox ? (
    <ScrollArea
      styles={{ scrollbar: { zIndex: 10 } }}
      className={classes.tableBox}
    >
      {table}
    </ScrollArea>
  ) : (
    table
  );
}
