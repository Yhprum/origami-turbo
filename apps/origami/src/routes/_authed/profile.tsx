import { Divider, ScrollArea, Tabs, Title } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import {
  IconLock,
  IconPlugConnected,
  IconSettings,
  IconTag,
  IconUserCircle,
} from "@tabler/icons-react";
import {
  Outlet,
  createFileRoute,
  useLocation,
  useRouter,
} from "@tanstack/react-router";
import cx from "clsx";
import classes from "./profile/layout.module.css";

export const Route = createFileRoute("/_authed/profile")({
  component: ProfileLayout,
});

const tabTitles = {
  profile: "Edit Profile",
  security: "Security Settings",
  connections: "Connect your Brokerage Accounts",
  tags: "Tags List",
} as const;

function ProfileLayout() {
  const router = useRouter();
  const { pathname } = useLocation();
  const horizontalTabs = useMediaQuery("(max-width: 80em)", false);
  const showLabel = useMediaQuery("(min-width: 35em)", true);
  const iconStyle = { width: "24px", height: "24px" };

  type ProfileRoute = "security" | "connections" | "tags";

  const activeTab = pathname.split("/").pop() as "profile" | ProfileRoute;
  return (
    <Tabs
      classNames={{
        root: cx(classes.root, { [classes.rootHorizontal]: horizontalTabs }),
      }}
      orientation={horizontalTabs ? "horizontal" : "vertical"}
      activateTabWithKeyboard={false}
      value={activeTab}
      radius={0}
      onChange={(value) =>
        router.navigate({
          to:
            value === "profile"
              ? "/profile"
              : `/profile/${value as ProfileRoute}`,
        })
      }
    >
      <Tabs.List>
        <Tabs.Tab
          value="profile"
          leftSection={<IconUserCircle style={iconStyle} />}
        >
          {showLabel && "Profile"}
        </Tabs.Tab>
        <Tabs.Tab value="security" leftSection={<IconLock style={iconStyle} />}>
          {showLabel && "Security"}
        </Tabs.Tab>
        <Tabs.Tab
          disabled
          value="preferences"
          leftSection={<IconSettings style={iconStyle} />}
        >
          {showLabel && "Preferences"}
        </Tabs.Tab>
        <Tabs.Tab
          value="connections"
          leftSection={<IconPlugConnected style={iconStyle} />}
        >
          {showLabel && "Connected Accounts"}
        </Tabs.Tab>
        <Tabs.Tab value="tags" leftSection={<IconTag style={iconStyle} />}>
          {showLabel && "Tags"}
        </Tabs.Tab>
      </Tabs.List>
      <ScrollArea className={classes.panel}>
        <Title p="sm" order={3}>
          {tabTitles[activeTab]}
        </Title>
        <Divider />
        <Outlet />
      </ScrollArea>
    </Tabs>
  );
}
