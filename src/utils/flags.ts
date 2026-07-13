const CURRENCY_TO_COUNTRY: Record<string, string> = {
  AUD: "au",
  BGN: "bg",
  BRL: "br",
  CAD: "ca",
  CHF: "ch",
  CNY: "cn",
  CZK: "cz",
  DKK: "dk",
  EUR: "eu",
  GBP: "gb",
  HKD: "hk",
  HUF: "hu",
  IDR: "id",
  ILS: "il",
  INR: "in",
  ISK: "is",
  JPY: "jp",
  KRW: "kr",
  MXN: "mx",
  MYR: "my",
  NOK: "no",
  NZD: "nz",
  PHP: "ph",
  PLN: "pl",
  RON: "ro",
  SEK: "se",
  SGD: "sg",
  THB: "th",
  TRY: "tr",
  USD: "us",
  ZAR: "za",
};

/**
 * Returns the resolved URL of the flag webp image for a given currency code.
 * Uses Vite's dynamic asset resolution mechanism.
 * Falls back to a placeholder if the flag image doesn't exist.
 */
export function getFlagUrl(currencyCode: string): string {
  try {
    const countryCode = CURRENCY_TO_COUNTRY[currencyCode.toUpperCase()] || currencyCode.substring(0, 2).toLowerCase();
    return new URL(`../assets/images/flags/${countryCode}.webp`, import.meta.url).href;
  } catch (error) {
    console.warn(`Flag image not found for currency: ${currencyCode}`);
    // Return a placeholder or empty string to prevent page break
    return '';
  }
}
