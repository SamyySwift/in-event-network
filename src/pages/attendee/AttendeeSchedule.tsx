
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
import { format, isToday, isTomorrow, isYesterday, parseISO } from 'date-fns';

const AttendeeSchedule = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>('all');
  
  const { speakers, isLoading, error } = useAttendeeSpeakers();

  // Filter speakers with sessions
  const speakersWithSessions = speakers.filter(speaker => 
    speaker.session_time && speaker.session_title
  );

  // Filter based on search and date
  const filteredSpeakers = speakersWithSessions.filter(speaker => {
    const matchesSearch = 
      speaker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      speaker.session_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      speaker.company?.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedDate === 'all') return true;

    if (speaker.session_time) {
      const sessionDate = parseISO(speaker.session_time);
      if (selectedDate === 'today') return isToday(sessionDate);
      if (selectedDate === 'tomorrow') return isTomorrow(sessionDate);
      if (selectedDate === 'yesterday') return isYesterday(sessionDate);
    }

    return true;
  });

  // Group speakers by date
  const groupedByDate = filteredSpeakers.reduce((groups, speaker) => {
    if (!speaker.session_time) return groups;
    
    const date = format(parseISO(speaker.session_time), 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(speaker);
    return groups;
  }, {} as Record<string, typeof filteredSpeakers>);

  // Sort each group by time
  Object.keys(groupedByDate).forEach(date => {
    groupedByDate[date].sort((a, b) => {
      if (!a.session_time || !b.session_time) return 0;
      return new Date(a.session_time).getTime() - new Date(b.session_time).getTime();
    });
  });

  const formatDateHeader = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'EEEE, MMMM d');
  };

  if (isLoading) {
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

  return (
    <AppLayout>
      <AttendeeRouteGuard>
        <div className="animate-fade-in max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Event Schedule</h1>
            <p className="text-gray-600 dark:text-gray-400">
              View sessions, speakers, and timing for the event
            </p>
          </div>

          {/* Search and Filter */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search sessions, speakers, or companies..."
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

          {/* Schedule Content */}
          {filteredSpeakers.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No sessions found</h3>
                <p>Try adjusting your search or filter criteria</p>
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
                      {groupedByDate[date].map(speaker => (
                        <Card key={speaker.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="pt-6">
                            <div className="flex items-start gap-4">
                              <Avatar className="flex-shrink-0">
                                {speaker.photo_url ? (
                                  <AvatarImage src={speaker.photo_url} alt={speaker.name} />
                                ) : (
                                  <AvatarFallback>
                                    {speaker.name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                )}
                              </Avatar>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                                      {speaker.session_title}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                      by {speaker.name}
                                      {speaker.company && ` • ${speaker.company}`}
                                    </p>
                                  </div>
                                  <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                                </div>
                                
                                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    {speaker.session_time && format(parseISO(speaker.session_time), 'h:mm a')}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    {speaker.session_time && format(parseISO(speaker.session_time), 'MMM d')}
                                  </div>
                                </div>
                                
                                <p className="text-gray-700 dark:text-gray-300 text-sm mb-4">
                                  {speaker.bio}
                                </p>
                                
                                <div className="flex items-center justify-between">
                                  <div className="flex gap-2">
                                    {speaker.title && (
                                      <Badge variant="secondary">{speaker.title}</Badge>
                                    )}
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
