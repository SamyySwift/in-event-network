
import React from 'react';
import { Calendar, Clock, User, MapPin, ExternalLink, Loader } from 'lucide-react';
import AppLayout from '@/components/layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useSpeakers } from '@/hooks/useSpeakers';
import EventAccessGuard from '@/components/EventAccessGuard';
import { useEventParticipation } from '@/hooks/useEventParticipation';

const AttendeeSchedule = () => {
  const { speakers, isLoading } = useSpeakers();
  const { getJoinedEvents, loading: participationLoading } = useEventParticipation();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getTimeStatus = (sessionTime: string) => {
    const now = new Date();
    const session = new Date(sessionTime);
    const diffHours = (session.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 0) return { status: 'completed', color: 'bg-gray-100 text-gray-800' };
    if (diffHours < 1) return { status: 'starting soon', color: 'bg-orange-100 text-orange-800' };
    if (diffHours < 24) return { status: 'today', color: 'bg-blue-100 text-blue-800' };
    return { status: 'upcoming', color: 'bg-green-100 text-green-800' };
  };

  // Group speakers by date
  const groupedSpeakers = speakers.reduce((acc, speaker) => {
    if (!speaker.session_time) return acc;
    
    const date = formatDate(speaker.session_time);
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(speaker);
    return acc;
  }, {} as Record<string, typeof speakers>);

  // Sort speakers within each date by time
  Object.keys(groupedSpeakers).forEach(date => {
    groupedSpeakers[date].sort((a, b) => {
      if (!a.session_time || !b.session_time) return 0;
      return new Date(a.session_time).getTime() - new Date(b.session_time).getTime();
    });
  });

  const hasEventAccess = getJoinedEvents().length > 0;

  if (isLoading || participationLoading) {
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
              View the complete schedule of speakers and sessions for this event.
            </p>
          </div>

          {Object.keys(groupedSpeakers).length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No Schedule Available
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  The event schedule hasn't been published yet. Check back later for updates.
                </p>
              </CardContent>
            </Card>
          ) : (
            Object.entries(groupedSpeakers).map(([date, dateSpeakers]) => (
              <div key={date} className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 border-b pb-2">
                  {date}
                </h2>
                <div className="space-y-4">
                  {dateSpeakers.map((speaker) => {
                    const timeStatus = speaker.session_time ? getTimeStatus(speaker.session_time) : null;
                    
                    return (
                      <Card key={speaker.id} className="overflow-hidden">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-4">
                              <Avatar className="h-12 w-12">
                                {speaker.photo_url ? (
                                  <AvatarImage src={speaker.photo_url} alt={speaker.name} />
                                ) : (
                                  <AvatarFallback className="bg-connect-100 text-connect-600">
                                    {speaker.name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                )}
                              </Avatar>
                              <div className="flex-1">
                                <CardTitle className="text-xl text-gray-900 dark:text-white">
                                  {speaker.session_title || 'Speaker Session'}
                                </CardTitle>
                                <CardDescription className="text-gray-600 dark:text-gray-400">
                                  <div className="flex items-center gap-4 mt-1">
                                    <div className="flex items-center">
                                      <User className="h-4 w-4 mr-1" />
                                      {speaker.name}
                                    </div>
                                    {speaker.session_time && (
                                      <div className="flex items-center">
                                        <Clock className="h-4 w-4 mr-1" />
                                        {formatTime(speaker.session_time)}
                                      </div>
                                    )}
                                  </div>
                                </CardDescription>
                              </div>
                            </div>
                            {timeStatus && (
                              <Badge className={timeStatus.color}>
                                {timeStatus.status}
                              </Badge>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">About the Speaker</h4>
                              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                                {speaker.bio}
                              </p>
                              {speaker.company && (
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  <strong>Company:</strong> {speaker.company}
                                </p>
                              )}
                              {speaker.title && (
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  <strong>Title:</strong> {speaker.title}
                                </p>
                              )}
                            </div>
                            <div className="space-y-3">
                              {speaker.linkedin_link && (
                                <Button variant="outline" size="sm" className="w-full" asChild>
                                  <a href={speaker.linkedin_link} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    LinkedIn
                                  </a>
                                </Button>
                              )}
                              {speaker.twitter_link && (
                                <Button variant="outline" size="sm" className="w-full" asChild>
                                  <a href={speaker.twitter_link} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    Twitter
                                  </a>
                                </Button>
                              )}
                              {speaker.website_link && (
                                <Button variant="outline" size="sm" className="w-full" asChild>
                                  <a href={speaker.website_link} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    Website
                                  </a>
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
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
