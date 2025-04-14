import { z } from "zod";

export const updateOptionIdeaValuesSchema = z.object({
  id: z.number(),
  symbol: z.string(),
  strike: z.string(),
  expiry: z.string(),
});

export const updateOptionIdeaSchema = z
  .object({
    id: z.number(),
    contractSymbol: z.string(),
  })
  .or(updateOptionIdeaValuesSchema);
