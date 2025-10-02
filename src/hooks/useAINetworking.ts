import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useAINetworking = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateConversationStarters = async (userProfile: any, targetProfile: any) => {
    setLoading(true);
    try {
      console.log('Calling generate-conversation-starters function', { 
        userProfileId: userProfile.id, 
        targetProfileId: targetProfile.id 
      });
      
      const { data, error } = await supabase.functions.invoke('generate-conversation-starters', {
        body: { userProfile, targetProfile }
      });

      console.log('Function response:', { data, error });

      if (error) {
        console.error('Function error:', error);
        throw error;
      }
      
      return data.starters || [];
    } catch (error: any) {
      console.error('Error generating conversation starters:', error);
      toast({
        title: 'Error',
        description: error?.message || 'Failed to generate conversation starters. Using defaults.',
        variant: 'destructive'
      });
      return [
        "Hi! What brings you to this event?",
        "I'd love to hear about what you're working on.",
        "Are there any sessions you're particularly excited about?"
      ];
    } finally {
      setLoading(false);
    }
  };

  const matchProfiles = async (userProfile: any, allProfiles: any[]) => {
    setLoading(true);
    try {
      console.log('Calling match-profiles function', { 
        userProfileId: userProfile.id,
        allProfilesCount: allProfiles.length
      });
      
      const { data, error } = await supabase.functions.invoke('match-profiles', {
        body: { userProfile, allProfiles }
      });

      console.log('Function response:', { data, error });

      if (error) {
        console.error('Function error:', error);
        throw error;
      }
      
      return data.matches || [];
    } catch (error: any) {
      console.error('Error matching profiles:', error);
      toast({
        title: 'Error',
        description: error?.message || 'Failed to generate AI matches.',
        variant: 'destructive'
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    generateConversationStarters,
    matchProfiles,
    loading
  };
};
