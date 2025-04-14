import { Sparkline } from "@mantine/charts";
import { Box, Group, Paper, Stack } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import { getIndices } from "~/lib/functions/symbol";
import { currency } from "~/lib/utils/formatter";

export const Route = createFileRoute("/_authed/")({
  loader: async () => {
    return await getIndices();
  },
  component: Home,
});

function Home() {
  const indices = Route.useLoaderData();
  return (
    <Box p={16}>
      <Group fz="sm" mb={16}>
        {indices.map((index) => (
          <Paper
            withBorder
            shadow="sm"
            component={Group}
            px={8}
            py={4}
            w={290}
            h={80}
            gap={0}
            wrap="nowrap"
            justify="space-between"
            key={index.symbol}
          >
            <Stack gap={4}>
              <Box fw="bold">{index.symbol}</Box>
              <div>{currency(index.prices[index.prices.length - 1])}</div>
              <Box
                c={index.gain >= 0 ? "green.8" : "red.8"}
                style={{ whiteSpace: "nowrap" }}
              >
                {(index.gain > 0 ? "+" : "") + currency(index.gain)}
              </Box>
            </Stack>
            <Sparkline
              w={290}
              h={75}
              data={index.prices.map((price) => price - index.previousClose)}
              trendColors={{
                positive: "green.9",
                negative: "red.9",
                neutral: "gray.5",
              }}
              fillOpacity={0.2}
            />
          </Paper>
        ))}
      </Group>
    </Box>
  );
}
