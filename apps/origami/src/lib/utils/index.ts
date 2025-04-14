import rfdc from "rfdc";
import type { Dividend } from "~/lib/server/formatters/types";

const clone = rfdc();
export const deepCopy = clone;

export const inputDate = (date: string | number | Date) =>
  new Date(date).toISOString().slice(0, 10);

export const currentInputDate = (plusMs = 0) => {
  const now = new Date();
  const offsetMs = now.getTimezoneOffset() * 60 * 1000;
  const dateLocal = new Date(now.getTime() + plusMs - offsetMs);
  return dateLocal.toISOString().slice(0, 10);
};

export const yahooSymbol = (symbol: string) => symbol.replace("-", "-P");
export const fromYahooSymbol = (symbol: string) => symbol.replace("-P", "-");

export function estimateFraction(rational: number, epsilon = 0.01) {
  let denominator = 0;
  let numerator: number;
  let error: number;

  do {
    denominator++;
    numerator = Math.round(rational * denominator);
    error = Math.abs(rational - numerator / denominator);
  } while (error > epsilon);
  return { numerator, denominator };
}

// To be used with .map()
export const sum = (a: number, b: unknown) =>
  typeof b === "number" ? a + b : a;

// To be used with .reduce()
export const closest = (target: number) => (prev: number, curr: number) =>
  Math.abs(curr - target) < Math.abs(prev - target) ? curr : prev;

export const exportCSV = (
  columns: string[],
  data: Record<string, unknown>[],
  filename: string
) => {
  const process = (row: Record<string, unknown>) => {
    let csv = "";
    columns.forEach((column: string, i: number) => {
      let value = row[column]?.toString() || "";
      value = value.replace(/"/g, '""');
      if (value.search(/[",\n]/g) >= 0) value = `"${value}"`;
      if (i < columns.length - 1) value += ",";
      csv += value;
    });
    return `${csv}\n`;
  };

  let csv = `${columns.join(",")}\n`;
  csv += data.map((row: Record<string, unknown>) => process(row)).join("");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// To be used with .filter()
const dividendOffset = 1000 * 60 * 60 * 9.5; // 9:30
export const earnedDividend = (buyDate: number | Date, dividend: Dividend) => {
  return (
    new Date(dividend.date).getTime() - dividendOffset >
      new Date(buyDate).getTime() &&
    new Date(dividend.date).getTime() - dividendOffset < Date.now()
  );
};

export const stockSplit = (
  buyDate: number | Date,
  split: { date: number; numerator: number; denominator: number }
) => {
  return (
    new Date(split.date).getTime() > new Date(buyDate).getTime() &&
    new Date(split.date).getTime() < Date.now()
  );
};

export function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function enumToWords(s: string) {
  return s
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
}
