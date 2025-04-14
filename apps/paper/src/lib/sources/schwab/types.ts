/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface Bond {
  cusip?: string;
  symbol?: string;
  description?: string;
  exchange?: string;
  assetType?:
    | "BOND"
    | "EQUITY"
    | "ETF"
    | "EXTENDED"
    | "FOREX"
    | "FUTURE"
    | "FUTURE_OPTION"
    | "FUNDAMENTAL"
    | "INDEX"
    | "INDICATOR"
    | "MUTUAL_FUND"
    | "OPTION"
    | "UNKNOWN";
  bondFactor?: string;
  bondMultiplier?: string;
  bondPrice?: number;
  type?:
    | "BOND"
    | "EQUITY"
    | "ETF"
    | "EXTENDED"
    | "FOREX"
    | "FUTURE"
    | "FUTURE_OPTION"
    | "FUNDAMENTAL"
    | "INDEX"
    | "INDICATOR"
    | "MUTUAL_FUND"
    | "OPTION"
    | "UNKNOWN";
}

export interface FundamentalInst {
  symbol?: string;
  /** @format double */
  high52?: number;
  /** @format double */
  low52?: number;
  /** @format double */
  dividendAmount?: number;
  /** @format double */
  dividendYield?: number;
  dividendDate?: string;
  /** @format double */
  peRatio?: number;
  /** @format double */
  pegRatio?: number;
  /** @format double */
  pbRatio?: number;
  /** @format double */
  prRatio?: number;
  /** @format double */
  pcfRatio?: number;
  /** @format double */
  grossMarginTTM?: number;
  /** @format double */
  grossMarginMRQ?: number;
  /** @format double */
  netProfitMarginTTM?: number;
  /** @format double */
  netProfitMarginMRQ?: number;
  /** @format double */
  operatingMarginTTM?: number;
  /** @format double */
  operatingMarginMRQ?: number;
  /** @format double */
  returnOnEquity?: number;
  /** @format double */
  returnOnAssets?: number;
  /** @format double */
  returnOnInvestment?: number;
  /** @format double */
  quickRatio?: number;
  /** @format double */
  currentRatio?: number;
  /** @format double */
  interestCoverage?: number;
  /** @format double */
  totalDebtToCapital?: number;
  /** @format double */
  ltDebtToEquity?: number;
  /** @format double */
  totalDebtToEquity?: number;
  /** @format double */
  epsTTM?: number;
  /** @format double */
  epsChangePercentTTM?: number;
  /** @format double */
  epsChangeYear?: number;
  /** @format double */
  epsChange?: number;
  /** @format double */
  revChangeYear?: number;
  /** @format double */
  revChangeTTM?: number;
  /** @format double */
  revChangeIn?: number;
  /** @format double */
  sharesOutstanding?: number;
  /** @format double */
  marketCapFloat?: number;
  /** @format double */
  marketCap?: number;
  /** @format double */
  bookValuePerShare?: number;
  /** @format double */
  shortIntToFloat?: number;
  /** @format double */
  shortIntDayToCover?: number;
  /** @format double */
  divGrowthRate3Year?: number;
  /** @format double */
  dividendPayAmount?: number;
  dividendPayDate?: string;
  /** @format double */
  beta?: number;
  /** @format double */
  vol1DayAvg?: number;
  /** @format double */
  vol10DayAvg?: number;
  /** @format double */
  vol3MonthAvg?: number;
  /** @format int64 */
  avg10DaysVolume?: number;
  /** @format int64 */
  avg1DayVolume?: number;
  /** @format int64 */
  avg3MonthVolume?: number;
  declarationDate?: string;
  /** @format int32 */
  dividendFreq?: number;
  /** @format double */
  eps?: number;
  corpactionDate?: string;
  /** @format int64 */
  dtnVolume?: number;
  nextDividendPayDate?: string;
  nextDividendDate?: string;
  /** @format double */
  fundLeverageFactor?: number;
  fundStrategy?: string;
}

export interface Instrument {
  cusip?: string;
  symbol?: string;
  description?: string;
  exchange?: string;
  assetType?:
    | "BOND"
    | "EQUITY"
    | "ETF"
    | "EXTENDED"
    | "FOREX"
    | "FUTURE"
    | "FUTURE_OPTION"
    | "FUNDAMENTAL"
    | "INDEX"
    | "INDICATOR"
    | "MUTUAL_FUND"
    | "OPTION"
    | "UNKNOWN";
  type?:
    | "BOND"
    | "EQUITY"
    | "ETF"
    | "EXTENDED"
    | "FOREX"
    | "FUTURE"
    | "FUTURE_OPTION"
    | "FUNDAMENTAL"
    | "INDEX"
    | "INDICATOR"
    | "MUTUAL_FUND"
    | "OPTION"
    | "UNKNOWN";
}

export interface InstrumentResponse {
  cusip?: string;
  symbol?: string;
  description?: string;
  exchange?: string;
  assetType?:
    | "BOND"
    | "EQUITY"
    | "ETF"
    | "EXTENDED"
    | "FOREX"
    | "FUTURE"
    | "FUTURE_OPTION"
    | "FUNDAMENTAL"
    | "INDEX"
    | "INDICATOR"
    | "MUTUAL_FUND"
    | "OPTION"
    | "UNKNOWN";
  bondFactor?: string;
  bondMultiplier?: string;
  bondPrice?: number;
  fundamental?: FundamentalInst;
  instrumentInfo?: Instrument;
  bondInstrumentInfo?: Bond;
  type?:
    | "BOND"
    | "EQUITY"
    | "ETF"
    | "EXTENDED"
    | "FOREX"
    | "FUTURE"
    | "FUTURE_OPTION"
    | "FUNDAMENTAL"
    | "INDEX"
    | "INDICATOR"
    | "MUTUAL_FUND"
    | "OPTION"
    | "UNKNOWN";
}

export interface Hours {
  date?: string;
  marketType?:
    | "BOND"
    | "EQUITY"
    | "ETF"
    | "EXTENDED"
    | "FOREX"
    | "FUTURE"
    | "FUTURE_OPTION"
    | "FUNDAMENTAL"
    | "INDEX"
    | "INDICATOR"
    | "MUTUAL_FUND"
    | "OPTION"
    | "UNKNOWN";
  exchange?: string;
  category?: string;
  product?: string;
  productName?: string;
  isOpen?: boolean;
  sessionHours?: Record<string, Interval[]>;
}

export interface Interval {
  start?: string;
  end?: string;
}

