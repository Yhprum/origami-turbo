import type { bonds } from "@/db/schema";

const FINRA_BASE_URL =
  "https://services-dynarep.ddwa.finra.org/public/reporting/v2";
const FINRA_COOKIE_URL = `${FINRA_BASE_URL}/template/template-e07aeeca-d6b8-4356-bd2a-0ca58e1e5bea/composite`;
const FINRA_BOND_URL = `${FINRA_BASE_URL}/data/group/FixedIncomeMarket/name/CorporateAndAgencySecurities`;
const FINRA_BOND_HISTORY_URL = `${FINRA_BASE_URL}/data/group/FixedIncomeMarket/name/CorporateAndAgencyTradeHistory`;

type FinraBond = {
  cusip: string;
  issueSymbolIdentifier: string;
  issuerName: string;
  isCallable: boolean;
  nextCallDate: string | null;
  productSubTypeCode: string;
  couponRate: number;
  maturityDate: number;
  industryGroup: string;
  lastSalePrice: number;
  lastSaleYield: number;
  lastTradeDate: number;
  moodysRating: string | null;
  standardAndPoorsRating: string | null;
  issuingAgency: string;
  couponType: string;
  subProductType: string;
};

export async function getBonds(cusips: string[]) {
  const figiBonds = await getFigiBonds(cusips);

  // Partition the cusips into two groups: treasury, that have marketSector="Govt" and securityType2="Note", and all others
  const finraCusips: string[] = [];
  const treasuryCusips: string[] = [];
  for (const cusip of cusips) {
    if (!figiBonds[cusip]) continue;
    if (
      figiBonds[cusip].marketSector === "Govt" &&
      figiBonds[cusip].securityType2 === "Note"
    ) {
      treasuryCusips.push(cusip);
    } else {
      finraCusips.push(cusip);
    }
  }

  // Call getTreasuryBonds for treasury bonds, and getFinraBonds for the rest
  const [treasuryBonds, finraBonds] = await Promise.all([
    getTreasuryBonds(treasuryCusips),
    getFinraBonds(finraCusips),
  ]);

  return [...treasuryBonds, ...finraBonds].map((bond) => ({
    ...bond,
    figi: figiBonds[bond.cusip].figi,
    symbol: figiBonds[bond.cusip].ticker,
  }));
}

async function getFinraAuth() {
  const response = await fetch(FINRA_COOKIE_URL);
  const cookie = response.headers.get("set-cookie") as string;
  const xsrfToken = cookie.match("XSRF-TOKEN=([^;]*)")?.[1] as string;

  return { cookie, xsrfToken };
}

async function getFinraBonds(cusips: string[]) {
  if (cusips.length === 0) return [];
  const { cookie, xsrfToken } = await getFinraAuth();
  const body = {
    fields: [
      "cusip",
      "issueSymbolIdentifier",
      "issuerName",
      "isCallable",
      "nextCallDate",
      "productSubTypeCode",
      "couponRate",
      "maturityDate",
      "industryGroup",
      "lastSalePrice",
      "lastSaleYield",
      "lastTradeDate",
      "moodysRating",
      "standardAndPoorsRating",
      "issuingAgency",
      "couponType",
      "subProductType",
    ],
    orFilters: [
      {
        compareFilters: cusips.map((cusip) => ({
          fieldName: "cusip",
          fieldValue: cusip,
          compareType: "EQUAL",
        })),
      },
    ],
    offset: 0,
    limit: cusips.length,
  };

  const response = await fetch(FINRA_BOND_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookie,
      "X-XSRF-TOKEN": xsrfToken,
    },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  try {
    const bondResponse: FinraBond[] = data.returnBody.data
      ? JSON.parse(data.returnBody.data)
      : [];
    const bondData = bondResponse.map((bond) => ({
      cusip: bond.cusip,
      name: bond.issuerName,
      rate: bond.couponRate / 100,
      price: bond.lastSalePrice * 10,
      yield: bond.lastSaleYield / 100,
      lastSaleDate: new Date(bond.lastTradeDate).getTime(),
      standardAndPoorRating: bond.standardAndPoorsRating,
      moodyRating: bond.moodysRating,
      maturityDate: new Date(bond.maturityDate).getTime(),
      callDate: bond.nextCallDate
        ? new Date(bond.nextCallDate).getTime()
        : null,
      type: bond.productSubTypeCode as (typeof bonds.$inferSelect)["type"],
      sector: bond.industryGroup as (typeof bonds.$inferSelect)["sector"],
      issueSymbolIdentifier: bond.issueSymbolIdentifier,
    }));

    // get backup price if bonds do not have a price
    const bondsWithoutPrice = bondData.filter((bond) => !bond.price);
    const prices = await backupBondPrice(
      bondsWithoutPrice.map((bond) => bond.issueSymbolIdentifier)
    );
    return bondData.map((bond) => ({
      ...bond,
      price: prices[bond.issueSymbolIdentifier] ?? bond.price,
      issueSymbolIdentifier: undefined,
    }));
  } catch (e) {
    console.log(e);
    return [];
  }
}

