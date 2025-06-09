
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'high' | 'normal' | 'low';
  send_immediately: boolean;
  image_url?: string;
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
      if (!currentUser?.id) {
        throw new Error('User not authenticated');
      }

      console.log('Fetching announcements for admin:', currentUser.id);

      // Only fetch announcements created by the current admin
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('created_by', currentUser.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching announcements:', error);
        throw error;
      }

      console.log('Announcements fetched:', data?.length || 0);
      return data as Announcement[];
    },
    enabled: !!currentUser?.id,
  });

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `announcements/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('media')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const createAnnouncementMutation = useMutation({
    mutationFn: async (announcementData: Omit<Announcement, 'id' | 'created_at' | 'updated_at'> & { image?: File }) => {
      if (!currentUser?.id) {
        throw new Error('User not authenticated');
      }

      let imageUrl;
      if (announcementData.image) {
        imageUrl = await uploadImage(announcementData.image);
      }

      const { image, ...dataWithoutImage } = announcementData;
      const finalData = {
        ...dataWithoutImage,
        image_url: imageUrl || announcementData.image_url,
        created_by: currentUser.id
      };

      const { data, error } = await supabase
        .from('announcements')
        .insert([finalData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements', currentUser?.id] });
      toast({
        title: 'Announcement Created',
        description: 'The announcement has been published successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create announcement. Please try again.',
        variant: 'destructive',
      });
      console.error('Error creating announcement:', error);
    },
  });

  const updateAnnouncementMutation = useMutation({
    mutationFn: async ({ id, image, ...announcementData }: Partial<Announcement> & { id: string; image?: File }) => {
      let imageUrl = announcementData.image_url;
      if (image) {
        imageUrl = await uploadImage(image);
      }

      const finalData = {
        ...announcementData,
        image_url: imageUrl,
      };

      const { data, error } = await supabase
        .from('announcements')
        .update(finalData)
        .eq('id', id)
        .eq('created_by', currentUser?.id) // Ensure user can only update their own announcements
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements', currentUser?.id] });
      toast({
        title: 'Announcement Updated',
        description: 'The announcement has been updated successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update announcement. Please try again.',
        variant: 'destructive',
      });
      console.error('Error updating announcement:', error);
    },
  });

  const deleteAnnouncementMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id)
        .eq('created_by', currentUser?.id); // Ensure user can only delete their own announcements

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements', currentUser?.id] });
      toast({
        title: 'Announcement Deleted',
        description: 'The announcement has been removed successfully.',
        variant: 'destructive',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete announcement. Please try again.',
        variant: 'destructive',
      });
      console.error('Error deleting announcement:', error);
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
    uploadImage,
  };
};
