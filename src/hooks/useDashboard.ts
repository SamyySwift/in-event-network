
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useCallback } from 'react';

interface DashboardData {
  currentEvent: any;
  upcomingEvents: any[];
  nextSession: any;
  upcomingSessions: any[];
  recentAnnouncements: any[];
  suggestedConnections: any[];
}

const CACHE_KEY = 'attendee-dashboard-cache';
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

// Get cached data from localStorage
const getCachedData = (userId: string): DashboardData | null => {
  try {
    const cached = localStorage.getItem(`${CACHE_KEY}-${userId}`);
    if (!cached) return null;
    
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_EXPIRY) {
      localStorage.removeItem(`${CACHE_KEY}-${userId}`);
      return null;
    }
    return data;
  } catch {
    return null;
  }
};

// Set cached data to localStorage
const setCachedData = (userId: string, data: DashboardData) => {
  try {
    localStorage.setItem(`${CACHE_KEY}-${userId}`, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  } catch {
    // Ignore localStorage errors
  }
};

export const useDashboard = () => {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();

  // Initialize cache from localStorage on mount
  useEffect(() => {
    if (currentUser?.id) {
      const cached = getCachedData(currentUser.id);
      if (cached) {
        queryClient.setQueryData(['dashboard', currentUser.id], cached);
      }
    }
  }, [currentUser?.id, queryClient]);

  const fetchDashboard = useCallback(async (): Promise<DashboardData> => {
    if (!currentUser?.id) {
      throw new Error('User not authenticated');
    }

    const now = new Date().toISOString();

    // Get the user's current event from their profile
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('current_event_id')
      .eq('id', currentUser.id)
      .single();

    if (!userProfile?.current_event_id) {
      return {
        currentEvent: null,
        upcomingEvents: [],
        nextSession: null,
        upcomingSessions: [],
        recentAnnouncements: [],
        suggestedConnections: [],
      };
    }

    // Use Promise.all to run parallel queries - optimized with minimal fields
    const [
      currentEventResponse,
      announcementsResponse,
      upcomingSessionsResponse,
      suggestedConnectionsResponse
    ] = await Promise.all([
      // Get current event details (only essential fields)
      supabase
        .from('events')
        .select('id, name, description, start_time, end_time, location, banner_url, logo_url, host_id')
        .eq('id', userProfile.current_event_id)
        .single(),
      
      // Get recent announcements (limit 3)
      supabase
        .from('announcements')
        .select('id, title, content, created_at, priority, image_url, require_submission, vendor_form_id, twitter_link, instagram_link, facebook_link, tiktok_link, website_link, whatsapp_link')
        .eq('event_id', userProfile.current_event_id)
        .order('created_at', { ascending: false })
        .limit(3),

      // Get upcoming schedule items (limit 3)
      supabase
        .from('schedule_items')
        .select('id, title, description, start_time, end_time, location, type')
        .eq('event_id', userProfile.current_event_id)
        .gt('start_time', now)
        .order('start_time', { ascending: true })
        .limit(3),

      // Get suggested connections (limit 3, minimal fields)
      supabase
        .from('event_participants')
        .select(`
          user_id,
          profiles:user_id (
            id, name, company, bio, niche, photo_url
          )
        `)
        .eq('event_id', userProfile.current_event_id)
        .neq('user_id', currentUser.id)
        .limit(3)
    ]);

    const currentEventData = currentEventResponse.data;
    const isCurrentEventLive = currentEventData && 
      currentEventData.start_time <= now && 
      currentEventData.end_time >= now;

    const suggestedConnections = suggestedConnectionsResponse.data
      ?.map((participant: any) => participant.profiles)
      .filter(Boolean) || [];

    const result: DashboardData = {
      currentEvent: isCurrentEventLive ? currentEventData : null,
      upcomingEvents: [],
      nextSession: null,
      upcomingSessions: upcomingSessionsResponse.data || [],
      recentAnnouncements: announcementsResponse.data || [],
      suggestedConnections: suggestedConnections.slice(0, 3),
    };

    // Cache the result
    setCachedData(currentUser.id, result);

    return result;
  }, [currentUser?.id]);

  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['dashboard', currentUser?.id],
    queryFn: fetchDashboard,
    enabled: !!currentUser,
    staleTime: 2 * 60 * 1000, // Consider data fresh for 2 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus for slow connections
    refetchOnReconnect: true,
    retry: 1, // Only retry once on slow connections
    placeholderData: currentUser?.id ? getCachedData(currentUser.id) ?? undefined : undefined,
  });

  // Add realtime effect with debouncing
  useEffect(() => {
    if (!currentUser?.id) return;

    let debounceTimer: NodeJS.Timeout;
    
    const handleChange = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['dashboard', currentUser.id] });
      }, 2000); // Debounce by 2 seconds
    };

    // Only subscribe to critical tables
    const channel = supabase.channel('dashboard-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, handleChange)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'schedule_items' }, handleChange)
      .subscribe();

    return () => {
      clearTimeout(debounceTimer);
      supabase.removeChannel(channel);
    };
  }, [currentUser?.id, queryClient]);

  return {
    dashboardData,
    isLoading,
    error,
  };
};
