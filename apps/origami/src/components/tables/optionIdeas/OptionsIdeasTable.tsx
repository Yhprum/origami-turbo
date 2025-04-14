import {
  ActionIcon,
  Button,
  NumberInput,
  Popover,
  Tooltip,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCalendarCog } from "@tabler/icons-react";
import { queryOptions, useMutation } from "@tanstack/react-query";
import { Fragment, useMemo, useState } from "react";
import ExportButton from "~/components/ExportButton";
import SymbolSelect from "~/components/SymbolSelect";
import CompareModal from "~/components/modals/CompareModal";
import MemoizedRow from "~/components/table/MemoizedRow";
import Table from "~/components/table/Table";
import TableHead from "~/components/table/TableHead";
import Toolbar from "~/components/table/Toolbar";
import NotesCell from "~/components/table/td/NotesCell";
import {
  IdeaSymbolCell,
  exDividendDateCell,
} from "~/components/table/td/cells";
import {
  createOptionIdea,
  getOptionIdeas,
  updateAllOptionIdeas,
  updateOptionIdea,
} from "~/lib/functions/optionIdea";
import { useQuery } from "~/lib/hooks/useQuery";
import useTable from "~/lib/hooks/useTable";
import { TableName } from "~/lib/server/db/enums";
import type { FormattedOptionIdea } from "~/lib/server/formatters/types";
import renderCell from "~/lib/table/renderCell";
import { stringCompare } from "~/lib/table/sorts";
import type { ColumnDef, InitialCellStyleProps } from "~/lib/table/types";
import { setModifiedResponse } from "~/lib/utils/dataEditor";
import { currency, date, percent, twoDecimals } from "~/lib/utils/formatter";
import OptionIdeasActions from "./OptionIdeasActions";

export const optionIdeasQueryOptions = queryOptions({
  queryKey: ["ideas", "options"] as ReadonlyArray<unknown>,
  queryFn: getOptionIdeas,
  initialData: [],
});

