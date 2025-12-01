import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface GuestDashboardData {
  currentEvent: any;
  upcomingSessions: any[];
  recentAnnouncements: any[];
  facilities: any[];
}

export const useGuestDashboard = (eventId: string | null) => {
  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['guest-dashboard', eventId],
    queryFn: async (): Promise<GuestDashboardData> => {
      if (!eventId) {
        throw new Error('No event ID provided');
      }

      const now = new Date().toISOString();

      // Fetch all guest-accessible data in parallel
      const [
        eventResponse,
        announcementsResponse,
        sessionsResponse,
        facilitiesResponse,
      ] = await Promise.all([
        // Get event details
        supabase
          .from('events')
          .select('*')
          .eq('id', eventId)
          .maybeSingle(),

        // Get announcements
        supabase
          .from('announcements')
          .select('*')
          .eq('event_id', eventId)
          .order('created_at', { ascending: false })
          .limit(5),

        // Get upcoming schedule items
        supabase
          .from('schedule_items')
          .select('*')
          .eq('event_id', eventId)
          .gt('start_time', now)
          .order('start_time', { ascending: true })
          .limit(5),

        // Get facilities
        supabase
          .from('facilities')
          .select('*')
          .eq('event_id', eventId)
          .order('name', { ascending: true }),
      ]);

      return {
        currentEvent: eventResponse.data,
        upcomingSessions: sessionsResponse.data || [],
        recentAnnouncements: announcementsResponse.data || [],
        facilities: facilitiesResponse.data || [],
      };
    },
    enabled: !!eventId,
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
  });

  return {
    dashboardData,
    isLoading,
    error,
  };
};
