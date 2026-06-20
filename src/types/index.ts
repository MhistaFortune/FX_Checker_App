export interface Currency {
  code: string;
  name: string;
}

export type CurrencyMap = Record<string, string>;

export interface Rates {
  [currencyCode: string]: number;
}

export interface LatestRatesResponse {
  amount: number;
  base: string;
  date: string;
  rates: Rates;
}

export interface HistoricalRatesResponse {
  amount: number;
  base: string;
  start_date: string;
  end_date: string;
  rates: {
    [dateString: string]: Rates;
  };
}

export interface PinnedPair {
  from: string;
  to: string;
}

export interface ConversionLogEntry {
  id: string;
  timestamp: number; // epoch ms
  from: string;
  to: string;
  amount: number;
  result: number;
}

export interface TickerItem {
  from: string;
  to: string;
  rate: number;
  change24h: number; // percentage change, e.g., +1.25 or -0.5
}
