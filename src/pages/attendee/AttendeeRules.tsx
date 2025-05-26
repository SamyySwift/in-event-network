
import React from 'react';
import AppLayout from '@/components/layouts/AppLayout';
import { BookOpen, Shield, Clock, MessageSquare, Camera, Smartphone, Coffee, Users, Check, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

// Mock data for event rules
const eventRules = {
  general: [
    {
      id: 'gen1',
      title: 'Badge Requirements',
      description: 'Badges must be worn visibly at all times during the event. Lost badges should be reported immediately to the information desk.'
    },
    {
      id: 'gen2',
      title: 'Access Restrictions',
      description: 'Access to certain areas is limited to specific badge types. Please respect all signage and staff directions regarding restricted areas.'
    },
    {
      id: 'gen3',
      title: 'Code of Conduct',
      description: 'All attendees must adhere to the event\'s code of conduct. Any harassment, discrimination, or disruptive behavior will result in removal from the event without refund.'
    },
    {
      id: 'gen4',
      title: 'Health and Safety',
      description: 'Follow all health and safety guidelines. Emergency exits are marked throughout the venue. In case of emergency, please follow staff instructions.'
    }
  ],
  sessions: [
    {
      id: 'sess1',
      title: 'Attendance',
      description: 'Try to arrive at least 5 minutes before sessions begin. Late arrivals may be asked to wait until an appropriate break to enter the room.'
    },
    {
      id: 'sess2',
      title: 'Seating',
      description: 'Seating is available on a first-come, first-served basis unless otherwise specified. Please do not reserve seats for others.'
    },
    {
      id: 'sess3',
      title: 'Questions',
      description: 'Use the event app or designated Q&A periods to ask questions. Please be respectful of the speakers and other attendees.'
    },
    {
      id: 'sess4',
      title: 'Recording Policy',
      description: 'Unless explicitly permitted, recording of sessions is prohibited. Official recordings will be made available after the event where applicable.'
    }
  ],
  networking: [
    {
      id: 'net1',
      title: 'Respectful Communication',
      description: 'Maintain professional and respectful communication with other attendees. Harassment or inappropriate behavior will not be tolerated.'
    },
    {
      id: 'net2',
      title: 'Contact Sharing',
      description: 'Use the event app for contact sharing when possible. Always ask for permission before taking someone\'s contact information.'
    },
    {
      id: 'net3',
      title: 'Business Card Etiquette',
      description: 'If exchanging physical business cards, present and receive cards with both hands as a sign of respect. Ask permission before writing on someone\'s card.'
    },
    {
      id: 'net4',
      title: 'Networking Events',
      description: 'Special networking events have their own schedules. Please check the event app for details and arrive on time.'
    }
  ],
  technology: [
    {
      id: 'tech1',
      title: 'Wi-Fi Usage',
      description: 'Free Wi-Fi is provided for all attendees. Please be mindful of bandwidth usage and avoid streaming or downloading large files.'
    },
    {
      id: 'tech2',
      title: 'Event App',
      description: 'Download the official event app for schedules, maps, and networking features. Technical support is available at the information desk.'
    },
    {
      id: 'tech3',
      title: 'Mobile Device Etiquette',
      description: 'Keep phones on silent during sessions. Take calls outside of session rooms to avoid disrupting presentations.'
    },
    {
      id: 'tech4',
      title: 'Charging Stations',
      description: 'Charging stations are available throughout the venue. Please limit usage to 30 minutes when others are waiting.'
    }
  ]
};

// Do's and Don'ts
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
              <Tabs defaultValue="general" className="w-full">
                <TabsList className="mb-4 grid grid-cols-4">
                  <TabsTrigger value="general">
                    General
                  </TabsTrigger>
                  <TabsTrigger value="sessions">
                    Sessions
                  </TabsTrigger>
                  <TabsTrigger value="networking">
                    Networking
                  </TabsTrigger>
                  <TabsTrigger value="technology">
                    Technology
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="general">
                  <div className="space-y-2">
                    {eventRules.general.map((rule) => (
                      <Accordion key={rule.id} type="single" collapsible className="w-full">
                        <AccordionItem value={rule.id}>
                          <AccordionTrigger className="text-base font-medium">
                            {rule.title}
                          </AccordionTrigger>
                          <AccordionContent className="text-gray-700 dark:text-gray-300">
                            {rule.description}
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    ))}
                  </div>
                  
                  <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                    <h3 className="font-medium text-amber-800 dark:text-amber-300 flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Important Note
                    </h3>
                    <p className="mt-2 text-amber-700 dark:text-amber-400 text-sm">
                      Failure to comply with these general rules may result in removal from the event without refund. If you have any questions or need clarification, please visit the information desk.
                    </p>
                  </div>
                </TabsContent>
                
                <TabsContent value="sessions">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      {eventRules.sessions.map((rule) => (
                        <Accordion key={rule.id} type="single" collapsible className="w-full">
                          <AccordionItem value={rule.id}>
                            <AccordionTrigger className="text-base font-medium">
                              {rule.title}
                            </AccordionTrigger>
                            <AccordionContent className="text-gray-700 dark:text-gray-300">
                              {rule.description}
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      ))}
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <Card className="bg-gray-50 dark:bg-gray-800/50">
                        <CardContent className="p-4 flex items-start gap-3">
                          <Clock className="h-8 w-8 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">Session Timing</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              Sessions start promptly at the scheduled time. Doors may close after sessions begin.
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-gray-50 dark:bg-gray-800/50">
                        <CardContent className="p-4 flex items-start gap-3">
                          <MessageSquare className="h-8 w-8 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-1" />
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">Question Format</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              Submit questions through the app. Keep questions concise and relevant to the topic.
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-gray-50 dark:bg-gray-800/50">
                        <CardContent className="p-4 flex items-start gap-3">
                          <Camera className="h-8 w-8 text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">Photography</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              Photography for personal use is permitted unless otherwise specified by the speaker.
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="networking">
                  <div className="space-y-2">
                    {eventRules.networking.map((rule) => (
                      <Accordion key={rule.id} type="single" collapsible className="w-full">
                        <AccordionItem value={rule.id}>
                          <AccordionTrigger className="text-base font-medium">
                            {rule.title}
                          </AccordionTrigger>
                          <AccordionContent className="text-gray-700 dark:text-gray-300">
                            {rule.description}
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    ))}
                  </div>
                  
                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h3 className="font-medium text-blue-800 dark:text-blue-300 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Networking Best Practices
                    </h3>
                    <ul className="mt-2 space-y-2 text-blue-700 dark:text-blue-400 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="mt-1">•</span>
                        <span>Introduce yourself clearly and have a brief, engaging description of what you do</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1">•</span>
                        <span>Listen actively to others and ask thoughtful follow-up questions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1">•</span>
                        <span>Follow up within a few days of the event to build on new connections</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1">•</span>
                        <span>Use the event app to schedule one-on-one meetings with other attendees</span>
                      </li>
                    </ul>
                  </div>
                </TabsContent>
                
                <TabsContent value="technology">
                  <div className="space-y-2">
                    {eventRules.technology.map((rule) => (
                      <Accordion key={rule.id} type="single" collapsible className="w-full">
                        <AccordionItem value={rule.id}>
                          <AccordionTrigger className="text-base font-medium">
                            {rule.title}
                          </AccordionTrigger>
                          <AccordionContent className="text-gray-700 dark:text-gray-300">
                            {rule.description}
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                    <Card className="bg-gray-50 dark:bg-gray-800/50">
                      <CardContent className="p-4 flex items-start gap-3">
                        <Smartphone className="h-8 w-8 text-teal-600 dark:text-teal-400 flex-shrink-0 mt-1" />
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">App Features</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            The event app offers scheduling, networking, maps, and notifications features. Make sure to enable notifications for important updates.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gray-50 dark:bg-gray-800/50">
                      <CardContent className="p-4 flex items-start gap-3">
                        <Coffee className="h-8 w-8 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-1" />
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">Lounge Areas</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Dedicated lounge areas with power outlets are available throughout the venue for work and relaxation. Please share these spaces during peak times.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
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
