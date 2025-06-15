import React, { useState, useMemo } from 'react';
import AppLayout from '@/components/layouts/AppLayout';
import RulesHero from './components/RulesHero';
import RuleCard from './components/RuleCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Check, X, BadgeInfo } from 'lucide-react';
import { useAttendeeRules } from '@/hooks/useAttendeeRules';
const dosAndDonts = {
  dos: ['Wear your badge visibly at all times', 'Arrive early for sessions to secure seating', 'Use the Q&A function in the app for questions', 'Network respectfully with other attendees', 'Keep your phone on silent during sessions', 'Follow staff directions during emergencies', 'Share feedback through official channels', 'Respect other attendees\' privacy and personal space'],
  donts: ['Record sessions without explicit permission', 'Enter restricted areas without proper access', 'Leave personal items unattended', 'Engage in disruptive behavior during sessions', 'Share other attendees\' contact info without permission', 'Block pathways or emergency exits', 'Bring outside food or drinks into session rooms', 'Use the event Wi-Fi for large downloads or streaming']
};
const AttendeeRules = () => {
  const {
    rules,
    isLoading,
    error
  } = useAttendeeRules();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const categories = useMemo(() => [...new Set(rules.map(r => r.category || 'General'))].sort((a, b) => a.localeCompare(b)), [rules]);
  const filteredRules = useMemo(() => rules.filter(rule => (category === "" || (rule.category || 'General') === category) && (search === "" || rule.title.toLowerCase().includes(search.toLowerCase()) || rule.content.toLowerCase().includes(search.toLowerCase()))), [rules, search, category]);
  return <AppLayout>
      {/* HERO Gradient Card Header */}
      <div className="max-w-5xl mx-auto px-0 sm:px-6 pb-8 animate-fade-in">
        <Card className="mb-8 p-0 overflow-visible rounded-3xl border-0 shadow-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white relative">
          <div className="absolute inset-0 bg-black/30 rounded-3xl z-0" />
          <CardHeader className="relative z-10 pb-0 pt-8 px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <span className="inline-flex items-center gap-2 bg-white/25 rounded-lg px-3 py-1 mb-4 shadow-inner">
                  <BadgeInfo className="text-yellow-200" />
                  <span className="uppercase tracking-wide text-xs font-semibold text-white">Event Rules</span>
                  <span className="ml-2 px-2 py-0.5 rounded-full bg-white/30 text-white text-xs font-bold">{rules.length}</span>
                </span>
                <h1 className="text-3xl sm:text-4xl font-bold mb-3">Stay Safe &amp; Informed</h1>
                <p className="text-lg opacity-95 max-w-2xl mb-2">
                  Explore all event guidelines and policies. Filter by category, search for keywords, and get the most out of your experience!
                </p>
              </div>
              <div className="flex flex-col items-center sm:items-end space-y-2 mt-0">
                <span className="bg-white/20 text-white px-4 py-2 rounded-full shadow-md text-sm font-medium">Your conduct ensures a great event!</span>
              </div>
            </div>
          </CardHeader>
          <div className="absolute -bottom-12 -right-12 w-44 h-44 bg-white/10 rounded-full z-0" />
          <div className="absolute -top-12 -left-12 w-60 h-60 bg-white/5 rounded-full z-0" />
        </Card>

        {/* SEARCH + CATEGORY */}
        <Card className="mb-8 rounded-2xl shadow-lg bg-white/95 backdrop-blur-sm border-0">
          
        </Card>

        {/* Rules List */}
        <Card className="rounded-2xl shadow-lg bg-white/95 backdrop-blur-sm border-0 mb-8">
          <CardContent className="p-5">
            {isLoading ? <div className="flex items-center justify-center my-24">
                <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              </div> : error ? <div className="text-center my-24 text-red-500 font-medium">Error loading rules. Please try again later.</div> : <>
                {filteredRules.length === 0 ? <div className="text-center py-14 opacity-70 animate-fade-in">
                    <span role="img" aria-label="info" className="text-5xl mb-6 block">📄</span>
                    <div className="font-semibold text-xl mb-2">No rules found</div>
                    <div className="text-muted-foreground text-base">Try a different search or category.</div>
                  </div> : <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {filteredRules.map(rule => <RuleCard key={rule.id} {...rule} />)}
                  </div>}
              </>}
          </CardContent>
        </Card>

        {/* Do's and Don'ts Card */}
        <Card className="glass-card border-primary-200/40 shadow-md rounded-2xl hover:shadow-lg transition-all mb-4">
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
                  {dosAndDonts.dos.map((item, idx) => <li key={idx} className="flex items-center gap-2 text-sm hover:scale-105 transition-all">
                      <Check className="h-4 w-4 text-green-600" />
                      <span>{item}</span>
                    </li>)}
                </ul>
              </div>
              <Separator orientation="vertical" className="hidden md:block h-40 mx-3" />
              <div className="w-full md:w-1/2">
                <h3 className="font-semibold text-red-600 mb-2 flex items-center gap-2">
                  <X className="h-4 w-4 text-red-600" />
                  Don'ts
                </h3>
                <ul className="space-y-2">
                  {dosAndDonts.donts.map((item, idx) => <li key={idx} className="flex items-center gap-2 text-sm hover:scale-105 transition-all">
                      <X className="h-4 w-4 text-red-600" />
                      <span>{item}</span>
                    </li>)}
                </ul>
              </div>
            </div>
            <div className="mt-7 px-4 py-3 rounded-lg bg-primary-100/60 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 shadow text-primary-900 dark:text-primary-100 text-sm">
              By attending this event, you acknowledge that you have read and agree to follow all event rules and guidelines.
              Thank you for your cooperation!
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>;
};
export default AttendeeRules;