
import React, { useEffect, useState } from 'react';
import { Calendar, Users, MessageSquare, Megaphone, Clock, MapPin } from 'lucide-react';
import AppLayout from '@/components/layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { format, parseISO } from 'date-fns';

interface DashboardData {
  upcomingSessions: any[];
  recentAnnouncements: any[];
  totalAttendees: number;
  myConnections: number;
  currentEvent: any;
}

const AttendeeDashboard = () => {
  const { currentUser } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    upcomingSessions: [],
    recentAnnouncements: [],
    totalAttendees: 0,
    myConnections: 0,
    currentEvent: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      fetchDashboardData();
      
      // Set up real-time subscriptions
      const announcementsChannel = supabase
        .channel('announcements-realtime')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'announcements'
          },
          () => {
            console.log('Announcements updated');
            fetchDashboardData();
          }
        )
        .subscribe();

      const speakersChannel = supabase
        .channel('speakers-realtime')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'speakers'
          },
          () => {
            console.log('Speakers updated');
            fetchDashboardData();
          }
        )
        .subscribe();

      const participantsChannel = supabase
        .channel('participants-realtime')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'event_participants'
          },
          () => {
            console.log('Participants updated');
            fetchDashboardData();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(announcementsChannel);
        supabase.removeChannel(speakersChannel);
        supabase.removeChannel(participantsChannel);
      };
    }
  }, [currentUser]);

  const fetchDashboardData = async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    try {
      // Get user's profile to find their current event
      const { data: profile } = await supabase
        .from('profiles')
        .select('current_event_id')
        .eq('id', currentUser.id)
        .single();

      if (!profile?.current_event_id) {
        setLoading(false);
        return;
      }

      console.log('Fetching dashboard data for event:', profile.current_event_id);

      // Get current event details
      const { data: currentEvent } = await supabase
        .from('events')
        .select('*')
        .eq('id', profile.current_event_id)
        .single();

      console.log('Current event:', currentEvent);

      // Get host's events to fetch all related data
      let hostEventIds = [profile.current_event_id];
      if (currentEvent?.host_id) {
        const { data: hostEvents } = await supabase
          .from('events')
          .select('id')
          .eq('host_id', currentEvent.host_id);
        
        hostEventIds = hostEvents?.map(e => e.id) || [profile.current_event_id];
      }

      // Fetch upcoming sessions (speakers with session times)
      const { data: speakers } = await supabase
        .from('speakers')
        .select('*')
        .in('event_id', hostEventIds)
        .not('session_time', 'is', null)
        .gte('session_time', new Date().toISOString())
        .order('session_time', { ascending: true })
        .limit(5);

      // Fetch recent announcements
      const { data: announcements } = await supabase
        .from('announcements')
        .select('*')
        .in('event_id', hostEventIds)
        .order('created_at', { ascending: false })
        .limit(5);

      // Get total attendees count
      const { data: participants } = await supabase
        .from('event_participants')
        .select('user_id')
        .in('event_id', hostEventIds);

      // Get my connections count
      const { data: connections } = await supabase
        .from('connections')
        .select('id')
        .or(`requester_id.eq.${currentUser.id},recipient_id.eq.${currentUser.id}`)
        .eq('status', 'accepted');

      setDashboardData({
        upcomingSessions: speakers || [],
        recentAnnouncements: announcements || [],
        totalAttendees: participants?.length || 0,
        myConnections: connections?.length || 0,
        currentEvent: currentEvent,
      });

      console.log('Dashboard data loaded:', {
        speakers: speakers?.length,
        announcements: announcements?.length,
        participants: participants?.length,
        connections: connections?.length
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="animate-fade-in">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-600 bg-clip-text text-transparent">
            Welcome back, {currentUser?.name || 'Attendee'}!
          </h1>
          {dashboardData.currentEvent && (
            <div className="mt-2 flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{dashboardData.currentEvent.name}</span>
              {dashboardData.currentEvent.location && (
                <>
                  <span>•</span>
                  <span>{dashboardData.currentEvent.location}</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Total Attendees</p>
                  <p className="text-3xl font-bold">{dashboardData.totalAttendees}</p>
                </div>
                <Users className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">My Connections</p>
                  <p className="text-3xl font-bold">{dashboardData.myConnections}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Sessions Today</p>
                  <p className="text-3xl font-bold">{dashboardData.upcomingSessions.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100">Announcements</p>
                  <p className="text-3xl font-bold">{dashboardData.recentAnnouncements.length}</p>
                </div>
                <Megaphone className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Sessions */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Upcoming Sessions
              </CardTitle>
              <CardDescription>
                Don't miss these upcoming sessions and talks
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dashboardData.upcomingSessions.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.upcomingSessions.map((session) => (
                    <div key={session.id} className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex-shrink-0">
                        <Clock className="h-5 w-5 text-primary mt-1" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm">
                          {session.session_title || `${session.name}'s Session`}
                        </h4>
                        <p className="text-sm text-muted-foreground">by {session.name}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {format(parseISO(session.session_time), 'MMM d, h:mm a')}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No upcoming sessions scheduled</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Announcements */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-primary" />
                Recent Announcements
              </CardTitle>
              <CardDescription>
                Stay updated with the latest event announcements
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dashboardData.recentAnnouncements.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.recentAnnouncements.map((announcement) => (
                    <div key={announcement.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-start justify-between">
                        <h4 className="font-semibold text-sm">{announcement.title}</h4>
                        <Badge 
                          variant={announcement.priority === 'high' ? 'destructive' : 'secondary'}
                          className="text-xs"
                        >
                          {announcement.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {announcement.content}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {format(parseISO(announcement.created_at), 'MMM d, h:mm a')}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Megaphone className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No announcements yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default AttendeeDashboard;
