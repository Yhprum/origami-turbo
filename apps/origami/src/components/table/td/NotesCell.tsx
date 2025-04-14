import { Popover, Textarea } from "@mantine/core";
import { IconNote } from "@tabler/icons-react";
import { useState } from "react";
import { updateHolding } from "~/lib/functions/holding";
import { updateIdea } from "~/lib/functions/idea";
import { type MutatorCallback, setModifiedField } from "~/lib/utils/dataEditor";
import classes from "./NotesCell.module.css";

interface Props {
  value: string;
  row: any;
  setData: MutatorCallback<any>;
  isTransaction: boolean;
  isIdea?: boolean;
}

export default function NotesCell({
  value,
  row,
  setData,
  isTransaction,
  isIdea = false,
}: Props) {
  const [load, setLoad] = useState(false);

  function editNotes<T extends { id: number; notes: string }>(
    row: T,
    value: string,
    setData: MutatorCallback<T>,
    isIdea = false
  ) {
    const update = isIdea ? updateIdea : updateHolding;
    update({ data: { id: row.id, field: "notes", value } }).then(() =>
      setModifiedField("notes", value.trim(), row.id, setData)
    );
  }

  return !isTransaction ? (
    load ? (
      <td className={classes.cell}>
        <Popover width={300} position="left-start" withArrow shadow="md">
          <Popover.Target>
            <div className={classes.cell}>
              {value?.trim() ? (
                value
              ) : (
                <IconNote size={18} className={classes.icon} />
              )}
            </div>
          </Popover.Target>
          <Popover.Dropdown mah="40vh" px={4} py={0}>
            <Textarea
              placeholder="Add new note..."
              defaultValue={value}
              onBlur={(e) =>
                value !== e.target.value &&
                editNotes(row, e.target.value, setData, isIdea)
              }
              autosize
              autoFocus
              variant="unstyled"
            />
          </Popover.Dropdown>
        </Popover>
      </td>
    ) : (
      <td className={classes.cell} onMouseOver={() => setLoad(true)}>
        {value?.trim() ? (
          value
        ) : (
          <IconNote size={18} className={classes.icon} />
        )}
      </td>
    )
  ) : (
    <td />
  );
}
