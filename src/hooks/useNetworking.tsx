
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface NetworkingProfile {
  id: string;
  name: string;
  role: string;
  company: string;
  bio: string;
  niche: string;
  photo_url: string;
  networking_preferences: string[];
  tags: string[];
  links: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    instagram?: string;
    website?: string;
  };
}

export interface ConnectionRequest {
  id: string;
  requester_id: string;
  recipient_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

export const useNetworking = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<NetworkingProfile[]>([]);
  const [connections, setConnections] = useState<ConnectionRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      fetchProfiles();
      fetchConnections();
    }
  }, [currentUser]);

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('public_profiles')
        .select('*')
        .neq('id', currentUser?.id); // Exclude current user

      if (error) throw error;

      const formattedProfiles: NetworkingProfile[] = (data || []).map((profile) => ({
        id: profile.id,
        name: profile.name || '',
        role: profile.role || '',
        company: profile.company || '',
        bio: profile.bio || '',
        niche: profile.niche || '',
        photo_url: profile.photo_url || '',
        networking_preferences: profile.networking_preferences || [],
        tags: profile.tags || [],
        links: {
          twitter: profile.twitter_link || undefined,
          linkedin: profile.linkedin_link || undefined,
          github: profile.github_link || undefined,
          instagram: profile.instagram_link || undefined,
          website: profile.website_link || undefined,
        },
      }));

      setProfiles(formattedProfiles);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast({
        title: "Error",
        description: "Failed to fetch user profiles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchConnections = async () => {
    try {
      const { data, error } = await supabase
        .from('connections')
        .select('*')
        .or(`requester_id.eq.${currentUser?.id},recipient_id.eq.${currentUser?.id}`);

      if (error) throw error;

      // Type assertion to ensure proper typing
      const typedConnections: ConnectionRequest[] = (data || []).map(conn => ({
        id: conn.id,
        requester_id: conn.requester_id || '',
        recipient_id: conn.recipient_id || '',
        status: (conn.status as 'pending' | 'accepted' | 'rejected') || 'pending',
        created_at: conn.created_at
      }));

      setConnections(typedConnections);
    } catch (error) {
      console.error('Error fetching connections:', error);
    }
  };

  const sendConnectionRequest = async (recipientId: string) => {
    if (!currentUser) return;

    try {
      const { error } = await supabase
        .from('connections')
        .insert({
          requester_id: currentUser.id,
          recipient_id: recipientId,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Connection Request Sent",
        description: "Your connection request has been sent successfully.",
      });

      fetchConnections(); // Refresh connections
    } catch (error) {
      console.error('Error sending connection request:', error);
      toast({
        title: "Error",
        description: "Failed to send connection request",
        variant: "destructive",
      });
    }
  };

  const getConnectionStatus = (profileId: string) => {
    return connections.find(conn => 
      (conn.requester_id === currentUser?.id && conn.recipient_id === profileId) ||
      (conn.recipient_id === currentUser?.id && conn.requester_id === profileId)
    );
  };

  return {
    profiles,
    connections,
    loading,
    sendConnectionRequest,
    getConnectionStatus,
    refetch: fetchProfiles,
  };
};
