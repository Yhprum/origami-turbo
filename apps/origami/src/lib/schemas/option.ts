import { z } from "zod";
import { AssetClass } from "~/lib/server/db/enums";

export const rollCoveredCallSchema = z.object({
  holding: z.object({
    id: z.number(),
    symbol: z.string(),
  }),
  open: z.object({
    strike: z.number(),
    expiry: z.number(),
    quantity: z.number(),
    price: z.number(),
    date: z.string(),
  }),
  close: z.object({
    strike: z.number(),
    expiry: z.number(),
    quantity: z.number(),
    price: z.number(),
    date: z.string(),
  }),
});

export const addOptionTransactionSchema = z.object({
  holding: z.number(),
  type: z.enum([AssetClass.CALL, AssetClass.PUT]),
  symbol: z.string(),
  contract: z.string(),
  strike: z.number(),
  expiry: z.number(),
  quantity: z.number(),
  price: z.number(),
  date: z.string(),
});