/** Security info of most moved with in an index */
export interface Screener {
  /**
   * percent or value changed, by default its percent changed
   * @format double
   */
  change?: number;
  /** Name of security */
  description?: string;
  direction?: "up" | "down";
  /**
   * what was last quoted price
   * @format double
   */
  last?: number;
  /** schwab security symbol */
  symbol?: string;
  /** @format int64 */
  totalVolume?: number;
}

export interface Candle {
  /** @format double */
  close?: number;
  /** @format int64 */
  datetime?: number;
  /** @format yyyy-MM-dd */
  datetimeISO8601?: string;
  /** @format double */
  high?: number;
  /** @format double */
  low?: number;
  /** @format double */
  open?: number;
  /** @format int64 */
  volume?: number;
}

export interface CandleList {
  candles?: Candle[];
  empty?: boolean;
  /** @format double */
  previousClose?: number;
  /** @format int64 */
  previousCloseDate?: number;
  /** @format yyyy-MM-dd */
  previousCloseDateISO8601?: string;
  symbol?: string;
}

/** Quote info of Equity security */
export interface EquityResponse {
  /** Instrument's asset type */
  assetMainType?: AssetMainType.EQUITY;
  /** Asset Sub Type (only there if applicable) */
  assetSubType?: EquityAssetSubType;
  /**
   * SSID of instrument
   * @format int64
   * @example 1234567890
   */
  ssid?: number;
  /**
   * Symbol of instrument
   * @example "AAPL"
   */
  symbol?: string;
  /**
   * is quote realtime
   * @example true
   */
  realtime?: boolean;
  /** NBBO - realtime, NFL - Non-fee liable quote. */
  quoteType?: QuoteType;
  /** Quote data for extended hours */
  extended?: ExtendedMarket;
  /** Fundamentals of a security */
  fundamental?: Fundamental;
  /** Quote data of Equity security */
  quote?: QuoteEquity;
  /** Reference data of Equity security */
  reference?: ReferenceEquity;
  /** Market info of security */
  regular?: RegularMarket;
}

/** Partial or Custom errors per request */
export interface QuoteError {
  /** list of invalid cusips from request */
  invalidCusips?: string[];
  /** list of invalid SSIDs from request */
  invalidSSIDs?: number[];
  /** list of invalid symbols from request */
  invalidSymbols?: string[];
}

/** Quote data for extended hours */
export interface ExtendedMarket {
  /**
   * Extended market ask price
   * @format double
   * @example 124.85
   */
  askPrice?: number;
  /**
   * Extended market ask size
   * @format int32
   * @example 51771
   */
  askSize?: number;
  /**
   * Extended market bid price
   * @format double
   * @example 124.85
   */
  bidPrice?: number;
  /**
   * Extended market bid size
   * @format int32
   * @example 51771
   */
  bidSize?: number;
  /**
   * Extended market last price
   * @format double
   * @example 124.85
   */
  lastPrice?: number;
  /**
   * Regular market last size
   * @format int32
   * @example 51771
   */
  lastSize?: number;
  /**
   * mark price
   * @format double
   * @example 1.1246
   */
  mark?: number;
  /**
   * Extended market quote time in milliseconds since Epoch
   * @format int64
   * @example 1621368000400
   */
  quoteTime?: number;
  /**
   * Total volume
   * @format int64
   * @example 12345
   */
  totalVolume?: number;
  /**
   * Extended market trade time in milliseconds since Epoch
   * @format int64
   * @example 1621368000400
   */
  tradeTime?: number;
}

/** Quote info of Forex security */
export interface ForexResponse {
  /** Instrument's asset type */
  assetMainType?: AssetMainType.FOREX;
  /**
   * SSID of instrument
   * @format int64
   * @example 1234567890
   */
  ssid?: number;
  /**
   * Symbol of instrument
   * @example "AAPL"
   */
  symbol?: string;
  /**
   * is quote realtime
   * @example true
   */
  realtime?: boolean;
  /** Quote data of Forex security */
  quote?: QuoteForex;
  /** Reference data of Forex security */
  reference?: ReferenceForex;
}

/** Fundamentals of a security */
export interface Fundamental {
  /**
   * Average 10 day volume
   * @format double
   */
  avg10DaysVolume?: number;
  /**
   * Average 1 day volume
   * @format double
   */
  avg1YearVolume?: number;
  /**
   * Declaration date in yyyy-mm-ddThh:mm:ssZ
   * @format date-time
   * @pattern yyyy-MM-dd'T'HH:mm:ssZ
   * @example "2021-04-28T00:00:00Z"
   */
  declarationDate?: string;
  /**
   * Dividend Amount
   * @format double
   * @example 0.88
   */
  divAmount?: number;
  /**
   * Dividend date in yyyy-mm-ddThh:mm:ssZ
   * @format yyyy-MM-dd'T'HH:mm:ssZ
   * @example "2021-05-07T00:00:00Z"
   */
  divExDate?: string;
  /** Dividend frequency 1 – once a year or annually 2 – 2x a year or semi-annualy 3 - 3x a year (ex. ARCO, EBRPF) 4 – 4x a year or quarterly 6 - 6x per yr or every other month 11 – 11x a year (ex. FBND, FCOR) 12 – 12x a year or monthly */
  divFreq?: DivFreq;
  /**
   * Dividend Pay Amount
   * @format double
   * @example 0.22
   */
  divPayAmount?: number;
  /**
   * Dividend pay date in yyyy-mm-ddThh:mm:ssZ
   * @format date-time
   * @pattern yyyy-MM-dd'T'HH:mm:ssZ
   * @example "2021-05-13T00:00:00Z"
   */
  divPayDate?: string;
  /**
   * Dividend yield
   * @format double
   * @example 0.7
   */
  divYield?: number;
  /**
   * Earnings per Share
   * @format double
   * @example 4.45645
   */
  eps?: number;
  /**
   * Fund Leverage Factor + > 0 <-
   * @format double
   * @example -1
   */
  fundLeverageFactor?: number;
  /** FundStrategy "A" - Active "L" - Leveraged "P" - Passive "Q" - Quantitative "S" - Short */
  fundStrategy?: FundStrategy;
  /**
   * Next Dividend date
   * @format date-time
   * @pattern yyyy-MM-dd'T'HH:mm:ssZ
   * @example "2021-02-12T00:00:00Z"
   */
  nextDivExDate?: string;
  /**
   * Next Dividend pay date
   * @format date-time
   * @pattern yyyy-MM-dd'T'HH:mm:ssZ
   * @example "2021-02-12T00:00:00Z"
   */
  nextDivPayDate?: string;
  /**
   * P/E Ratio
   * @format double
   * @example 28.599
   */
  peRatio?: number;
}

