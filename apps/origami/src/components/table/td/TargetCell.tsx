import {
  Box,
  type DefaultMantineColor,
  Input,
  type StyleProp,
} from "@mantine/core";
import { useInputState } from "@mantine/hooks";
import { IconEdit } from "@tabler/icons-react";
import { useState } from "react";
import classes from "./TargetCell.module.css";

interface Props {
  defaultValue: number | null;
  updateValue: (newValue: number | null) => void;
  isTransaction: boolean;
  bg?: StyleProp<DefaultMantineColor>;
}

export default function TargetCell({
  defaultValue,
  updateValue,
  isTransaction,
  bg,
}: Props) {
  const [editMode, setEditMode] = useState(false);
  const [value, setValue] = useInputState(String(defaultValue ?? ""));

  const onBlur = () => {
    setEditMode(false);
    const newValue =
      value.trim() && !Number.isNaN(Number.parseFloat(value))
        ? Number.parseFloat(value)
        : null;
    if (newValue !== defaultValue) {
      defaultValue = newValue;
      updateValue(newValue);
    }
  };

  return !isTransaction ? (
    <Box
      component="td"
      bg={bg}
      className={classes.cell}
      onClick={() => setEditMode(true)}
    >
      {editMode ? (
        <Input
          autoFocus
          type="number"
          value={value ?? ""}
          onChange={setValue}
          onFocus={(e) => e.target.select()}
          onBlur={onBlur}
          onKeyDown={(e) => e.key === "Enter" && onBlur()}
        />
      ) : value ? (
        value
      ) : (
        <Box c="gray" onClick={() => setEditMode(true)}>
          <IconEdit size={18} className={classes.icon} />
        </Box>
      )}
    </Box>
  ) : (
    <td />
  );
}
