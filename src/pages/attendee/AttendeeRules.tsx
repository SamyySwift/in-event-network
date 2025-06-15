
import React, { useState, useMemo } from 'react';
import AppLayout from '@/components/layouts/AppLayout';
import RulesHero from './components/RulesHero';
import RuleCard from './components/RuleCard';
import DoDontCard from './components/DoDontCard';
import { Card, CardContent } from '@/components/ui/card';
import { useAttendeeRules } from '@/hooks/useAttendeeRules';

const dosAndDonts = {
  dos: [
    "Wear your badge visibly at all times",
    "Arrive early for sessions to secure seating",
    "Use the Q&A function in the app for questions",
    "Network respectfully with other attendees",
    "Keep your phone on silent during sessions",
    "Follow staff directions during emergencies",
    "Share feedback through official channels",
    "Respect other attendees' privacy and personal space",
  ],
  donts: [
    "Record sessions without explicit permission",
    "Enter restricted areas without proper access",
    "Leave personal items unattended",
    "Engage in disruptive behavior during sessions",
    "Share other attendees' contact info without permission",
    "Block pathways or emergency exits",
    "Bring outside food or drinks into session rooms",
    "Use the event Wi-Fi for large downloads or streaming",
  ],
};

const AttendeeRules = () => {
  const { rules, isLoading, error } = useAttendeeRules();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  const categories = useMemo(
    () =>
      ['All', ...[...new Set(rules.map(r => r.category || 'General'))].sort((a, b) => a.localeCompare(b))],
    [rules]
  );

  const filteredRules = useMemo(
    () =>
      rules.filter(
        rule =>
          (category === '' || category === 'All' || (rule.category || 'General') === category) &&
          (search === '' ||
            rule.title.toLowerCase().includes(search.toLowerCase()) ||
            rule.content.toLowerCase().includes(search.toLowerCase()))
      ),
    [rules, search, category]
  );

  return (
    <AppLayout>
      {/* Container with calmer, soft backgrounds */}
      <div className="relative w-full max-w-3xl mx-auto px-3 sm:px-6 pb-10 animate-fade-in">
        {/* Redesigned calm, minimal hero section */}
        <RulesHero
          total={rules.length}
          value={search}
          onChange={setSearch}
          categories={categories}
          selectedCategory={category}
          onCategoryChange={setCategory}
        />

        {/* Rules List - minimalist glass cards, muted */}
        <div className="mt-8 space-y-0">
          <Card className="glass-card border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-zinc-800/60 shadow-md mb-10 ring-0 relative overflow-visible">
            <CardContent className="p-6 sm:p-8">
              {isLoading ? (
                <div className="flex items-center justify-center my-20">
                  <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary/50 animate-spin" />
                </div>
              ) : error ? (
                <div className="text-center my-20 text-red-600 font-semibold text-lg">
                  Error loading rules. Please try again later.
                </div>
              ) : filteredRules.length === 0 ? (
                <div className="text-center py-16 opacity-75 animate-fade-in">
                  <span role="img" aria-label="no results" className="text-6xl mb-5 block">
                    📄
                  </span>
                  <div className="font-bold text-2xl mb-2">No rules found</div>
                  <div className="text-muted-foreground text-base">Try a different search or category.</div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                  {filteredRules.map((rule) => (
                    <RuleCard key={rule.id} {...rule} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Modern calm Do's and Don'ts card */}
        <DoDontCard dos={dosAndDonts.dos} donts={dosAndDonts.donts} />
      </div>
    </AppLayout>
  );
};

export default AttendeeRules;

