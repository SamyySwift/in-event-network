import React from 'react';
import AppLayout from '@/components/layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Megaphone, Clock, Loader } from 'lucide-react';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import EventAccessGuard from '@/components/EventAccessGuard';
import { useEventParticipation } from '@/hooks/useEventParticipation';

const AttendeeAnnouncements = () => {
  const { announcements, isLoading } = useAnnouncements();
  const { getJoinedEvents, loading: participationLoading } = useEventParticipation();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 hover:bg-red-200';
      case 'normal': return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'low': return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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
              <Megaphone className="h-8 w-8 mr-3" />
              Announcements
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Stay updated with the latest news and important information about the event.
            </p>
          </div>

          {announcements.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Megaphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No Announcements Yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Check back later for important updates and announcements from the event organizers.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <Card key={announcement.id} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-xl text-gray-900 dark:text-white">
                            {announcement.title}
                          </CardTitle>
                          <Badge className={getPriorityColor(announcement.priority)}>
                            {announcement.priority} priority
                          </Badge>
                          {announcement.send_immediately && (
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                              Urgent
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <Clock className="h-4 w-4 mr-1" />
                          {formatDate(announcement.created_at)}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none text-gray-700 dark:text-gray-300">
                      {announcement.content.split('\n').map((paragraph, index) => (
                        <p key={index} className="mb-2 last:mb-0">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                    {announcement.image_url && (
                      <div className="mt-4">
                        <img 
                          src={announcement.image_url} 
                          alt="Announcement" 
                          className="max-w-full h-auto rounded-lg"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </EventAccessGuard>
    </AppLayout>
  );
};

export default AttendeeAnnouncements;
