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
  const data = await response.json();
  
  // Handle both old format (object) and new format (array)
  if (Array.isArray(data)) {
    // New format: array of { iso_code, name } objects
    const map: CurrencyMap = {};
    data.forEach((item: { iso_code: string; name: string }) => {
      map[item.iso_code] = item.name;
    });
    return map;
  }
  
  // Old format: object with code as key and name as value
  return data;
}

/**
 * Fetches the latest exchange rates for a given base currency.
 * The new API returns an array of rate objects.
 * Endpoint: GET /v2/rates?base=USD
 */
export async function fetchLatestRates(base: string, symbols?: string[]): Promise<LatestRatesResponse> {
  const url = `${BASE_URL}/rates?base=${base}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch latest rates for base: ${base}`);
  }
  
  const data = await response.json();
  
  // The API returns an array of rate objects
  if (Array.isArray(data)) {
    const rates: Record<string, number> = {};
    data.forEach((item: { quote: string; rate: number }) => {
      rates[item.quote] = item.rate;
    });
    
    // Filter by symbols if provided
    if (symbols && symbols.length > 0) {
      const filtered: Record<string, number> = {};
      symbols.forEach((symbol) => {
        if (rates[symbol]) {
          filtered[symbol] = rates[symbol];
        }
      });
      return { rates: filtered, base, date: data[0]?.date };
    }
    
    return { rates, base, date: data[0]?.date };
  }
  
  // Fallback for old format
  return data;
}

/**
 * Fetches historical rate time-series for a single currency pair over a range.
 * Endpoint: GET /v2/{start}..{end}?base=USD&quote=EUR
 */
export async function fetchRateHistory(
  base: string,
  target: string,
  startDate: string,
  endDate: string
): Promise<HistoricalRatesResponse> {
  const url = `${BASE_URL}/${startDate}..${endDate}?base=${base}&quote=${target}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch rate history for ${base}/${target} from ${startDate} to ${endDate}`);
  }
  
  const data = await response.json();
  
  // The API returns an array of rate objects by date
  if (Array.isArray(data)) {
    const rates: Record<string, Record<string, number>> = {};
    data.forEach((item: { date: string; rate: number; quote: string }) => {
      if (!rates[item.date]) {
        rates[item.date] = {};
      }
      rates[item.date][item.quote] = item.rate;
    });
    return { rates, base, start_date: startDate, end_date: endDate };
  }
  
  // Fallback for old format
  return data;
}
