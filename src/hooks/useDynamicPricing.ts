
import { useEffect, useState } from "react";
import { DefaultPricing, getRegionPricing, RegionCurrencyConfig } from "@/lib/currencyConfig";
import { getCountryCodeFromIP } from "@/lib/locationService";

export function useDynamicPricing() {
  const [pricing, setPricing] = useState<RegionCurrencyConfig>(DefaultPricing);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancel = false;
    async function fetchAndSet() {
      try {
        // Cache country code in localStorage to avoid excessive lookups
        let cached = localStorage.getItem("country_code");
        if (!cached) {
          const code = await getCountryCodeFromIP();
          if (code) {
            cached = code;
            localStorage.setItem("country_code", code);
          }
        }
        if (!cancel) {
          setPricing(getRegionPricing(cached || undefined));
        }
      } finally {
        if (!cancel) setLoading(false);
      }
    }
    fetchAndSet();
    return () => {
      cancel = true;
    };
  }, []);

  return {
    loading,
    ...pricing
  };
}
