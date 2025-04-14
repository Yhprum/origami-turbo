import { ActionIcon, Button, Input, Modal } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import {
  type Dispatch,
  type SetStateAction,
  useEffect,
  useMemo,
  useState,
} from "react";
import MemoizedRow from "~/components/table/MemoizedRow";
import Table from "~/components/table/Table";
import TableHead from "~/components/table/TableHead";
import Toolbar from "~/components/table/Toolbar";
import { compareOptions } from "~/lib/functions/option";
import useTable from "~/lib/hooks/useTable";
import { TableName } from "~/lib/server/db/enums";
import renderCell from "~/lib/table/renderCell";
import { stringCompare } from "~/lib/table/sorts";
import type { ColumnDef } from "~/lib/table/types";
import { currentInputDate, inputDate } from "~/lib/utils";
import { currency, date, percent } from "~/lib/utils/formatter";
import classes from "./CompareModal.module.css";

interface Props {
  show: boolean;
  setModal: Dispatch<SetStateAction<string>>;
  current: any;
  onSelect: (contractSymbol: string) => void;
  plusMs?: number;
}
export default function CompareModal({
  show,
  setModal,
  current,
  onSelect,
  plusMs = 0,
}: Props) {
  const [options, setOptions] = useState<any[]>([]);
  const [targetDate, setTargetDate] = useState<string>(currentInputDate());

  useEffect(() => {
    if (!show || !current) return;
    headerProps.updateFilter(
      "strike",
      [current.price * 0.5, current.price * 1.5],
      "btwn"
    );

    setTargetDate(inputDate(current.expireDate + plusMs));
    updateOptionsMutation.mutate({
      data: {
        symbol: current,
        target: current.expireDate + plusMs,
      },
    });
  }, [show, current]);

  const updateOptionsMutation = useMutation({
    mutationFn: compareOptions,
    onSuccess: setOptions,
  });

  const columnDefs: ColumnDef<any>[] = useMemo(
    () => [
      { header: "Type", data: "type", sortFn: stringCompare },
      { header: "Strike", data: "strike", format: currency },
      {
        header: "Expiry",
        data: "expireDate",
        format: date,
        filterType: "date",
      },
      { header: "Per Annum", data: "pa", format: percent },
      { header: "Down Protection", data: "downPT", format: percent },
      { header: "PA + PT", data: "paPlusPT", format: percent },
      { header: "IV", data: "iv", format: percent },
      { header: "Interest", data: "openInterest" },
      {
        header: "",
        data: "contractSymbol",
        disableSort: true,
        Cell: ({ value }) => (
          <td>
            <ActionIcon variant="subtle" color="grey">
              <IconPlus onClick={() => onSelect(value)} />
            </ActionIcon>
          </td>
        ),
      },
    ],
    [current]
  );

  const { rows, columns, headerProps, toolbarProps } = useTable(
    TableName.COMPARE_OPTIONS,
    options,
    columnDefs,
    {
      sort: [{ header: "paPlusPT", direction: 1 }],
      filter: [{ header: "openInterest", value: 0, type: "gt" }],
      showFilter: true,
    }
  );

  return (
    <Modal
      title="Compare Similar Options"
      size="xl"
      opened={show}
      onClose={() => setModal("")}
      zIndex={400}
    >
      <Toolbar
        tools={[
          <Input
            key="date"
            size="xs"
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
          />,
          <Button
            key="update"
            size="xs"
            loading={updateOptionsMutation.isPending}
            onClick={() =>
              updateOptionsMutation.mutate({
                data: {
                  symbol: current,
                  target: new Date(targetDate).getTime(),
                },
              })
            }
          >
            Update
          </Button>,
        ]}
        zIndex={450}
        p={0}
        h={30}
        {...toolbarProps}
      />
      <Table inBox={false}>
        <TableHead columns={columns} {...headerProps} />
        <tbody>
          {current ? (
            <tr className={classes.current}>
              {columns.map((column) =>
                column.header ? (
                  renderCell(current, column)
                ) : (
                  <td key={column.accessorKey} />
                )
              )}
            </tr>
          ) : undefined}
          {rows.map((row) => (
            <MemoizedRow key={row.contractSymbol} row={row} columns={columns}>
              {columns.map((column) => renderCell(row, column))}
            </MemoizedRow>
          ))}
        </tbody>
      </Table>
    </Modal>
  );
}
