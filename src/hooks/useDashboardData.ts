
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export const useDashboardData = () => {
  const [attendeesCount, setAttendeesCount] = useState(0);
  const [questionsCount, setQuestionsCount] = useState(0);
  const [pollResponsesCount, setPollResponsesCount] = useState(0);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'host') {
      setLoading(false);
      return;
    }

    fetchDashboardData();
  }, [currentUser]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Get admin's events first
      const { data: adminEvents, error: eventsError } = await supabase
        .from('events')
        .select('id')
        .eq('host_id', currentUser!.id);

      if (eventsError) {
        console.error('Error fetching admin events:', eventsError);
        return;
      }

      const eventIds = adminEvents?.map(event => event.id) || [];

      if (eventIds.length === 0) {
        // New admin with no events - show empty dashboard
        setAttendeesCount(0);
        setQuestionsCount(0);
        setPollResponsesCount(0);
        setRecentActivity([]);
        setLoading(false);
        return;
      }

      // Fetch attendees count for admin's events
      const { data: participants, error: participantsError } = await supabase
        .from('event_participants')
        .select('user_id')
        .in('event_id', eventIds);

      if (participantsError) {
        console.error('Error fetching participants:', participantsError);
      } else {
        // Count unique attendees across all admin's events
        const uniqueAttendees = new Set(participants?.map(p => p.user_id) || []);
        setAttendeesCount(uniqueAttendees.size);
      }

      // Fetch questions count for admin's events - skip if table doesn't exist
      try {
        const { data: questions, error: questionsError } = await supabase
          .from('questions')
          .select('id')
          .in('event_id', eventIds);

        if (!questionsError) {
          setQuestionsCount(questions?.length || 0);
        }
      } catch (error) {
        console.log('Questions table not available');
        setQuestionsCount(0);
      }

      // Fetch poll responses count for admin's polls
      const { data: polls, error: pollsError } = await supabase
        .from('polls')
        .select('id')
        .in('event_id', eventIds);

      if (pollsError) {
        console.error('Error fetching polls:', pollsError);
      } else {
        const pollIds = polls?.map(poll => poll.id) || [];
        
        if (pollIds.length > 0) {
          const { data: pollVotes, error: votesError } = await supabase
            .from('poll_votes')
            .select('id')
            .in('poll_id', pollIds);

          if (votesError) {
            console.error('Error fetching poll votes:', votesError);
          } else {
            setPollResponsesCount(pollVotes?.length || 0);
          }
        } else {
          setPollResponsesCount(0);
        }
      }

      // Fetch recent activity for admin's events
      const recentActivityData = [];

      // Add recent announcements
      const { data: recentAnnouncements } = await supabase
        .from('announcements')
        .select('id, title, created_at')
        .in('event_id', eventIds)
        .order('created_at', { ascending: false })
        .limit(5);

      recentAnnouncements?.forEach(announcement => {
        recentActivityData.push({
          id: announcement.id,
          type: 'announcement',
          content: `Published: ${announcement.title}`,
          time: new Date(announcement.created_at).toLocaleDateString(),
          status: 'published'
        });
      });

      setRecentActivity(recentActivityData);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    attendeesCount,
    questionsCount,
    pollResponsesCount,
    recentActivity,
    loading,
    refetch: fetchDashboardData,
  };
};
