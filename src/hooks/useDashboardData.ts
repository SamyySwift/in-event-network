
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface DashboardData {
  currentEvent: any;
  upcomingEvents: any[];
  nextSession: any;
  recentAnnouncements: any[];
  suggestedConnections: any[];
}

export const useDashboardData = () => {
  const { currentUser } = useAuth();

  return useQuery({
    queryKey: ['dashboard-data', currentUser?.access_key],
    queryFn: async (): Promise<DashboardData> => {
      if (!currentUser?.access_key) {
        throw new Error('No access key available');
      }

      const now = new Date().toISOString();

      // Get current event
      const { data: currentEvent } = await supabase
        .from('events')
        .select('*')
        .eq('access_key', currentUser.access_key)
        .lte('start_time', now)
        .gte('end_time', now)
        .single();

      // Get upcoming events
      const { data: upcomingEvents } = await supabase
        .from('events')
        .select('*')
        .eq('access_key', currentUser.access_key)
        .gt('start_time', now)
        .order('start_time', { ascending: true })
        .limit(5);

      // Get next speaker session
      const { data: nextSession } = await supabase
        .from('speakers')
        .select('*')
        .eq('access_key', currentUser.access_key)
        .gt('session_time', now)
        .order('session_time', { ascending: true })
        .limit(1)
        .single();

      // Get recent announcements
      const { data: recentAnnouncements } = await supabase
        .from('announcements')
        .select('*')
        .eq('access_key', currentUser.access_key)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(3);

      // Get suggested connections
      const { data: suggestedConnections } = await supabase
        .from('profiles')
        .select('id, name, niche, company, photo_url')
        .eq('access_key', currentUser.access_key)
        .neq('id', currentUser.id)
        .limit(6);

      return {
        currentEvent: currentEvent || null,
        upcomingEvents: upcomingEvents || [],
        nextSession: nextSession || null,
        recentAnnouncements: recentAnnouncements || [],
        suggestedConnections: suggestedConnections || [],
      };
    },
    enabled: !!currentUser?.access_key,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};
