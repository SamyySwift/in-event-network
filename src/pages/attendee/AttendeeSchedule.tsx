
import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, Users, ChevronRight, Calendar as CalendarFull } from 'lucide-react';
import { format } from 'date-fns';
import AppLayout from '@/components/layouts/AppLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { useIsMobile } from '@/hooks/use-mobile';

// Mock data for events
const events = [{
  id: 1,
  title: 'Opening Keynote',
  description: 'Welcome address by our CEO and introduction to the event',
  date: '2025-05-20',
  time: '09:00 AM - 10:00 AM',
  location: 'Main Hall',
  category: 'keynote',
  speakers: [{
    id: 1,
    name: 'Alex Johnson',
    role: 'CEO',
    photoUrl: null
  }],
  attendees: 120
}, {
  id: 2,
  title: 'Future of Tech Panel',
  description: 'Expert panel discussing upcoming trends in technology',
  date: '2025-05-20',
  time: '11:00 AM - 12:30 PM',
  location: 'Panel Room A',
  category: 'panel',
  speakers: [{
    id: 2,
    name: 'Maria Garcia',
    role: 'CTO',
    photoUrl: null
  }, {
    id: 3,
    name: 'John Smith',
    role: 'Research Director',
    photoUrl: null
  }],
  attendees: 85
}, {
  id: 3,
  title: 'Networking Lunch',
  description: 'Connect with other attendees over lunch',
  date: '2025-05-20',
  time: '12:30 PM - 02:00 PM',
  location: 'Dining Hall',
  category: 'networking',
  speakers: [],
  attendees: 200
}, {
  id: 4,
  title: 'Workshop: AI Integration',
  description: 'Hands-on workshop about implementing AI in your products',
  date: '2025-05-20',
  time: '02:30 PM - 04:00 PM',
  location: 'Workshop Room B',
  category: 'workshop',
  speakers: [{
    id: 4,
    name: 'David Lee',
    role: 'AI Specialist',
    photoUrl: null
  }],
  attendees: 40
}, {
  id: 5,
  title: 'Closing Remarks',
  description: 'Summary of the day and what to expect tomorrow',
  date: '2025-05-20',
  time: '04:30 PM - 05:00 PM',
  location: 'Main Hall',
  category: 'keynote',
  speakers: [{
    id: 1,
    name: 'Alex Johnson',
    role: 'CEO',
    photoUrl: null
  }],
  attendees: 110
}, {
  id: 6,
  title: 'Day 2 Keynote',
  description: 'Opening address for day 2 of the conference',
  date: '2025-05-21',
  time: '09:30 AM - 10:30 AM',
  location: 'Main Hall',
  category: 'keynote',
  speakers: [{
    id: 5,
    name: 'Sarah Williams',
    role: 'Product Director',
    photoUrl: null
  }],
  attendees: 105
}];

// Category badge colors and variants
const categoryColors = {
  keynote: {
    variant: 'default',
    className: 'bg-connect-500 text-white'
  },
  panel: {
    variant: 'secondary',
    className: 'bg-blue-500 text-white'
  },
  workshop: {
    variant: 'outline',
    className: 'border-amber-500 text-amber-700 dark:text-amber-400'
  },
  networking: {
    variant: 'secondary',
    className: 'bg-green-500 text-white'
  }
} as const;

