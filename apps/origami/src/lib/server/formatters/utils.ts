import paper from "~/lib/server/paper";

export async function getClosestOption(
  symbol: string,
  target: { strike: number; expiry: number },
  type: "call" | "put",
  useRegular = false
) {
  try {
    let expiries = (await paper.option({ symbol }).expirations.get()).data;
    if (!expiries) throw new Error("No Options Found");
    if (useRegular)
      expiries = expiries.filter(
        (expiry) =>
          new Date(expiry).getDate() > 14 && new Date(expiry).getDate() <= 21
      );
    const expiry = expiries.reduce((prev, cur) =>
      Math.abs(cur - target.expiry) < Math.abs(prev - target.expiry)
        ? cur
        : prev
    );

    const chain = (
      await paper
        .option({ symbol })
        .expirations({ expiration: expiry })
        .chain.get()
    ).data;
    if (!chain) throw new Error("No Options Found");
    const optionsOfType = chain.options.filter((item) => item.type === type);
    return optionsOfType.reduce((prev, curr) =>
      Math.abs(curr.strike - target.strike) <
      Math.abs(prev.strike - target.strike)
        ? curr
        : prev
    );
  } catch {
    return undefined;
  }
}

const tickerTypes = {
  CS: "Common Stock",
  PFD: "Preferred Stock",
  WARRANT: "Warrant",
  RIGHT: "Rights",
  UNIT: "Unit",
  BASKET: "Basket",
  ETF: "Exchange Traded Fund",
  ETN: "Exchange Traded Note",
  ETV: "Exchange Traded Vehicle",
  ETS: "Single-security ETF",
  SP: "Structured Product",
  ADRC: "ADR Common",
  ADRP: "ADR Preferred",
  ADRW: "ADR Warrants",
  ADRR: "ADR Rights",
  CEF: "CEF",
  OEF: "OEF",
  LT: "Liquidating Trust",
  OS: "Ordinary Shares",
  GDR: "Global Depository Receipts",
  NYRS: "New York Registry Shares",
  BOND: "Corporate Bond",
  AGEN: "Agency Bond",
  EQLK: "Equity Linked Bond",
  OTHER: "Other Security Type",
};

export function stockType(holdingType: keyof typeof tickerTypes) {
  if (tickerTypes[holdingType]) return tickerTypes[holdingType];
  return "Other";
}

// Sort list of returned symbols first by if it starts with the search param, then alphabetically
export function symbolSort<T extends { symbol: string }>(
  symbols: T[],
  querySymbol: string
) {
  return symbols.sort((a, b) => {
    if (
      a.symbol.toLowerCase().startsWith(querySymbol.toLowerCase()) &&
      b.symbol.toLowerCase().startsWith(querySymbol.toLowerCase())
    ) {
      return a.symbol.localeCompare(b.symbol);
    }
    if (a.symbol.toLowerCase().startsWith(querySymbol.toLowerCase())) {
      return -1;
    }
    if (b.symbol.toLowerCase().startsWith(querySymbol.toLowerCase())) {
      return 1;
    }
    return a.symbol.localeCompare(b.symbol);
  });
}

export const sanitizeSymbol = (symbol: string) =>
  symbol.replace(".", "-").replace(/[^\w\d\s-]/g, "");

export function getContractSymbol(
  symbol: string,
  strike: number,
  expireDate: string | number | Date,
  type: "call" | "put"
) {
  const formattedDate = new Date(expireDate)
    .toISOString()
    .split("T")[0]
    .split("-")
    .map((d) => d.substr(d.length - 2, 2))
    .join("");
  const formattedStrike = strike.toString().split(".");
  formattedStrike[0] = formattedStrike[0]
    ? formattedStrike[0].toString().padStart(5, "0")
    : "00000";
  formattedStrike[1] = formattedStrike[1]
    ? formattedStrike[1].toString().padEnd(3, "0")
    : "000";

  return (
    symbol +
    formattedDate +
    type.charAt(0).toUpperCase() +
    formattedStrike.join("")
  );
}

export function contractToDetails(contractSymbol: string) {
  const symbol = (contractSymbol.match(/^[A-Z]+/) as string[])[0];
  const [expiryDate, strikePrice] = contractSymbol.match(/\d+/g) as [
    string,
    string,
  ];
  const expiry = new Date(
    `20${expiryDate.substring(0, 2)}-${expiryDate.substring(2, 4)}-${expiryDate.substring(4)}`
  );
  const strike = Number.parseFloat(
    `${strikePrice.substring(0, 5)}.${strikePrice.substring(5)}`
  );
  const type: "call" | "put" =
    (contractSymbol.match(/\d(\D)\d/) as string[])[1].toLowerCase() === "c"
      ? "call"
      : "put";
  return { symbol, strike, expiry, type };
}
