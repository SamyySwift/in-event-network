
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAttendeeEventContext } from '@/contexts/AttendeeEventContext';
import { getCache, setCache, slowNetworkQueryOptions } from '@/utils/queryCache';

export interface Rule {
  id: string;
  title: string;
  content: string;
  category?: string;
  priority?: 'high' | 'medium' | 'low';
  created_by?: string;
  created_at: string;
  updated_at?: string;
}

const CACHE_KEY = 'attendee-rules';

export const useAttendeeRules = () => {
  const { currentUser } = useAuth();
  const { hostEvents, hasJoinedEvent } = useAttendeeEventContext();

  const { data: rules = [], isLoading, error } = useQuery({
    queryKey: ['attendee-rules', currentUser?.id, hostEvents],
    queryFn: async () => {
      if (!currentUser?.id || !hasJoinedEvent || hostEvents.length === 0) {
        return [];
      }

      const { data, error } = await supabase
        .from('rules')
        .select('id, title, content, category, priority, created_at')
        .in('event_id', hostEvents)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const result = (data || []) as Rule[];
      setCache(`${CACHE_KEY}-${currentUser.id}`, result);
      return result;
    },
    enabled: !!currentUser?.id && hasJoinedEvent && hostEvents.length > 0,
    ...slowNetworkQueryOptions,
    placeholderData: () => currentUser?.id ? getCache<Rule[]>(`${CACHE_KEY}-${currentUser.id}`) ?? undefined : undefined,
  });

  return { rules, isLoading, error };
};