/** Quote info of Future Option security */
export interface FutureOptionResponse {
  /** Instrument's asset type */
  assetMainType?: AssetMainType.FUTURE_OPTION;
  /**
   * SSID of instrument
   * @format int64
   * @example 1234567890
   */
  ssid?: number;
  /**
   * Symbol of instrument
   * @example "AAPL"
   */
  symbol?: string;
  /**
   * is quote realtime
   * @example true
   */
  realtime?: boolean;
  /** Quote data of Option security */
  quote?: QuoteFutureOption;
  /** Reference data of Future Option security */
  reference?: ReferenceFutureOption;
}

/** Quote info of Future security */
export interface FutureResponse {
  /** Instrument's asset type */
  assetMainType?: AssetMainType.FUTURE;
  /**
   * SSID of instrument
   * @format int64
   * @example 1234567890
   */
  ssid?: number;
  /**
   * Symbol of instrument
   * @example "AAPL"
   */
  symbol?: string;
  /**
   * is quote realtime
   * @example true
   */
  realtime?: boolean;
  /** Quote data of Future security */
  quote?: QuoteFuture;
  /** Reference data of Future security */
  reference?: ReferenceFuture;
}

/** Quote info of Index security */
export interface IndexResponse {
  /** Instrument's asset type */
  assetMainType?: AssetMainType.INDEX;
  /**
   * SSID of instrument
   * @format int64
   * @example 1234567890
   */
  ssid?: number;
  /**
   * Symbol of instrument
   * @example "AAPL"
   */
  symbol?: string;
  /**
   * is quote realtime
   * @example true
   */
  realtime?: boolean;
  /** Quote data of Index security */
  quote?: QuoteIndex;
  /** Reference data of Index security */
  reference?: ReferenceIndex;
}

/** Quote info of MutualFund security */
export interface MutualFundResponse {
  /** Instrument's asset type */
  assetMainType?: AssetMainType.MUTUAL_FUND;
  /** Asset Sub Type (only there if applicable) */
  assetSubType?: MutualFundAssetSubType;
  /**
   * SSID of instrument
   * @format int64
   * @example 1234567890
   */
  ssid?: number;
  /**
   * Symbol of instrument
   * @example "AAPL"
   */
  symbol?: string;
  /**
   * is quote realtime
   * @example true
   */
  realtime?: boolean;
  /** Fundamentals of a security */
  fundamental?: Fundamental;
  /** Quote data of Mutual Fund security */
  quote?: QuoteMutualFund;
  /** Reference data of MutualFund security */
  reference?: ReferenceMutualFund;
}

/** Quote info of Option security */
export interface OptionResponse {
  /** Instrument's asset type */
  assetMainType?: AssetMainType.OPTION;
  /**
   * SSID of instrument
   * @format int64
   * @example 1234567890
   */
  ssid?: number;
  /**
   * Symbol of instrument
   * @example "AAPL"
   */
  symbol?: string;
  /**
   * is quote realtime
   * @example true
   */
  realtime?: boolean;
  /** Quote data of Option security */
  quote?: QuoteOption;
  /** Reference data of Option security */
  reference?: ReferenceOption;
}

/** Quote data of Equity security */
export interface QuoteEquity {
  /**
   * Higest price traded in the past 12 months, or 52 weeks
   * @format double
   * @example 145.09
   */
  "52WeekHigh"?: number;
  /**
   * Lowest price traded in the past 12 months, or 52 weeks
   * @format double
   * @example 77.581
   */
  "52WeekLow"?: number;
  /**
   * ask MIC code
   * @example "XNYS"
   */
  askMICId?: string;
  /**
   * Current Best Ask Price
   * @format double
   * @example 124.63
   */
  askPrice?: number;
  /**
   * Number of shares for ask
   * @format int32
   * @example 700
   */
  askSize?: number;
  /**
   * Last ask time in milliseconds since Epoch
   * @format int64
   * @example 1621376892336
   */
  askTime?: number;
  /**
   * bid MIC code
   * @example "XNYS"
   */
  bidMICId?: string;
  /**
   * Current Best Bid Price
   * @format double
   * @example 124.6
   */
  bidPrice?: number;
  /**
   * Number of shares for bid
   * @format int32
   * @example 300
   */
  bidSize?: number;
  /**
   * Last bid time in milliseconds since Epoch
   * @format int64
   * @example 1621376892336
   */
  bidTime?: number;
  /**
   * Previous day's closing price
   * @format double
   * @example 126.27
   */
  closePrice?: number;
  /**
   * Day's high trade price
   * @format double
   * @example 126.99
   */
  highPrice?: number;
  /**
   * Last MIC Code
   * @example "XNYS"
   */
  lastMICId?: string;
  /**
   * @format double
   * @example 122.3
   */
  lastPrice?: number;
  /**
   * Number of shares traded with last trade
   * @format int32
   * @example 100
   */
  lastSize?: number;
  /**
   * Day's low trade price
   * @format double
   */
  lowPrice?: number;
  /**
   * Mark price
   * @format double
   * @example 52.93
   */
  mark?: number;
  /**
   * Mark Price change
   * @format double
   * @example -0.01
   */
  markChange?: number;
  /**
   * Mark Price percent change
   * @format double
   * @example -0.0189
   */
  markPercentChange?: number;
  /**
   * Current Last-Prev Close
   * @format double
   * @example -0.04
   */
  netChange?: number;
  /**
   * Net Percentage Change
   * @format double
   * @example -0.0756
   */
  netPercentChange?: number;
  /**
   * Price at market open
   * @format double
   * @example 52.8
   */
  openPrice?: number;
  /**
   * Last quote time in milliseconds since Epoch
   * @format int64
   * @example 1621376892336
   */
  quoteTime?: number;
  /**
   * Status of security
   * @example "Normal"
   */
  securityStatus?: string;
  /**
   * Aggregated shares traded throughout the day, including pre/post market hours.
   * @format int64
   * @example 20171188
   */
  totalVolume?: number;
  /**
   * Last trade time in milliseconds since Epoch
   * @format int64
   * @example 1621376731304
   */
  tradeTime?: number;
  /**
   * Option Risk/Volatility Measurement
   * @format double
   * @example 0.0094
   */
  volatility?: number;
}

