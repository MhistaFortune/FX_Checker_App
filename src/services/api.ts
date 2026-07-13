import type { CurrencyMap, LatestRatesResponse, HistoricalRatesResponse } from '../types';
import { CURRENCY_NAMES } from '../data/currencies';

const FRANKFURTER_BASE_URL = "https://api.frankfurter.dev/v1";
const EXCHANGERATE_API_BASE_URL = "https://v6.exchangerate-api.com/v6/f91191ce7f7769d419576ae6";

// Currencies supported by Frankfurter
const FRANKFURTER_SUPPORTED_CURRENCIES = new Set([
  "AUD", "BGN", "BRL", "CAD", "CHF", "CNY", "CZK", "DKK", "EUR", "GBP",
  "HKD", "HUF", "IDR", "ILS", "INR", "ISK", "JPY", "KRW", "MXN", "MYR",
  "NOK", "NZD", "PHP", "PLN", "RON", "SEK", "SGD", "THB", "TRY", "USD", "ZAR"
]);

/**
 * Checks if a currency is supported by Frankfurter
 */
export function isSupportedByFrankfurter(currencyCode: string): boolean {
  return FRANKFURTER_SUPPORTED_CURRENCIES.has(currencyCode.toUpperCase());
}

/**
 * Fetches currency codes from ExchangeRate-API using USD as base
 */
async function fetchExchangeRateCurrencies(): Promise<string[]> {
  try {
    const response = await fetch(`${EXCHANGERATE_API_BASE_URL}/latest/USD`);
    if (!response.ok) throw new Error('Failed to fetch ExchangeRate-API currencies');
    const data = await response.json();
    if (data.result !== 'success') throw new Error(data['error-type']);
    return Object.keys(data.conversion_rates);
  } catch (error) {
    console.error(error);
    return [];
  }
}

/**
 * Fetches the dictionary of all supported currencies.
 * Combines Frankfurter's currency names with ExchangeRate-API's currency codes.
 */
export async function fetchCurrencies(): Promise<CurrencyMap> {
  try {
    // Fetch both datasets in parallel
    const [frankfurterCurrencies, exchangeRateCodes] = await Promise.all([
      fetchFrankfurterCurrencies(),
      fetchExchangeRateCurrencies(),
    ]);

    // Merge them together, using Frankfurter's name if available, then our CURRENCY_NAMES, then "Unknown Currency"
    const mergedCurrencies: CurrencyMap = {};
    for (const code of exchangeRateCodes) {
      mergedCurrencies[code] = 
        frankfurterCurrencies[code] || 
        CURRENCY_NAMES[code] || 
        'Unknown Currency';
    }

    return mergedCurrencies;
  } catch (error) {
    console.error('Failed to fetch combined currency list:', error);
    // Fallback to just Frankfurter currencies if anything fails
    return fetchFrankfurterCurrencies();
  }
}

/**
 * Fetches currencies from Frankfurter
 */
async function fetchFrankfurterCurrencies(): Promise<CurrencyMap> {
  try {
    const response = await fetch(`${FRANKFURTER_BASE_URL}/currencies`);
    if (!response.ok) throw new Error('Failed to fetch Frankfurter currencies');
    return response.json();
  } catch (error) {
    console.error(error);
    return {};
  }
}

/**
 * Fetches the latest exchange rates for a given base currency.
 * Option to filter rates by target symbols list.
 */
export async function fetchLatestRates(base: string, symbols?: string[]): Promise<LatestRatesResponse> {
  // Check if base is supported by Frankfurter AND all symbols are also supported by Frankfurter
  const allUseFrankfurter = isSupportedByFrankfurter(base) &&
    (!symbols || symbols.every(symbol => isSupportedByFrankfurter(symbol)));

  if (allUseFrankfurter) {
    try {
      return await fetchFrankfurterLatestRates(base, symbols);
    } catch (error) {
      console.warn("Frankfurter failed, falling back to ExchangeRate-API", error);
    }
  }

  // Fallback to ExchangeRate-API
  return await fetchExchangeRateLatestRates(base, symbols);
}