const AttendeeSchedule = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTab, setSelectedTab] = useState('all');
  const isMobile = useIsMobile();

  // Format the selected date for filtering
  const formattedSelectedDate = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';

  // Filter events based on selected date and category
  const filteredEvents = events.filter(event => {
    const matchesDate = event.date === formattedSelectedDate;
    const matchesCategory = selectedTab === 'all' || event.category === selectedTab;
    return matchesDate && matchesCategory;
  });

  // Get unique dates for the calendar
  const eventDates = [...new Set(events.map(event => event.date))];
  // Convert string dates to Date objects for the calendar
  const highlightedDates = eventDates.map(date => new Date(date));

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6 max-w-7xl animate-fade-in">
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Event Schedule</h1>
              <p className="text-gray-600 dark:text-gray-400">Browse and manage your event schedule</p>
            </div>
            <Button className="bg-gradient-to-r from-connect-600 to-connect-700 hover:from-connect-700 hover:to-connect-800 text-white">
              <CalendarIcon className="mr-2 h-4 w-4" />
              Add to My Calendar
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar Section */}
            <div className="lg:col-span-1">
              <Card className="bg-white dark:bg-gray-800 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center text-gray-900 dark:text-white">
                    <CalendarFull className="h-5 w-5 mr-2 text-connect-600 dark:text-connect-400" />
                    Event Days
                  </CardTitle>
                  <CardDescription>Select a date to see the schedule</CardDescription>
                </CardHeader>
                <CardContent>
                  <Calendar 
                    mode="single" 
                    selected={selectedDate} 
                    onSelect={setSelectedDate} 
                    className="border rounded-md bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 p-2 w-full" 
                    modifiers={{
                      highlighted: highlightedDates
                    }} 
                    modifiersStyles={{
                      highlighted: {
                        fontWeight: 'bold',
                        backgroundColor: 'rgba(139, 92, 246, 0.15)',
                        color: '#8b5cf6',
                        borderRadius: '4px'
                      }
                    }} 
                  />
                </CardContent>
                <CardFooter className="flex justify-between text-sm text-gray-500">
                  <span>{events.length} total events</span>
                  <span>{formattedSelectedDate ? filteredEvents.length : 0} events today</span>
                </CardFooter>
              </Card>
            </div>

            {/* Events Section */}
            <div className="lg:col-span-2">
              <Card className="bg-white dark:bg-gray-800 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-gray-900 dark:text-white">
                    Events for {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Today'}
                  </CardTitle>
                  <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
                    <TabsList className="mb-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-md grid grid-cols-5 w-full">
                      <TabsTrigger value="all" className="text-xs sm:text-sm">All</TabsTrigger>
                      <TabsTrigger value="keynote" className="text-xs sm:text-sm">Keynotes</TabsTrigger>
                      <TabsTrigger value="panel" className="text-xs sm:text-sm">Panels</TabsTrigger>
                      <TabsTrigger value="workshop" className="text-xs sm:text-sm">Workshops</TabsTrigger>
                      <TabsTrigger value="networking" className="text-xs sm:text-sm">Network</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </CardHeader>
                <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
                  {filteredEvents.length > 0 ? (
                    filteredEvents.map(event => (
                      <div key={event.id} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-300 bg-white dark:bg-gray-800">
                        <div className="flex justify-between items-start gap-2 flex-wrap sm:flex-nowrap">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap gap-2 justify-between items-start mb-2">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">{event.title}</h3>
                              <Badge 
                                className={categoryColors[event.category as keyof typeof categoryColors]?.className} 
                                variant={categoryColors[event.category as keyof typeof categoryColors]?.variant || 'default'}
                              >
                                {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
                              </Badge>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 mt-1 line-clamp-2 text-sm">{event.description}</p>
                            <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3">
                              <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                                <Clock className="h-4 w-4 mr-1 text-connect-500 dark:text-connect-400" />
                                {event.time}
                              </div>
                              <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                                <MapPin className="h-4 w-4 mr-1 text-connect-500 dark:text-connect-400" />
                                {event.location}
                              </div>
                              <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                                <Users className="h-4 w-4 mr-1 text-connect-500 dark:text-connect-400" />
                                {event.attendees} attendees
                              </div>
                            </div>

                            {event.speakers.length > 0 && (
                              <div className="mt-4">
                                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Speakers:</div>
                                <div className="flex flex-wrap gap-2 mt-1">
                                  {event.speakers.map(speaker => (
                                    <HoverCard key={speaker.id}>
                                      <HoverCardTrigger asChild>
                                        <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-full cursor-pointer border border-gray-200 dark:border-gray-600">
                                          <Avatar className="h-6 w-6">
                                            <AvatarImage src={speaker.photoUrl || undefined} alt={speaker.name} />
                                            <AvatarFallback className="bg-connect-100 dark:bg-connect-900 text-connect-600 dark:text-connect-400">
                                              {speaker.name.charAt(0)}
                                            </AvatarFallback>
                                          </Avatar>
                                          <span className="text-sm text-gray-700 dark:text-gray-300">{speaker.name}</span>
                                        </div>
                                      </HoverCardTrigger>
                                      <HoverCardContent className="w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                        <div className="flex justify-between space-x-4">
                                          <Avatar className="h-12 w-12">
                                            <AvatarImage src={speaker.photoUrl || undefined} alt={speaker.name} />
                                            <AvatarFallback className="bg-connect-600 text-white">
                                              {speaker.name.charAt(0)}
                                            </AvatarFallback>
                                          </Avatar>
                                          <div className="space-y-1">
                                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{speaker.name}</h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{speaker.role}</p>
                                            <div className="flex items-center pt-2">
                                              <Button variant="outline" size="sm">View Profile</Button>
                                            </div>
                                          </div>
                                        </div>
                                      </HoverCardContent>
                                    </HoverCard>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex justify-end mt-4 gap-2">
                          <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                            Add to My Schedule
                          </Button>
                          <Button size="sm" className="bg-connect-600 hover:bg-connect-700 text-white text-xs sm:text-sm">
                            View Details
                            <ChevronRight className="ml-1 h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10">
                      <CalendarIcon className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600" />
                      <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No events found</h3>
                      <p className="mt-2 text-gray-500 dark:text-gray-400">
                        There are no events scheduled for this date or category.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default AttendeeSchedule;
