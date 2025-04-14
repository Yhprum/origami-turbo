import {
  ActionIcon,
  Group,
  Input,
  TextInput,
  Tooltip,
  Transition,
} from "@mantine/core";
import { useToggle } from "@mantine/hooks";
import { IconSearch, IconSearchOff } from "@tabler/icons-react";
import type { Dispatch, SetStateAction } from "react";

interface ToolbarProps {
  zIndex?: number;
  value: string;
  setValue: Dispatch<SetStateAction<string>>;
}

const scaleXReverse = {
  in: { opacity: 1, transform: "scaleX(1)" },
  out: { opacity: 0, transform: "scaleX(0)" },
  common: { transformOrigin: "right" },
  transitionProperty: "transform, opacity",
};
export default function SearchTool({ zIndex, value, setValue }: ToolbarProps) {
  const [show, toggle] = useToggle([false, true]);

  return (
    <Group gap={2}>
      <Transition duration={200} mounted={show} transition={scaleXReverse}>
        {(styles) => (
          <div style={styles}>
            <TextInput
              autoFocus
              value={value}
              onChange={(e) => setValue(e.currentTarget.value)}
              placeholder="Search"
              size="xs"
              leftSection={<IconSearch size={18} />}
              leftSectionPointerEvents="none"
              rightSection={
                value !== "" ? (
                  <Input.ClearButton onClick={() => setValue("")} />
                ) : undefined
              }
            />
          </div>
        )}
      </Transition>
      <Tooltip zIndex={zIndex} withArrow label="Show/Hide Search">
        <ActionIcon
          variant="subtle"
          color="gray"
          p={0}
          disabled={show && value !== ""}
          onClick={() => toggle()}
        >
          {show ? <IconSearchOff /> : <IconSearch />}
        </ActionIcon>
      </Tooltip>
    </Group>
  );
}
