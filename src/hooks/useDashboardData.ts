
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Activity {
  id: string;
  type: string;
  content: string;
  time: string;
  status: string;
}

export const useDashboardData = () => {
  const { currentUser } = useAuth();
  const [attendeesCount, setAttendeesCount] = useState(0);
  const [questionsCount, setQuestionsCount] = useState(0);
  const [pollResponsesCount, setPollResponsesCount] = useState(0);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchDashboardData();
    setupRealTimeSubscriptions();
  }, []);

  return {
    attendeesCount,
    questionsCount,
    pollResponsesCount,
    recentActivity,
    loading,
    refetch: fetchDashboardData
  };
};
