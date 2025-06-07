
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

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

  const { data: announcements = [], isLoading, error } = useQuery({
    queryKey: ['announcements', currentUser?.id],
    queryFn: async () => {
      if (!currentUser) {
        return [];
      }

      let query = supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });

      if (currentUser.role === 'host') {
        // Hosts see only their own announcements
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
        // Attendees see announcements from events they've joined
        const { data: participantData } = await supabase
          .from('event_participants')
          .select('event_id')
          .eq('user_id', currentUser.id);

        const eventIds = participantData?.map(p => p.event_id) || [];
        if (eventIds.length === 0) {
          return [];
        }
        query = query.in('event_id', eventIds);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching announcements:', error);
        throw error;
      }
      return data as Announcement[];
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
        description: 'The announcement has been created successfully.',
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
        .eq('created_by', currentUser.id) // Ensure only creator can update
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
        .eq('created_by', currentUser.id); // Ensure only creator can delete

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
