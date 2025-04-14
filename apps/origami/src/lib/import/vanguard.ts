import { AssetClass, HoldingType } from "~/lib/server/db/enums";
import type { BrokerageHoldingList } from ".";

const transactionTypes = ["Buy", "Sell"];

export default function importTransactions(
  rows: string[][],
  holdings: BrokerageHoldingList
) {
  const headerRow = rows.findIndex((row) =>
    row.some((col) => col === "Trade Date")
  );
  if (headerRow === -1) return {};

  const symbolIndex = rows[headerRow].findIndex((col) => col === "Symbol");
  const dateIndex = rows[headerRow].findIndex((col) => col === "Trade Date");
  const sharesIndex = rows[headerRow].findIndex((col) => col === "Shares");
  const priceIndex = rows[headerRow].findIndex((col) => col === "Share Price");
  const typeIndex = rows[headerRow].findIndex(
    (col) => col === "Transaction Type"
  );

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (
      i <= headerRow ||
      !row[symbolIndex] ||
      !transactionTypes.includes(row[typeIndex])
    )
      continue;
    if (!row[symbolIndex]) continue; // TODO

    const symbol = row[symbolIndex];
    const transaction = {
      date: row[dateIndex],
      quantity: Number(row[sharesIndex]),
      price: Number(row[priceIndex]),
      type: AssetClass.STOCK,
    };
    if (!holdings[symbol]) {
      holdings[symbol] = {
        symbol,
        type: HoldingType.STOCK,
        transactions: [],
      };
    }
    holdings[symbol].transactions.push(transaction);
  }

  return holdings;
}