/**
 * Fetches latest rates from Frankfurter
 */
async function fetchFrankfurterLatestRates(base: string, symbols?: string[]): Promise<LatestRatesResponse> {
  let url = `${FRANKFURTER_BASE_URL}/latest?base=${base}`;
  if (symbols && symbols.length > 0) {
    url += `&symbols=${symbols.join(',')}`;
  }
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch Frankfurter latest rates for base: ${base}`);
  }
  return response.json();
}

/**
 * Fetches latest rates from ExchangeRate-API
 */
async function fetchExchangeRateLatestRates(base: string, symbols?: string[]): Promise<LatestRatesResponse> {
  const url = `${EXCHANGERATE_API_BASE_URL}/latest/${base}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ExchangeRate-API latest rates for base: ${base}`);
  }
  const data = await response.json();
  if (data.result !== 'success') throw new Error(data['error-type']);

  // Convert ExchangeRate-API format to our LatestRatesResponse
  return {
    amount: 1,
    base: data.base_code,
    date: data.time_last_update_utc?.split(' ')[0] || new Date().toISOString().split('T')[0],
    rates: symbols ? 
      Object.fromEntries(Object.entries(data.conversion_rates).filter(([key]) => symbols.includes(key))) :
      data.conversion_rates
  };
}

/**
 * Fetches historical rate time-series for a single currency pair over a range.
 */
export async function fetchRateHistory(
  base: string,
  target: string,
  startDate: string,
  endDate: string
): Promise<HistoricalRatesResponse> {
  // Check if both currencies are supported by Frankfurter
  const bothUseFrankfurter = isSupportedByFrankfurter(base) && isSupportedByFrankfurter(target);

  if (bothUseFrankfurter) {
    try {
      return await fetchFrankfurterRateHistory(base, target, startDate, endDate);
    } catch (error) {
      console.warn("Frankfurter history failed, falling back to ExchangeRate-API (note: history requires Pro plan)", error);
    }
  }

  // Fallback - note: ExchangeRate-API free plan doesn't support historical data
  throw new Error("Historical data requires ExchangeRate-API Pro plan, or use Frankfurter-supported currencies");
}

/**
 * Fetches rate history from Frankfurter
 */
async function fetchFrankfurterRateHistory(
  base: string,
  target: string,
  startDate: string,
  endDate: string
): Promise<HistoricalRatesResponse> {
  const url = `${FRANKFURTER_BASE_URL}/${startDate}..${endDate}?base=${base}&symbols=${target}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch Frankfurter rate history for ${base}/${target}`);
  }
  return response.json();
}

/**
 * Fetches the latest exchange rates for a specific date in history.
 */
export async function fetchRatesForDate(
  date: string,
  base: string,
  symbols?: string[]
): Promise<LatestRatesResponse> {
  const allUseFrankfurter = isSupportedByFrankfurter(base) &&
    (!symbols || symbols.every(symbol => isSupportedByFrankfurter(symbol)));

  if (allUseFrankfurter) {
    try {
      return await fetchFrankfurterRatesForDate(date, base, symbols);
    } catch (error) {
      console.warn("Frankfurter historical rates failed", error);
    }
  }

  throw new Error("Historical rates for this date requires ExchangeRate-API Pro plan");
}

async function fetchFrankfurterRatesForDate(
  date: string,
  base: string,
  symbols?: string[]
): Promise<LatestRatesResponse> {
  let url = `${FRANKFURTER_BASE_URL}/${date}?base=${base}`;
  if (symbols && symbols.length > 0) {
    url += `&symbols=${symbols.join(',')}`;
  }
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch Frankfurter rates for date ${date}`);
  }
  return response.json();
}

// Expose for testing
if (typeof window !== 'undefined') {
  (window as any).fetchFrankfurterLatestRates = fetchFrankfurterLatestRates;
  (window as any).fetchExchangeRateLatestRates = fetchExchangeRateLatestRates;
  (window as any).fetchLatestRates = fetchLatestRates;
}
