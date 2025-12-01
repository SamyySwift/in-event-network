import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGuestEventContext } from '@/contexts/GuestEventContext';
import { useGuestDashboard } from '@/hooks/useGuestDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Megaphone, 
  Map as MapIcon,
  FileText,
  BarChart3,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { format } from 'date-fns';

const GuestDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { guestEventId, guestEvent, isLoading: contextLoading } = useGuestEventContext();
  const { dashboardData, isLoading, error } = useGuestDashboard(guestEventId);

  if (contextLoading || isLoading) {
    return (
      <div className="space-y-6 p-4">
        <Skeleton className="h-48 w-full rounded-xl" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-24 rounded-lg" />
          <Skeleton className="h-24 rounded-lg" />
          <Skeleton className="h-24 rounded-lg" />
          <Skeleton className="h-24 rounded-lg" />
        </div>
      </div>
    );
  }

  if (error || !dashboardData?.currentEvent) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <p className="text-muted-foreground mb-4">Unable to load event data</p>
        <Button onClick={() => navigate('/scan')}>Scan Another Event</Button>
      </div>
    );
  }

  const event = dashboardData.currentEvent;

  const quickActions = [
    { icon: Calendar, label: 'Schedule', path: '/attendee/schedule', color: 'bg-blue-500' },
    { icon: MapIcon, label: 'Facilities', path: '/attendee/map', color: 'bg-green-500' },
    { icon: BarChart3, label: 'Polls', path: '/attendee/polls', color: 'bg-purple-500' },
    { icon: Megaphone, label: 'Announcements', path: '/attendee/announcements', color: 'bg-orange-500' },
    { icon: FileText, label: 'Rules', path: '/attendee/rules', color: 'bg-red-500' },
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* Event Header Card */}
      <Card className="overflow-hidden border-0 shadow-lg">
        {event.banner_url && (
          <div className="h-32 w-full overflow-hidden">
            <img 
              src={event.banner_url} 
              alt={event.name} 
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {event.logo_url && (
              <img 
                src={event.logo_url} 
                alt={`${event.name} logo`} 
                className="w-16 h-16 rounded-lg object-cover shadow-md"
              />
            )}
            <div className="flex-1">
              <h1 className="text-xl font-bold text-foreground">{event.name}</h1>
              {event.location && (
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin className="h-3 w-3" />
                  {event.location}
                </p>
              )}
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <Clock className="h-3 w-3" />
                {format(new Date(event.start_time), 'MMM d, yyyy • h:mm a')}
              </p>
            </div>
          </div>
          {event.description && (
            <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
              {event.description}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions Grid */}
      <div>
        <h2 className="text-lg font-semibold mb-3 px-1">Explore</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {quickActions.map((action) => (
            <Card 
              key={action.path}
              className="cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5 border-0 shadow"
              onClick={() => navigate(action.path)}
            >
              <CardContent className="p-4 flex flex-col items-center text-center">
                <div className={`${action.color} p-3 rounded-full mb-2`}>
                  <action.icon className="h-5 w-5 text-white" />
                </div>
                <span className="text-sm font-medium">{action.label}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Upcoming Sessions */}
      {dashboardData.upcomingSessions.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-lg font-semibold">Upcoming Sessions</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/attendee/schedule')}>
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <div className="space-y-2">
            {dashboardData.upcomingSessions.slice(0, 3).map((session: any) => (
              <Card key={session.id} className="border-0 shadow-sm">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <Calendar className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{session.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(session.start_time), 'h:mm a')} - {format(new Date(session.end_time), 'h:mm a')}
                      </p>
                    </div>
                    {session.location && (
                      <Badge variant="secondary" className="text-xs">
                        {session.location}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Recent Announcements */}
      {dashboardData.recentAnnouncements.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-lg font-semibold">Announcements</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/attendee/announcements')}>
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <div className="space-y-2">
            {dashboardData.recentAnnouncements.slice(0, 3).map((announcement: any) => (
              <Card key={announcement.id} className="border-0 shadow-sm">
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg">
                      <Megaphone className="h-4 w-4 text-orange-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{announcement.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                        {announcement.content}
                      </p>
                    </div>
                    {announcement.priority === 'high' && (
                      <Badge variant="destructive" className="text-xs">
                        Important
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Sign Up Prompt */}
      <Card className="border-2 border-primary/20 bg-primary/5">
        <CardContent className="p-4 text-center">
          <Sparkles className="h-8 w-8 text-primary mx-auto mb-2" />
          <h3 className="font-semibold mb-1">Want the full experience?</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Create an account to network with attendees, ask questions, and more!
          </p>
          <Button onClick={() => navigate('/register')} className="w-full">
            Create Account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default GuestDashboard;
