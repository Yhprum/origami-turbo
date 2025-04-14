import {
  ActionIcon,
  Box,
  Menu,
  Title,
  useMantineColorScheme,
} from "@mantine/core";
import { IconMoon, IconSun, IconSunMoon } from "@tabler/icons-react";
import cx from "clsx";
import classes from "./ThemeChanger.module.css";

export default function ThemeChanger() {
  const { setColorScheme } = useMantineColorScheme();

  return (
    <Box maw={500} px="lg">
      <Title order={4}>Change Theme</Title>
      <Menu transitionProps={{ transition: "scale-y" }} position="bottom-start">
        <Menu.Target>
          <ActionIcon variant="default" aria-label="Toggle color scheme">
            <IconSun className={cx(classes.icon, classes.light)} stroke={1.5} />
            <IconMoon className={cx(classes.icon, classes.dark)} stroke={1.5} />
          </ActionIcon>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item
            leftSection={<IconSun size={18} />}
            onClick={() => setColorScheme("light")}
          >
            Light
          </Menu.Item>
          <Menu.Item
            leftSection={<IconMoon size={18} />}
            onClick={() => setColorScheme("dark")}
          >
            Dark
          </Menu.Item>
          <Menu.Item
            leftSection={<IconSunMoon size={18} />}
            onClick={() => setColorScheme("auto")}
          >
            System
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Box>
  );
}
