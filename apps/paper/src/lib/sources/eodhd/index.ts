import type { EODHDOptionResponse } from "@/lib/sources/eodhd/types";

export async function getOptionChain(symbol: string) {
  const url = buildUrl(symbol, 1000, 0);
  const options: EODHDOptionResponse["data"][number]["attributes"][] = [];

  const response = await fetch(url);
  const json: EODHDOptionResponse = await response.json();
  options.push(...json.data.map((option) => option.attributes));

  const total = json.meta.total;
  let offset = json.meta.offset + json.meta.limit;
  while (offset < total) {
    const nextUrl = buildUrl(symbol, 1000, offset);
    const nextResponse = await fetch(nextUrl);
    const nextJson: EODHDOptionResponse = await nextResponse.json();
    options.push(...nextJson.data.map((option) => option.attributes));
    offset = nextJson.meta.offset + nextJson.meta.limit;
  }
  return options;
}

function currentDate() {
  const now = new Date();
  const offsetMs = now.getTimezoneOffset() * 60 * 1000;
  const dateLocal = new Date(now.getTime() - offsetMs);
  return dateLocal.toISOString().slice(0, 10);
}

function buildUrl(symbol: string, limit: number, offset: number) {
  const url = new URL("https://eodhd.com/api/mp/unicornbay/options/contracts");
  url.searchParams.set("filter[underlying_symbol]", symbol.toUpperCase());
  url.searchParams.set("filter[exp_date_from]", currentDate());
  url.searchParams.set(
    "fields[options-contracts]",
    "contract,type,strike,exp_date,bid,ask,delta,open_interest,volatility"
  );
  url.searchParams.set("sort", "exp_date");
  url.searchParams.set(
    "api_token",
    symbol.toUpperCase() === "AAPL" ? "demo" : (Bun.env.EODHD_API_KEY ?? "demo")
  );
  url.searchParams.set("page[limit]", limit.toString());
  url.searchParams.set("page[offset]", offset.toString());
  return url.href;
}
