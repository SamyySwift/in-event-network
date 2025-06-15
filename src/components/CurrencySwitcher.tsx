
import React from "react";
import { Globe } from "lucide-react";
import { RegionCurrencyConfig, RegionPricing } from "@/lib/currencyConfig";

type CurrencySwitcherProps = {
  value: string;
  onChange: (currency: string) => void;
  availableCurrencies?: RegionCurrencyConfig[];
  className?: string;
};

const CURRENCY_FLAGS: Record<string, string> = {
  NGN: "🇳🇬",
  GBP: "🇬🇧",
  USD: "🇺🇸",
  EUR: "🇪🇺",
  INR: "🇮🇳",
};

export const CurrencySwitcher: React.FC<CurrencySwitcherProps> = ({
  value,
  onChange,
  availableCurrencies,
  className = "",
}) => {
  const currencies = availableCurrencies ?? Object.values(RegionPricing);
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Globe className="w-4 h-4 text-cyan-400" aria-hidden />
      <select
        aria-label="Change currency"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-black/40 text-white px-2 py-1 rounded-md border border-white/10 focus:outline-none"
      >
        {currencies.map((cur) => (
          <option key={cur.currency} value={cur.currency}>
            {CURRENCY_FLAGS[cur.currency] || ""} {cur.symbol} – {cur.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CurrencySwitcher;
