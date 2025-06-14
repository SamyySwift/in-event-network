
import React, { useState, useMemo } from 'react';
import AppLayout from '@/components/layouts/AppLayout';
import RuleCard from './components/RuleCard';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Check, X, Sparkle, ShieldCheck, Search } from 'lucide-react';

import { useAttendeeRules } from '@/hooks/useAttendeeRules';

// Do's and Don'ts data
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
      {/* Ultra-modern dashboard-inspired background */}
      <div className="relative w-full min-h-[100vh] bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500/90 pb-20">
        {/* Floating Shapes */}
        <Sparkle className="absolute left-10 top-8 text-white/20 h-28 w-28 animate-float z-0" />
        <ShieldCheck className="absolute right-24 top-32 text-white/15 h-20 w-20 animate-float z-0" />
        <Sparkle className="absolute right-10 bottom-16 text-pink-200/20 h-16 w-16 animate-float z-0" />
        {/* Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto w-full px-4 py-4 md:py-12">
          {/* MODERN HEADER/HERO */}
          <section
            className="rounded-3xl mb-12 w-full p-0 overflow-hidden shadow-xl bg-gradient-to-br from-white/70 via-primary-50/60 to-white/60 ring-2 ring-primary-300/10 dark:bg-gray-950/80 animate-fade-in"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.85) 65%, rgba(124,58,237,0.12) 100%)"
            }}
          >
            <div className="relative px-6 md:px-12 py-12 flex flex-col md:flex-row justify-between items-center gap-10 backdrop-blur-[2px] dark:bg-gray-900/30">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck className="text-primary-600 h-6 w-6" />
                  <span className="uppercase font-semibold tracking-widest text-primary-700 text-xs bg-primary-100/80 px-2 py-1 rounded-md">Event Rules</span>
                  <span className="ml-3 px-3 py-1 rounded-full bg-gradient-to-br from-primary-500 to-primary-300 text-white shadow text-xs font-bold">{rules.length}</span>
                  <span className="ml-4 animate-pulse rounded-full h-2 w-2 bg-green-400 shadow-inner" title="Live" />
                </div>
                <h2 className="font-extrabold text-3xl md:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 via-purple-600 to-pink-600 mb-4 tracking-tight">Modern Event Rules</h2>
                <p className="text-base md:text-lg text-muted-foreground max-w-2xl">Explore all guidelines, filter by category, and search instantly. Stay informed and help keep our event inspiring & safe!</p>
              </div>
              {/* Modern Search & Filter */}
              <div className="flex flex-col gap-4 md:w-[22rem] w-full">
                <div className="flex items-center w-full bg-white/80 border rounded-2xl px-4 py-2 shadow-md ring-2 ring-primary-100 focus-within:ring-primary-500 transition-all backdrop-blur-md">
                  <Search className="text-gray-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 bg-transparent ml-2 py-1 focus:outline-none text-base text-gray-900 dark:text-white"
                    placeholder="Search rules…"
                    aria-label="Search rules"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      className={`px-4 py-1.5 rounded-full font-semibold text-xs shadow transition hover:scale-105 border
                        ${category === cat
                          ? "bg-gradient-to-tr from-primary-600 via-purple-500 to-pink-500 text-white border-transparent"
                          : "bg-primary-100/70 text-primary-800 border-primary-200 dark:bg-primary-700/30 dark:text-primary-50"
                        }`}
                      onClick={() => setCategory(cat === category ? '' : cat)}
                    >
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      <span className="ml-2 px-1.5 rounded-full text-xs font-bold bg-white/70 text-primary-500 border border-primary-200">{rules.filter(r => (r.category || 'General') === cat).length}</span>
                    </button>
                  ))}
                  <button
                    className={`px-4 py-1.5 rounded-full font-semibold text-xs shadow transition hover:scale-105 border
                      ${category === ""
                        ? "bg-gradient-to-tr from-pink-600 via-purple-500 to-indigo-600 text-white border-transparent"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 border-primary-50"
                      }`}
                    onClick={() => setCategory("")}
                  >
                    All
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* RULE CARDS AREA */}
          <div className="mb-12 w-full min-h-[410px]">
            {isLoading ? (
              <div className="flex items-center justify-center mt-32 mb-32">
                <div className="w-14 h-14 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              </div>
            ) : error ? (
              <div className="text-center my-32 text-red-500">Error loading rules. Please try again later.</div>
            ) : (
              <div>
                {filteredRules.length === 0 ? (
                  <div className="flex flex-col items-center py-24 opacity-70 animate-fade-in">
                    <span role="img" aria-label="info" className="text-6xl mb-7 block">📄</span>
                    <div className="font-extrabold text-2xl md:text-3xl mb-2 text-gradient">No rules found</div>
                    <div className="text-muted-foreground text-base">Try another search or switch category.</div>
                  </div>
                ) : (
                  <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {filteredRules.map((rule) => (
                      <div
                        key={rule.id}
                        className="relative group"
                      >
                        {/* Glassmorphism, glow, hover shift */}
                        <div className="absolute inset-0 rounded-xl pointer-events-none transition-all opacity-0 group-hover:opacity-80 blur-[8px] z-0 
                          bg-gradient-to-br from-primary-300/30 via-primary-400/40 to-pink-400/25" />
                        <RuleCard {...rule} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* MODERN DO'S AND DON'Ts */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="rounded-2xl bg-gradient-to-br from-green-100/80 via-white/95 to-green-50/80 shadow-2xl border-0 p-0">
              <CardContent className="py-8 px-7 flex flex-col items-start gap-6">
                <h3 className="font-bold text-2xl flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent">
                  <Check className="h-6 w-6 animate-float text-green-500" />
                  Do's
                </h3>
                <ul className="space-y-2">
                  {dosAndDonts.dos.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-base font-medium text-green-900 dark:text-green-200 group">
                      <span className="h-5 w-5 flex items-center justify-center rounded-full bg-gradient-to-br from-green-200 to-green-400 shadow">
                        <Check className="h-4 w-4 text-green-700 animate-fade-in" />
                      </span>
                      <span className="group-hover:translate-x-1 transition-transform">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card className="rounded-2xl bg-gradient-to-br from-pink-100/90 via-white/95 to-purple-100/80 shadow-2xl border-0 p-0">
              <CardContent className="py-8 px-7 flex flex-col items-start gap-6">
                <h3 className="font-bold text-2xl flex items-center gap-2 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  <X className="h-6 w-6 animate-float text-pink-500" />
                  Don'ts
                </h3>
                <ul className="space-y-2">
                  {dosAndDonts.donts.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-base font-medium text-pink-900 dark:text-pink-200 group">
                      <span className="h-5 w-5 flex items-center justify-center rounded-full bg-gradient-to-br from-pink-200 to-pink-400 shadow">
                        <X className="h-4 w-4 text-pink-700 animate-fade-in" />
                      </span>
                      <span className="group-hover:-translate-x-1 transition-transform">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
          <div className="mt-10 text-center px-4">
            <div className="inline-block rounded-xl px-6 py-3 bg-gradient-to-r from-gray-100 via-primary-50 to-pink-50 dark:from-gray-900 dark:to-gray-700 border border-primary-100/60 dark:border-primary-900/60 shadow text-gray-700 dark:text-gray-100 text-base font-medium">
              By attending this event, you acknowledge and agree to follow all event rules and guidelines.
              <span className="ml-2 text-primary-600 font-semibold">Thank you for your cooperation!</span>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default AttendeeRules;
