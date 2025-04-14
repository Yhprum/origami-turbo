import type { SortProps } from "./types";

// biome-ignore format: 2 columns
export const ratingScale = [
  // S&P, Moody's
  "AAA", "Aaa",
  "AA+", "Aa1",
  "AA", "Aa2",
  "AA-", "Aa3",
  "A+", "A1",
  "A", "A2",
  "A-", "A3",
  "BBB+", "Baa1",
  "BBB", "Baa2",
  "BBB-", "Baa3",
  "BB+", "Ba1",
  "BB", "Ba2",
  "BB-", "Ba3",
  "B+", "B1",
  "B", "B2",
  "B-", "B3",
  "CCC+", "Caa1",
  "CCC", "Caa2",
  "CCC-", "Caa3",
  "CC", "Ca",
  "C", "Ca",
  "D", "C",
  "WR", "NF", "NR", "", null,
];
export const ratingCompare = (sort: SortProps) => (a, b) => {
  if (a[sort.header] === undefined) return sort.direction;
  if (b[sort.header] === undefined) return sort.direction * -1;
  return (
    (ratingScale.indexOf(b[sort.header]) -
      ratingScale.indexOf(a[sort.header])) *
    sort.direction *
    -1
  );
};
export const numberOrStringCompare = (sort: SortProps) => (a, b) => {
  const parsedA = a[sort.header];
  const parsedB = b[sort.header];
  if (typeof parsedA === "number" && typeof parsedB === "number")
    return (parsedB - parsedA) * sort.direction;
  if (typeof parsedA === "number") return -sort.direction;
  if (typeof parsedB === "number") return sort.direction;
  return (parsedA > parsedB ? 1 : parsedB > parsedA ? -1 : 0) * sort.direction;
};
export const numberCompare = (sort: SortProps) => (a, b) => {
  if (a[sort.header] === undefined) return sort.direction;
  if (b[sort.header] === undefined) return sort.direction * -1;
  return (b[sort.header] - a[sort.header]) * sort.direction;
};
export const stringCompare = (sort: SortProps) => (a, b) => {
  if (a[sort.header] === undefined) return sort.direction;
  if (b[sort.header] === undefined) return sort.direction * -1;
  return (
    (a[sort.header] > b[sort.header]
      ? 1
      : b[sort.header] > a[sort.header]
        ? -1
        : 0) * sort.direction
  );
};
