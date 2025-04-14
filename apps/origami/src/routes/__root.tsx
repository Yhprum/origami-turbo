import {
  ColorSchemeScript,
  MantineProvider,
  createTheme,
  mantineHtmlProps,
} from "@mantine/core";
// @ts-expect-error: import css url
import mantineCssUrl from "@mantine/core/styles.css?url";
// @ts-expect-error: import css url
import mantineDropzoneCssUrl from "@mantine/dropzone/styles.css?url";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
// @ts-expect-error: import css url
import mantineNotificationsCssUrl from "@mantine/notifications/styles.css?url";
import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import type { ReactNode } from "react";
import { DefaultCatchBoundary } from "~/components/DefaultCatchBoundary.js";
import { NotFound } from "~/components/NotFound.js";
// @ts-expect-error: import css url
import proximaNova from "~/lib/css/ProximaNova.css?url";
import { fetchUser } from "~/lib/functions/session";
import { seo } from "~/utils/seo.js";

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  beforeLoad: async () => {
    return { user: await fetchUser() };
  },
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      ...seo({
        title: "Origami",
        description: "A tading portfolio tracker",
      }),
    ],
    links: [
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/apple-touch-icon.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        href: "/favicon-32x32.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        href: "/favicon-16x16.png",
      },
      { rel: "manifest", href: "/site.webmanifest", color: "#fffff" },
      { rel: "icon", href: "/favicon.ico" },
      { rel: "stylesheet", href: mantineCssUrl },
      { rel: "stylesheet", href: mantineDropzoneCssUrl },
      { rel: "stylesheet", href: mantineNotificationsCssUrl },
      { rel: "stylesheet", href: proximaNova },
    ],
  }),
  errorComponent: (props) => {
    return (
      <RootDocument>
        <DefaultCatchBoundary {...props} />
      </RootDocument>
    );
  },
  notFoundComponent: () => <NotFound />,
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: { children: ReactNode }) {
  const theme = createTheme({
    fontFamily:
      "ProximaNova, -apple-system, system-ui, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif",
  });
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <HeadContent />
        <ColorSchemeScript defaultColorScheme="auto" />
      </head>
      <body>
        <MantineProvider theme={theme} defaultColorScheme="auto">
          <ModalsProvider>{children}</ModalsProvider>
          <Notifications />
        </MantineProvider>
        {/* <TanStackRouterDevtools position="top-right" /> */}
        <ReactQueryDevtools buttonPosition="bottom-right" />
        <Scripts />
      </body>
    </html>
  );
}
