import { z } from "zod";
import { AssetClass } from "~/lib/server/db/enums";

export const createTransactionSchema = z.object({
  quantity: z.number(),
  price: z.number(),
  date: z.string(),
  holding: z.number(),
  symbol: z.string(),
  type: z.nativeEnum(AssetClass),
  closed: z.boolean().optional(),
});

export const updateTransactionSchema = z
  .object({ id: z.number() })
  .and(
    z.union([
      z.object({ field: z.literal("date"), value: z.date() }),
      z.object({ field: z.literal("quantity"), value: z.number() }),
      z.object({ field: z.literal("price"), value: z.number() }),
    ])
  );
