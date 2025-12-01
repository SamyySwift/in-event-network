import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface GuestEvent {
  id: string;
  name: string;
  description: string | null;
  start_time: string;
  end_time: string;
  location: string | null;
  host_id: string | null;
  logo_url: string | null;
  banner_url: string | null;
}

interface GuestEventContextType {
  guestEventId: string | null;
  guestEvent: GuestEvent | null;
  isGuestMode: boolean;
  isLoading: boolean;
  setGuestEvent: (eventId: string) => void;
  clearGuestEvent: () => void;
}

const GuestEventContext = createContext<GuestEventContextType | undefined>(undefined);

const GUEST_EVENT_KEY = 'guest_event_id';

export const GuestEventProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [guestEventId, setGuestEventId] = useState<string | null>(() => {
    return sessionStorage.getItem(GUEST_EVENT_KEY);
  });
  const [guestEvent, setGuestEventData] = useState<GuestEvent | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch event data when guestEventId changes
  useEffect(() => {
    const fetchEvent = async () => {
      if (!guestEventId) {
        setGuestEventData(null);
        return;
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('events')
          .select('id, name, description, start_time, end_time, location, host_id, logo_url, banner_url')
          .eq('id', guestEventId)
          .single();

        if (error) {
          console.error('Error fetching guest event:', error);
          setGuestEventData(null);
        } else {
          setGuestEventData(data);
        }
      } catch (err) {
        console.error('Error in fetchEvent:', err);
        setGuestEventData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [guestEventId]);

  const setGuestEvent = (eventId: string) => {
    sessionStorage.setItem(GUEST_EVENT_KEY, eventId);
    setGuestEventId(eventId);
  };

  const clearGuestEvent = () => {
    sessionStorage.removeItem(GUEST_EVENT_KEY);
    setGuestEventId(null);
    setGuestEventData(null);
  };

  const value: GuestEventContextType = {
    guestEventId,
    guestEvent,
    // isGuestMode should be true as soon as we have a guestEventId, regardless of loading state
    isGuestMode: !!guestEventId,
    isLoading,
    setGuestEvent,
    clearGuestEvent,
  };

  return (
    <GuestEventContext.Provider value={value}>
      {children}
    </GuestEventContext.Provider>
  );
};

export const useGuestEventContext = () => {
  const context = useContext(GuestEventContext);
  if (context === undefined) {
    throw new Error('useGuestEventContext must be used within a GuestEventProvider');
  }
  return context;
};
