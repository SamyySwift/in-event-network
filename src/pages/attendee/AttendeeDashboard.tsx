
import React from "react";
import AppLayout from "@/components/layouts/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Clock, Ticket, QrCode, MessageSquare, Network, Bell, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useDashboard } from "@/hooks/useDashboard";
import { useAttendeeContext } from "@/hooks/useAttendeeContext";
import { format } from "date-fns";
import TicketWallet from "@/components/tickets/TicketWallet";

const AttendeeDashboard = () => {
  const { context: attendeeContext } = useAttendeeContext();
  const { dashboardData, isLoading } = useDashboard();
  const currentEvent = attendeeContext?.currentEvent;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!currentEvent) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <div className="p-4 rounded-full bg-primary/10 inline-block mb-4">
            <Calendar className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">No Event Selected</h2>
          <p className="text-muted-foreground mb-6">
            Join an event to access your personalized dashboard and features.
          </p>
          <Button asChild>
            <Link to="/scan">Join an Event</Link>
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Event Header */}
        <div className="text-center space-y-4">
          <div className="relative">
            {currentEvent.banner_url && (
              <div 
                className="h-32 rounded-xl bg-cover bg-center"
                style={{ backgroundImage: `url(${currentEvent.banner_url})` }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent rounded-xl flex items-center justify-center">
              <h1 className="text-3xl font-bold text-white">{currentEvent.name}</h1>
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(currentEvent.start_time), 'PPP')}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{format(new Date(currentEvent.start_time), 'p')}</span>
            </div>
            {currentEvent.location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{currentEvent.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* My Tickets Section */}
        <TicketWallet />

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
            <Link to="/scan">
              <QrCode className="h-6 w-6" />
              <span>Scan QR</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
            <Link to="/attendee/announcements">
              <Bell className="h-6 w-6" />
              <span>Announcements</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
            <Link to="/attendee/networking">
              <Network className="h-6 w-6" />
              <span>Networking</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
            <Link to="/attendee/questions">
              <HelpCircle className="h-6 w-6" />
              <span>Q&A</span>
            </Link>
          </Button>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Sessions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Schedule
              </CardTitle>
              <CardDescription>Upcoming sessions and activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardData?.upcomingSessions?.slice(0, 3).map((session: any) => (
                  <div key={session.id} className="flex items-start gap-3 p-2 rounded-lg border">
                    <div className="text-xs text-center min-w-0">
                      <div className="font-medium">
                        {format(new Date(session.start_time), 'HH:mm')}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{session.title}</div>
                      {session.location && (
                        <div className="text-xs text-muted-foreground">{session.location}</div>
                      )}
                    </div>
                  </div>
                )) || (
                  <p className="text-sm text-muted-foreground">No upcoming sessions</p>
                )}
              </div>
              <Button asChild variant="outline" size="sm" className="w-full mt-3">
                <Link to="/attendee/schedule">View Full Schedule</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Recent Announcements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Announcements
              </CardTitle>
              <CardDescription>Latest event updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardData?.recentAnnouncements?.slice(0, 2).map((announcement: any) => (
                  <div key={announcement.id} className="p-3 rounded-lg border">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={announcement.priority === 'high' ? 'destructive' : 'secondary'}>
                        {announcement.priority}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(announcement.created_at), 'MMM d')}
                      </span>
                    </div>
                    <h4 className="font-medium text-sm">{announcement.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {announcement.content}
                    </p>
                  </div>
                )) || (
                  <p className="text-sm text-muted-foreground">No recent announcements</p>
                )}
              </div>
              <Button asChild variant="outline" size="sm" className="w-full mt-3">
                <Link to="/attendee/announcements">View All</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Event Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Event Stats
              </CardTitle>
              <CardDescription>Event participation overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total Attendees</span>
                  <Badge variant="outline">{dashboardData?.totalAttendees || 0}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Active Polls</span>
                  <Badge variant="outline">{dashboardData?.activePolls || 0}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Q&A Sessions</span>
                  <Badge variant="outline">{dashboardData?.qaCount || 0}</Badge>
                </div>
              </div>
              <Button asChild variant="outline" size="sm" className="w-full mt-4">
                <Link to="/attendee/polls">Participate in Polls</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default AttendeeDashboard;