/** Quote data of Forex security */
export interface QuoteForex {
  /**
   * Higest price traded in the past 12 months, or 52 weeks
   * @format double
   * @example 145.09
   */
  "52WeekHigh"?: number;
  /**
   * Lowest price traded in the past 12 months, or 52 weeks
   * @format double
   * @example 77.581
   */
  "52WeekLow"?: number;
  /**
   * Current Best Ask Price
   * @format double
   * @example 124.63
   */
  askPrice?: number;
  /**
   * Number of shares for ask
   * @format int32
   * @example 700
   */
  askSize?: number;
  /**
   * Current Best Bid Price
   * @format double
   * @example 124.6
   */
  bidPrice?: number;
  /**
   * Number of shares for bid
   * @format int32
   * @example 300
   */
  bidSize?: number;
  /**
   * Previous day's closing price
   * @format double
   * @example 126.27
   */
  closePrice?: number;
  /**
   * Day's high trade price
   * @format double
   * @example 126.99
   */
  highPrice?: number;
  /**
   * @format double
   * @example 122.3
   */
  lastPrice?: number;
  /**
   * Number of shares traded with last trade
   * @format int32
   * @example 100
   */
  lastSize?: number;
  /**
   * Day's low trade price
   * @format double
   * @example 52.74
   */
  lowPrice?: number;
  /**
   * Mark price
   * @format double
   * @example 52.93
   */
  mark?: number;
  /**
   * Current Last-Prev Close
   * @format double
   * @example -0.04
   */
  netChange?: number;
  /**
   * Net Percentage Change
   * @format double
   * @example -0.0756
   */
  netPercentChange?: number;
  /**
   * Price at market open
   * @format double
   * @example 52.8
   */
  openPrice?: number;
  /**
   * Last quote time in milliseconds since Epoch
   * @format int64
   * @example 1621376892336
   */
  quoteTime?: number;
  /**
   * Status of security
   * @example "Normal"
   */
  securityStatus?: string;
  /**
   * Tick Price
   * @format double
   * @example 0
   */
  tick?: number;
  /**
   * Tick Amount
   * @format double
   * @example 0
   */
  tickAmount?: number;
  /**
   * Aggregated shares traded throughout the day, including pre/post market hours.
   * @format int64
   * @example 20171188
   */
  totalVolume?: number;
  /**
   * Last trade time in milliseconds since Epoch
   * @format int64
   * @example 1621376731304
   */
  tradeTime?: number;
}

/** Quote data of Future security */
export interface QuoteFuture {
  /**
   * ask MIC code
   * @example "XNYS"
   */
  askMICId?: string;
  /**
   * Current Best Ask Price
   * @format double
   * @example 4083.25
   */
  askPrice?: number;
  /**
   * Number of shares for ask
   * @format int32
   * @example 36
   */
  askSize?: number;
  /**
   * Last ask time in milliseconds since Epoch
   * @format int64
   * @example 1621376892336
   */
  askTime?: number;
  /**
   * bid MIC code
   * @example "XNYS"
   */
  bidMICId?: string;
  /**
   * Current Best Bid Price
   * @format double
   * @example 4083
   */
  bidPrice?: number;
  /**
   * Number of shares for bid
   * @format int32
   * @example 18
   */
  bidSize?: number;
  /**
   * Last bid time in milliseconds since Epoch
   * @format int64
   * @example 1621376892336
   */
  bidTime?: number;
  /**
   * Previous day's closing price
   * @format double
   * @example 4123
   */
  closePrice?: number;
  /**
   * Net Percentage Change
   * @format double
   * @example -0.0756
   */
  futurePercentChange?: number;
  /**
   * Day's high trade price
   * @format double
   * @example 4123
   */
  highPrice?: number;
  /**
   * Last MIC Code
   * @example "XNYS"
   */
  lastMICId?: string;
  /**
   * @format double
   * @example 4083
   */
  lastPrice?: number;
  /**
   * Number of shares traded with last trade
   * @format int32
   * @example 7
   */
  lastSize?: number;
  /**
   * Day's low trade price
   * @format double
   * @example 4075.5
   */
  lowPrice?: number;
  /**
   * Mark price
   * @format double
   * @example 4083
   */
  mark?: number;
  /**
   * Current Last-Prev Close
   * @format double
   * @example -40
   */
  netChange?: number;
  /**
   * Open interest
   * @format int32
   * @example 2517139
   */
  openInterest?: number;
  /**
   * Price at market open
   * @format double
   * @example 4114
   */
  openPrice?: number;
  /**
   * Last quote time in milliseconds since Epoch
   * @format int64
   * @example 1621427004585
   */
  quoteTime?: number;
  /**
   * quoted during trading session
   * @example false
   */
  quotedInSession?: boolean;
  /**
   * Status of security
   * @example "Normal"
   */
  securityStatus?: string;
  /**
   * settlement time in milliseconds since Epoch
   * @format int64
   * @example 1621376892336
   */
  settleTime?: number;
  /**
   * Tick Price
   * @format double
   * @example 0.25
   */
  tick?: number;
  /**
   * Tick Amount
   * @format double
   * @example 12.5
   */
  tickAmount?: number;
  /**
   * Aggregated shares traded throughout the day, including pre/post market hours.
   * @format int64
   * @example 20171188
   */
  totalVolume?: number;
  /**
   * Last trade time in milliseconds since Epoch
   * @format int64
   * @example 1621376731304
   */
  tradeTime?: number;
}

/** Quote data of Option security */
export interface QuoteFutureOption {
  /**
   * ask MIC code
   * @example "XNYS"
   */
  askMICId?: string;
  /**
   * Current Best Ask Price
   * @format double
   * @example 124.63
   */
  askPrice?: number;
  /**
   * Number of shares for ask
   * @format int32
   * @example 700
   */
  askSize?: number;
  /**
   * bid MIC code
   * @example "XNYS"
   */
  bidMICId?: string;
  /**
   * Current Best Bid Price
   * @format double
   * @example 124.6
   */
  bidPrice?: number;
  /**
   * Number of shares for bid
   * @format int32
   * @example 300
   */
  bidSize?: number;
  /**
   * Previous day's closing price
   * @format double
   * @example 126.27
   */
  closePrice?: number;
  /**
   * Day's high trade price
   * @format double
   * @example 126.99
   */
  highPrice?: number;
  /**
   * Last MIC Code
   * @example "XNYS"
   */
  lastMICId?: string;
  /**
   * @format double
   * @example 122.3
   */
  lastPrice?: number;
  /**
   * Number of shares traded with last trade
   * @format int32
   * @example 100
   */
  lastSize?: number;
  /**
   * Day's low trade price
   * @format double
   * @example 52.74
   */
  lowPrice?: number;
  /**
   * Mark price
   * @format double
   * @example 52.93
   */
  mark?: number;
  /**
   * Mark Price change
   * @format double
   * @example -0.04
   */
  markChange?: number;
  /**
   * Current Last-Prev Close
   * @format double
   * @example -0.04
   */
  netChange?: number;
  /**
   * Net Percentage Change
   * @format double
   * @example -0.0756
   */
  netPercentChange?: number;
  /**
   * Open Interest
   * @format int32
   * @example 317
   */
  openInterest?: number;
  /**
   * Price at market open
   * @format double
   * @example 52.8
   */
  openPrice?: number;
  /**
   * Last quote time in milliseconds since Epoch
   * @format int64
   * @example 1621376892336
   */
  quoteTime?: number;
  /**
   * Status of security
   * @example "Normal"
   */
  securityStatus?: string;
  /**
   * Price at market open
   * @format double
   * @example 52.8
   */
  settlemetPrice?: number;
  /**
   * Tick Price
   * @format double
   * @example 0
   */
  tick?: number;
  /**
   * Tick Amount
   * @format double
   * @example 0
   */
  tickAmount?: number;
  /**
   * Aggregated shares traded throughout the day, including pre/post market hours.
   * @format int64
   * @example 20171188
   */
  totalVolume?: number;
  /**
   * Last trade time in milliseconds since Epoch
   * @format int64
   * @example 1621376731304
   */
  tradeTime?: number;
}

