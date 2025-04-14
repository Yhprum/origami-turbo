import type { CSSProperties } from "react";
import type { Row } from "~/lib/table/types";

export type Styler = ({
  value,
  row,
}: {
  value: any;
  row: Row<any>;
}) => CSSProperties;

export const gainLoss: Styler = ({ value }) =>
  value >= 0
    ? { color: "var(--mantine-color-green-8)", whiteSpace: "nowrap" }
    : { color: "var(--mantine-color-red-8)", whiteSpace: "nowrap" };
