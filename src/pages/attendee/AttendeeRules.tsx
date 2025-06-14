
import React, { useState, useMemo } from 'react';
import AppLayout from '@/components/layouts/AppLayout';
import RulesHero from './components/RulesHero';
import RuleCard from './components/RuleCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Check, X } from 'lucide-react';

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
    'Respect other attendees\' privacy and personal space'
  ],
  donts: [
    'Record sessions without explicit permission',
    'Enter restricted areas without proper access',
    'Leave personal items unattended',
    'Engage in disruptive behavior during sessions',
    'Share other attendees\' contact info without permission',
    'Block pathways or emergency exits',
    'Bring outside food or drinks into session rooms',
    'Use the event Wi-Fi for large downloads or streaming'
  ]
};

// Modern & dynamic Attendee Event Rule page
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
      <div className="px-2 pt-4 pb-10 max-w-5xl mx-auto w-full animate-fade-in">
        <RulesHero 
          total={rules.length}
          value={search}
          onChange={setSearch}
          categories={categories}
          selectedCategory={category}
          onCategoryChange={setCategory}
        />

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
                {filteredRules.map((rule) => (
                  <RuleCard key={rule.id} {...rule} />
                ))}
              </div>
            )}
          </div>
        )}

        <div className="mt-8">
          <Card className="glass-card border-primary-200/40 shadow-soft hover:shadow-lg transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-gradient flex gap-2 items-center">
                <span>Do's and Don'ts</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-10 md:gap-24 justify-center items-start">
                <div className="w-full md:w-1/2">
                  <h3 className="font-semibold text-green-700 mb-2 flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    Do's
                  </h3>
                  <ul className="space-y-2">
                    {dosAndDonts.dos.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm hover:scale-105 transition-all">
                        <Check className="h-4 w-4 text-green-600" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Separator orientation="vertical" className="hidden md:block h-40 mx-3" />
                <div className="w-full md:w-1/2">
                  <h3 className="font-semibold text-red-600 mb-2 flex items-center gap-2">
                    <X className="h-4 w-4 text-red-600" />
                    Don'ts
                  </h3>
                  <ul className="space-y-2">
                    {dosAndDonts.donts.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm hover:scale-105 transition-all">
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
      </div>
    </AppLayout>
  );
};

export default AttendeeRules;
