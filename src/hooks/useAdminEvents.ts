
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface Event {
  id: string;
  name: string;
  description?: string;
  start_time: string;
  end_time: string;
  location?: string;
  banner_url?: string;
  logo_url?: string;
  website?: string;
  host_id?: string;
  created_at: string;
  updated_at: string;
}

export const useAdminEvents = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentUser } = useAuth();

  const { data: events = [], isLoading, error } = useQuery({
    queryKey: ['admin-events', currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) {
        throw new Error('User not authenticated');
      }

      console.log('Fetching events for admin:', currentUser.id);
      
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('host_id', currentUser.id)
        .order('start_time', { ascending: true });

      if (error) {
        console.error('Error fetching admin events:', error);
        throw error;
      }
      
      console.log('Admin events fetched:', data?.length || 0);
      return data as Event[];
    },
    enabled: !!currentUser?.id,
  });

  const uploadImage = async (file: File): Promise<string> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
      const filePath = `events/${fileName}`;

      console.log('Uploading event image to:', filePath);

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      console.log('Event image uploaded successfully:', publicUrl);
      return publicUrl;
    } catch (error) {
      console.error('Error in uploadImage:', error);
      throw error;
    }
  };

  const createEventMutation = useMutation({
    mutationFn: async (eventData: Omit<Event, 'id' | 'created_at' | 'updated_at'> & { image?: File }) => {
      try {
        if (!currentUser?.id) {
          throw new Error('User not authenticated');
        }

        console.log('Creating event with data:', eventData);
        
        let bannerUrl = eventData.banner_url;
        if (eventData.image) {
          bannerUrl = await uploadImage(eventData.image);
        }

        const { image, ...dataWithoutImage } = eventData;
        
        if (!dataWithoutImage.name || !dataWithoutImage.start_time || !dataWithoutImage.end_time) {
          throw new Error('Name, start time, and end time are required fields');
        }

        const finalData = {
          ...dataWithoutImage,
          banner_url: bannerUrl,
          host_id: currentUser.id, // Ensure host_id is set to current user
          description: dataWithoutImage.description || null,
          location: dataWithoutImage.location || null,
          logo_url: dataWithoutImage.logo_url || null,
          website: dataWithoutImage.website || null,
        };

        console.log('Final event data:', finalData);

        const { data, error } = await supabase
          .from('events')
          .insert([finalData])
          .select()
          .single();

        if (error) {
          console.error('Database error:', error);
          throw error;
        }

        console.log('Event created successfully:', data);
        return data;
      } catch (error) {
        console.error('Error in createEventMutation:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
      toast({
        title: 'Event Created',
        description: 'The event has been created successfully.',
      });
    },
    onError: (error) => {
      console.error('Create event error:', error);
      toast({
        title: 'Error',
        description: `Failed to create event: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: async ({ id, image, ...eventData }: Partial<Event> & { id: string; image?: File }) => {
      try {
        console.log('Updating event:', id, eventData);
        
        let bannerUrl = eventData.banner_url;
        if (image) {
          bannerUrl = await uploadImage(image);
        }

        const finalData = {
          ...eventData,
          banner_url: bannerUrl,
          description: eventData.description || null,
          location: eventData.location || null,
          logo_url: eventData.logo_url || null,
          website: eventData.website || null,
        };

        console.log('Final update data:', finalData);

        const { data, error } = await supabase
          .from('events')
          .update(finalData)
          .eq('id', id)
          .eq('host_id', currentUser?.id) // Ensure user can only update their own events
          .select()
          .single();

        if (error) {
          console.error('Database update error:', error);
          throw error;
        }

        console.log('Event updated successfully:', data);
        return data;
      } catch (error) {
        console.error('Error in updateEventMutation:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
      toast({
        title: 'Event Updated',
        description: 'The event has been updated successfully.',
      });
    },
    onError: (error) => {
      console.error('Update event error:', error);
      toast({
        title: 'Error',
        description: `Failed to update event: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting event:', id);
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id)
        .eq('host_id', currentUser?.id); // Ensure user can only delete their own events

      if (error) {
        console.error('Delete error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
      toast({
        title: 'Event Deleted',
        description: 'The event has been removed successfully.',
        variant: 'destructive',
      });
    },
    onError: (error) => {
      console.error('Delete event error:', error);
      toast({
        title: 'Error',
        description: `Failed to delete event: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  return {
    events,
    isLoading,
    error,
    createEvent: createEventMutation.mutate,
    updateEvent: updateEventMutation.mutate,
    deleteEvent: deleteEventMutation.mutate,
    isCreating: createEventMutation.isPending,
    isUpdating: updateEventMutation.isPending,
    isDeleting: deleteEventMutation.isPending,
    uploadImage,
  };
};
