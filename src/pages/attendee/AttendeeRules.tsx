
import React, { useState, useMemo } from 'react';
import AppLayout from '@/components/layouts/AppLayout';
import RulesHero from './components/RulesHero';
import RuleCard from './components/RuleCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Check, X, Info } from 'lucide-react';

import { useAttendeeRules } from '@/hooks/useAttendeeRules';

const dosAndDonts = {
  dos: [
    'Wear your badge visibly at all times',
    'Arrive early for sessions to secure seating',
    'Use the Q&A function in the app for questions',
    'Network respectfully with other attendees',
    'Keep your phone on silent during sessions',
    'Follow staff directions during emergencies',
    'Share feedback through official channels',
    "Respect other attendees' privacy and personal space"
  ],
  donts: [
    'Record sessions without explicit permission',
    'Enter restricted areas without proper access',
    'Leave personal items unattended',
    'Engage in disruptive behavior during sessions',
    "Share other attendees' contact info without permission",
    'Block pathways or emergency exits',
    'Bring outside food or drinks into session rooms',
    'Use the event Wi-Fi for large downloads or streaming'
  ]
};

const AttendeeRules = () => {
  const { rules, isLoading, error } = useAttendeeRules();

  // Dynamic search/filter
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  // Available categories
  const categories = useMemo(
    () => [...new Set(rules.map(r => r.category || 'General'))].sort((a, b) => a.localeCompare(b)),
    [rules]
  );

  // Filtered rules with search/category
  const filteredRules = useMemo(() =>
    rules.filter(rule =>
      (category === "" || (rule.category || 'General') === category) &&
      (search === "" ||
        rule.title.toLowerCase().includes(search.toLowerCase()) ||
        rule.content.toLowerCase().includes(search.toLowerCase())
      )
    ),
    [rules, search, category]
  );

  return (
    <AppLayout>
      {/* Hero Section - Modern style */}
      <section className="relative rounded-3xl glass-effect shadow-soft px-4 py-10 md:py-14 md:px-8 mb-10 overflow-hidden animate-fade-in">
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="w-full h-full bg-gradient-to-tr from-primary-50/80 via-primary-100/70 to-primary-300/40 animate-fade-in" />
          <div className="absolute left-8 top-8 w-32 h-32 rounded-full bg-primary-100/50 blur-2xl opacity-60 animate-fade-in hidden md:block"></div>
          <div className="absolute right-8 bottom-0 w-24 h-24 rounded-full bg-primary-300/40 blur-3xl opacity-60 animate-fade-in hidden md:block"></div>
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end justify-between gap-8">
          <div>
            <div className="inline-flex items-center gap-2 bg-primary-200/80 rounded-lg px-3 py-1 mb-4 shadow-inner animate-fade-in">
              <Info className="text-primary-500" />
              <span className="uppercase tracking-wide text-xs font-semibold text-primary-700">Event Rules</span>
              <span className="ml-2 px-2 py-0.5 rounded-full bg-white text-primary-700 text-xs font-bold shadow">{rules.length}</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight animate-fade-in gradient-text gradient-primary">
              Stay Safe, Have Fun<br className="hidden sm:inline" /> &amp; Stay Informed!
            </h2>
            <p className="text-muted-foreground max-w-xl text-base md:text-lg animate-fade-in">
              Explore all event guidelines and community policies below. Use categories and search to quickly find info you care about.
            </p>
          </div>
          <div className="flex flex-col items-end gap-4 w-full md:w-auto">
            {/* Search */}
            <div className="flex w-full md:w-80 items-center bg-white/90 dark:bg-gray-900/80 border shadow rounded-xl px-3 py-2 ring-2 ring-primary-100 focus-within:ring-primary-500 transition-all">
              <svg className="text-gray-400 h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35"></path></svg>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="flex-1 px-2 py-1 bg-transparent focus:outline-none text-base"
                placeholder="Search rules..."
                aria-label="Search rules"
              />
            </div>
            {/* Category pills */}
            <div className="flex flex-wrap gap-2 animate-fade-in">
              <button
                className={`px-3 py-1 rounded-full text-xs transition font-medium
                  ${category === "" 
                    ? "bg-primary-600 text-white scale-105"
                    : "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-primary-200/60"
                  }`}
                onClick={() => setCategory("")}
              >
                All
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  className={`px-3 py-1 rounded-full text-xs transition font-semibold shadow hover:scale-105
                    ${category === cat 
                      ? "bg-primary-500 text-white shadow-primary/30 scale-105"
                      : "bg-primary-200/50 text-primary-700 hover:bg-primary-300/70"
                    }`}
                  onClick={() => setCategory(cat)}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Rule Cards Area */}
      <div className="relative">
        {isLoading ? (
          <div className="flex items-center justify-center mt-28 mb-20">
            <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center my-24 text-red-500">Error loading rules. Please try again later.</div>
        ) : (
          <div>
            {filteredRules.length === 0 ? (
              <div className="text-center py-20 opacity-60 animate-fade-in">
                <span role="img" aria-label="info" className="text-5xl mb-6 block">📄</span>
                <div className="font-semibold text-xl mb-2">No rules found</div>
                <div className="text-muted-foreground text-base">Try a different search or category.</div>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 mb-12">
                {filteredRules.map((rule, idx) => (
                  <div key={rule.id} className="animate-fade-in" style={{ animationDelay: `${idx * 50}ms` }}>
                    <RuleCard {...rule} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Do's and Don'ts - Muted glassmorphism box */}
      <div className="mt-10 animate-fade-in">
        <Card className="glass-effect border border-primary-200/40 shadow-soft hover:shadow-lg transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex gap-2 items-center">
              <span className="gradient-text gradient-connect">Do's and Don'ts</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-10 md:gap-24 justify-center items-start">
              {/* Do's list */}
              <div className="w-full md:w-1/2">
                <h3 className="font-semibold text-green-700 mb-2 flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  Do's
                </h3>
                <ul className="space-y-2">
                  {dosAndDonts.dos.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm transition-all animate-fade-in">
                      <Check className="h-4 w-4 text-green-600" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Separator orientation="vertical" className="hidden md:block h-40 mx-3" />
              {/* Don'ts list */}
              <div className="w-full md:w-1/2">
                <h3 className="font-semibold text-red-600 mb-2 flex items-center gap-2">
                  <X className="h-4 w-4 text-red-600" />
                  Don'ts
                </h3>
                <ul className="space-y-2">
                  {dosAndDonts.donts.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm transition-all animate-fade-in">
                      <X className="h-4 w-4 text-red-600" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mt-7 px-4 py-3 rounded-lg bg-primary-100/60 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 shadow text-primary-900 dark:text-primary-100 text-sm">
              By attending this event, you acknowledge that you have read and agree to follow all event rules and guidelines. Thank you for your cooperation!
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default AttendeeRules;

