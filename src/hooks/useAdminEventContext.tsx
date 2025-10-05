
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Event {
  id: string;
  name: string;
  description?: string;
  start_time: string;
  end_time: string;
  location?: string;
  custom_title?: string | null;
  logo_url?: string | null;
  created_at: string;
}

interface AdminEventContextType {
  selectedEventId: string | null;
  setSelectedEventId: (eventId: string | null) => void;
  selectedEvent: Event | null;
  adminEvents: Event[];
  isLoading: boolean;
  error: any;
}

const AdminEventContext = createContext<AdminEventContextType | undefined>(undefined);

export const useAdminEventContext = () => {
  const context = useContext(AdminEventContext);
  if (!context) {
    throw new Error('useAdminEventContext must be used within AdminEventProvider');
  }
  return context;
};

export const AdminEventProvider = ({ children }: { children: ReactNode }) => {
  const { currentUser } = useAuth();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // Fetch admin's events
  const { data: adminEvents = [], isLoading, error } = useQuery({
    queryKey: ['admin-events', currentUser?.id],
    queryFn: async (): Promise<Event[]> => {
      if (!currentUser?.id) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('host_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching admin events:', error);
        throw error;
      }

      return data as Event[];
    },
    enabled: !!currentUser?.id,
  });

  // Auto-select the first event if none selected
  useEffect(() => {
    if (adminEvents.length > 0 && !selectedEventId) {
      setSelectedEventId(adminEvents[0].id);
    }
  }, [adminEvents, selectedEventId]);

  const selectedEvent = adminEvents.find(event => event.id === selectedEventId) || null;

  const value = {
    selectedEventId,
    setSelectedEventId,
    selectedEvent,
    adminEvents,
    isLoading,
    error,
  };

  return (
    <AdminEventContext.Provider value={value}>
      {children}
    </AdminEventContext.Provider>
  );
};
