import type { CurrencyMap, LatestRatesResponse, HistoricalRatesResponse } from '../types';

const BASE_URL = 'https://api.frankfurter.dev/v2';

/**
 * Fetches the dictionary of all supported currencies.
 * Endpoint: GET /v2/currencies
 * Returns: Record<string, string> (e.g. { "USD": "United States Dollar", "EUR": "Euro" })
 */
export async function fetchCurrencies(): Promise<CurrencyMap> {
  const response = await fetch(`${BASE_URL}/currencies`);
  if (!response.ok) {
    throw new Error('Failed to fetch currencies list');
  }
  return response.json();
}

/**
 * Fetches the latest exchange rates for a given base currency.
 * Option to filter rates by target symbols list.
 * Endpoint: GET /v2/latest?base=USD[&symbols=EUR,GBP]
 */
export async function fetchLatestRates(base: string, symbols?: string[]): Promise<LatestRatesResponse> {
  let url = `${BASE_URL}/latest?base=${base}`;
  if (symbols && symbols.length > 0) {
    url += `&symbols=${symbols.join(',')}`;
  }
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch latest rates for base: ${base}`);
  }
  return response.json();
}

/**
 * Fetches historical rate time-series for a single currency pair over a range.
 * Endpoint: GET /v2/{start}..{end}?base=USD&symbols=EUR
 */
export async function fetchRateHistory(
  base: string,
  target: string,
  startDate: string,
  endDate: string
): Promise<HistoricalRatesResponse> {
  const url = `${BASE_URL}/${startDate}..${endDate}?base=${base}&symbols=${target}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch rate history for ${base}/${target} from ${startDate} to ${endDate}`);
  }
  return response.json();
}