export default function OptionIdeasTable({
  styles,
}: {
  styles?: InitialCellStyleProps[];
}) {
  const [preferencesOpened, setPreferencesOpened] = useState(false);
  const [preferences, setPreferences] = useState({
    plusMonths: 3,
    strikeRound: 0.8,
  });
  const [modal, setModal] = useState("");
  const [row, setRow] = useState<any>();

  const { data, isPending, isFetching, setData } = useQuery(
    optionIdeasQueryOptions
  );

  const addIdeaMutation = useMutation({
    mutationFn: createOptionIdea,
    onSuccess: (response) => setData((oldData) => [...oldData, response]),
  });

  const updateAllMutation = useMutation({
    mutationFn: updateAllOptionIdeas,
    onSuccess: (response) => {
      setPreferencesOpened(false);
      setData(response);
      notifications.show({
        title: "Update complete",
        message: "All rows have been updated to the new preferences",
      });
    },
  });

  async function updateContract(contractSymbol) {
    if (!row) return;
    const response = await updateOptionIdea({
      data: { id: row.id, contractSymbol },
    });
    if (!response) return;
    setModifiedResponse(response, row.id, setData);
    setModal("");
  }

  const columnDefs: ColumnDef<FormattedOptionIdea>[] = useMemo(
    () => [
      {
        header: "Symbol",
        data: "symbol",
        sticky: true,
        Cell: ({ value, row }) => <IdeaSymbolCell value={value} row={row} />,
        sortFn: stringCompare,
      },
      {
        header: "Actions",
        id: "actions",
        disableSort: true,
        Cell: ({ row }) => (
          <OptionIdeasActions
            row={row}
            setData={setData}
            setModal={setModal}
            setRow={setRow}
          />
        ),
      },
      {
        group: "Option Data",
        header: "Contract Symbol",
        data: "contractSymbol",
        sortFn: stringCompare,
      },
      {
        group: "Option Data",
        header: "Stock Price",
        data: "price",
        format: currency,
      },
      {
        group: "Covered Call",
        header: "Current Call Mark",
        data: "callMark",
        format: currency,
      },
      {
        group: "Covered Call",
        header: "Bid - Ask",
        data: "bidAskCall",
        disableSort: true,
        style: { whiteSpace: "nowrap" },
      },
      {
        group: "Covered Call",
        header: "Div Payments To Expiry",
        data: "divPaymentsToExpiry",
        format: currency,
      },
      {
        group: "Covered Call",
        header: "Eff Div pa",
        data: "effDivPA",
        format: percent,
      },
      {
        group: "Covered Call",
        header: "Expire Date",
        data: "expireDate",
        format: date,
        filterType: "date",
      },
      {
        group: "Covered Call",
        header: "Strike",
        data: "strike",
        format: currency,
      },
      { group: "Covered Call", header: "Days To Expiry", data: "daysToExpiry" },
      {
        group: "Covered Call",
        header: "Open Date",
        data: "openDate",
        format: date,
        filterType: "date",
      },
      {
        group: "Covered Call",
        header: "CC Basis",
        data: "ccBasis",
        format: currency,
      },
      {
        group: "Covered Call",
        header: "MX Gain",
        data: "mxGain",
        format: currency,
        style: { whiteSpace: "nowrap" },
      },
      { group: "Covered Call", header: "MX", data: "mx", format: percent },
      { group: "Covered Call", header: "MX PA", data: "mxPA", format: percent },
      {
        group: "Covered Call",
        header: "Profit No Change",
        data: "pftNoChg",
        format: percent,
      },
      { group: "Covered Call", header: "PA", data: "pa", format: percent },
      {
        group: "Covered Call",
        header: "Down PT",
        data: "downPT",
        format: percent,
      },
      { group: "Covered Call", header: "ITM", data: "itm", format: percent },
      {
        group: "Covered Call",
        header: "PA + PT",
        data: "paPlusPT",
        format: percent,
      },
      {
        group: "Covered Call",
        header: "B/E Low",
        data: "beLow",
        format: currency,
      },
      {
        group: "Covered Call",
        header: "B/E High",
        data: "beHigh",
        format: currency,
      },
      {
        group: "Covered Call",
        header: "PA at ex-div",
        data: "paAtExDiv",
        format: percent,
      },
      // { group: "Option Data", header: "RSI", data: "rsi" },
      {
        group: "Option Data",
        header: "Est. Ex-Div Date",
        data: "exDividendDate",
        Cell: ({ value, row }) => exDividendDateCell(value, row),
        filterType: "date",
      },
      {
        group: "Put Write",
        header: "PW Basis",
        data: "pwBasis",
        format: currency,
      },
      {
        group: "Put Write",
        header: "MX Gain",
        data: "mxGainPut",
        format: currency,
      },
      { group: "Put Write", header: "MX", data: "mxPut", format: percent },
      { group: "Put Write", header: "MX PA", data: "mxPAPut", format: percent },
      {
        group: "Put Write",
        header: "Profit No Change",
        data: "pftNoChgPut",
        format: percent,
      },
      { group: "Put Write", header: "PA", data: "paPut", format: percent },
      {
        group: "Put Write",
        header: "Down PT",
        data: "downPTPut",
        format: percent,
      },
      {
        group: "Put Write",
        header: "Skew Mkr",
        data: "skewMkr",
        format: percent,
      },
      {
        group: "Protective Put",
        header: "Strike",
        data: "ppStrike",
        format: currency,
      },
      {
        group: "Protective Put",
        header: "Symbol",
        data: "ppContractSymbol",
        sortFn: stringCompare,
      },
      {
        group: "Protective Put",
        header: "Bid",
        data: "ppBid",
        format: currency,
      },
      {
        group: "Protective Put",
        header: "Ask",
        data: "ppAsk",
        format: currency,
      },
      {
        group: "Protective Put",
        header: "Mark",
        data: "ppMark",
        format: currency,
      },
      {
        group: "Protective Put",
        header: "CC w/Prot Basis",
        data: "ppBasis",
        format: currency,
      },
      {
        group: "Protective Put",
        header: "Max Gain",
        data: "ppMaxGain",
        format: currency,
        style: { whiteSpace: "nowrap" },
      },
      { group: "Protective Put", header: "MX", data: "ppMX", format: percent },
      {
        group: "Protective Put",
        header: "MX PA",
        data: "ppMxPa",
        format: percent,
      },
      {
        group: "Protective Put",
        header: "Profit No Change",
        data: "ppPftNoChg",
        format: percent,
      },
      { group: "Protective Put", header: "PA", data: "ppPA", format: percent },
      {
        group: "Protective Put",
        header: "Max Loss",
        data: "ppMaxLoss",
        format: currency,
      },
      {
        group: "Protective Put",
        header: "Max Loss Percent",
        data: "ppMaxLossPercent",
        format: percent,
      },
      {
        group: "Protective Put",
        header: "PA at ex-div",
        data: "ppPaAtExDiv",
        format: percent,
      },
      {
        group: "Protective Put",
        header: "PA minus PA at ex-div",
        data: "ppPaDiff",
        format: percent,
      },
      {
        group: "Bull Put Spread",
        header: "Net Mark",
        data: "bpsMark",
        format: twoDecimals,
      },
      {
        group: "Bull Put Spread",
        header: "MX",
        data: "bpsMX",
        format: percent,
      },
      {
        group: "Bull Put Spread",
        header: "MX PA",
        data: "bpsMxPa",
        format: percent,
      },
      {
        group: "Bull Put Spread",
        header: "Max Loss",
        data: "bpsMaxLoss",
        format: currency,
      },
      {
        group: "Bull Put Spread",
        header: "CC w/Bull Put Spread",
        data: "bpsCC",
        format: currency,
      },
      {
        group: "Bull Put Spread",
        header: "PA > strike",
        data: "bpsPaStrike",
        format: percent,
      },
      {
        group: "Bull Put Spread",
        header: "Gain %",
        data: "bpsGainPercent",
        format: percent,
      },
      {
        group: "Bull Put Spread",
        header: "Downside to PW Strike",
        data: "bpsDownside",
        format: percent,
      },
      {
        group: "Bull Put Spread",
        header: "Protection (assigned)",
        data: "bpsProtection",
        format: percent,
      },
      {
        group: "Bull Put Spread",
        header: "Initial Invest (100 shares)",
        data: "bpsInvest",
        format: currency,
      },
      {
        group: "Bull Put Spread",
        header: "Max Gain",
        data: "bpsMaxGain",
        format: currency,
        style: { whiteSpace: "nowrap" },
      },
      {
        group: "Bull Put Spread",
        header: "PW Stock Basis",
        data: "bpsBasis",
        format: currency,
      },
      {
        group: "Bull Put Spread",
        header: "Max Loss (assigned)",
        data: "bpsMaxLossAssigned",
        format: currency,
      },
      {
        group: "Bull Put Spread",
        header: "Max Invest Exposure",
        data: "bpsExposure",
        format: currency,
      },
      {
        header: "Notes",
        data: "notes",
        Cell: ({ value, row, isTransaction }) => (
          <NotesCell
            value={value}
            row={row}
            setData={setData}
            isTransaction={isTransaction}
            isIdea
          />
        ),
        sortFn: stringCompare,
      },
    ],
    []
  );

  const { rows, columns, headerProps, toolbarProps } = useTable(
    TableName.OPTION_IDEAS,
    data,
    columnDefs,
    { styles }
  );

  return (
    <Fragment>
      <Toolbar
        tools={[
          <SymbolSelect
            key="add"
            size="xs"
            placeholder="Add Symbol"
            onChange={(symbol) =>
              addIdeaMutation.mutate({ data: { symbol, preferences } })
            }
            clearOnSelect
          />,
          <Popover
            key="updatePreferences"
            opened={preferencesOpened}
            onChange={setPreferencesOpened}
          >
            <Popover.Target>
              <Tooltip withArrow label="Update Preferences">
                <ActionIcon
                  variant="subtle"
                  onClick={() => setPreferencesOpened((o) => !o)}
                >
                  <IconCalendarCog />
                </ActionIcon>
              </Tooltip>
            </Popover.Target>
            <Popover.Dropdown>
              <NumberInput
                label="Strike Round"
                description="Update strikes to be current stock price multiplied by this scale"
                decimalScale={2}
                step={0.01}
                value={preferences.strikeRound}
                onChange={(value) =>
                  setPreferences((oldPrefs) => ({
                    ...oldPrefs,
                    strikeRound: Number(value),
                  }))
                }
              />
              <NumberInput
                label="Plus Months"
                description="Update expiries to be this many months in the future"
                mt="sm"
                value={preferences.plusMonths}
                onChange={(value) =>
                  setPreferences((oldPrefs) => ({
                    ...oldPrefs,
                    plusMonths: Number(value),
                  }))
                }
              />
              <Button
                fullWidth
                mt="sm"
                loading={updateAllMutation.isPending}
                onClick={() => updateAllMutation.mutate({ data: preferences })}
              >
                Update All
              </Button>
            </Popover.Dropdown>
          </Popover>,
          <ExportButton
            key="export"
            title="option-ideas"
            headers={columns.map((c) => c.accessorKey)}
            data={rows}
          />,
        ]}
        loading={isFetching || addIdeaMutation.isPending}
        {...toolbarProps}
      />
      <Table>
        <TableHead columns={columns} {...headerProps} />
        <tbody>
          {rows.map((row) => (
            <MemoizedRow
              key={row.id}
              row={row}
              columns={columns}
              isLoading={isPending}
            >
              {columns.map((column) => renderCell(row, column, isPending))}
            </MemoizedRow>
          ))}
        </tbody>
      </Table>
      <CompareModal
        show={modal === "compare"}
        setModal={setModal}
        current={row}
        onSelect={updateContract}
      />
    </Fragment>
  );
}
