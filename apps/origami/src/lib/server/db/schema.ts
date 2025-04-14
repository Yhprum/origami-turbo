import type { ColumnType } from "kysely";
export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

import type {
  AssetClass,
  ConnectionType,
  HoldingType,
  IdeaType,
  TableName,
} from "./enums";

export type Account = {
  id: Generated<number>;
  accountId: string;
  providerId: string;
  userId: number;
  accessToken: string | null;
  refreshToken: string | null;
  idToken: string | null;
  accessTokenExpiresAt: Timestamp | null;
  refreshTokenExpiresAt: Timestamp | null;
  scope: string | null;
  password: string | null;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
};
export type ColumnStyle = {
  table: TableName;
  /**
   * @kyselyType(CellStyle[])
   */
  styles: CellStyle[];
  userId: number;
};
export type Connection = {
  id: Generated<number>;
  name: string;
  type: ConnectionType;
  accessToken: string | null;
  itemId: string | null;
  syncedAt: Timestamp | null;
  userId: number | null;
};
export type Holding = {
  id: Generated<number>;
  type: HoldingType;
  buyTarget: number | null;
  sellTarget: number | null;
  notes: string | null;
  userId: number;
  symbol: string;
  name: string | null;
  category: string | null;
  closed: Generated<boolean>;
  connectionId: number | null;
};
export type HoldingTag = {
  holdingId: number;
  tagId: number;
};
export type Idea = {
  id: Generated<number>;
  symbol: string;
  userId: number;
  type: IdeaType;
  target: number | null;
  notes: string | null;
  tags: Generated<string[]>;
  updatedAt: Generated<Timestamp>;
};
export type Income = {
  id: Generated<number>;
  holdingId: number;
  amount: number;
  date: Timestamp;
  note: string | null;
  userId: number;
};
export type OpenOrder = {
  id: Generated<number>;
  symbol: string;
  price: number;
  quantity: number;
  buy: boolean;
  ordertype: string;
  userId: number;
  gtc: Timestamp;
  holdingId: number | null;
};
export type Session = {
  id: Generated<number>;
  expiresAt: Timestamp;
  token: string;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
  ipAddress: string | null;
  userAgent: string | null;
  userId: number;
};
export type Tag = {
  id: Generated<number>;
  name: Generated<string>;
  color: Generated<string>;
  userId: number;
};
export type Transaction = {
  id: Generated<number>;
  date: Timestamp;
  quantity: number;
  price: number;
  holdingId: number;
  userId: number;
  type: AssetClass;
  symbol: string;
};
export type User = {
  id: Generated<number>;
  name: string | null;
  email: string;
  emailVerified: boolean;
  date: Generated<Timestamp>;
  cash: Generated<number>;
  yield: Generated<number>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};
export type Verification = {
  id: Generated<number>;
  identifier: string;
  value: string;
  expiresAt: Timestamp;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
};
export type DB = {
  Account: Account;
  ColumnStyle: ColumnStyle;
  Connection: Connection;
  Holding: Holding;
  HoldingTag: HoldingTag;
  Idea: Idea;
  Income: Income;
  OpenOrder: OpenOrder;
  Session: Session;
  Tag: Tag;
  Transaction: Transaction;
  User: User;
  Verification: Verification;
};
