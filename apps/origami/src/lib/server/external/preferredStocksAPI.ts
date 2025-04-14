import { load } from "cheerio";
import type { Selectable } from "kysely";
import type { Idea } from "~/lib/server/db/schema";
import { RATE } from "~/lib/server/utils/math";
const ONE_YEAR = 1000 * 60 * 60 * 24 * 365;

const PREFERRED_STOCKS_API =
  "https://www.preferredstockinvesting.com/pslv2/preferredstocklist.php";

const skippedColumns = ["", "Prospectus"];

interface PreferredStock {
  id: number;
  favorite: boolean;
  "IPO Date": string;
  Symbol: string;
  "Preferred Stock Name": string;
  "Div Rate": number;
  "Last Price": number;
  Volume: number;
  Yield: number;
  YTC: number | null;
  YTM: number | null;
  "Ex-Div Date": string;
  "Call Date": string;
  Dates: number;
  "Maturity Date": string | number;
  "Liquid Price": number;
  "Moody's": string;
  "S&P": string;
  Exchange: string;
  Prospectus: string;
  Status: string;
}

export async function getPreferredStocks(
  ideas: Selectable<Idea>[]
): Promise<PreferredStock[]> {
  let [{ headers, rows }, moreRows] = await Promise.all([
    getRows(),
    getMoreFields(),
  ]);

  moreRows.forEach((row, i) => {
    rows[i] = { ...rows[i], ...row };
    if (row["Maturity Date"] !== "Perpetual") {
      const yearsToMaturity =
        (new Date(row["Maturity Date"]).getTime() - Date.now()) / ONE_YEAR;
      const rate = rows[i]["Div Rate"];
      const liquidPrice = rows[i]["Liquid Price"];
      const lastPrice = rows[i]["Last Price"];

      const ytm = RATE(
        yearsToMaturity * 4,
        (rate / 4) * liquidPrice,
        lastPrice * -1,
        liquidPrice
      );
      rows[i].YTM = ytm ? ytm * 4 : null;
    } else {
      rows[i].YTM = null;
    }
    rows[i].id = i;
    rows[i].favorite = ideas.some((idea) => idea.symbol === rows[i].Symbol);
  });
  headers.splice(headers.indexOf("Yield") + 1, 0, "YTC", "YTM");
  headers.splice(headers.indexOf("Call Date") + 1, 0, "Maturity Date");
  headers = headers.filter((header) => !skippedColumns.includes(header));

  return rows;
}

async function getRows() {
  const preferredStocks = await fetch(PREFERRED_STOCKS_API, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "sortColumn=0&currentView=preferred_etds&lastSortColumn=1&sortDirection=DESC&actionValue=preferred_etds&sorting=sorting",
    method: "POST",
  });

  let preferredStocksHtml = await preferredStocks.text();
  preferredStocksHtml = preferredStocksHtml.match(
    /<table[^>]*stocksTable[^>]*>[\s\S]*<\/table>/
  )?.[0] as string;
  const $ = load(preferredStocksHtml);

  const $headers = $("#stocksTable > thead > tr > th");
  const headers: (keyof PreferredStock)[] = [];
  $headers.each(function (i) {
    let text = $(this).find("div:first").text()?.trim();
    if (text === "Dates") text = "Call Date";
    if (i !== 0) headers[i - 1] = text as keyof PreferredStock;
  });

  const $rows = $("#stocksTable > tbody > tr");
  const rows: PreferredStock[] = [];
  $rows.each(function (i) {
    rows[i] = {} as PreferredStock;
    $(this)
      .find("td")
      .each(function (j) {
        if (j !== 0 && !skippedColumns.includes(headers[j - 1]))
          rows[i][headers[j - 1]] = format(
            headers[j - 1],
            $(this).find("div:first").text()
          );
      });
  });

  return { headers, rows };
}

async function getMoreFields() {
  const preferredStocks = await fetch(PREFERRED_STOCKS_API, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "sortColumn=0&currentView=preferred_etds&lastSortColumn=1&sortDirection=DESC&actionValue=preferred_etds&sorting=sorting&&yieldSelect=YTC&dateSelect=MATURITY",
    method: "POST",
  });

  let preferredStocksHtml = await preferredStocks.text();
  preferredStocksHtml = preferredStocksHtml.match(
    /<table[^>]*stocksTable[^>]*>[\s\S]*<\/table>/
  )?.[0] as string;
  const $ = load(preferredStocksHtml);

  const $headers = $("#stocksTable > thead > tr > th");
  let ytcColumn: number;
  let maturityDateColumn: number;
  $headers.each(function (i) {
    const text = $(this).find("div:first").text()?.trim();
    if (text === "Yield") ytcColumn = i;
    else if (text === "Dates") maturityDateColumn = i;
  });

  const $rows = $("#stocksTable > tbody > tr");
  const rows: { YTC: number | null; "Maturity Date": string | number }[] = [];
  $rows.each(function (i) {
    rows[i] = {} as { YTC: number | null; "Maturity Date": string | number };
    $(this)
      .find("td")
      .each(function (j) {
        if (j === ytcColumn)
          rows[i].YTC = format("YTC", $(this).find("div:first").text()) as
            | number
            | null;
        else if (j === maturityDateColumn)
          rows[i]["Maturity Date"] = format(
            "Maturity Date",
            $(this).find("div:first").text()
          ) as string | number;
      });
  });

  return rows;
}

function format(column: string, value: string) {
  // Number Columns
  if (["Last Price", "Liquid Price", "Volume"].includes(column)) {
    return Number.parseFloat(value.replace("$", "")) || null;
  }
  // Percent Columns
  if (["Div Rate", "Yield", "YTC"].includes(column)) {
    return Number.parseFloat(value.replace("%", "")) / 100 || null;
  }
  // Date Columns
  if (
    ["IPO Date", "Ex-Div Date", "Call Date", "Maturity Date"].includes(column)
  ) {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.getTime();
  }
  return value;
}
