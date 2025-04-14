import {
  type AssetClass,
  ConnectionType,
  type HoldingType,
} from "~/lib/server/db/enums";
import etrade from "./etrade";
import vanguard from "./vanguard";

export interface BrokerageHolding {
  symbol: string;
  type: HoldingType;
  holdingId?: number;
  transactions: {
    quantity: number;
    price: number;
    date: string;
    type: AssetClass;
  }[];
}
export type BrokerageHoldingList = Record<string, BrokerageHolding>;

export const importTransactions = async (
  files: File[],
  brokerage: ConnectionType
): Promise<BrokerageHoldingList> => {
  let importer: (
    rows: string[][],
    holdings: BrokerageHoldingList
  ) => BrokerageHoldingList;
  switch (brokerage) {
    case ConnectionType.ETRADE:
      importer = etrade;
      break;
    case ConnectionType.VANGUARD:
      importer = vanguard;
      break;
    default:
      return {};
  }

  let holdings: BrokerageHoldingList = {};
  for (const file of files) {
    const csv = await file.text();
    // const csv = await file.arrayBuffer();
    const rows = csvToArray(csv);
    holdings = importer(rows, holdings);
  }
  return holdings;
};

const csvToArray = (csv: string, delimiter = ",") => {
  const regex = new RegExp(
    `(\\${delimiter}|\\r?\\n|\\r|^)(?:"([^"]*(?:""[^"]*)*)"|([^"\\${delimiter}\\r\\n]*))`,
    "gi"
  );
  const data: string[][] = [[]];
  let matches: string[] | null;
  // biome-ignore lint/suspicious/noAssignInExpressions: while loop exec
  while ((matches = regex.exec(csv))) {
    const match = matches[1];
    if (match.length && match !== delimiter) {
      data.push([]);
    }
    const value = matches[2] ? matches[2].replace(/""/g, '"') : matches[3];
    data[data.length - 1].push(value);
  }
  return data;
};
