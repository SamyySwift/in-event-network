
import React from 'react';
import AppLayout from '@/components/layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, User, Loader, ExternalLink } from 'lucide-react';
import { useEvents } from '@/hooks/useEvents';
import { useSpeakers } from '@/hooks/useSpeakers';

const AttendeeSchedule = () => {
  const { events, isLoading: eventsLoading } = useEvents();
  const { speakers, isLoading: speakersLoading } = useSpeakers();

  const isLoading = eventsLoading || speakersLoading;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isEventLive = (startTime: string, endTime: string) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);
    return now >= start && now <= end;
  };

  const isEventUpcoming = (startTime: string) => {
    const now = new Date();
    const start = new Date(startTime);
    return now < start;
  };

  const groupEventsByDate = (events: any[]) => {
    const grouped: { [key: string]: any[] } = {};
    events.forEach(event => {
      const date = new Date(event.start_time).toDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(event);
    });
    return grouped;
  };

  const getSpeakerForSession = (sessionTitle?: string) => {
    if (!sessionTitle) return null;
    return speakers.find(speaker => 
      speaker.session_title?.toLowerCase() === sessionTitle.toLowerCase()
    );
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <Loader className="h-8 w-8 animate-spin" />
        </div>
      </AppLayout>
    );
  }

  const groupedEvents = groupEventsByDate(events);

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Event Schedule</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Stay updated with all the events and sessions happening at the conference.
          </p>
        </div>

        {events.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Events Scheduled
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Check back later for event updates or contact the organizers for more information.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedEvents).map(([date, dayEvents]) => (
              <div key={date}>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  {formatDate(dayEvents[0].start_time)}
                </h2>
                <div className="space-y-4">
                  {dayEvents
                    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
                    .map((event) => {
                      const speaker = getSpeakerForSession(event.name);
                      
                      return (
                        <Card key={event.id} className="overflow-hidden">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {event.name}
                                  </h3>
                                  {isEventLive(event.start_time, event.end_time) && (
                                    <Badge className="bg-red-100 text-red-800 hover:bg-red-200 animate-pulse">
                                      Live Now
                                    </Badge>
                                  )}
                                  {isEventUpcoming(event.start_time) && (
                                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                                      Upcoming
                                    </Badge>
                                  )}
                                </div>

                                {event.description && (
                                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                                    {event.description}
                                  </p>
                                )}

                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                  <div className="flex items-center">
                                    <Clock className="h-4 w-4 mr-1" />
                                    {formatTime(event.start_time)} - {formatTime(event.end_time)}
                                  </div>
                                  {event.location && (
                                    <div className="flex items-center">
                                      <MapPin className="h-4 w-4 mr-1" />
                                      {event.location}
                                    </div>
                                  )}
                                  {event.website && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-auto p-0 text-blue-600 hover:text-blue-800"
                                      onClick={() => window.open(event.website, '_blank')}
                                    >
                                      <ExternalLink className="h-4 w-4 mr-1" />
                                      Event Website
                                    </Button>
                                  )}
                                </div>

                                {speaker && (
                                  <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                      <Avatar className="h-10 w-10">
                                        {speaker.photo_url ? (
                                          <AvatarImage src={speaker.photo_url} alt={speaker.name} />
                                        ) : (
                                          <AvatarFallback className="bg-blue-100 text-blue-600">
                                            {speaker.name.split(' ').map(n => n[0]).join('')}
                                          </AvatarFallback>
                                        )}
                                      </Avatar>
                                      <div>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                          {speaker.name}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                          {speaker.title} {speaker.company && `at ${speaker.company}`}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        )}

        {speakers.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <User className="h-5 w-5 mr-2" />
              Featured Speakers
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {speakers.map((speaker) => (
                <Card key={speaker.id}>
                  <CardContent className="p-6 text-center">
                    <Avatar className="h-16 w-16 mx-auto mb-4">
                      {speaker.photo_url ? (
                        <AvatarImage src={speaker.photo_url} alt={speaker.name} />
                      ) : (
                        <AvatarFallback className="bg-blue-100 text-blue-600 text-lg">
                          {speaker.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {speaker.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {speaker.title} {speaker.company && `at ${speaker.company}`}
                    </p>
                    {speaker.session_title && (
                      <Badge variant="outline" className="mb-3">
                        {speaker.session_title}
                      </Badge>
                    )}
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {speaker.bio}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default AttendeeSchedule;
