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
 */
export function getFlagUrl(currencyCode: string): string {
  const countryCode = CURRENCY_TO_COUNTRY[currencyCode.toUpperCase()] || currencyCode.substring(0, 2).toLowerCase();
  return new URL(`../assets/images/flags/${countryCode}.webp`, import.meta.url).href;
}
