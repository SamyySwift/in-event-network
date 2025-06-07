import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'low' | 'normal' | 'high';
  image_url?: string;
  send_immediately: boolean;
  event_id?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export const useAnnouncements = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentUser } = useAuth();

  // Set up real-time subscription
  useEffect(() => {
    if (!currentUser) return;

    const channel = supabase
      .channel('announcements-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'announcements'
        },
        (payload) => {
          console.log('Announcements real-time update:', payload);
          queryClient.invalidateQueries({ queryKey: ['announcements'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser, queryClient]);

  const { data: announcements = [], isLoading, error } = useQuery({
    queryKey: ['announcements', currentUser?.id],
    queryFn: async () => {
      if (!currentUser) {
        return [];
      }

      try {
        let query = supabase
          .from('announcements')
          .select('*')
          .order('created_at', { ascending: false });

        if (currentUser.role === 'host') {
          // Hosts see announcements from their events
          const { data: hostEvents } = await supabase
            .from('events')
            .select('id')
            .eq('host_id', currentUser.id);

          const eventIds = hostEvents?.map(e => e.id) || [];
          if (eventIds.length === 0) {
            return [];
          }
          query = query.in('event_id', eventIds);
        } else if (currentUser.role === 'attendee') {
          // Get the user's profile to find their current event
          const { data: profile } = await supabase
            .from('profiles')
            .select('current_event_id')
            .eq('id', currentUser.id)
            .single();

          if (profile?.current_event_id) {
            // Get the current event to find the host
            const { data: currentEvent } = await supabase
              .from('events')
              .select('host_id')
              .eq('id', profile.current_event_id)
              .single();

            if (currentEvent?.host_id) {
              // Get all events from the same host
              const { data: hostEvents } = await supabase
                .from('events')
                .select('id')
                .eq('host_id', currentEvent.host_id);

              const eventIds = hostEvents?.map(e => e.id) || [];
              if (eventIds.length > 0) {
                query = query.in('event_id', eventIds);
              } else {
                return [];
              }
            } else {
              return [];
            }
          } else {
            return [];
          }
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching announcements:', error);
          throw error;
        }
        return data as Announcement[];
      } catch (error) {
        console.error('Error fetching announcements:', error);
        return [];
      }
    },
    enabled: !!currentUser,
  });

  const createAnnouncementMutation = useMutation({
    mutationFn: async (announcementData: Omit<Announcement, 'id' | 'created_at' | 'updated_at'>) => {
      if (!currentUser || currentUser.role !== 'host') {
        throw new Error('Only hosts can create announcements');
      }

      const { data, error } = await supabase
        .from('announcements')
        .insert([{
          ...announcementData,
          created_by: currentUser.id,
        }])
        .select()
        .single();

      if (error) {
        console.error('Create announcement error:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      toast({
        title: 'Announcement Created',
        description: 'The announcement has been published successfully.',
      });
    },
    onError: (error) => {
      console.error('Create announcement error:', error);
      toast({
        title: 'Error',
        description: `Failed to create announcement: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const updateAnnouncementMutation = useMutation({
    mutationFn: async ({ id, ...announcementData }: Partial<Announcement> & { id: string }) => {
      if (!currentUser || currentUser.role !== 'host') {
        throw new Error('Only hosts can update announcements');
      }

      const { data, error } = await supabase
        .from('announcements')
        .update(announcementData)
        .eq('id', id)
        .eq('created_by', currentUser.id)
        .select()
        .single();

      if (error) {
        console.error('Update announcement error:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      toast({
        title: 'Announcement Updated',
        description: 'The announcement has been updated successfully.',
      });
    },
    onError: (error) => {
      console.error('Update announcement error:', error);
      toast({
        title: 'Error',
        description: `Failed to update announcement: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const deleteAnnouncementMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!currentUser || currentUser.role !== 'host') {
        throw new Error('Only hosts can delete announcements');
      }

      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id)
        .eq('created_by', currentUser.id);

      if (error) {
        console.error('Delete announcement error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      toast({
        title: 'Announcement Deleted',
        description: 'The announcement has been removed successfully.',
        variant: 'destructive',
      });
    },
    onError: (error) => {
      console.error('Delete announcement error:', error);
      toast({
        title: 'Error',
        description: `Failed to delete announcement: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  return {
    announcements,
    isLoading,
    error,
    createAnnouncement: createAnnouncementMutation.mutate,
    updateAnnouncement: updateAnnouncementMutation.mutate,
    deleteAnnouncement: deleteAnnouncementMutation.mutate,
    isCreating: createAnnouncementMutation.isPending,
    isUpdating: updateAnnouncementMutation.isPending,
    isDeleting: deleteAnnouncementMutation.isPending,
  };
};
