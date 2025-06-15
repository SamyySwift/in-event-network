
export type CurrencyCode = "NGN" | "GBP" | "USD" | "EUR" | "INR";

export interface RegionCurrencyConfig {
  currency: CurrencyCode;
  symbol: string;
  price: number;
  name: string;
}

export const RegionPricing: Record<string, RegionCurrencyConfig> = {
  NG: { currency: "NGN", symbol: "₦", price: 30000, name: "Nigerian Naira" },
  GB: { currency: "GBP", symbol: "£", price: 35, name: "British Pound" },
  US: { currency: "USD", symbol: "$", price: 45, name: "US Dollar" },
  EU: { currency: "EUR", symbol: "€", price: 40, name: "Euro" },
  IN: { currency: "INR", symbol: "₹", price: 3500, name: "Indian Rupee" },
};

// Default fallback
export const DefaultPricing: RegionCurrencyConfig = {
  currency: "USD",
  symbol: "$",
  price: 45,
  name: "US Dollar",
};

export function getRegionPricing(countryCode?: string): RegionCurrencyConfig {
  // Map "GB" to UK, "NG" to Nigeria, etc. and group EU countries as "EU"
  if (!countryCode) return DefaultPricing;
  if (countryCode === "NG") return RegionPricing["NG"];
  if (countryCode === "GB") return RegionPricing["GB"];
  if (countryCode === "US") return RegionPricing["US"];
  if (["DE","FR","IT","ES","NL","BE","FI","SE","DK","IE","PT","AT","GR","LU","MT","CY","EE","LV","LT","SK","SI","CZ","PL","HR","HU","BG","RO"].includes(countryCode))
    return RegionPricing["EU"];
  if (countryCode === "IN") return RegionPricing["IN"];
  return DefaultPricing;
}
