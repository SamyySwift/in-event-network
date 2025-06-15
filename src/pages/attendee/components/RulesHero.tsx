
import React from "react";
import { Search, ShieldCheck } from "lucide-react";

interface RulesHeroProps {
  total: number;
  value: string;
  onChange: (v: string) => void;
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
}

export default function RulesHero({
  total,
  value,
  onChange,
  categories,
  selectedCategory,
  onCategoryChange,
}: RulesHeroProps) {
  return (
    <div className="relative z-10 pt-8 mb-6">
      {/* Calm, minimal glass header, removed colors/gradients/blurred shapes */}
      <div className="relative glass-card bg-white/80 dark:bg-zinc-900/70 shadow-lg rounded-2xl p-7 md:p-10 mb-2 flex flex-col gap-5 items-center md:items-start border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-5">
          <div>
            <span className="inline-flex items-center gap-2 bg-zinc-100/65 dark:bg-zinc-800/75 rounded-lg px-3 py-1 mb-2 shadow-inner backdrop-blur text-xs font-medium text-zinc-700 dark:text-zinc-200">
              <ShieldCheck className="h-4 w-4 text-primary/80" />
              Rules
              <span className="ml-2 px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-700 text-xs font-semibold tracking-tight text-zinc-700 dark:text-zinc-200">
                {total}
              </span>
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-zinc-800 dark:text-zinc-100 mb-1 tracking-tight">Event Guidelines</h1>
            <p className="text-base md:text-lg text-zinc-600 dark:text-zinc-300 max-w-2xl">
              Please review and follow all event rules. You can search or filter by category.
            </p>
          </div>
        </div>
        {/* Minimalist search + category pill filter */}
        <div className="mt-4 flex flex-col md:flex-row gap-2 md:gap-5 w-full items-center md:items-end">
          {/* Search */}
          <label className="relative w-full md:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              className="w-full rounded-full pl-10 pr-4 py-2.5 bg-zinc-100 dark:bg-zinc-800 placeholder:text-zinc-400 text-zinc-800 dark:text-zinc-100 font-medium shadow focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all animate-fade-in border border-gray-200 dark:border-gray-700"
              placeholder="Search rules..."
              value={value}
              onChange={(e) => onChange(e.target.value)}
              type="search"
            />
          </label>
          {/* Category pills - neutral, soft */}
          <div className="flex flex-wrap gap-2 w-full md:w-auto animate-fade-in">
            {categories.map((cat, idx) => (
              <button
                key={cat}
                className={`px-4 py-1.5 rounded-full font-medium transition text-sm border hover:bg-zinc-100 dark:hover:bg-zinc-700 hover:text-primary
                  ${
                    selectedCategory === cat
                      ? "bg-primary/10 text-primary border-primary"
                      : "bg-white/70 dark:bg-zinc-900/60 text-zinc-700 dark:text-zinc-200 border-gray-200 dark:border-gray-700"
                  }
                `}
                onClick={() => onCategoryChange(cat === "All" ? "" : cat)}
                tabIndex={0}
                style={{ animationDelay: `${idx * 14}ms` }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
