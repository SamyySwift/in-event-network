
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

      // Get only events hosted by the current admin
      const { count: eventsCount, error: eventsError } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('host_id', currentUser.id);

      if (eventsError) {
        console.error('Error fetching events count:', eventsError);
        throw eventsError;
      }

      // Get admin's events for other calculations
      const { data: events, error: eventsDataError } = await supabase
        .from('events')
        .select('id, start_time, end_time')
        .eq('host_id', currentUser.id);

      if (eventsDataError) {
        console.error('Error fetching events data:', eventsDataError);
        throw eventsDataError;
      }

      const eventIds = events?.map(e => e.id) || [];

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

      // Get counts only for the current admin's events
      const [attendeesResult, speakersResult, questionsResult] = await Promise.all([
        eventIds.length > 0 ? supabase
          .from('event_participants')
          .select('*', { count: 'exact', head: true })
          .in('event_id', eventIds) : { count: 0, error: null },
        
        eventIds.length > 0 ? supabase
          .from('speakers')
          .select('*', { count: 'exact', head: true })
          .in('event_id', eventIds) : { count: 0, error: null },
        
        eventIds.length > 0 ? supabase
          .from('questions')
          .select('*', { count: 'exact', head: true })
          .in('event_id', eventIds) : { count: 0, error: null }
      ]);

      if (attendeesResult.error) {
        console.error('Error fetching attendees:', attendeesResult.error);
      }
      if (speakersResult.error) {
        console.error('Error fetching speakers:', speakersResult.error);
      }
      if (questionsResult.error) {
        console.error('Error fetching questions:', questionsResult.error);
      }

      return {
        eventsCount: eventsCount || 0,
        attendeesCount: attendeesResult.count || 0,
        speakersCount: speakersResult.count || 0,
        questionsCount: questionsResult.count || 0,
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
