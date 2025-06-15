
import React from "react";
import { Sparkle, Search, ShieldCheck } from "lucide-react";

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
  onCategoryChange
}: RulesHeroProps) {
  return (
    <div className="relative z-10 pt-8 mb-8">

      {/* Floating, animated blurred shapes */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-10 left-[5%] w-72 h-32 bg-indigo-400 opacity-30 rounded-full blur-3xl" style={{zIndex:0}} />
        <div className="absolute -left-24 top-14 w-40 h-48 bg-gradient-to-br from-pink-400 to-purple-400 opacity-20 blur-2xl rotate-12" style={{zIndex:0}} />
        <div className="absolute right-[10%] -bottom-8 w-60 h-32 bg-cyan-400 opacity-30 rounded-full blur-2xl rotate-45" />
        <div className="absolute right-2 top-4 md:top-2 w-24 h-24 bg-gradient-to-br from-indigo-400 to-transparent opacity-40 blur-2xl" />
      </div>

      {/* Glassmorphic/gradient header */}
      <div className="relative glass-card bg-gradient-to-tr from-primary-500/95 via-primary-400/90 to-pink-400/80 shadow-2xl rounded-3xl p-7 md:p-11 overflow-visible mb-0 flex flex-col gap-6 items-center md:items-start">
        <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-6">
          <div>
            <span className="inline-flex items-center gap-2 bg-white/25 rounded-lg px-3 py-1 mb-3 shadow-inner backdrop-blur">
              <Sparkle className="text-yellow-200 h-5 w-5 animate-float" />
              <span className="uppercase tracking-wide text-xs font-bold text-white">Event Rules</span>
              <span className="ml-2 px-2 py-0.5 rounded-full bg-white/20 text-white text-xs font-bold">{total}</span>
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-white via-yellow-100 to-pink-100 bg-clip-text text-transparent drop-shadow mb-2 tracking-tight shadow-lg">Stay Safe &amp; Informed</h1>
            <p className="text-lg md:text-xl font-medium text-white/90 max-w-2xl mb-2">
              Discover all event guidelines and policies. Search or filter by category to make the most of your experience!
            </p>
          </div>
          <div className="flex flex-col items-center sm:items-end">
            <span className="bg-white/30 text-white px-6 py-2 rounded-full shadow-lg text-base font-semibold tracking-wider flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-200 animate-pulse" />
              Your conduct creates a great event!
            </span>
          </div>
        </div>

        {/* Modern search + category filter pills */}
        <div className="mt-7 flex flex-col md:flex-row gap-3 md:gap-5 w-full items-center md:items-end">
          {/* Search */}
          <label className="relative w-full md:max-w-sm">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-400" />
            <input
              className="w-full rounded-full pl-12 pr-4 py-3 bg-white/70 dark:bg-black/35 placeholder:text-primary-700 font-medium shadow focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all animate-fade-in"
              placeholder="Search rules..."
              value={value}
              onChange={e => onChange(e.target.value)}
              type="search"
            />
          </label>
          {/* Category pills */}
          <div className="flex flex-wrap gap-2 w-full md:w-auto animate-fade-in">
            {categories.map((cat, idx) => (
              <button
                key={cat}
                className={`px-4 py-2 rounded-full font-semibold shadow hover:scale-105 transition text-sm 
                  ${selectedCategory === cat
                    ? "bg-gradient-to-r from-primary-600 to-pink-400 text-white shadow-lg"
                    : "bg-white/60 text-primary-700 hover:bg-primary-100/60"}
                  border-2 border-transparent hover:border-primary-400`}
                onClick={() => onCategoryChange(cat === 'All' ? '' : cat)}
                tabIndex={0}
                style={{animationDelay: `${idx * 24}ms`}}
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
