import type { options } from "@/db/schema";

export function formattedOption(option: typeof options.$inferSelect) {
  const { id, stockId, updatedAt, ...rest } = option;
  return rest;
}

export function parseContractSymbol(contractSymbol: string) {
  const symbol = (contractSymbol.match(/^[A-Z]+/) as string[])[0];
  const [expiryDate, strikePrice] = contractSymbol.match(/\d+/g) as [
    string,
    string,
  ];
  const expiry = new Date(
    `20${expiryDate.substring(0, 2)}-${expiryDate.substring(2, 4)}-${expiryDate.substring(4)}`
  ).getTime();
  const strike = Number.parseFloat(
    `${strikePrice.substring(0, 5)}.${strikePrice.substring(5)}`
  );
  const type: "call" | "put" =
    (contractSymbol.match(/\d(\D)\d/) as string[])[1].toLowerCase() === "c"
      ? "call"
      : "put";
  return { symbol, strike, expiry, type };
}