/** Quote data of Index security */
export interface QuoteIndex {
  /**
   * Higest price traded in the past 12 months, or 52 weeks
   * @format double
   * @example 145.09
   */
  "52WeekHigh"?: number;
  /**
   * Lowest price traded in the past 12 months, or 52 weeks
   * @format double
   * @example 77.581
   */
  "52WeekLow"?: number;
  /**
   * Previous day's closing price
   * @format double
   * @example 126.27
   */
  closePrice?: number;
  /**
   * Day's high trade price
   * @format double
   * @example 126.99
   */
  highPrice?: number;
  /**
   * @format double
   * @example 122.3
   */
  lastPrice?: number;
  /**
   * Day's low trade price
   * @format double
   * @example 52.74
   */
  lowPrice?: number;
  /**
   * Current Last-Prev Close
   * @format double
   * @example -0.04
   */
  netChange?: number;
  /**
   * Net Percentage Change
   * @format double
   * @example -0.0756
   */
  netPercentChange?: number;
  /**
   * Price at market open
   * @format double
   * @example 52.8
   */
  openPrice?: number;
  /**
   * Status of security
   * @example "Normal"
   */
  securityStatus?: string;
  /**
   * Aggregated shares traded throughout the day, including pre/post market hours.
   * @format int64
   * @example 20171188
   */
  totalVolume?: number;
  /**
   * Last trade time in milliseconds since Epoch
   * @format int64
   * @example 1621376731304
   */
  tradeTime?: number;
}

/** Quote data of Mutual Fund security */
export interface QuoteMutualFund {
  /**
   * Higest price traded in the past 12 months, or 52 weeks
   * @format double
   * @example 145.09
   */
  "52WeekHigh"?: number;
  /**
   * Lowest price traded in the past 12 months, or 52 weeks
   * @format double
   * @example 77.581
   */
  "52WeekLow"?: number;
  /**
   * @format double
   * @example 126.27
   */
  lastPrice?: number;
  /**
   * Previous day's closing price
   * @format double
   * @example 126.27
   */
  closePrice?: number;
  /**
   * Net Asset Value
   * @format double
   * @example 126.99
   */
  nAV?: number;
  /**
   * Current Last-Prev Close
   * @format double
   * @example -0.04
   */
  netChange?: number;
  /**
   * Net Percentage Change
   * @format double
   * @example -0.0756
   */
  netPercentChange?: number;
  /**
   * Status of security
   * @example "Normal"
   */
  securityStatus?: string;
  /**
   * Aggregated shares traded throughout the day, including pre/post market hours.
   * @format int64
   * @example 20171188
   */
  totalVolume?: number;
  /**
   * Last trade time in milliseconds since Epoch
   * @format int64
   * @example 1621376731304
   */
  tradeTime?: number;
}

/** Quote data of Option security */
export interface QuoteOption {
  /**
   * Higest price traded in the past 12 months, or 52 weeks
   * @format double
   * @example 145.09
   */
  "52WeekHigh"?: number;
  /**
   * Lowest price traded in the past 12 months, or 52 weeks
   * @format double
   * @example 77.581
   */
  "52WeekLow"?: number;
  /**
   * Current Best Ask Price
   * @format double
   * @example 124.63
   */
  askPrice?: number;
  /**
   * Number of shares for ask
   * @format int32
   * @example 700
   */
  askSize?: number;
  /**
   * Current Best Bid Price
   * @format double
   * @example 124.6
   */
  bidPrice?: number;
  /**
   * Number of shares for bid
   * @format int32
   * @example 300
   */
  bidSize?: number;
  /**
   * Previous day's closing price
   * @format double
   * @example 126.27
   */
  closePrice?: number;
  /**
   * Delta Value
   * @format double
   * @example -0.0407
   */
  delta?: number;
  /**
   * Gamma Value
   * @format double
   * @example 0.0001
   */
  gamma?: number;
  /**
   * Day's high trade price
   * @format double
   * @example 126.99
   */
  highPrice?: number;
  /**
   * Indicative Ask Price applicable only for Indicative Option Symbols
   * @format double
   * @example 126.99
   */
  indAskPrice?: number;
  /**
   * Indicative Bid Price applicable only for Indicative Option Symbols
   * @format double
   * @example 126.99
   */
  indBidPrice?: number;
  /**
   * Indicative Quote Time in milliseconds since Epoch applicable only for Indicative Option Symbols
   * @format int64
   * @example 126.99
   */
  indQuoteTime?: number;
  /**
   * Implied Yield
   * @format double
   * @example -0.0067
   */
  impliedYield?: number;
  /**
   * @format double
   * @example 122.3
   */
  lastPrice?: number;
  /**
   * Number of shares traded with last trade
   * @format int32
   * @example 100
   */
  lastSize?: number;
  /**
   * Day's low trade price
   * @format double
   * @example 52.74
   */
  lowPrice?: number;
  /**
   * Mark price
   * @format double
   * @example 52.93
   */
  mark?: number;
  /**
   * Mark Price change
   * @format double
   * @example -0.01
   */
  markChange?: number;
  /**
   * Mark Price percent change
   * @format double
   * @example -0.0189
   */
  markPercentChange?: number;
  /**
   * Money Intrinsic Value
   * @format double
   * @example -947.96
   */
  moneyIntrinsicValue?: number;
  /**
   * Current Last-Prev Close
   * @format double
   * @example -0.04
   */
  netChange?: number;
  /**
   * Net Percentage Change
   * @format double
   * @example -0.0756
   */
  netPercentChange?: number;
  /**
   * Open Interest
   * @format double
   * @example 317
   */
  openInterest?: number;
  /**
   * Price at market open
   * @format double
   * @example 52.8
   */
  openPrice?: number;
  /**
   * Last quote time in milliseconds since Epoch
   * @format int64
   * @example 1621376892336
   */
  quoteTime?: number;
  /**
   * Rho Value
   * @format double
   * @example -0.3732
   */
  rho?: number;
  /**
   * Status of security
   * @example "Normal"
   */
  securityStatus?: string;
  /**
   * Theoretical option Value
   * @format double
   * @example 12.275
   */
  theoreticalOptionValue?: number;
  /**
   * Theta Value
   * @format double
   * @example -0.315
   */
  theta?: number;
  /**
   * Time Value
   * @format double
   * @example 12.22
   */
  timeValue?: number;
  /**
   * Aggregated shares traded throughout the day, including pre/post market hours.
   * @format int64
   * @example 20171188
   */
  totalVolume?: number;
  /**
   * Last trade time in milliseconds since Epoch
   * @format int64
   * @example 1621376731304
   */
  tradeTime?: number;
  /**
   * Underlying Price
   * @format double
   * @example 3247.96
   */
  underlyingPrice?: number;
  /**
   * Vega Value
   * @format double
   * @example 1.4455
   */
  vega?: number;
  /**
   * Option Risk/Volatility Measurement
   * @format double
   * @example 0.0094
   */
  volatility?: number;
}

