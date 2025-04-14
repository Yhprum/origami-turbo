import { error } from "elysia";

export function notFound(cause?: any) {
  return error(404, {
    errors: { body: [cause ? `${cause}` : "Invalid resource identifier"] },
  });
}

export function isDefined<T>(thing?: T | null | undefined): thing is T {
  return thing !== undefined && thing !== null;
}

export function isOptionContract(symbol: string) {
  return /^[a-z]{1,6}\d{6}(c|p)\d{8}$/i.test(symbol);
}

export const sanitizeSymbol = (symbol: string) =>
  symbol
    .replace(".", "-")
    .replace(/[^\w\d\s-]/g, "")
    .toUpperCase();
