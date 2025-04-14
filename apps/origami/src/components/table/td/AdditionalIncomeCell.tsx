import { CloseButton, Divider, Grid, Popover } from "@mantine/core";
import type { Selectable } from "kysely";
import { type Dispatch, Fragment, type SetStateAction, useState } from "react";
import { deleteIncome } from "~/lib/functions/income";
import type { Income } from "~/lib/server/db/schema";
import { deepCopy } from "~/lib/utils";
import type { MutatorCallback } from "~/lib/utils/dataEditor";
import { currency, date } from "~/lib/utils/formatter";
import classes from "./AdditionalIncomeCell.module.css";

interface Props {
  value: number;
  row: any;
  setData: MutatorCallback<any>;
  isTransaction: boolean;
}

export default function AdditionalIncomeCell({
  value,
  row,
  setData,
  isTransaction,
}: Props) {
  const [load, setLoad] = useState(false);

  function removeIncome(
    id: number,
    row: any,
    setData: Dispatch<SetStateAction<any[]>>
  ) {
    deleteIncome({ data: id }).then(() => {
      setData((data) => {
        const newData = deepCopy(data);
        const holdingIndex = newData.findIndex((item) => item.id === row.id);
        newData[holdingIndex].additionalIncome = newData[
          holdingIndex
        ].additionalIncome.filter((income) => income.id !== id);
        newData[holdingIndex].additionalIncomeTotal = newData[
          holdingIndex
        ].additionalIncome.reduce((sum, cur) => sum + cur.amount, 0);
        return newData;
      });
    });
  }

  if (value <= 0) return <td />;
  return !isTransaction && row.additionalIncome?.length ? (
    load ? (
      <Popover withArrow withinPortal position="right" width={280} shadow="lg">
        <Popover.Target>
          <td className={classes.td}>{currency(value)}</td>
        </Popover.Target>
        <Popover.Dropdown mah="40vh" className={classes.dropdown}>
          Additional Income
          <Divider />
          <Grid fz={12} gutter="xs">
            {row.additionalIncome.map((item: Selectable<Income>) => (
              <Fragment key={item.id}>
                <Grid.Col span={3} ta="center" m="auto">
                  {date(item.date)}
                </Grid.Col>
                <Grid.Col span={3} ta="center" m="auto">
                  {currency(Number(item.amount))}
                </Grid.Col>
                <Grid.Col span={4} ta="left" m="auto">
                  {item.note}
                </Grid.Col>
                <Grid.Col span={2}>
                  <CloseButton
                    title="Delete Income"
                    onClick={() => removeIncome(item.id, row, setData)}
                  />
                </Grid.Col>
              </Fragment>
            ))}
          </Grid>
        </Popover.Dropdown>
      </Popover>
    ) : (
      <td className={classes.td} onMouseOver={() => setLoad(true)}>
        {currency(value)}
      </td>
    )
  ) : (
    <td />
  );
}
