
import React from 'react';
import AppLayout from '@/components/layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Calendar, 
  MessageSquare, 
  BarChart3, 
  TrendingUp, 
  Bell,
  Megaphone,
  User
} from 'lucide-react';
import { useEvents } from '@/hooks/useEvents';
import { useSpeakers } from '@/hooks/useSpeakers';
import { useAnnouncements } from '@/hooks/useAnnouncements';

const HostDashboard = () => {
  const { events } = useEvents();
  const { speakers } = useSpeakers();
  const { announcements } = useAnnouncements();

  // Calculate metrics for this host's events only - all data comes from host-specific hooks
  const totalEvents = events?.length || 0;
  const totalSpeakers = speakers?.length || 0;
  const totalAnnouncements = announcements?.length || 0;
  
  const liveEvents = events?.filter(event => {
    const now = new Date();
    return new Date(event.start_time) <= now && new Date(event.end_time) >= now;
  }).length || 0;

  const upcomingEvents = events?.filter(event => {
    const now = new Date();
    return new Date(event.start_time) > now;
  }).length || 0;

  const metrics = [
    {
      title: 'Your Events',
      value: totalEvents.toString(),
      change: `${upcomingEvents} upcoming`,
      icon: Calendar,
      color: 'text-blue-600',
    },
    {
      title: 'Live Events',
      value: liveEvents.toString(),
      change: 'Currently active',
      icon: TrendingUp,
      color: 'text-green-600',
    },
    {
      title: 'Your Speakers',
      value: totalSpeakers.toString(),
      change: 'Registered',
      icon: User,
      color: 'text-purple-600',
    },
    {
      title: 'Your Announcements',
      value: totalAnnouncements.toString(),
      change: 'Published',
      icon: Megaphone,
      color: 'text-orange-600',
    },
  ];

  // Only show recent events if they exist
  const recentEvents = events
    ?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5) || [];

  // Only show recent announcements if they exist
  const recentAnnouncements = announcements
    ?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3) || [];

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Host Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome back! Here's what's happening with your events.
          </p>
        </div>

        {/* Metrics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => (
            <Card key={metric.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {metric.title}
                </CardTitle>
                <metric.icon className={`h-4 w-4 ${metric.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <p className="text-xs text-muted-foreground">
                  {metric.change}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Recent Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Your Recent Events
              </CardTitle>
              <CardDescription>
                Latest events you've created
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentEvents.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    No events created yet. Create your first event to get started!
                  </p>
                ) : (
                  recentEvents.map((event) => (
                    <div key={event.id} className="flex items-start space-x-3">
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {event.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(event.start_time).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {event.location || 'Online'}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Announcements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="h-5 w-5" />
                Your Recent Announcements
              </CardTitle>
              <CardDescription>
                Latest announcements you've published
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentAnnouncements.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    No announcements published yet
                  </p>
                ) : (
                  recentAnnouncements.map((announcement) => (
                    <div key={announcement.id} className="flex items-start space-x-3">
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {announcement.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(announcement.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge 
                        variant={announcement.priority === 'high' ? 'destructive' : 'outline'}
                        className="text-xs"
                      >
                        {announcement.priority}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Event Overview - Only showing this host's data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Your Event Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{upcomingEvents}</div>
                <p className="text-sm text-muted-foreground">Your Upcoming Events</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{liveEvents}</div>
                <p className="text-sm text-muted-foreground">Your Live Events</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{totalSpeakers}</div>
                <p className="text-sm text-muted-foreground">Your Speakers</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default HostDashboard;
