import type {
  FMPQuoteResponse,
  FMPStockListResponse,
} from "@/lib/sources/fmp/types";

const BASE_URL = "https://financialmodelingprep.com";
const LEGACY_API_URL = `${BASE_URL}/api/v3`;
const STABLE_API_URL = `${BASE_URL}/stable`;

export async function stockList() {
  const response = await fetch(
    `${LEGACY_API_URL}/stock/list?apikey=${process.env.FMP_API_KEY}`
  );
  const data: FMPStockListResponse[] = await response.json();
  return data;
}

export async function etfList() {
  const response = await fetch(
    `${LEGACY_API_URL}/etf/list?apikey=${process.env.FMP_API_KEY}`
  );
  const data: FMPStockListResponse[] = await response.json();
  return data;
}

export async function quote(symbol: string) {
  const response = await fetch(
    `${LEGACY_API_URL}/quote/${toFMPSymbol(symbol)}?apikey=${process.env.FMP_API_KEY}`
  );
  const data: FMPQuoteResponse[] = await response.json();
  return data[0];
}

function toFMPSymbol(symbol: string) {
  return symbol.toUpperCase().replace("-", "-P");
}
