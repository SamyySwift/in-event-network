
import React, { createContext, useContext, ReactNode } from 'react';
import { useAttendeeContext } from '@/hooks/useAttendeeContext';

interface AttendeeEventContextType {
  currentEventId: string | null;
  hostId: string | null;
  hostEvents: string[];
  isLoading: boolean;
  error: any;
  hasJoinedEvent: boolean;
}

const AttendeeEventContext = createContext<AttendeeEventContextType | undefined>(undefined);

export const AttendeeEventProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { context, isLoading, error } = useAttendeeContext();

  // Add imports needed for reset and verification
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isParticipant, setIsParticipant] = React.useState<boolean>(false);
  const prevEventIdRef = React.useRef<string | null>(null);
  const { currentUser } = require('@/contexts/AuthContext').useAuth();
  const { useQueryClient } = require('@tanstack/react-query');
  const { supabase } = require('@/integrations/supabase/client');
  const queryClient = useQueryClient();

  React.useEffect(() => {
    const currId: string | null = context?.currentEventId || null;

    // If event changed, reset attendee session (caches + event-scoped localStorage)
    if (currId && prevEventIdRef.current && prevEventIdRef.current !== currId) {
      try {
        // Remove attendee-related and dashboard caches
        queryClient.removeQueries({
          predicate: (q: any) => {
            const key = Array.isArray(q.queryKey) ? String(q.queryKey[0]) : '';
            return (
              key === 'dashboard' ||
              key === 'current-event-id' ||
              key === 'is-participant' ||
              key === 'user-profile' ||
              key.startsWith('attendee-')
            );
          },
        });

        // Clear event-scoped localStorage keys
        const patterns = [
          /^announcementDismissed_/,
          /^announcementAcknowledged_/,
          /^vendor_form_submitted_/,
          /^poll_dismissed_/,
        ];
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (!k) continue;
          if (patterns.some((p) => p.test(k))) {
            keysToRemove.push(k);
          }
        }
        keysToRemove.forEach((k) => localStorage.removeItem(k));

        // Also clear any transient “pendingEventCode” used during switching
        sessionStorage.removeItem('pendingEventCode');
        // Optionally store the active event id for quick checks
        sessionStorage.setItem('active_event_id', currId);
      } catch (e) {
        console.warn('Error during attendee session reset:', e);
      }
    }

    // Update ref
    if (currId && prevEventIdRef.current !== currId) {
      prevEventIdRef.current = currId;
    }

    // Verify participant membership for the current event (block cross-event data)
    const verify = async () => {
      if (!currentUser?.id || !currId) {
        setIsParticipant(false);
        return;
      }
      const { data, error: participantError } = await supabase
        .from('event_participants')
        .select('id')
        .eq('user_id', currentUser.id)
        .eq('event_id', currId)
        .maybeSingle();

      if (participantError) {
        console.error('AttendeeEventContext - participant verify error:', participantError);
        setIsParticipant(false);
        return;
      }
      setIsParticipant(!!data);
    };

    verify();
  }, [context?.currentEventId]);

  console.log('AttendeeEventContext - context:', context);
  console.log('AttendeeEventContext - isLoading:', isLoading);
  console.log('AttendeeEventContext - error:', error);

  const value: AttendeeEventContextType = {
    currentEventId: context?.currentEventId || null,
    hostId: context?.hostId || null,
    hostEvents: context?.hostEvents || [],
    isLoading,
    error,
    hasJoinedEvent: !!context?.currentEventId && !!context?.hostId && isParticipant,
  };

  console.log('AttendeeEventContext - providing value:', value);

  return (
    <AttendeeEventContext.Provider value={value}>
      {children}
    </AttendeeEventContext.Provider>
  );
};

export const useAttendeeEventContext = () => {
  const context = useContext(AttendeeEventContext);
  if (context === undefined) {
    throw new Error('useAttendeeEventContext must be used within an AttendeeEventProvider');
  }
  return context;
};
