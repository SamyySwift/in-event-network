
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
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import QRCodeGenerator from '@/components/admin/QRCodeGenerator';

const AdminDashboard = () => {
  const { events, isLoading: eventsLoading } = useEvents();
  const { speakers, isLoading: speakersLoading } = useSpeakers();
  const { announcements, isLoading: announcementsLoading } = useAnnouncements();
  const { currentUser } = useAuth();
  
  const [attendeesCount, setAttendeesCount] = useState(0);
  const [questionsCount, setQuestionsCount] = useState(0);
  const [pollResponsesCount, setPollResponsesCount] = useState(0);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchDashboardData();
    setupRealTimeSubscriptions();
  }, []);

  const fetchDashboardData = async () => {
    try {
      if (!currentUser) return;

      // Fetch attendees count for this host's events
      const { data: participants, error: participantsError } = await supabase
        .from('event_participants')
        .select(`
          user_id,
          events!inner(host_id)
        `)
        .eq('events.host_id', currentUser.id);
      
      if (!participantsError) {
        // Count unique attendees across all events
        const uniqueAttendees = new Set(participants?.map(p => p.user_id) || []);
        setAttendeesCount(uniqueAttendees.size);
      }

      // Fetch questions count for this host's events
      const { data: questions, error: questionsError } = await supabase
        .from('questions')
        .select(`
          id,
          events!inner(host_id)
        `)
        .eq('events.host_id', currentUser.id);
      
      if (!questionsError) {
        setQuestionsCount(questions?.length || 0);
      }

      // Fetch poll responses count for this host's polls
      const { data: pollVotes, error: pollVotesError } = await supabase
        .from('poll_votes')
        .select(`
          id,
          polls!inner(created_by)
        `)
        .eq('polls.created_by', currentUser.id);
      
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
      if (!currentUser) return;

      const activities = [];

      // Recent questions for this host's events
      const { data: recentQuestions } = await supabase
        .from('questions')
        .select(`
          id, 
          content, 
          created_at, 
          is_answered,
          events!inner(host_id)
        `)
        .eq('events.host_id', currentUser.id)
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

      // Recent registrations for this host's events
      const { data: recentParticipants } = await supabase
        .from('event_participants')
        .select(`
          created_at,
          profiles!inner(name),
          events!inner(host_id)
        `)
        .eq('events.host_id', currentUser.id)
        .order('created_at', { ascending: false })
        .limit(2);

      if (recentParticipants) {
        recentParticipants.forEach(participant => {
          activities.push({
            id: `registration-${participant.created_at}`,
            type: 'registration',
            content: `${participant.profiles.name || 'New user'} joined an event`,
            time: getTimeAgo(participant.created_at),
            status: 'success'
          });
        });
      }

      // Recent announcements by this host
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
    if (!currentUser) return;

    // Subscribe to event participants changes for this host's events
    const participantsChannel = supabase
      .channel('admin-participants-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'event_participants'
        },
        () => {
          console.log('Event participants updated, refetching...');
          fetchDashboardData();
        }
      )
      .subscribe();

    // Subscribe to questions changes for this host's events
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

    // Subscribe to poll votes changes for this host's polls
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
      supabase.removeChannel(participantsChannel);
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

  const metrics = [
    {
      title: 'Total Attendees',
      value: attendeesCount.toString(),
      change: 'Unique attendees',
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
          {/* Host Access Key Section */}
          <QRCodeGenerator />

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Latest updates from your events
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
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
