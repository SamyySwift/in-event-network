
import React from "react";
import { ShieldCheck, Search } from "lucide-react";

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
    <div className="relative z-10 mb-4">
      {/* Dashboard-style hero gradient */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 shadow-lg p-8 sm:p-12 mb-0 flex flex-col gap-5 border-0">
        {/* Background decorations for visual polish */}
        <div className="absolute inset-0 bg-black/10 z-0"></div>
        <div className="absolute -bottom-14 -right-12 w-36 h-36 bg-white/10 rounded-full z-0"></div>
        <div className="absolute -top-20 -left-20 w-48 h-48 bg-white/5 rounded-full z-0"></div>
        {/* Hero content */}
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between w-full gap-7">
          <div className="flex-1">
            <span className="inline-flex items-center gap-2 bg-white/20 rounded-lg px-3 py-1 mb-2 shadow-inner backdrop-blur text-xs font-semibold text-zinc-100 tracking-wide">
              <ShieldCheck className="h-4 w-4 text-white/80" />
              Event Rules
              <span className="ml-2 px-2 py-0.5 rounded-full bg-white/30 text-xs font-semibold tracking-tight text-white/90">
                {total}
              </span>
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-1 tracking-tight">Event Guidelines</h1>
            <p className="text-base md:text-lg text-white/90 max-w-2xl">
              Please review and follow all event rules. You can search and filter by category.
            </p>
          </div>
          {/* Search box */}
          <label className="relative w-full max-w-sm md:mt-0 mt-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              className="w-full rounded-full pl-10 pr-4 py-3 bg-white/80 placeholder:text-zinc-400 text-zinc-900 font-medium shadow focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all border border-white/60"
              placeholder="Search rules..."
              value={value}
              onChange={(e) => onChange(e.target.value)}
              type="search"
            />
          </label>
        </div>
        {/* Category pills, inside hero for dashboard feel */}
        <div className="relative z-10 mt-7 flex flex-wrap gap-2 w-full animate-fade-in">
          {categories.map((cat, idx) => (
            <button
              key={cat}
              className={`px-4 py-1.5 rounded-full font-semibold transition text-sm border-2 
                ${
                  selectedCategory === cat
                    ? "bg-white/95 text-indigo-700 border-indigo-600 shadow-sm"
                    : "bg-white/20 text-white border-white/40 hover:bg-white/30"
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
  );
}
