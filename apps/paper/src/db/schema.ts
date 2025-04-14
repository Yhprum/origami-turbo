import { tickerTypeKeys } from "@/lib/constants";
import { relations, sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const stocks = sqliteTable("stocks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  figi: text("figi"),
  symbol: text("symbol").unique().notNull(),
  name: text("name"),
  type: text("type", {
    enum: tickerTypeKeys,
  }).notNull(),
  price: integer("price").notNull(),
  rate: integer("rate"),
  fiftyTwoWeekHigh: integer("fiftyTwoWeekHigh"),
  fiftyTwoWeekLow: integer("fiftyTwoWeekLow"),
  forwardPE: integer("forwardPE"),
  marketCap: integer("marketCap"),
  dayChange: integer("dayChange"),
  dayChangePercent: integer("dayChangePercent"),
  sector: text("sector"),
  exDividendDate: integer("exDividendDate"),
  earningsDate: integer("earningsDate"),
  optionExpirations: text({ mode: "json" }).$type<number[]>(),
  marketIdentifierCode: text("marketIdentifierCode"),
  source: text("source", {
    enum: ["polygon", "fmp", "nasdaq"],
  }).notNull(),
  lastOptionsUpdate: integer("lastOptionsUpdate"),
  fetchedEvents: integer("fetchedEvents", { mode: "boolean" })
    .notNull()
    .default(false),
  updatedAt: integer("updatedAt")
    .notNull()
    .default(sql`(unixepoch() * 1000)`)
    .$onUpdateFn(() => Date.now()),
});

export const stockRelations = relations(stocks, ({ many }) => ({
  dividends: many(dividends),
  splits: many(splits),
  options: many(options),
}));

export const dividends = sqliteTable("dividends", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  stockId: integer("stockId")
    .notNull()
    .references(() => stocks.id, { onDelete: "cascade" }),
  date: integer("date").notNull(),
  amount: integer("amount").notNull(),
});

export const dividendRelations = relations(dividends, ({ one }) => ({
  stock: one(stocks, { fields: [dividends.stockId], references: [stocks.id] }),
}));

export const splits = sqliteTable("splits", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  stockId: integer("stockId")
    .notNull()
    .references(() => stocks.id, { onDelete: "cascade" }),
  date: integer("date").notNull(),
  numerator: integer("numerator").notNull(),
  denominator: integer("denominator").notNull(),
});

export const splitRelations = relations(splits, ({ one }) => ({
  stock: one(stocks, { fields: [splits.stockId], references: [stocks.id] }),
}));

export const options = sqliteTable("options", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  stockId: integer("stockId")
    .notNull()
    .references(() => stocks.id, { onDelete: "cascade" }),
  contractSymbol: text("contractSymbol").unique().notNull(),
  strike: integer("strike").notNull(),
  expiry: integer("expiry").notNull(),
  type: text("type", { enum: ["call", "put"] }).notNull(),
  bid: integer("bid").notNull(),
  ask: integer("ask").notNull(),
  impliedVolatility: integer("impliedVolatility").notNull(),
  openInterest: integer("openInterest").notNull(),
  delta: integer("delta").notNull(),
  gamma: integer("gamma").notNull(),
  theta: integer("theta").notNull(),
  vega: integer("vega").notNull(),
  updatedAt: integer("updatedAt")
    .notNull()
    .default(sql`(unixepoch() * 1000)`)
    .$onUpdateFn(() => Date.now()),
});

export const optionRelations = relations(options, ({ one }) => ({
  stock: one(stocks, { fields: [options.stockId], references: [stocks.id] }),
}));

export const bonds = sqliteTable("bonds", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  figi: text("figi").unique().notNull(),
  cusip: text("cusip").unique().notNull(),
  symbol: text("symbol").unique().notNull(),
  name: text("name").notNull(),
  rate: integer("rate").notNull(),
  price: integer("price").notNull(),
  yield: integer("yield").notNull(),
  lastSaleDate: integer("lastSaleDate"),
  standardAndPoorRating: text("standardAndPoorRating"),
  standardAndPoorChange: integer("standardAndPoorChange").notNull().default(0),
  moodyRating: text("moodyRating"),
  moodyChange: integer("moodyChange").notNull().default(0),
  fitchRating: text("fitchRating"),
  fitchChange: integer("fitchChange").notNull().default(0),
  maturityDate: integer("maturityDate").notNull(),
  callDate: integer("callDate"),
  type: text("type", {
    enum: ["AGCY", "CORP", "MUNI", "TREA", "CHRC", "ELN"],
  }).notNull(),
  sector: text("sector"),
  lastRatingUpdate: integer("lastRatingUpdate")
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
  updatedAt: integer("updatedAt")
    .notNull()
    .default(sql`(unixepoch() * 1000)`)
    .$onUpdateFn(() => Date.now()),
});

export const tokens = sqliteTable("tokens", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  refreshToken: text("refreshToken").notNull(),
  expiresAt: integer("expiresAt").notNull(),
});
