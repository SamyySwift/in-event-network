
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAttendeeContext } from '@/hooks/useAttendeeContext';
import { useDashboard } from '@/hooks/useDashboard';
import { Calendar, Users, MessageSquare, Bell, Clock, MapPin, QrCode, Ticket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TicketWallet from '@/components/tickets/TicketWallet';

const AttendeeDashboard = () => {
  const navigate = useNavigate();
  const { context: attendeeContext, isLoading: contextLoading } = useAttendeeContext();
  const { dashboardData, isLoading: dashboardLoading } = useDashboard();

  const currentEvent = attendeeContext?.currentEventId ? {
    id: attendeeContext.currentEventId,
    name: 'Current Event' // We don't have event name in context
  } : null;

  if (contextLoading || dashboardLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!currentEvent) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">No Event Joined</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              You haven't joined any events yet. Scan a QR code or enter an access code to join an event.
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => navigate('/scan')} className="flex items-center gap-2">
                <QrCode className="h-4 w-4" />
                Scan QR Code
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Welcome to Connect</h1>
          <p className="text-muted-foreground">
            You're connected to <span className="font-semibold">{currentEvent.name}</span>
          </p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          <Users className="h-3 w-3 mr-1" />
          Attendee
        </Badge>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/attendee/schedule')}>
          <CardContent className="p-6 text-center">
            <Calendar className="h-8 w-8 mx-auto mb-2 text-primary" />
            <h3 className="font-semibold">Schedule</h3>
            <p className="text-sm text-muted-foreground">View event agenda</p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/attendee/networking')}>
          <CardContent className="p-6 text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
            <h3 className="font-semibold">Networking</h3>
            <p className="text-sm text-muted-foreground">Connect with others</p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/attendee/announcements')}>
          <CardContent className="p-6 text-center">
            <Bell className="h-8 w-8 mx-auto mb-2 text-primary" />
            <h3 className="font-semibold">Updates</h3>
            <p className="text-sm text-muted-foreground">Latest announcements</p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/attendee/questions')}>
          <CardContent className="p-6 text-center">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 text-primary" />
            <h3 className="font-semibold">Q&A</h3>
            <p className="text-sm text-muted-foreground">Ask questions</p>
          </CardContent>
        </Card>
      </div>

      {/* Event Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Attendees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.attendees || 0}</div>
            <p className="text-xs text-muted-foreground">
              People connected to this event
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Polls</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.polls || 0}</div>
            <p className="text-xs text-muted-foreground">
              Live polls you can participate in
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Q&A Questions</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.questions || 0}</div>
            <p className="text-xs text-muted-foreground">
              Questions submitted to speakers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Ticket Wallet Section */}
      <TicketWallet />

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Welcome to the event!</p>
                <p className="text-xs text-muted-foreground">Connected successfully</p>
              </div>
              <div className="text-xs text-muted-foreground">Just now</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendeeDashboard;
