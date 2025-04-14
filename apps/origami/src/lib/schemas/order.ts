import { z } from "zod";

export const createOpenOrderSchema = z.object({
  symbol: z.string(),
  quantity: z.number(),
  price: z.number(),
  gtc: z.string(),
  buy: z.enum(["Buy", "Sell"]),
  orderType: z.enum(["S/L", "L"]),
  holding: z.number().optional(),
});

export const updateOpenOrderSchema = z.object({
  id: z.number(),
  symbol: z.string(),
  quantity: z.number(),
  price: z.number(),
  gtc: z.string(),
  buy: z.enum(["Buy", "Sell"]),
  orderType: z.enum(["S/L", "L"]),
  holding: z.number().optional(),
});
