
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface EventParticipation {
  id: string;
  user_id: string;
  event_id: string;
  joined_at: string;
  created_at: string;
}

export const useEventParticipation = () => {
  const [participations, setParticipations] = useState<EventParticipation[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (currentUser) {
      fetchParticipations();
    }
  }, [currentUser]);

  const fetchParticipations = async () => {
    try {
      const { data, error } = await supabase
        .from('event_participants')
        .select('*')
        .eq('user_id', currentUser?.id);

      if (error) throw error;
      setParticipations(data || []);
    } catch (error) {
      console.error('Error fetching event participations:', error);
    } finally {
      setLoading(false);
    }
  };

  const joinEvent = async (eventId: string) => {
    if (!currentUser) return false;

    try {
      const { error } = await supabase
        .from('event_participants')
        .insert({
          user_id: currentUser.id,
          event_id: eventId
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "You've successfully joined the event!",
      });

      await fetchParticipations();
      return true;
    } catch (error: any) {
      console.error('Error joining event:', error);
      if (error.code === '23505') {
        toast({
          title: "Already Joined",
          description: "You're already a participant in this event.",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to join event. Please try again.",
          variant: "destructive",
        });
      }
      return false;
    }
  };

  const hasJoinedEvent = (eventId: string) => {
    return participations.some(p => p.event_id === eventId);
  };

  const getJoinedEvents = () => {
    return participations.map(p => p.event_id);
  };

  return {
    participations,
    loading,
    joinEvent,
    hasJoinedEvent,
    getJoinedEvents,
    refetch: fetchParticipations
  };
};
