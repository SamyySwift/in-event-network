
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

interface AttendeeContext {
  currentEventId: string | null;
  hostId: string | null;
  hostEvents: string[];
}

const CACHE_KEY = 'attendee-context-cache';

// Get cached context from localStorage
const getCachedContext = (userId: string): AttendeeContext | null => {
  try {
    const cached = localStorage.getItem(`${CACHE_KEY}-${userId}`);
    if (!cached) return null;
    const { data, timestamp } = JSON.parse(cached);
    // Cache valid for 10 minutes
    if (Date.now() - timestamp > 10 * 60 * 1000) {
      localStorage.removeItem(`${CACHE_KEY}-${userId}`);
      return null;
    }
    return data;
  } catch {
    return null;
  }
};

const setCachedContext = (userId: string, data: AttendeeContext) => {
  try {
    localStorage.setItem(`${CACHE_KEY}-${userId}`, JSON.stringify({ data, timestamp: Date.now() }));
  } catch {}
};

export const useAttendeeContext = () => {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();

  // Pre-populate cache from localStorage on mount
  useEffect(() => {
    if (currentUser?.id) {
      const cached = getCachedContext(currentUser.id);
      if (cached) {
        queryClient.setQueryData(['attendee-context', currentUser.id], cached);
      }
    }
  }, [currentUser?.id, queryClient]);

  const { data: context, isLoading, error } = useQuery({
    queryKey: ['attendee-context', currentUser?.id],
    queryFn: async (): Promise<AttendeeContext> => {
      if (!currentUser?.id) throw new Error('User not authenticated');

      // Get user profile and event in parallel if possible
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('current_event_id')
        .eq('id', currentUser.id)
        .single();

      if (!userProfile?.current_event_id) {
        return { currentEventId: null, hostId: null, hostEvents: [] };
      }

      const { data: currentEvent } = await supabase
        .from('events')
        .select('host_id')
        .eq('id', userProfile.current_event_id)
        .single();

      if (!currentEvent?.host_id) {
        return { currentEventId: userProfile.current_event_id, hostId: null, hostEvents: [] };
      }

      const { data: hostEvents } = await supabase
        .from('events')
        .select('id')
        .eq('host_id', currentEvent.host_id);

      const result: AttendeeContext = {
        currentEventId: userProfile.current_event_id,
        hostId: currentEvent.host_id,
        hostEvents: hostEvents?.map(e => e.id) || [],
      };

      setCachedContext(currentUser.id, result);
      return result;
    },
    enabled: !!currentUser?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false,
    retry: 1,
    placeholderData: () => currentUser?.id ? getCachedContext(currentUser.id) ?? undefined : undefined,
  });

  return { context, isLoading, error };
};
