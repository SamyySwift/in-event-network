import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Users, 
  Calendar, 
  MessageSquare, 
  BarChart3, 
  TrendingUp, 
  Bell,
  Key,
  Copy,
  RefreshCw,
  User,
  Megaphone
} from 'lucide-react';
import { useEvents } from '@/hooks/useEvents';
import { useSpeakers } from '@/hooks/useSpeakers';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const { events, isLoading: eventsLoading, updateEvent } = useEvents();
  const { speakers, isLoading: speakersLoading } = useSpeakers();
  const { announcements, isLoading: announcementsLoading } = useAnnouncements();
  
  const [attendeesCount, setAttendeesCount] = useState(0);
  const [questionsCount, setQuestionsCount] = useState(0);
  const [pollResponsesCount, setPollResponsesCount] = useState(0);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  // Calculate metrics from real data
  const totalEvents = events.length;
  const totalSpeakers = speakers.length;
  const totalAnnouncements = announcements.length;
  
  const liveEvents = events.filter(event => {
    const now = new Date();
    return new Date(event.start_time) <= now && new Date(event.end_time) >= now;
  }).length;

  const upcomingEvents = events.filter(event => {
    const now = new Date();
    return new Date(event.start_time) > now;
  }).length;

  // Set the first event as selected by default
  useEffect(() => {
    if (events.length > 0 && !selectedEvent) {
      setSelectedEvent(events[0]);
    }
  }, [events, selectedEvent]);

  useEffect(() => {
    fetchDashboardData();
    setupRealTimeSubscriptions();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch attendees count
      const { data: attendees, error: attendeesError } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'attendee');
      
      if (!attendeesError) {
        setAttendeesCount(attendees?.length || 0);
      }

      // Fetch questions count
      const { data: questions, error: questionsError } = await supabase
        .from('questions')
        .select('id');
      
      if (!questionsError) {
        setQuestionsCount(questions?.length || 0);
      }

      // Fetch poll responses count
      const { data: pollVotes, error: pollVotesError } = await supabase
        .from('poll_votes')
        .select('id');
      
      if (!pollVotesError) {
        setPollResponsesCount(pollVotes?.length || 0);
      }

      // Fetch recent activity
      await fetchRecentActivity();
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const activities = [];

      // Recent questions
      const { data: recentQuestions } = await supabase
        .from('questions')
        .select('id, content, created_at, is_answered')
        .order('created_at', { ascending: false })
        .limit(2);

      if (recentQuestions) {
        recentQuestions.forEach(question => {
          activities.push({
            id: `question-${question.id}`,
            type: 'question',
            content: `New question: "${question.content.substring(0, 50)}${question.content.length > 50 ? '...' : ''}"`,
            time: getTimeAgo(question.created_at),
            status: question.is_answered ? 'answered' : 'pending'
          });
        });
      }

      // Recent registrations (new profiles)
      const { data: recentProfiles } = await supabase
        .from('profiles')
        .select('id, created_at, name')
        .order('created_at', { ascending: false })
        .limit(2);

      if (recentProfiles) {
        recentProfiles.forEach(profile => {
          activities.push({
            id: `registration-${profile.id}`,
            type: 'registration',
            content: `${profile.name || 'New user'} registered`,
            time: getTimeAgo(profile.created_at),
            status: 'success'
          });
        });
      }

      // Recent announcements
      const recentAnnouncementsList = announcements
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 2);

      recentAnnouncementsList.forEach(announcement => {
        activities.push({
          id: `announcement-${announcement.id}`,
          type: 'announcement',
          content: `New announcement: "${announcement.title}"`,
          time: getTimeAgo(announcement.created_at),
          status: 'published'
        });
      });

      // Sort by most recent
      activities.sort((a, b) => {
        const timeA = convertTimeAgoToDate(a.time);
        const timeB = convertTimeAgoToDate(b.time);
        return timeB.getTime() - timeA.getTime();
      });

      setRecentActivity(activities.slice(0, 4));
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    }
  };

  const setupRealTimeSubscriptions = () => {
    // Subscribe to profile changes (new registrations)
    const profilesChannel = supabase
      .channel('admin-profiles-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        () => {
          console.log('Profiles updated, refetching...');
          fetchDashboardData();
        }
      )
      .subscribe();

    // Subscribe to questions changes
    const questionsChannel = supabase
      .channel('admin-questions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'questions'
        },
        () => {
          console.log('Questions updated, refetching...');
          fetchDashboardData();
        }
      )
      .subscribe();

    // Subscribe to poll votes changes
    const pollVotesChannel = supabase
      .channel('admin-poll-votes-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'poll_votes'
        },
        () => {
          console.log('Poll votes updated, refetching...');
          fetchDashboardData();
        }
      )
      .subscribe();

    // Cleanup subscriptions on unmount
    return () => {
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(questionsChannel);
      supabase.removeChannel(pollVotesChannel);
    };
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    
    if (diffMinutes < 1) {
      return 'Just now';
    } else if (diffMinutes < 60) {
      return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    }
  };

  const convertTimeAgoToDate = (timeAgo: string): Date => {
    const now = new Date();
    if (timeAgo.includes('minute')) {
      const minutes = parseInt(timeAgo.split(' ')[0]);
      return new Date(now.getTime() - minutes * 60 * 1000);
    } else if (timeAgo.includes('hour')) {
      const hours = parseInt(timeAgo.split(' ')[0]);
      return new Date(now.getTime() - hours * 60 * 60 * 1000);
    } else if (timeAgo.includes('day')) {
      const days = parseInt(timeAgo.split(' ')[0]);
      return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    }
    return now;
  };

  const copyEventKey = (eventKey: string) => {
    navigator.clipboard.writeText(eventKey);
    toast.success('Event key copied to clipboard!');
  };

  const generateNewEventKey = async (eventId: string) => {
    try {
      // Generate a new random 6-digit key
      const newKey = Math.floor(100000 + Math.random() * 900000).toString();
      
      await updateEvent({ id: eventId, event_key: newKey });
      setSelectedEvent({ ...selectedEvent, event_key: newKey });
      toast.success('New event key generated successfully!');
    } catch (error) {
      toast.error('Failed to generate new event key');
      console.error('Error generating new event key:', error);
    }
  };

  const metrics = [
    {
      title: 'Total Attendees',
      value: attendeesCount.toString(),
      change: 'Registered',
      icon: Users,
      color: 'text-blue-600',
    },
    {
      title: 'Live Events',
      value: liveEvents.toString(),
      change: 'Currently active',
      icon: Calendar,
      color: 'text-green-600',
    },
    {
      title: 'Questions Asked',
      value: questionsCount.toString(),
      change: 'Total submitted',
      icon: MessageSquare,
      color: 'text-purple-600',
    },
    {
      title: 'Poll Responses',
      value: pollResponsesCount.toString(),
      change: 'Total votes',
      icon: BarChart3,
      color: 'text-orange-600',
    },
  ];

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Success</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'answered':
        return <Badge className="bg-blue-100 text-blue-800">Answered</Badge>;
      case 'published':
        return <Badge className="bg-purple-100 text-purple-800">Published</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const isDataLoading = loading || eventsLoading || speakersLoading || announcementsLoading;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your event.
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
                {isDataLoading ? (
                  <Skeleton className="h-8 w-16 mb-2" />
                ) : (
                  <div className="text-2xl font-bold">{metric.value}</div>
                )}
                <p className="text-xs text-muted-foreground">
                  {metric.change}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Event Key Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Key className="h-5 w-5" />
              Event Access Key
            </h2>
            
            {events.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>Event Access</CardTitle>
                  <CardDescription>
                    Share this 6-digit key with attendees to join your event
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {events.length > 1 && (
                    <div className="space-y-2">
                      <Label htmlFor="event-select">Select Event</Label>
                      <select
                        id="event-select"
                        className="w-full p-2 border rounded-md"
                        value={selectedEvent?.id || ''}
                        onChange={(e) => {
                          const event = events.find(ev => ev.id === e.target.value);
                          setSelectedEvent(event);
                        }}
                      >
                        {events.map((event) => (
                          <option key={event.id} value={event.id}>
                            {event.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  {selectedEvent && (
                    <>
                      <div className="space-y-2">
                        <Label>Event Key</Label>
                        <div className="flex gap-2">
                          <Input
                            value={selectedEvent.event_key || 'Generating...'}
                            readOnly
                            className="text-2xl font-mono text-center tracking-widest"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => copyEventKey(selectedEvent.event_key)}
                            disabled={!selectedEvent.event_key}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => generateNewEventKey(selectedEvent.id)}
                          className="flex-1"
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Generate New Key
                        </Button>
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        <p>Attendees can use this key to join the event at:</p>
                        <p className="font-mono bg-gray-100 p-2 rounded mt-1">
                          {window.location.origin}/join
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Key className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No Events Created
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Create an event first to get an access key for attendees.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Latest updates from your event
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isDataLoading ? (
                  // Loading skeletons
                  [...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-start space-x-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))
                ) : recentActivity.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    No recent activity found.
                  </p>
                ) : (
                  recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {activity.content}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {activity.time}
                        </p>
                      </div>
                      {getStatusBadge(activity.status)}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Event Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center">
                {isDataLoading ? (
                  <Skeleton className="h-8 w-16 mx-auto mb-2" />
                ) : (
                  <div className="text-2xl font-bold text-blue-600">{upcomingEvents}</div>
                )}
                <p className="text-sm text-muted-foreground">Upcoming Events</p>
              </div>
              <div className="text-center">
                {isDataLoading ? (
                  <Skeleton className="h-8 w-16 mx-auto mb-2" />
                ) : (
                  <div className="text-2xl font-bold text-green-600">{liveEvents}</div>
                )}
                <p className="text-sm text-muted-foreground">Live Events</p>
              </div>
              <div className="text-center">
                {isDataLoading ? (
                  <Skeleton className="h-8 w-16 mx-auto mb-2" />
                ) : (
                  <div className="text-2xl font-bold text-purple-600">{totalSpeakers}</div>
                )}
                <p className="text-sm text-muted-foreground">Total Speakers</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
