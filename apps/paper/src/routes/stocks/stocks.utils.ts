import type { stocks } from "@/db/schema";

export function formattedStock(
  stock: typeof stocks.$inferSelect & {
    dividends: { date: number; amount: number }[];
    splits: { date: number; numerator: number; denominator: number }[];
  }
) {
  const {
    id,
    source,
    updatedAt,
    fetchedEvents,
    lastOptionsUpdate,
    optionExpirations,
    ...rest
  } = stock;
  return rest;
}
