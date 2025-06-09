
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, ChevronRight, Search, Filter } from 'lucide-react';
import AppLayout from '@/components/layouts/AppLayout';
import AttendeeRouteGuard from '@/components/attendee/AttendeeRouteGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAttendeeSpeakers } from '@/hooks/useAttendeeSpeakers';
import { useAttendeeContext } from '@/hooks/useAttendeeContext';
import { format, isToday, isTomorrow, isYesterday, parseISO } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

interface ScheduleItem {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  location: string | null;
  type: string;
  priority: string;
  event_id: string;
}

interface CombinedScheduleItem {
  id: string;
  title: string;
  description?: string | null;
  start_time: string;
  end_time?: string;
  location?: string | null;
  type: 'speaker' | 'schedule';
  speaker_name?: string;
  speaker_photo?: string;
  speaker_company?: string;
  speaker_bio?: string;
  priority?: string;
}

const AttendeeSchedule = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>('all');
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [combinedItems, setCombinedItems] = useState<CombinedScheduleItem[]>([]);
  
  const { speakers, isLoading: speakersLoading, error } = useAttendeeSpeakers();
  const { context, isLoading: contextLoading } = useAttendeeContext();

  console.log('Attendee context:', context);
  console.log('Current event ID:', context?.currentEventId);

  // Fetch schedule items from database
  useEffect(() => {
    const fetchScheduleItems = async () => {
      if (!context?.currentEventId) {
        console.log('No current event ID, skipping schedule fetch');
        return;
      }

      try {
        console.log('Fetching schedule items for event:', context.currentEventId);
        
        const { data, error } = await supabase
          .from('schedule_items')
          .select('*')
          .eq('event_id', context.currentEventId)
          .order('start_time', { ascending: true });

        if (error) {
          console.error('Error fetching schedule items:', error);
          return;
        }

        console.log('Schedule items fetched:', data);
        setScheduleItems(data || []);
      } catch (error) {
        console.error('Error fetching schedule items:', error);
      }
    };

    if (context?.currentEventId) {
      fetchScheduleItems();
    }

    // Set up real-time subscription for schedule items
    if (context?.currentEventId) {
      const channel = supabase
        .channel('attendee-schedule-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'schedule_items',
            filter: `event_id=eq.${context.currentEventId}`
          },
          () => {
            console.log('Schedule items updated, refetching...');
            fetchScheduleItems();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [context?.currentEventId]);

  // Combine speakers and schedule items
  useEffect(() => {
    console.log('Combining speakers and schedule items');
    console.log('Speakers:', speakers);
    console.log('Schedule items:', scheduleItems);
    
    const combined: CombinedScheduleItem[] = [];

    // Add speaker sessions
    const speakersWithSessions = speakers.filter(speaker => 
      speaker.session_time && speaker.session_title
    );

    console.log('Speakers with sessions:', speakersWithSessions);

    speakersWithSessions.forEach(speaker => {
      combined.push({
        id: `speaker-${speaker.id}`,
        title: speaker.session_title!,
        description: speaker.bio,
        start_time: speaker.session_time!,
        location: undefined,
        type: 'speaker',
        speaker_name: speaker.name,
        speaker_photo: speaker.photo_url,
        speaker_company: speaker.company,
        speaker_bio: speaker.bio
      });
    });

    // Add schedule items
    scheduleItems.forEach(item => {
      combined.push({
        id: `schedule-${item.id}`,
        title: item.title,
        description: item.description,
        start_time: item.start_time,
        end_time: item.end_time,
        location: item.location,
        type: 'schedule',
        priority: item.priority
      });
    });

    // Sort by start time
    combined.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

    console.log('Combined items:', combined);
    setCombinedItems(combined);
  }, [speakers, scheduleItems]);

  // Filter items based on search and date
  const filteredItems = combinedItems.filter(item => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.speaker_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.speaker_company?.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedDate === 'all') return true;

    try {
      const sessionDate = parseISO(item.start_time);
      if (selectedDate === 'today') return isToday(sessionDate);
      if (selectedDate === 'tomorrow') return isTomorrow(sessionDate);
      if (selectedDate === 'yesterday') return isYesterday(sessionDate);
    } catch (error) {
      console.error('Error parsing date:', item.start_time, error);
      return false;
    }

    return true;
  });

  // Group items by date
  const groupedByDate = filteredItems.reduce((groups, item) => {
    try {
      const date = format(parseISO(item.start_time), 'yyyy-MM-dd');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(item);
    } catch (error) {
      console.error('Error formatting date:', item.start_time, error);
    }
    return groups;
  }, {} as Record<string, typeof filteredItems>);

  const formatDateHeader = (dateStr: string) => {
    try {
      const date = parseISO(dateStr);
      if (isToday(date)) return 'Today';
      if (isTomorrow(date)) return 'Tomorrow';
      if (isYesterday(date)) return 'Yesterday';
      return format(date, 'EEEE, MMMM d');
    } catch (error) {
      console.error('Error formatting date header:', dateStr, error);
      return dateStr;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'speaker':
        return <Badge variant="default">Speaker Session</Badge>;
      case 'schedule':
        return <Badge variant="secondary">Event Item</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getPriorityBadge = (priority?: string) => {
    if (!priority) return null;
    switch (priority) {
      case 'high':
        return <Badge className="bg-red-100 text-red-800">High Priority</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Medium Priority</Badge>;
      case 'low':
        return <Badge className="bg-green-100 text-green-800">Low Priority</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  if (speakersLoading || contextLoading) {
    return (
      <AppLayout>
        <AttendeeRouteGuard>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading schedule...</p>
            </div>
          </div>
        </AttendeeRouteGuard>
      </AppLayout>
    );
  }

  if (!context?.currentEventId) {
    return (
      <AppLayout>
        <AttendeeRouteGuard>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No Event Selected</h3>
              <p className="text-muted-foreground">You need to join an event to view its schedule.</p>
            </div>
          </div>
        </AttendeeRouteGuard>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <AttendeeRouteGuard>
        <div className="animate-fade-in max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Event Schedule</h1>
            <p className="text-gray-600 dark:text-gray-400">
              View sessions, speakers, and timing for the event
            </p>
            {context?.currentEventId && (
              <p className="text-sm text-muted-foreground mt-1">
                Event ID: {context.currentEventId}
              </p>
            )}
          </div>

          {/* Search and Filter */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search sessions, speakers, or events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Tabs value={selectedDate} onValueChange={setSelectedDate} className="w-auto">
                  <TabsList>
                    <TabsTrigger value="all">All Days</TabsTrigger>
                    <TabsTrigger value="today">Today</TabsTrigger>
                    <TabsTrigger value="tomorrow">Tomorrow</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardContent>
          </Card>

          {/* Debug Information */}
          <Card className="mb-6 bg-gray-50">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">Debug Information:</h3>
              <div className="text-sm space-y-1">
                <p>Total speakers: {speakers.length}</p>
                <p>Total schedule items: {scheduleItems.length}</p>
                <p>Combined items: {combinedItems.length}</p>
                <p>Filtered items: {filteredItems.length}</p>
              </div>
            </CardContent>
          </Card>

          {/* Schedule Content */}
          {filteredItems.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No schedule items found</h3>
                <p>
                  {combinedItems.length === 0 
                    ? "No schedule items have been created yet"
                    : "Try adjusting your search or filter criteria"
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8">
              {Object.keys(groupedByDate)
                .sort()
                .map(date => (
                  <div key={date}>
                    <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                      {formatDateHeader(date)}
                    </h2>
                    <div className="space-y-4">
                      {groupedByDate[date].map(item => (
                        <Card key={item.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="pt-6">
                            <div className="flex items-start gap-4">
                              {item.type === 'speaker' && (
                                <Avatar className="flex-shrink-0">
                                  {item.speaker_photo ? (
                                    <AvatarImage src={item.speaker_photo} alt={item.speaker_name} />
                                  ) : (
                                    <AvatarFallback>
                                      {item.speaker_name?.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                  )}
                                </Avatar>
                              )}
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                                      {item.title}
                                    </h3>
                                    {item.type === 'speaker' && (
                                      <p className="text-gray-600 dark:text-gray-400">
                                        by {item.speaker_name}
                                        {item.speaker_company && ` • ${item.speaker_company}`}
                                      </p>
                                    )}
                                  </div>
                                  <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                                </div>
                                
                                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    {(() => {
                                      try {
                                        const startTime = format(parseISO(item.start_time), 'h:mm a');
                                        const endTime = item.end_time ? ` - ${format(parseISO(item.end_time), 'h:mm a')}` : '';
                                        return startTime + endTime;
                                      } catch (error) {
                                        console.error('Error formatting time:', error);
                                        return item.start_time;
                                      }
                                    })()}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    {(() => {
                                      try {
                                        return format(parseISO(item.start_time), 'MMM d');
                                      } catch (error) {
                                        console.error('Error formatting date:', error);
                                        return item.start_time;
                                      }
                                    })()}
                                  </div>
                                  {item.location && (
                                    <div className="flex items-center gap-1">
                                      <MapPin className="h-4 w-4" />
                                      {item.location}
                                    </div>
                                  )}
                                </div>
                                
                                {item.description && (
                                  <p className="text-gray-700 dark:text-gray-300 text-sm mb-4">
                                    {item.description}
                                  </p>
                                )}
                                
                                <div className="flex items-center justify-between">
                                  <div className="flex gap-2">
                                    {getTypeBadge(item.type)}
                                    {getPriorityBadge(item.priority)}
                                  </div>
                                  <Button variant="outline" size="sm">
                                    View Details
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </AttendeeRouteGuard>
    </AppLayout>
  );
};

export default AttendeeSchedule;
