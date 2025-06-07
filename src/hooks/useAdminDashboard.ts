
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardData {
  eventsCount: number;
  attendeesCount: number;
  speakersCount: number;
  questionsCount: number;
  liveEventsCount: number;
  upcomingEventsCount: number;
}

export const useAdminDashboard = () => {
  const { currentUser } = useAuth();

  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['admin-dashboard', currentUser?.id],
    queryFn: async (): Promise<DashboardData> => {
      if (!currentUser?.id) {
        throw new Error('User not authenticated');
      }

      console.log('Fetching dashboard data for admin:', currentUser.id);

      const now = new Date().toISOString();

      // Get admin's events
      const { data: events, error: eventsError } = await supabase
        .from('events')
        .select('id, start_time, end_time')
        .eq('host_id', currentUser.id);

      if (eventsError) {
        console.error('Error fetching events:', eventsError);
        throw eventsError;
      }

      // Calculate live and upcoming events
      const liveEvents = events?.filter(event => {
        const start = new Date(event.start_time);
        const end = new Date(event.end_time);
        const current = new Date(now);
        return current >= start && current <= end;
      }) || [];

      const upcomingEvents = events?.filter(event => {
        const start = new Date(event.start_time);
        const current = new Date(now);
        return current < start;
      }) || [];

      // Get attendees count for admin's events
      const { data: attendees, error: attendeesError } = await supabase
        .from('event_participants')
        .select('id', { count: 'exact' })
        .in('event_id', events?.map(e => e.id) || []);
      
      if (attendeesError) {
        console.error('Error fetching attendees:', attendeesError);
      }

      // Get speakers count for admin's events
      const { data: speakers, error: speakersError } = await supabase
        .from('speakers')
        .select('id', { count: 'exact' })
        .in('event_id', events?.map(e => e.id) || []);

      if (speakersError) {
        console.error('Error fetching speakers:', speakersError);
      }

      // Get questions count for admin's events
      const { data: questions, error: questionsError } = await supabase
        .from('questions')
        .select('id', { count: 'exact' })
        .in('event_id', events?.map(e => e.id) || []);

      if (questionsError) {
        console.error('Error fetching questions:', questionsError);
      }

      return {
        eventsCount: events?.length || 0,
        attendeesCount: (attendees as any)?.length || 0,
        speakersCount: (speakers as any)?.length || 0,
        questionsCount: (questions as any)?.length || 0,
        liveEventsCount: liveEvents.length,
        upcomingEventsCount: upcomingEvents.length,
      };
    },
    enabled: !!currentUser?.id,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  return {
    dashboardData,
    isLoading,
    error,
  };
};
