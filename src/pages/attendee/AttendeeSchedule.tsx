import React from 'react';
import { Calendar, Clock, MapPin, User, Loader } from 'lucide-react';
import AppLayout from '@/components/layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSpeakers } from '@/hooks/useSpeakers';
import EventAccessGuard from '@/components/EventAccessGuard';
import { useEventParticipation } from '@/hooks/useEventParticipation';

const AttendeeSchedule = () => {
  const { speakers, loading } = useSpeakers();
  const { getJoinedEvents, loading: participationLoading } = useEventParticipation();

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  // Group speakers by date
  const groupedByDate = speakers.reduce((acc, speaker) => {
    if (!speaker.session_time) return acc;
    
    const date = new Date(speaker.session_time).toDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(speaker);
    return acc;
  }, {} as Record<string, typeof speakers>);

  // Sort sessions within each date by time
  Object.keys(groupedByDate).forEach(date => {
    groupedByDate[date].sort((a, b) => {
      if (!a.session_time || !b.session_time) return 0;
      return new Date(a.session_time).getTime() - new Date(b.session_time).getTime();
    });
  });

  const hasEventAccess = getJoinedEvents().length > 0;

  if (loading || participationLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <Loader className="h-8 w-8 animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <EventAccessGuard hasAccess={hasEventAccess} loading={participationLoading}>
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
              <Calendar className="h-8 w-8 mr-3" />
              Event Schedule
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Explore the event schedule and plan your day.
            </p>
          </div>

          {Object.keys(groupedByDate).length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No Sessions Scheduled
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Check back later for the event schedule and session details.
                </p>
              </CardContent>
            </Card>
          ) : (
            Object.entries(groupedByDate).sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime()).map(([date, sessions]) => (
              <div key={date} className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  <Clock className="inline-block h-6 w-6 mr-2 align-middle" />
                  {formatDateTime(date)}
                </h2>
                <div className="space-y-4">
                  {sessions.map((speaker) => (
                    <Card key={speaker.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <div className="flex items-center">
                          <Avatar className="h-10 w-10 mr-4">
                            {speaker.photo_url ? (
                              <AvatarImage src={speaker.photo_url} alt={speaker.name} />
                            ) : (
                              <AvatarFallback className="bg-connect-100 text-connect-600 dark:bg-connect-900 dark:text-connect-300">
                                {speaker.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg text-gray-900 dark:text-white">{speaker.session_title}</CardTitle>
                            <CardDescription className="text-sm text-gray-500 dark:text-gray-400">
                              {speaker.name}, {speaker.title}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center text-gray-600 dark:text-gray-300 mb-2">
                          <Clock className="h-4 w-4 mr-2" />
                          <span>{formatTime(speaker.session_time)}</span>
                        </div>
                        <div className="flex items-center text-gray-600 dark:text-gray-300 mb-2">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span>{speaker.location || 'TBD'}</span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {speaker.session_description}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </EventAccessGuard>
    </AppLayout>
  );
};

export default AttendeeSchedule;
