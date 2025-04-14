import type { Dividend } from "./types";

export function latestDividend(dividends: null): { d: null; p: null };
export function latestDividend(dividends: Dividend[]): Dividend;
export function latestDividend(
  dividends: Dividend[] | null
): Dividend | { d: null; p: null } {
  if (!dividends || dividends.length === 0) return { d: null, p: null };
  return dividends.sort((a, b) => b.date - a.date)[0];
}

// TODO: refactor to remove nextDividendDate
export function annualDividend(
  exDividendDate: MaybeDateish,
  dividends: Dividend[]
) {
  const { estExDivDate } = getNextDividendDate(exDividendDate);
  if (dividends.length === 0 || !estExDivDate) return 0;
  const latestDividendAmount = latestDividend(dividends).amount;
  const dividendsLastYear = dividends.filter(
    (item) =>
      new Date(item.date).getTime() > Date.now() - 365 * 24 * 60 * 60 * 1000 &&
      new Date(item.date).getTime() < Date.now()
  );
  if (dividendsLastYear.length <= 4) {
    return latestDividendAmount * 4;
  }
  return dividendsLastYear.map((div) => div.amount).reduce((a, b) => a + b, 0);
}

type MaybeDateish = string | number | Date | null | undefined;
export function getNextDividendDate(exDividendDate: MaybeDateish) {
  let estExDivDate: Date | null = null;
  let exDivIsEst = false;
  if (exDividendDate) {
    const date = new Date(exDividendDate);
    // TODO: check for cases of more than 4 dividends in the last year
    exDivIsEst =
      date.getTime() < Date.now() &&
      date.setDate(date.getDate() + 91) > Date.now();
    const timestamp =
      date.getTime() > Date.now()
        ? date.getTime()
        : date.setDate(date.getDate() + 91);
    estExDivDate = timestamp > Date.now() ? new Date(timestamp) : null;
  }

  return { estExDivDate, exDivIsEst };
}

export function getTTMDividendYield(dividends: Dividend[], price: number) {
  return (
    dividends
      .filter(
        (item) =>
          new Date(item.date).getTime() >
            Date.now() - 365 * 24 * 60 * 60 * 1000 &&
          new Date(item.date).getTime() < Date.now()
      )
      .map((item) => item.amount)
      .reduce((a, b) => a + b, 0) / price
  );
}

const ONE_YEAR = 1000 * 60 * 60 * 24 * 365;
export function getForwardDividendYield(dividends: Dividend[], price: number) {
  const latestDividend = dividends.sort((a, b) => b.date - a.date)[0];
  if (!latestDividend) return 0;

  return latestDividend
    ? (dividends.filter(
        (div) => div.date > Date.now() - ONE_YEAR && div.date < Date.now()
      ).length *
        latestDividend.amount) /
        price
    : 0;
}