/** Request one or more quote data in POST body */
export interface QuoteRequest {
  /**
   * List of cusip, max of 500 of symbols+cusip+ssids
   * @example [808524680,594918104]
   */
  cusips?: string[];
  /**
   * comma separated list of nodes in each quote<br/> possible values are quote,fundamental,reference,extended,regular. Dont send this attribute for full response.
   * @example "quote,reference"
   */
  fields?: string;
  /**
   * List of Schwab securityid[SSID], max of 500 of symbols+cusip+ssids
   * @example [1516105793,34621523]
   */
  ssids?: number[];
  /**
   * List of symbols, max of 500 of symbols+cusip+ssids
   * @example ["MRAD","EATOF","EBIZ","AAPL","BAC","AAAHX","AAAIX","$DJI","$SPX","MVEN","SOBS","TOITF","CNSWF","AMZN  230317C01360000","DJX   231215C00290000","/ESH23","./ADUF23C0.55","AUD/CAD"]
   */
  symbols?: string[];
  /**
   * Get realtime quotes and skip entitlement check
   * @example true
   */
  realtime?: true | false;
  /**
   * Include indicative symbol quotes for all ETF symbols in request. If ETF symbol ABC is in request and indicative=true API will return quotes for ABC and its corresponding indicative quote for $ABC.IV
   * @example true
   */
  indicative?: true | false;
}

/** a (symbol, QuoteResponse) map. `SCHW`is an example key */
export type QuoteResponse = Record<string, QuoteResponseObject>;

export type QuoteResponseObject =
  | EquityResponse
  | OptionResponse
  | ForexResponse
  | FutureResponse
  | FutureOptionResponse
  | IndexResponse
  | MutualFundResponse
  | QuoteError;

/** Reference data of Equity security */
export interface ReferenceEquity {
  /**
   * CUSIP of Instrument
   * @example "A23456789"
   */
  cusip?: string;
  /**
   * Description of Instrument
   * @example "Apple Inc. - Common Stock"
   */
  description?: string;
  /**
   * Exchange Code
   * @example "q"
   */
  exchange?: string;
  /** Exchange Name */
  exchangeName?: string;
  /**
   * FSI Desc
   * @maxLength 50
   */
  fsiDesc?: string;
  /**
   * Hard to borrow quantity.
   * @format int32
   * @example 100
   */
  htbQuantity?: number;
  /**
   * Hard to borrow rate.
   * @format double
   * @example 4.5
   */
  htbRate?: number;
  /**
   * is Hard to borrow security.
   * @example false
   */
  isHardToBorrow?: boolean;
  /**
   * is shortable security.
   * @example false
   */
  isShortable?: boolean;
  /**
   * OTC Market Tier
   * @maxLength 10
   */
  otcMarketTier?: string;
}

/** Reference data of Forex security */
export interface ReferenceForex {
  /**
   * Description of Instrument
   * @example "Euro/USDollar Spot"
   */
  description?: string;
  /**
   * Exchange Code
   * @example "q"
   */
  exchange?: string;
  /** Exchange Name */
  exchangeName?: string;
  /**
   * is FOREX tradable
   * @example true
   */
  isTradable?: boolean;
  /** Market marker */
  marketMaker?: string;
  /**
   * Product name
   * @example null
   */
  product?: string;
  /** Trading hours */
  tradingHours?: string;
}

/** Reference data of Future security */
export interface ReferenceFuture {
  /**
   * Description of Instrument
   * @example "E-mini S&P 500 Index Futures,Jun-2021,ETH"
   */
  description?: string;
  /**
   * Exchange Code
   * @example "q"
   */
  exchange?: string;
  /** Exchange Name */
  exchangeName?: string;
  /**
   * Active symbol
   * @example "/ESM21"
   */
  futureActiveSymbol?: string;
  /**
   * Future expiration date in milliseconds since epoch
   * @format int64
   * @example 1623988800000
   */
  futureExpirationDate?: number;
  /**
   * Future is active
   * @example true
   */
  futureIsActive?: boolean;
  /**
   * Future multiplier
   * @format double
   * @example 50
   */
  futureMultiplier?: number;
  /**
   * Price format
   * @example "D,D"
   */
  futurePriceFormat?: string;
  /**
   * Future Settlement Price
   * @format double
   * @example 4123
   */
  futureSettlementPrice?: number;
  /**
   * Trading Hours
   * @example "GLBX(de=1640;0=-1700151515301600;1=r-17001515r15301600d-15551640;7=d-16401555)"
   */
  futureTradingHours?: string;
  /**
   * Futures product symbol
   * @example "/ES"
   */
  product?: string;
}

