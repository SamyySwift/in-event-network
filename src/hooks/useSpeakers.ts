
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

      if (error) throw error;
      return data as Speaker[];
    },
  });

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `speakers/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('media')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const createSpeakerMutation = useMutation({
    mutationFn: async (speakerData: Omit<Speaker, 'id' | 'created_at' | 'updated_at'> & { image?: File }) => {
      let photoUrl;
      if (speakerData.image) {
        photoUrl = await uploadImage(speakerData.image);
      }

      const { image, ...dataWithoutImage } = speakerData;
      const finalData = {
        ...dataWithoutImage,
        photo_url: photoUrl || speakerData.photo_url,
      };

      const { data, error } = await supabase
        .from('speakers')
        .insert([finalData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['speakers'] });
      toast({
        title: 'Speaker Added',
        description: 'The speaker has been added successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to add speaker. Please try again.',
        variant: 'destructive',
      });
      console.error('Error creating speaker:', error);
    },
  });

  const updateSpeakerMutation = useMutation({
    mutationFn: async ({ id, image, ...speakerData }: Partial<Speaker> & { id: string; image?: File }) => {
      let photoUrl = speakerData.photo_url;
      if (image) {
        photoUrl = await uploadImage(image);
      }

      const finalData = {
        ...speakerData,
        photo_url: photoUrl,
      };

      const { data, error } = await supabase
        .from('speakers')
        .update(finalData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['speakers'] });
      toast({
        title: 'Speaker Updated',
        description: 'The speaker has been updated successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update speaker. Please try again.',
        variant: 'destructive',
      });
      console.error('Error updating speaker:', error);
    },
  });

  const deleteSpeakerMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('speakers')
        .delete()
        .eq('id', id);

      if (error) throw error;
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
      toast({
        title: 'Error',
        description: 'Failed to delete speaker. Please try again.',
        variant: 'destructive',
      });
      console.error('Error deleting speaker:', error);
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
