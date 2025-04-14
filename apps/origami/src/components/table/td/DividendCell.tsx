import { Divider, Popover, SimpleGrid } from "@mantine/core";
import { Fragment, useState } from "react";
import { currency, date } from "~/lib/utils/formatter";
import classes from "./DividendCell.module.css";

interface Props {
  value: any;
  row: any;
  isTransaction: boolean;
}

export default function DividendCell({ value, row, isTransaction }: Props) {
  const [load, setLoad] = useState(false);

  if (value <= 0) return <td />;
  return !isTransaction && row.dividendsEarned ? (
    load ? (
      <Popover withArrow position="right" width={280} shadow="lg">
        <Popover.Target>
          <td className={classes.cell}>{currency(value)}</td>
        </Popover.Target>
        <Popover.Dropdown mah="40vh" className={classes.dropdown}>
          Dividends Received
          <Divider mb="xs" />
          <SimpleGrid fz={14} cols={2} spacing="xs" verticalSpacing="xs">
            {row.dividendsEarned.map((div) => (
              <Fragment key={div.date}>
                <div>{date(div.date)}</div>
                <div>{currency(div.amount)}</div>
              </Fragment>
            ))}
          </SimpleGrid>
        </Popover.Dropdown>
      </Popover>
    ) : (
      <td className={classes.cell} onMouseOver={() => setLoad(true)}>
        {currency(value)}
      </td>
    )
  ) : (
    <td>{currency(value)}</td>
  );
}
