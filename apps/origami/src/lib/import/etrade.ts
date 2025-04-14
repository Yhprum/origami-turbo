import { AssetClass, HoldingType } from "~/lib/server/db/enums";
import type { BrokerageHoldingList } from ".";

const transactionTypes = [
  "Bought",
  "Sold",
  "Bought To Cover",
  "Sold Short",
  "Sold To Close",
  "Option Expiration",
  "Option Assignment",
];

export default function importTransactions(
  rows: string[][],
  holdings: BrokerageHoldingList
) {
  const headerRow = rows.findIndex((row) =>
    row.some((col) => col === "Symbol")
  );
  if (headerRow === -1) return {};

  const symbolIndex = rows[headerRow].findIndex((col) => col === "Symbol");
  const dateIndex = rows[headerRow].findIndex(
    (col) => col === "TransactionDate"
  );
  const sharesIndex = rows[headerRow].findIndex((col) => col === "Quantity");
  const priceIndex = rows[headerRow].findIndex((col) => col === "Price");
  const typeIndex = rows[headerRow].findIndex(
    (col) => col === "TransactionType"
  );
  const securityTypeIndex = rows[headerRow].findIndex(
    (col) => col === "SecurityType"
  );

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (
      i <= headerRow ||
      !row[symbolIndex] ||
      !transactionTypes.includes(row[typeIndex])
    )
      continue;
    if (row[securityTypeIndex] !== "EQ") continue; // TODO

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
