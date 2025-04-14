import { Box } from "@mantine/core";
import { currency, percent } from "~/lib/utils/formatter";

interface Props {
  value: number;
  format?: "currency" | "percent";
  variant?: "text" | "background";
}

function GainLoss({ value, format, variant }: Props) {
  const text = format === "percent" ? percent(value) : currency(value);

  return (
    <Box
      component="td"
      c={
        variant !== "background"
          ? value >= 0
            ? "green.8"
            : "red.8"
          : undefined
      }
      bg={
        variant === "background"
          ? value >= 0
            ? "green.8"
            : "red.8"
          : undefined
      }
    >
      {text}
    </Box>
  );
}

export default GainLoss;
