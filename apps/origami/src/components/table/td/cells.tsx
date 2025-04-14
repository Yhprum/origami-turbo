import { Badge, Box, Group, Tooltip } from "@mantine/core";
import {
  IconCalendarOff,
  IconChevronRight,
  IconChevronsDown,
  IconChevronsUp,
  IconCoin,
  IconFileDollar,
} from "@tabler/icons-react";
import cx from "clsx";
import type { Dispatch, SetStateAction } from "react";
import { date } from "~/lib/utils/formatter";
import classes from "./Cells.module.css";

export const symbolCell = (
  expanded: boolean,
  setExpanded: Dispatch<SetStateAction<number | undefined>>,
  row: any,
  isTransaction: boolean,
  closed?: boolean
) => {
  return !isTransaction ? (
    <Box
      component="td"
      className={classes.symbol}
      bg={
        row.openOrderType
          ? row.openOrderType === "buy"
            ? "green.2"
            : "red.2"
          : undefined
      }
      onClick={() => setExpanded((id) => (id === row.id ? undefined : row.id))}
    >
      <Group wrap="nowrap">
        <IconChevronRight
          className={cx(classes.chevron, { [classes.rotated]: expanded })}
        />
        {row.symbol}
        {row.exDividendDate &&
          row.exDividendDate > Date.now() &&
          row.exDividendDate < Date.now() + 1000 * 60 * 60 * 24 * 7 * 3 && (
            <Tooltip
              label={`Upcoming Ex Dividend Date: ${date(row.exDividendDate)}`}
              position="right"
              withArrow
            >
              <Box ml="auto" my="auto" c="green">
                <IconCoin size={20} className={classes.symbolIcon} />
              </Box>
            </Tooltip>
          )}
        {row.earningsDate &&
          row.earningsDate < Date.now() + 1000 * 60 * 60 * 24 * 7 * 3 && (
            <Tooltip
              label={`Upcoming Earnings Report: ${date(row.earningsDate)}`}
              position="right"
              withArrow
            >
              <Box ml="auto" my="auto" c="blue">
                <IconFileDollar size={20} className={classes.symbolIcon} />
              </Box>
            </Tooltip>
          )}
        {!closed && row.maturityDate && row.maturityDate < Date.now() && (
          <Tooltip
            label="Bond Maturity Date Reached"
            position="right"
            withArrow
          >
            <Box ml="auto" my="auto" c="red">
              <IconCalendarOff size={20} className={classes.symbolIcon} />
            </Box>
          </Tooltip>
        )}
      </Group>
    </Box>
  ) : (
    <td className={classes.symbolTransaction} />
  );
};

export const IdeaSymbolCell = ({ value, row }) => (
  <td className={classes.symbol}>
    <Group wrap="nowrap">
      {value}
      {row.exDividendDate &&
        new Date(row.exDividendDate).getTime() > Date.now() &&
        new Date(row.exDividendDate).getTime() <
          Date.now() + 1000 * 60 * 60 * 24 * 7 * 3 && (
          <Tooltip
            label={`Upcoming Ex Dividend Date: ${date(row.exDividendDate)}`}
            position="right"
            withArrow
          >
            <Box ml="auto" my="auto" c="green">
              <IconCoin size={20} className={classes.symbolIcon} />
            </Box>
          </Tooltip>
        )}
      {row.earningsDate &&
        row.earningsDate < Date.now() + 1000 * 60 * 60 * 24 * 7 * 3 && (
          <Tooltip
            label={`Upcoming Earnings Report: ${date(row.earningsDate)}`}
            position="right"
            withArrow
          >
            <Box ml="auto" my="auto" c="blue">
              <IconFileDollar size={20} className={classes.symbolIcon} />
            </Box>
          </Tooltip>
        )}
    </Group>
  </td>
);

export const StickyCell = ({ children }) => (
  <td className={classes.sticky}>{children}</td>
);
export const StickyTh = ({ children }) => (
  <th className={classes.sticky}>{children}</th>
);

export const tagCell = (
  tags: { id: number; name: string; color: string }[],
  isTransaction: boolean
) =>
  !isTransaction ? (
    <td>
      {(tags ?? []).map((tag) => (
        <Badge
          key={tag.id}
          size="xs"
          variant="filled"
          color={tag.color}
          styles={{ label: { overflow: "unset" } }}
        >
          {tag.name}
        </Badge>
      ))}
    </td>
  ) : (
    <td />
  );

export const bondRatingCell = (rating: string, change: number) =>
  change !== undefined ? (
    <Box
      component="td"
      c={change !== 0 ? (change > 0 ? "green" : "red") : undefined}
      className={classes.bondRating}
    >
      {rating}
      {change !== 0 ? (
        <span>
          {" "}
          ({change}
          {change > 0 ? (
            <IconChevronsUp
              size={16}
              stroke={2.5}
              className={classes.bondRatingIcon}
            />
          ) : (
            <IconChevronsDown
              size={16}
              stroke={2.5}
              className={classes.bondRatingIcon}
            />
          )}
          )
        </span>
      ) : undefined}
    </Box>
  ) : (
    <td />
  );

export const exDividendDateCell = (value: string | number | Date, row: any) => (
  <td>
    {date(value)}
    {row.exDivIsEst && "*"}
  </td>
);
