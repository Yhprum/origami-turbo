import { ActionIcon } from "@mantine/core";
import {
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
} from "@tabler/icons-react";

export default function ExpandButton({
  expanded,
  toggle,
}: { expanded: boolean; toggle: () => void }) {
  return (
    <ActionIcon
      variant="subtle"
      onClick={toggle}
      aria-label={expanded ? "expand" : "collapse"}
    >
      {expanded ? (
        <IconLayoutSidebarLeftCollapse size={20} stroke={1.5} />
      ) : (
        <IconLayoutSidebarLeftExpand size={20} stroke={1.5} />
      )}
    </ActionIcon>
  );
}
