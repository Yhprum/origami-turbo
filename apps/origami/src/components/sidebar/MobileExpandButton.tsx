import { ActionIcon } from "@mantine/core";
import { IconMenu2 } from "@tabler/icons-react";
import classes from "./MobileExpandButton.module.css";

export default function MobileExpandButton({ toggle }: { toggle: () => void }) {
  return (
    <ActionIcon
      variant="filled"
      size="xl"
      radius="xl"
      aria-label="Open Menu"
      className={classes.button}
      onClick={toggle}
    >
      <IconMenu2 />
    </ActionIcon>
  );
}
