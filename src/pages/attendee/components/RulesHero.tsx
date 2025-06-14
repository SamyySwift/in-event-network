
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
  onCategoryChange,
}: RulesHeroProps) {
  return (
    <section className="relative w-full px-4 py-8 md:py-12 rounded-2xl overflow-hidden glass-card mb-10 shadow-lg animate-fade-in">
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Subtle animated bg */}
        <div className="w-full h-full bg-gradient-to-tr from-primary-100/90 to-primary-300/40 animate-fade-in" />
        <Sparkle className="absolute left-4 top-6 text-primary-300/30 h-16 w-16 animate-float hidden md:block" />
        <Sparkle className="absolute right-8 bottom-6 text-primary-400/50 h-12 w-12 animate-float" />
      </div>
      <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end justify-between gap-5">
        <div>
          <div className="inline-flex items-center gap-2 bg-primary-200/70 rounded-lg px-3 py-1 mb-3 shadow-inner animate-fade-in">
            <ShieldCheck className="text-primary-500" />
            <span className="uppercase tracking-wide text-xs font-semibold text-primary-700">Event Rules</span>
            <span className="ml-2 px-2 py-0.5 rounded-full bg-white text-primary-700 text-xs font-bold shadow">{total}</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-3 tracking-tight animate-fade-in">
            Stay Safe &amp; Informed
          </h2>
          <p className="text-muted-foreground max-w-md animate-fade-in">
            Explore all event guidelines and policies. Filter by category, search for keywords, and get the most out of your experience!
          </p>
        </div>
        <div className="flex flex-col items-end gap-4 w-full md:w-auto">
          <div className="flex w-full md:w-80 items-center bg-white/80 dark:bg-gray-900/80 border shadow rounded-xl px-3 py-2 ring-2 ring-primary-100 focus-within:ring-primary-500 transition-all">
            <Search className="text-gray-400" />
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="flex-1 px-2 py-1 bg-transparent focus:outline-none text-base"
              placeholder="Search rules..."
              aria-label="Search rules"
            />
          </div>
          <div className="flex flex-wrap gap-2 animate-fade-in">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`px-3 py-1 rounded-full text-xs transition font-semibold shadow hover:scale-105
                  ${selectedCategory === cat 
                    ? "bg-primary-500 text-white shadow-primary/30 scale-105"
                    : "bg-primary-200/50 text-primary-700 hover:bg-primary-300/70"
                  }`}
                onClick={() => onCategoryChange(cat)}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
            <button
              className={`px-3 py-1 rounded-full text-xs transition font-medium
                ${selectedCategory === "" 
                  ? "bg-primary-600 text-white scale-105"
                  : "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-primary-200/60"
                }`}
              onClick={() => onCategoryChange("")}
            >
              All
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