/** Reference data of Future Option security */
export interface ReferenceFutureOption {
  /** Indicates call or put */
  contractType?: ContractType;
  /**
   * Description of Instrument
   * @example "AMZN Aug 20 2021 2300 Put"
   */
  description?: string;
  /**
   * Exchange Code
   * @example "q"
   */
  exchange?: string;
  /** Exchange Name */
  exchangeName?: string;
  /**
   * Option multiplier
   * @format double
   * @example 100
   */
  multiplier?: number;
  /**
   * date of expiration in long
   * @format int64
   */
  expirationDate?: number;
  /** Style of expiration */
  expirationStyle?: string;
  /**
   * Strike Price
   * @format double
   * @example 2300
   */
  strikePrice?: number;
  /**
   * A company, index or fund name
   * @example "AMZN Aug 20 2021 2300 Put"
   */
  underlying?: string;
}

/** Reference data of Index security */
export interface ReferenceIndex {
  /**
   * Description of Instrument
   * @example "DOW JONES 30 INDUSTRIALS"
   */
  description?: string;
  /**
   * Exchange Code
   * @example "q"
   */
  exchange?: string;
  /** Exchange Name */
  exchangeName?: string;
}

/** Reference data of MutualFund security */
export interface ReferenceMutualFund {
  /**
   * CUSIP of Instrument
   * @example "A23456789"
   */
  cusip?: string;
  /**
   * Description of Instrument
   * @example "Apple Inc. - Common Stock"
   */
  description?: string;
  /**
   * Exchange Code
   * @default "m"
   */
  exchange?: string;
  /**
   * Exchange Name
   * @default "MUTUAL_FUND"
   */
  exchangeName?: string;
}

/** Reference data of Option security */
export interface ReferenceOption {
  /** Indicates call or put */
  contractType?: ContractType;
  /**
   * CUSIP of Instrument
   * @example "0AMZN.TK12300000"
   */
  cusip?: string;
  /**
   * Days to Expiration
   * @format int32
   * @example 94
   */
  daysToExpiration?: number;
  /**
   * Unit of trade
   * @example "$6024.37 cash in lieu of shares, 212 shares of AZN"
   */
  deliverables?: string;
  /**
   * Description of Instrument
   * @example "AMZN Aug 20 2021 2300 Put"
   */
  description?: string;
  /**
   * Exchange Code
   * @default "o"
   */
  exchange?: string;
  /** Exchange Name */
  exchangeName?: string;
  /** option contract exercise type America or European */
  exerciseType?: ExerciseType;
  /**
   * Expiration Day
   * @format int32
   * @min 1
   * @max 31
   * @example 20
   */
  expirationDay?: number;
  /**
   * Expiration Month
   * @format int32
   * @min 1
   * @max 12
   * @example 8
   */
  expirationMonth?: number;
  /** M for End Of Month Expiration Calendar Cycle. (To match the last business day of the month), Q for Quarterly expirations (last business day of the quarter month MAR/JUN/SEP/DEC), W for Weekly expiration (also called Friday Short Term Expirations) and S for Expires 3rd Friday of the month (also known as regular options). */
  expirationType?: ExpirationType;
  /**
   * Expiration Year
   * @format int32
   * @example 2021
   */
  expirationYear?: number;
  /**
   * Is this contract part of the Penny Pilot program
   * @example true
   */
  isPennyPilot?: boolean;
  /**
   * milliseconds since epoch
   * @format int64
   * @example 1629504000000
   */
  lastTradingDay?: number;
  /**
   * Option multiplier
   * @format double
   * @example 100
   */
  multiplier?: number;
  /** option contract settlement type AM or PM */
  settlementType?: SettlementType;
  /**
   * Strike Price
   * @format double
   * @example 2300
   */
  strikePrice?: number;
  /**
   * A company, index or fund name
   * @example "AMZN Aug 20 2021 2300 Put"
   */
  underlying?: string;
}

/** Market info of security */
export interface RegularMarket {
  /**
   * Regular market last price
   * @format double
   * @example 124.85
   */
  regularMarketLastPrice?: number;
  /**
   * Regular market last size
   * @format int32
   * @example 51771
   */
  regularMarketLastSize?: number;
  /**
   * Regular market net change
   * @format double
   * @example -1.42
   */
  regularMarketNetChange?: number;
  /**
   * Regular market percent change
   * @format double
   * @example -1.1246
   */
  regularMarketPercentChange?: number;
  /**
   * Regular market trade time in milliseconds since Epoch
   * @format int64
   * @example 1621368000400
   */
  regularMarketTradeTime?: number;
}

/** Instrument's asset type */
export enum AssetMainType {
  BOND = "BOND",
  EQUITY = "EQUITY",
  FOREX = "FOREX",
  FUTURE = "FUTURE",
  FUTURE_OPTION = "FUTURE_OPTION",
  INDEX = "INDEX",
  MUTUAL_FUND = "MUTUAL_FUND",
  OPTION = "OPTION",
}

/** Asset Sub Type (only there if applicable) */
export enum EquityAssetSubType {
  COE = "COE",
  PRF = "PRF",
  ADR = "ADR",
  GDR = "GDR",
  CEF = "CEF",
  ETF = "ETF",
  ETN = "ETN",
  UIT = "UIT",
  WAR = "WAR",
  RGT = "RGT",
}

/** Asset Sub Type (only there if applicable) */
export enum MutualFundAssetSubType {
  OEF = "OEF",
  CEF = "CEF",
  MMF = "MMF",
}

/** Indicates call or put */
export enum ContractType {
  P = "P",
  C = "C",
}

/** option contract settlement type AM or PM */
export enum SettlementType {
  A = "A",
  P = "P",
}

/** M for End Of Month Expiration Calendar Cycle. (To match the last business day of the month), Q for Quarterly expirations (last business day of the quarter month MAR/JUN/SEP/DEC), W for Weekly expiration (also called Friday Short Term Expirations) and S for Expires 3rd Friday of the month (also known as regular options). */
export enum ExpirationType {
  M = "M",
  Q = "Q",
  S = "S",
  W = "W",
}

/** FundStrategy "A" - Active "L" - Leveraged "P" - Passive "Q" - Quantitative "S" - Short */
export enum FundStrategy {
  A = "A",
  L = "L",
  P = "P",
  Q = "Q",
  S = "S",
}

/** option contract exercise type America or European */
export enum ExerciseType {
  A = "A",
  E = "E",
}

/** Dividend frequency 1 – once a year or annually 2 – 2x a year or semi-annualy 3 - 3x a year (ex. ARCO, EBRPF) 4 – 4x a year or quarterly 6 - 6x per yr or every other month 11 – 11x a year (ex. FBND, FCOR) 12 – 12x a year or monthly */
export enum DivFreq {
  Value1 = 1,
  Value2 = 2,
  Value3 = 3,
  Value4 = 4,
  Value6 = 6,
  Value11 = 11,
  Value12 = 12,
}

