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
  return <section className="relative w-full px-4 py-8 md:py-12 rounded-2xl overflow-hidden glass-card mb-10 shadow-lg animate-fade-in">
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Subtle animated bg */}
        <div className="w-full h-full bg-gradient-to-tr from-primary-100/90 to-primary-300/40 animate-fade-in" />
        <Sparkle className="absolute left-4 top-6 text-primary-300/30 h-16 w-16 animate-float hidden md:block" />
        <Sparkle className="absolute right-8 bottom-6 text-primary-400/50 h-12 w-12 animate-float" />
      </div>
      
    </section>;
}