
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardData {
  currentEvent: any;
  upcomingEvents: any[];
  nextSession: any;
  recentAnnouncements: any[];
  suggestedConnections: any[];
}

export const useDashboard = () => {
  const { currentUser } = useAuth();

  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['dashboard', currentUser?.id],
    queryFn: async (): Promise<DashboardData> => {
      const now = new Date().toISOString();

      // Get current/live events
      const { data: currentEvents } = await supabase
        .from('events')
        .select('*')
        .lte('start_time', now)
        .gte('end_time', now)
        .order('start_time', { ascending: true })
        .limit(1);

      // Get upcoming events
      const { data: upcomingEvents } = await supabase
        .from('events')
        .select('*')
        .gt('start_time', now)
        .order('start_time', { ascending: true })
        .limit(5);

      // Get recent announcements
      const { data: announcements } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);

      // Get speakers for upcoming sessions
      const { data: speakers } = await supabase
        .from('speakers')
        .select('*')
        .not('session_time', 'is', null)
        .gt('session_time', now)
        .order('session_time', { ascending: true })
        .limit(1);

      // Get suggested connections (other attendees)
      const { data: profiles } = await supabase
        .from('public_profiles')
        .select('*')
        .neq('id', currentUser?.id || '')
        .limit(3);

      return {
        currentEvent: currentEvents?.[0] || null,
        upcomingEvents: upcomingEvents || [],
        nextSession: speakers?.[0] || null,
        recentAnnouncements: announcements || [],
        suggestedConnections: profiles || [],
      };
    },
    enabled: !!currentUser,
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });

  return {
    dashboardData,
    isLoading,
    error,
  };
};
