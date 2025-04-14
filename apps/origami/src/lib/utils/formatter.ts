const formatter = new Intl.NumberFormat("en", {
  style: "currency",
  currency: "USD",
});
const dateFormatter = Intl.DateTimeFormat("sv-SE");

export const currency = (num: number | string) =>
  num || num === 0
    ? formatter.format(typeof num === "number" ? num : Number(num))
    : null;
export const percent = (num: number | string) =>
  num || num === 0
    ? `${((typeof num === "number" ? num : Number(num)) * 100).toFixed(2)}%`
    : null;
export const date = (date: string | number | Date) =>
  date ? new Date(date).toLocaleDateString("en-US", { timeZone: "UTC" }) : null;
export const dateOrString = (value: number | string) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-US", { timeZone: "UTC" });
};
export function longDate(date: string | number | Date) {
  return new Date(date).toLocaleDateString("en-US", {
    timeZone: "UTC",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function yyyymmdd(date: null): null;
export function yyyymmdd(date: string | number | Date): string;
export function yyyymmdd(date: string | number | Date | null): string | null {
  return date ? dateFormatter.format(new Date(date)) : null;
}

// Format market cap number with abbreviations
const numAbbr = ["", "k", "M", "B", "T", "Q"];
export const abbreviate = (number: number | null | undefined) => {
  if (number === null || number === undefined) return "";
  const scale = (Math.log10(number) / 3) | 0;
  return (
    Number.parseFloat((number / 10 ** (scale * 3)).toFixed(2)) + numAbbr[scale]
  );
};

export const target = (
  value: number | null,
  price: number,
  buySell: "buy" | "sell" | string
) => {
  if (value === null) return undefined;
  if (buySell === "buy") {
    if (price < value) return "green";
    if (price * 0.95 < value) return "green.2";
  } else {
    if (price > value) return "red";
    if (price * 1.05 > value) return "red.2";
  }
  return undefined;
};

export const twoDecimals = (value: number) =>
  Math.round((value + Number.EPSILON) * 100) / 100 || null;
