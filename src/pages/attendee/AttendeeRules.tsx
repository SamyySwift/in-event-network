import React, { useState, useMemo } from "react";
import RulesHero from "./components/RulesHero";
import RuleCard from "./components/RuleCard";
import DoDontCard from "./components/DoDontCard";
import { Card, CardContent } from "@/components/ui/card";
import { useAttendeeRules } from "@/hooks/useAttendeeRules";

const AttendeeRules = () => {
  const { rules, isLoading, error } = useAttendeeRules();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const categories = useMemo(
    () => [
      "All",
      ...[...new Set(rules.map((r) => r.category || "General"))].sort((a, b) =>
        a.localeCompare(b)
      ),
    ],
    [rules]
  );

  const filteredRules = useMemo(
    () =>
      rules.filter(
        (rule) =>
          (category === "" ||
            category === "All" ||
            (rule.category || "General") === category) &&
          (search === "" ||
            rule.title.toLowerCase().includes(search.toLowerCase()) ||
            rule.content.toLowerCase().includes(search.toLowerCase()))
      ),
    [rules, search, category]
  );

  return (
    // Remove the AppLayout wrapper
    <div className="relative w-full max-w-7xl mx-auto px-3 sm:px-6 pb-14 animate-fade-in">
      <RulesHero
        total={rules.length}
        value={search}
        onChange={setSearch}
        categories={categories}
        selectedCategory={category}
        onCategoryChange={setCategory}
      />

      <div className="mt-12">
        <Card className="border-0 bg-white/90 dark:bg-zinc-900/70 shadow-xl mb-10 ring-0 relative overflow-visible group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/90 via-primary/5 to-indigo-50/90 dark:from-zinc-900/60 dark:to-zinc-800/80 z-0"></div>
          <CardContent className="p-8 relative z-10">
            {isLoading ? (
              <div className="flex items-center justify-center my-24">
                <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary/50 animate-spin" />
              </div>
            ) : error ? (
              <div className="text-center my-20 text-red-600 font-semibold text-lg">
                Error loading rules. Please try again later.
              </div>
            ) : filteredRules.length === 0 ? (
              <div className="text-center py-20 opacity-75 animate-fade-in">
                <span
                  role="img"
                  aria-label="no results"
                  className="text-6xl mb-6 block"
                >
                  📄
                </span>
                <div className="font-bold text-2xl mb-2">No rules found</div>
                <div className="text-muted-foreground text-base">
                  Try a different search or category.
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
                {filteredRules.map((rule) => (
                  <RuleCard key={rule.id} {...rule} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AttendeeRules;
