export const ConnectionType = {
  PLAID: "PLAID",
  ETRADE: "ETRADE",
  VANGUARD: "VANGUARD",
} as const;
export type ConnectionType =
  (typeof ConnectionType)[keyof typeof ConnectionType];
export const HoldingType = {
  STOCK: "STOCK",
  BOND: "BOND",
  MUTUAL_FUND: "MUTUAL_FUND",
  COVERED_CALL: "COVERED_CALL",
} as const;
export type HoldingType = (typeof HoldingType)[keyof typeof HoldingType];
export const AssetClass = {
  STOCK: "STOCK",
  BOND: "BOND",
  MUTUAL_FUND: "MUTUAL_FUND",
  CALL: "CALL",
  PUT: "PUT",
} as const;
export type AssetClass = (typeof AssetClass)[keyof typeof AssetClass];
export const IdeaType = {
  STOCK: "STOCK",
  BOND: "BOND",
  PREFERRED_STOCK: "PREFERRED_STOCK",
  OPTION: "OPTION",
} as const;
export type IdeaType = (typeof IdeaType)[keyof typeof IdeaType];
export const TableName = {
  STOCKS: "STOCKS",
  COVERED_CALLS: "COVERED_CALLS",
  CLOSED_STOCKS: "CLOSED_STOCKS",
  CLOSED_OPTIONS: "CLOSED_OPTIONS",
  STOCK_IDEAS: "STOCK_IDEAS",
  PREFERRED_STOCK_IDEAS: "PREFERRED_STOCK_IDEAS",
  OPTION_IDEAS: "OPTION_IDEAS",
  BOND_IDEAS: "BOND_IDEAS",
  OPEN_ORDERS: "OPEN_ORDERS",
  COMPARE_OPTIONS: "COMPARE_OPTIONS",
} as const;
export type TableName = (typeof TableName)[keyof typeof TableName];
