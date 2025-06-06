import React from 'react';
import AppLayout from '@/components/layouts/AppLayout';
import { BookOpen, Shield, Clock, MessageSquare, Camera, Smartphone, Coffee, Users, Check, X, AlertTriangle, Info, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { useRules } from '@/hooks/useRules';
import { format } from 'date-fns';

// Do's and Don'ts (keeping these as static content for now)
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

const AttendeeRules = () => {
  const { rules, isLoading, error } = useRules();

  // Group rules by category
  const rulesByCategory = rules.reduce((acc, rule) => {
    const category = rule.category || 'general';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(rule);
    return acc;
  }, {} as Record<string, typeof rules>);

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="h-3 w-3" />;
      case 'medium':
        return <Zap className="h-3 w-3" />;
      case 'low':
        return <Info className="h-3 w-3" />;
      default:
        return <Info className="h-3 w-3" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading event rules...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-500">Error loading rules. Please try again later.</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Get available categories from the rules
  const availableCategories = Object.keys(rulesByCategory);
  const defaultCategory = availableCategories.length > 0 ? availableCategories[0] : 'general';

  return (
    <AppLayout>
      <div className="animate-fade-in max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Event Rules</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Guidelines and policies to ensure a positive experience for all attendees
            </p>
          </div>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => window.print()}
          >
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Print Rules</span>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-connect-600" />
                <CardTitle>Event Rules & Guidelines</CardTitle>
              </div>
              <CardDescription>
                Please familiarize yourself with these rules to ensure a great experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              {rules.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Info className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No rules have been set yet.</p>
                  <p className="text-sm mt-2">Check back later for event guidelines.</p>
                </div>
              ) : availableCategories.length > 1 ? (
                <Tabs defaultValue={defaultCategory} className="w-full">
                  <TabsList className="mb-4 grid w-full" style={{ gridTemplateColumns: `repeat(${Math.min(availableCategories.length, 4)}, 1fr)` }}>
                    {availableCategories.slice(0, 4).map((category) => (
                      <TabsTrigger key={category} value={category} className="capitalize">
                        {category}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  
                  {availableCategories.map((category) => (
                    <TabsContent key={category} value={category}>
                      <div className="space-y-2">
                        {rulesByCategory[category].map((rule) => (
                          <Accordion key={rule.id} type="single" collapsible className="w-full">
                            <AccordionItem value={rule.id}>
                              <AccordionTrigger className="text-base font-medium">
                                <div className="flex items-center gap-2">
                                  {rule.title}
                                  {rule.priority && (
                                    <Badge className={getPriorityColor(rule.priority)}>
                                      <div className="flex items-center gap-1">
                                        {getPriorityIcon(rule.priority)}
                                        <span className="capitalize text-xs">{rule.priority}</span>
                                      </div>
                                    </Badge>
                                  )}
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="text-gray-700 dark:text-gray-300">
                                <p>{rule.content}</p>
                                <div className="mt-2 text-xs text-muted-foreground">
                                  Added {format(new Date(rule.created_at), 'MMM d, yyyy')}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        ))}
                      </div>
                      
                      {category === 'general' && (
                        <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                          <h3 className="font-medium text-amber-800 dark:text-amber-300 flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Important Note
                          </h3>
                          <p className="mt-2 text-amber-700 dark:text-amber-400 text-sm">
                            Failure to comply with these rules may result in removal from the event without refund. If you have any questions or need clarification, please visit the information desk.
                          </p>
                        </div>
                      )}
                    </TabsContent>
                  ))}
                </Tabs>
              ) : (
                // Single category or no categories - display all rules directly
                <div className="space-y-2">
                  {rules.map((rule) => (
                    <Accordion key={rule.id} type="single" collapsible className="w-full">
                      <AccordionItem value={rule.id}>
                        <AccordionTrigger className="text-base font-medium">
                          <div className="flex items-center gap-2">
                            {rule.title}
                            {rule.priority && (
                              <Badge className={getPriorityColor(rule.priority)}>
                                <div className="flex items-center gap-1">
                                  {getPriorityIcon(rule.priority)}
                                  <span className="capitalize text-xs">{rule.priority}</span>
                                </div>
                              </Badge>
                            )}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-700 dark:text-gray-300">
                          <p>{rule.content}</p>
                          <div className="mt-2 text-xs text-muted-foreground">
                            Added {format(new Date(rule.created_at), 'MMM d, yyyy')}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  ))}
                  
                  <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                    <h3 className="font-medium text-amber-800 dark:text-amber-300 flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Important Note
                    </h3>
                    <p className="mt-2 text-amber-700 dark:text-amber-400 text-sm">
                      Failure to comply with these rules may result in removal from the event without refund. If you have any questions or need clarification, please visit the information desk.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Do's and Don'ts</CardTitle>
              <CardDescription>Quick reference guide for attendees</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-medium text-green-600 dark:text-green-400 flex items-center mb-3 gap-2">
                  <Check className="h-5 w-5" />
                  Do's
                </h3>
                <ul className="space-y-2">
                  {dosAndDonts.dos.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-medium text-red-600 dark:text-red-400 flex items-center mb-3 gap-2">
                  <X className="h-5 w-5" />
                  Don'ts
                </h3>
                <ul className="space-y-2">
                  {dosAndDonts.donts.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <X className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="p-4 bg-connect-50 dark:bg-connect-900/20 rounded-lg border border-connect-200 dark:border-connect-800 mt-4">
                <p className="text-sm text-connect-600 dark:text-connect-400">
                  By attending this event, you acknowledge that you have read and agree to follow all event rules and guidelines. Thank you for your cooperation!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default AttendeeRules;
