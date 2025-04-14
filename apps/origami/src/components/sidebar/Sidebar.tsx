import {
  ActionIcon,
  Anchor,
  Button,
  Collapse,
  Divider,
  Menu,
  NavLink,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import { useDisclosure, useLocalStorage, useMediaQuery } from "@mantine/hooks";
// import { setUser } from "@sentry/nextjs";
import {
  IconBulb,
  IconChartBar,
  IconChevronDown,
  IconHelp,
  IconLogout,
  IconPackage,
  IconSelector,
  IconShoppingCart,
  IconTable,
  IconUserCircle,
} from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useLocation, useRouter } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { authClient } from "~/lib/authClient";
// @ts-expect-error: svg import
import logo from "~/lib/images/origami.svg";
import ExpandButton from "./ExpandButton";
import MobileExpandButton from "./MobileExpandButton";
import classes from "./Sidebar.module.css";

const sections = [
  {
    label: "Holdings",
    icon: <IconTable size={20} stroke={1.5} />,
    links: [
      { label: "Stocks & Bonds", href: "/holdings/stocks" },
      { label: "Covered Calls", href: "/holdings/options" },
    ],
  },
  {
    label: "Closed Positions",
    icon: <IconPackage size={20} stroke={1.5} />,
    links: [
      { label: "Stocks & Bonds", href: "/holdings/closed" },
      { label: "Options", href: "/holdings/options/closed" },
    ],
  },
  {
    label: "Ideas",
    icon: <IconBulb size={20} stroke={1.5} />,
    links: [
      { label: "Stocks", href: "/ideas/stocks" },
      { label: "Bonds", href: "/ideas/bonds" },
      { label: "Options", href: "/ideas/options" },
      { label: "Preferred Stocks", href: "/ideas/preferred-stocks" },
    ],
  },
  {
    label: "Orders",
    icon: <IconShoppingCart size={20} stroke={1.5} />,
    links: [{ label: "Open Orders", href: "/orders" }],
  },
  {
    label: "Data",
    icon: <IconChartBar size={20} stroke={1.5} />,
    links: [
      { label: "Charts", href: "/charts" },
      { label: "Labels & Tags", href: "/holdings/label" },
    ],
  },
] as const;

export default function Sidebar({
  user,
}: {
  user: { name: string; email: string };
}) {
  const [expanded, { toggle }] = useDisclosure(true);
  const [mobileExpanded, { toggle: toggleMobile, close: closeMobile }] =
    useDisclosure(false);
  const [groupClosed, setGroupClosed] = useLocalStorage<
    Record<string, boolean>
  >({
    key: "origami.sidebar-groups-collapsed",
    defaultValue: {},
  });
  const router = useRouter();
  const { pathname } = useLocation();
  const queryClient = useQueryClient();
  const mobile = useMediaQuery("(max-width: 48em)");
  const full = mobile || expanded;

  async function logoutUser() {
    // clear query cache
    queryClient.clear();
    // logout and clear sentry user
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.navigate({ to: "/login" });
          // setUser(null);
        },
      },
    });
  }

  const SectionMenu = ({
    label,
    icon,
    items,
  }: {
    label: string;
    icon: ReactNode;
    items: (typeof sections)[number]["links"];
  }) =>
    full ? (
      <NavLink
        p={5}
        label={label}
        leftSection={icon}
        rightSection={
          <IconChevronDown
            size={18}
            stroke={1.5}
            style={{
              transform: groupClosed[label] ? "rotate(-90deg)" : "none",
            }}
          />
        }
        className={classes.navLink}
        onClick={() =>
          setGroupClosed((current) => ({
            ...current,
            [label]: !groupClosed[label],
          }))
        }
      />
    ) : (
      <Menu position="right-start" width={200} offset={8}>
        <Menu.Target>
          <Tooltip
            label={label}
            position="right"
            transitionProps={{ duration: 0.1 }}
            offset={8}
          >
            <NavLink
              p={5}
              label={label}
              leftSection={icon}
              rightSection={
                <IconChevronDown
                  size={18}
                  stroke={1.5}
                  style={{
                    transform: groupClosed[label] ? "rotate(-90deg)" : "none",
                  }}
                />
              }
              active={items.some((item) => item.href === pathname)}
              className={classes.navLink}
            />
          </Tooltip>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Label>{label}</Menu.Label>
          {items.map((item) => (
            <Menu.Item key={item.href} component={Link} to={item.href}>
              {item.label}
            </Menu.Item>
          ))}
        </Menu.Dropdown>
      </Menu>
    );

  return (
    <>
      {mobile && <MobileExpandButton toggle={toggleMobile} />}
      <nav>
        <div
          className={classes.sidebar}
          data-state={
            (mobile && mobileExpanded) || (!mobile && expanded)
              ? "expanded"
              : "collapsed"
          }
        >
          <Anchor
            component={Link}
            mx="auto"
            py={8}
            underline="never"
            to="/"
            className={classes.link}
          >
            <img
              src={logo}
              alt="Origami"
              height={32}
              width={32}
              className={classes.logo}
            />
            <Text ff="serif" fz={28} ml="xs">
              Origami
            </Text>
          </Anchor>
          <Divider pb={10} />
          <div className={classes.pageLinkContainer}>
            {sections.map((section) => (
              <div key={section.label}>
                <SectionMenu
                  label={section.label}
                  icon={section.icon}
                  items={section.links}
                />
                <Collapse in={full && !groupClosed[section.label]}>
                  <Stack
                    align="center"
                    gap={4}
                    py={4}
                    pl={15}
                    ml={15}
                    className={classes.nestedLinkContainer}
                  >
                    {section.links.map(({ label, href }) => (
                      <NavLink
                        component={Link}
                        key={href}
                        py={5}
                        className={classes.pageLink}
                        to={href}
                        onClick={() => mobile && closeMobile()}
                        label={label}
                        active={href === pathname}
                      />
                    ))}
                  </Stack>
                </Collapse>
              </div>
            ))}
          </div>
          <div>
            <Divider />
            <Stack align={full ? "end" : "center"} gap={4} py={8}>
              <ExpandButton
                expanded={mobile ? mobileExpanded : expanded}
                toggle={mobile ? toggleMobile : toggle}
              />
              <Menu
                transitionProps={{ transition: "pop" }}
                width={full ? "target" : 213}
              >
                <Menu.Target>
                  {full ? (
                    <Button
                      variant="default"
                      className={classes.pageLink}
                      data-active={pathname.startsWith("/profile")}
                      leftSection={<IconUserCircle size={20} stroke={1.5} />}
                      rightSection={<IconSelector size={20} stroke={1.5} />}
                      fw="normal"
                      justify="space-between"
                      fullWidth
                    >
                      {user.name}
                    </Button>
                  ) : (
                    <ActionIcon
                      variant="default"
                      className={classes.pageLink}
                      data-active={pathname.startsWith("/profile")}
                    >
                      <IconUserCircle size={20} stroke={1.5} />
                    </ActionIcon>
                  )}
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Label>{user.email}</Menu.Label>
                  <Menu.Item
                    component={Link}
                    to="/profile"
                    leftSection={<IconUserCircle size={18} />}
                  >
                    Profile
                  </Menu.Item>
                  <Menu.Item
                    component={Link}
                    to="/support"
                    leftSection={<IconHelp size={18} />}
                  >
                    Support
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item
                    color="red"
                    onClick={logoutUser}
                    leftSection={<IconLogout size={18} />}
                  >
                    Log Out
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Stack>
          </div>
        </div>
      </nav>
    </>
  );
}
