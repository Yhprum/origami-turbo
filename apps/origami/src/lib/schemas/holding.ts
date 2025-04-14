import { z } from "zod";
import { AssetClass, HoldingType } from "~/lib/server/db/enums";

const createHoldingWithoutTransactionSchema = z.object({
  type: z.nativeEnum(HoldingType),
  symbol: z.string(),
  name: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()),
  withTransaction: z.literal(false),
});

export const createHoldingWithTransactionSchema = z.object({
  type: z.nativeEnum(HoldingType),
  symbol: z.string(),
  name: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()),
  withTransaction: z.literal(true),
  transaction: z.object({
    type: z.nativeEnum(AssetClass),
    quantity: z.number(),
    price: z.number(),
    date: z.string(),
  }),
});

export const createOpenOrderSchema = createHoldingWithTransactionSchema.extend({
  holding: z.number(),
});

export const createHoldingSchema = createHoldingWithTransactionSchema.or(
  createHoldingWithoutTransactionSchema
);
