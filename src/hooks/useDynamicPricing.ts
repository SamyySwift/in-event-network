
import { useEffect, useState, useCallback } from "react";
import { DefaultPricing, getRegionPricing, RegionCurrencyConfig, RegionPricing } from "@/lib/currencyConfig";
import { getCountryCodeFromIP } from "@/lib/locationService";

const PREFERRED_CURRENCY_KEY = "preferred_currency";

/** Returns hook for dynamic region-based pricing, with manual override. */
export function useDynamicPricing() {
  const [pricing, setPricing] = useState<RegionCurrencyConfig>(DefaultPricing);
  const [loading, setLoading] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState<string | undefined>(undefined);

  // Manual setter for currency code
  const setCurrency = useCallback((currencyCode: string) => {
    localStorage.setItem(PREFERRED_CURRENCY_KEY, currencyCode);
    setSelectedCurrency(currencyCode);
    // update pricing according to manual selection
    setPricing(RegionPricing[currencyCode] || DefaultPricing);
  }, []);

  useEffect(() => {
    let cancel = false;
    async function fetchAndSet() {
      setLoading(true);

      // 1. Manual selection takes priority (from localStorage)
      let preferred = localStorage.getItem(PREFERRED_CURRENCY_KEY);
      if (preferred && RegionPricing[preferred]) {
        setPricing(RegionPricing[preferred]);
        setSelectedCurrency(preferred);
        setLoading(false);
        return;
      }

      // 2. Look for country code cache
      let cached = localStorage.getItem("country_code");
      let code = cached;
      if (!code) {
        code = await getCountryCodeFromIP();
        if (code) {
          cached = code;
          localStorage.setItem("country_code", code);
        }
      }

      // 3. Map country code to region currency
      let region = code ? getRegionPricing(code) : DefaultPricing;

      if (!cancel) {
        setPricing(region);
        setSelectedCurrency(region.currency);
        setLoading(false);
      }
    }
    fetchAndSet();
    return () => {
      cancel = true;
    };
  }, []);

  return {
    loading,
    ...pricing,
    selectedCurrency,
    setCurrency,
    allCurrencies: Object.values(RegionPricing),
  };
}
