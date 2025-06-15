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
  return;
}