async function backupBondPrice(issueSymbolIdentifiers: string[]) {
  if (issueSymbolIdentifiers.length === 0) return {};
  const { cookie, xsrfToken } = await getFinraAuth();

  const body = {
    fields: [
      "issueSymbolIdentifier",
      "issuerName",
      "tradeExecutionDate",
      "lastSalePrice",
    ],
    compareFilters: issueSymbolIdentifiers.map((issueSymbolIdentifier) => ({
      fieldName: "issueSymbolIdentifier",
      fieldValue: issueSymbolIdentifier,
      compareType: "EQUAL",
    })),
    sortFields: ["-tradeExecutionDate"],
    limit: 1,
  };
  const response = await fetch(FINRA_BOND_HISTORY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookie,
      "X-XSRF-TOKEN": xsrfToken,
    },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  try {
    const bondData = JSON.parse(data.returnBody.data ?? "[]");
    return bondData.reduce(
      (
        acc: Record<string, number>,
        bond: { lastSalePrice: any; issueSymbolIdentifier: string | number }
      ) => {
        if (bond.lastSalePrice) {
          acc[bond.issueSymbolIdentifier] = bond.lastSalePrice;
        }
        return acc;
      },
      {} as Record<string, number>
    );
  } catch (e) {
    return {};
  }
}

const WSJ_QUOTE_URL =
  "https://api.wsj.net/api/dylan/quotes/v2/comp/quoteByDialect";
const DYLAN_TOKEN = "cecc4267a0194af89ca343805a3e57af";

type TreasuryBond = {
  cusip: string;
  name: string;
  price: number;
  rate: number;
  yield: number;
  lastSaleDate: number;
  maturityDate: number;
  type: "TREA";
  standardAndPoorRating: null;
  moodyRating: null;
};

async function getTreasuryBonds(cusips: string[]): Promise<TreasuryBond[]> {
  try {
    if (cusips.length === 0) return [];
    const response = await fetch(
      `${WSJ_QUOTE_URL}?dialect=official&MaxInstrumentMatches=1&accept=application/json&EntitlementToken=${DYLAN_TOKEN}&ckey=cecc4267a0&id=${cusips.map((cusip) => `BOND-US-${cusip}`).join(",")}`
    );
    const quote = await response.json();

    const bonds = [];
    for (const response of quote.InstrumentResponses) {
      const data = response.Matches?.[0];
      if (!data) continue;

      const bond = {
        cusip: data.Instrument?.Cusip,
        name: data.Instrument?.CommonName,
        price: data.BondSpecific?.TradePrice?.Value * 10,
        rate: data.BondSpecific?.CouponRate / 100,
        yield: data.BondSpecific?.Yield / 100,
        lastSaleDate: new Date(data.Trading?.Last?.Time).getTime(),
        maturityDate: new Date(data.BondSpecific?.MaturityDate).getTime(),
        type:
          data.IndustryClassification?.Sector ||
          (data.Instrument?.Exchange?.CountryCode
            ? data.Instrument?.Exchange?.CountryCode
            : null) ||
          "unknown pls text me",
        sector: "TREA",
        standardAndPoorRating: null,
        moodyRating: null,
      };
      bonds.push(bond);
    }
    return bonds;
  } catch (e) {
    console.log(e);
    return [];
  }
}

const FIGI_BASE_URL = "https://api.openfigi.com/v3";
const FIGI_MAPPING_URL = `${FIGI_BASE_URL}/mapping`;

type FigiResponse = {
  data: {
    figi: string;
    name: string;
    ticker: string;
    exchCode: string;
    compositeFIGI: string | null;
    securityType: string;
    marketSector: string;
    shareClassFIGI: string | null;
    securityType2: string;
    securityDescription: string;
  }[];
};
async function getFigiBonds(cusips: string[]) {
  const body = JSON.stringify(
    cusips.map((cusip) => ({ idType: "ID_CUSIP", idValue: cusip }))
  );
  const response = await fetch(FIGI_MAPPING_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
  const data: FigiResponse[] = await response.json();

  // return a map with cusip as key and figi response as value
  return data.reduce(
    (acc, item, index) => {
      acc[cusips[index]] = item.data?.[0] ?? null;
      return acc;
    },
    {} as Record<string, FigiResponse["data"][0]>
  );
}
