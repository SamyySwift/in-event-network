
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Speaker {
  id: string;
  name: string;
  title?: string;
  company?: string;
  bio: string;
  photo_url?: string;
  session_title?: string;
  session_time?: string;
  twitter_link?: string;
  linkedin_link?: string;
  website_link?: string;
  created_at: string;
  updated_at: string;
}

export const useSpeakers = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: speakers = [], isLoading, error } = useQuery({
    queryKey: ['speakers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('speakers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching speakers:', error);
        throw error;
      }
      return data as Speaker[];
    },
  });

  const uploadImage = async (file: File): Promise<string> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
      const filePath = `speakers/${fileName}`;

      console.log('Uploading image to:', filePath);

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

      console.log('Image uploaded successfully:', publicUrl);
      return publicUrl;
    } catch (error) {
      console.error('Error in uploadImage:', error);
      throw error;
    }
  };

  const createSpeakerMutation = useMutation({
    mutationFn: async (speakerData: Omit<Speaker, 'id' | 'created_at' | 'updated_at'> & { image?: File }) => {
      try {
        console.log('Creating speaker with data:', speakerData);
        
        let photoUrl = speakerData.photo_url;
        if (speakerData.image) {
          photoUrl = await uploadImage(speakerData.image);
        }

        const { image, ...dataWithoutImage } = speakerData;
        
        // Ensure required fields are not empty
        if (!dataWithoutImage.name || !dataWithoutImage.bio) {
          throw new Error('Name and bio are required fields');
        }

        const finalData = {
          ...dataWithoutImage,
          photo_url: photoUrl,
          // Convert empty strings to null for optional fields
          title: dataWithoutImage.title || null,
          company: dataWithoutImage.company || null,
          session_title: dataWithoutImage.session_title || null,
          session_time: dataWithoutImage.session_time ? dataWithoutImage.session_time + ':00' : null,
          twitter_link: dataWithoutImage.twitter_link || null,
          linkedin_link: dataWithoutImage.linkedin_link || null,
          website_link: dataWithoutImage.website_link || null,
        };

        console.log('Final speaker data:', finalData);

        const { data, error } = await supabase
          .from('speakers')
          .insert([finalData])
          .select()
          .single();

        if (error) {
          console.error('Database error:', error);
          throw error;
        }

        console.log('Speaker created successfully:', data);
        return data;
      } catch (error) {
        console.error('Error in createSpeakerMutation:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['speakers'] });
      toast({
        title: 'Speaker Added',
        description: 'The speaker has been added successfully.',
      });
    },
    onError: (error) => {
      console.error('Create speaker error:', error);
      toast({
        title: 'Error',
        description: `Failed to add speaker: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const updateSpeakerMutation = useMutation({
    mutationFn: async ({ id, image, ...speakerData }: Partial<Speaker> & { id: string; image?: File }) => {
      try {
        console.log('Updating speaker:', id, speakerData);
        
        let photoUrl = speakerData.photo_url;
        if (image) {
          photoUrl = await uploadImage(image);
        }

        const finalData = {
          ...speakerData,
          photo_url: photoUrl,
          // Convert empty strings to null for optional fields
          title: speakerData.title || null,
          company: speakerData.company || null,
          session_title: speakerData.session_title || null,
          session_time: speakerData.session_time ? speakerData.session_time + ':00' : null,
          twitter_link: speakerData.twitter_link || null,
          linkedin_link: speakerData.linkedin_link || null,
          website_link: speakerData.website_link || null,
        };

        console.log('Final update data:', finalData);

        const { data, error } = await supabase
          .from('speakers')
          .update(finalData)
          .eq('id', id)
          .select()
          .single();

        if (error) {
          console.error('Database update error:', error);
          throw error;
        }

        console.log('Speaker updated successfully:', data);
        return data;
      } catch (error) {
        console.error('Error in updateSpeakerMutation:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['speakers'] });
      toast({
        title: 'Speaker Updated',
        description: 'The speaker has been updated successfully.',
      });
    },
    onError: (error) => {
      console.error('Update speaker error:', error);
      toast({
        title: 'Error',
        description: `Failed to update speaker: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const deleteSpeakerMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting speaker:', id);
      const { error } = await supabase
        .from('speakers')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Delete error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['speakers'] });
      toast({
        title: 'Speaker Deleted',
        description: 'The speaker has been removed successfully.',
        variant: 'destructive',
      });
    },
    onError: (error) => {
      console.error('Delete speaker error:', error);
      toast({
        title: 'Error',
        description: `Failed to delete speaker: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  return {
    speakers,
    isLoading,
    error,
    createSpeaker: createSpeakerMutation.mutate,
    updateSpeaker: updateSpeakerMutation.mutate,
    deleteSpeaker: deleteSpeakerMutation.mutate,
    isCreating: createSpeakerMutation.isPending,
    isUpdating: updateSpeakerMutation.isPending,
    isDeleting: deleteSpeakerMutation.isPending,
    uploadImage,
  };
};