/** NBBO - realtime, NFL - Non-fee liable quote. */
export enum QuoteType {
  NBBO = "NBBO",
  NFL = "NFL",
}

export interface ErrorResponse {
  errors?: Error[];
}

export interface Error {
  /**
   * Unique error id.
   * @format uuid
   * @example "9821320c-8500-4edf-bd46-a9299c13d2e0"
   */
  id?: string;
  /**
   * The HTTP status code .
   * @example "400"
   */
  status?: "400" | "401" | "404" | "500";
  /**
   * Short error description.
   * @example "Missing header"
   */
  title?: string;
  /**
   * Detailed error description.
   * @example "Search combination should not exceed 500."
   */
  detail?: string;
  /** Who is responsible for triggering these errors. */
  source?: ErrorSource;
}

/** Who is responsible for triggering these errors. */
export interface ErrorSource {
  /**
   * list of attributes which lead to this error message.
   * @example ["/data/attributes/symbols","/data/attributes/cusips","/data/attributes/ssids"]
   */
  pointer?: string[];
  /**
   * parameter name which lead to this error message.
   * @example "fields"
   */
  parameter?: string;
  /**
   * header name which lead to this error message.
   * @example "Schwab-Client-CorrelId"
   */
  header?: string;
}

export interface OptionChain {
  symbol?: string;
  status?: string;
  underlying?: Underlying;
  strategy?:
    | "SINGLE"
    | "ANALYTICAL"
    | "COVERED"
    | "VERTICAL"
    | "CALENDAR"
    | "STRANGLE"
    | "STRADDLE"
    | "BUTTERFLY"
    | "CONDOR"
    | "DIAGONAL"
    | "COLLAR"
    | "ROLL";
  /** @format double */
  interval?: number;
  isDelayed?: boolean;
  isIndex?: boolean;
  /** @format double */
  daysToExpiration?: number;
  /** @format double */
  interestRate?: number;
  /** @format double */
  underlyingPrice?: number;
  /** @format double */
  volatility?: number;
  callExpDateMap?: Record<string, OptionContractMap>;
  putExpDateMap?: Record<string, OptionContractMap>;
}

export type OptionContractMap = Record<string, OptionContract[]>;

export interface Underlying {
  /** @format double */
  ask?: number;
  /** @format int32 */
  askSize?: number;
  /** @format double */
  bid?: number;
  /** @format int32 */
  bidSize?: number;
  /** @format double */
  change?: number;
  /** @format double */
  close?: number;
  delayed?: boolean;
  description?: string;
  exchangeName?: "IND" | "ASE" | "NYS" | "NAS" | "NAP" | "PAC" | "OPR" | "BATS";
  /** @format double */
  fiftyTwoWeekHigh?: number;
  /** @format double */
  fiftyTwoWeekLow?: number;
  /** @format double */
  highPrice?: number;
  /** @format double */
  last?: number;
  /** @format double */
  lowPrice?: number;
  /** @format double */
  mark?: number;
  /** @format double */
  markChange?: number;
  /** @format double */
  markPercentChange?: number;
  /** @format double */
  openPrice?: number;
  /** @format double */
  percentChange?: number;
  /** @format int64 */
  quoteTime?: number;
  symbol?: string;
  /** @format int64 */
  totalVolume?: number;
  /** @format int64 */
  tradeTime?: number;
}

export interface OptionDeliverables {
  symbol?: string;
  assetType?: string;
  deliverableUnits?: string;
  currencyType?: string;
}

export interface OptionContract {
  putCall?: "PUT" | "CALL";
  symbol?: string;
  description?: string;
  exchangeName?: string;
  /** @format double */
  bid?: number;
  /** @format double */
  ask?: number;
  /** @format double */
  last?: number;
  /** @format double */
  mark?: number;
  /** @format int32 */
  bidSize?: number;
  /** @format int32 */
  askSize?: number;
  bidAskSize?: string;
  /** @format int32 */
  lastSize?: number;
  /** @format double */
  highPrice?: number;
  /** @format double */
  lowPrice?: number;
  /** @format double */
  openPrice?: number;
  /** @format double */
  closePrice?: number;
  /** @format int32 */
  totalVolume?: number;
  /** @format integer */
  tradeDate?: number;
  /** @format int32 */
  quoteTimeInLong?: number;
  /** @format int32 */
  tradeTimeInLong?: number;
  /** @format double */
  netChange?: number;
  /** @format double */
  volatility?: number;
  /** @format double */
  delta?: number;
  /** @format double */
  gamma?: number;
  /** @format double */
  theta?: number;
  /** @format double */
  vega?: number;
  /** @format double */
  rho?: number;
  /** @format double */
  timeValue?: number;
  /** @format double */
  openInterest?: number;
  isInTheMoney?: boolean;
  /** @format double */
  theoreticalOptionValue?: number;
  /** @format double */
  theoreticalVolatility?: number;
  isMini?: boolean;
  isNonStandard?: boolean;
  optionDeliverablesList?: OptionDeliverables[];
  /** @format double */
  strikePrice?: number;
  expirationDate?: string;
  /** @format int */
  daysToExpiration?: number;
  /** M for End Of Month Expiration Calendar Cycle. (To match the last business day of the month), Q for Quarterly expirations (last business day of the quarter month MAR/JUN/SEP/DEC), W for Weekly expiration (also called Friday Short Term Expirations) and S for Expires 3rd Friday of the month (also known as regular options). */
  expirationType?: ExpirationType;
  /** @format long */
  lastTradingDay?: number;
  /** @format double */
  multiplier?: number;
  /** option contract settlement type AM or PM */
  settlementType?: SettlementType;
  deliverableNote?: string;
  isIndexOption?: boolean;
  /** @format double */
  percentChange?: number;
  /** @format double */
  markChange?: number;
  /** @format double */
  markPercentChange?: number;
  isPennyPilot?: boolean;
  /** @format double */
  intrinsicValue?: number;
  optionRoot?: string;
}

export interface ExpirationChain {
  status?: string;
  expirationList?: Expiration[];
}

/** expiration type */
export interface Expiration {
  /** @format int32 */
  daysToExpiration?: number;
  expiration?: string;
  /** M for End Of Month Expiration Calendar Cycle. (To match the last business day of the month), Q for Quarterly expirations (last business day of the quarter month MAR/JUN/SEP/DEC), W for Weekly expiration (also called Friday Short Term Expirations) and S for Expires 3rd Friday of the month (also known as regular options). */
  expirationType?: ExpirationType;
  standard?: boolean;
  /** option contract settlement type AM or PM */
  settlementType?: SettlementType;
  optionRoots?: string;
}
