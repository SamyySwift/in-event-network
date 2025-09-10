
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useAttendeeEventContext } from '@/contexts/AttendeeEventContext';

export interface ChatMessage {
  id: string;
  user_id: string;
  content: string;
  quoted_message_id: string | null;
  event_id: string | null;
  created_at: string;
  updated_at: string;
  user_profile?: {
    name: string;
    photo_url?: string;
  };
  quoted_message?: ChatMessage;
}

export const useChat = (overrideEventId?: string) => {
  const { currentUser } = useAuth();
  const { currentEventId } = useAttendeeEventContext();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const effectiveEventId = overrideEventId ?? currentEventId;

  useEffect(() => {
    if (currentUser && effectiveEventId) {
      fetchMessages();
      setupRealtimeSubscription();
    }
  }, [currentUser, effectiveEventId]);

  const fetchMessages = async () => {
    if (!effectiveEventId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching chat messages for event:', effectiveEventId);
      
      // First get the messages for the current event only
      const { data: messagesData, error: messagesError } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('event_id', effectiveEventId)
        .order('created_at', { ascending: true })
        .limit(100);

      if (messagesError) {
        console.error('Error fetching messages:', messagesError);
        throw messagesError;
      }

      console.log('Messages fetched:', messagesData);

      // Then get user profiles for all unique user IDs
      const userIds = [...new Set(messagesData?.map(msg => msg.user_id) || [])];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, photo_url')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      }

      // Create a map of user profiles
      const profilesMap = new Map();
      profilesData?.forEach(profile => {
        profilesMap.set(profile.id, profile);
      });

      // Combine messages with user profiles
      const messagesWithProfiles = messagesData?.map(message => ({
        ...message,
        user_profile: profilesMap.get(message.user_id) || { name: 'Unknown User' }
      })) || [];

      console.log('Messages with profiles:', messagesWithProfiles);
      setMessages(messagesWithProfiles);
    } catch (error) {
      console.error('Error in fetchMessages:', error);
      toast({
        title: "Error",
        description: "Failed to load chat messages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    if (!effectiveEventId) {
      return;
    }

    console.log('Setting up realtime subscription for event:', effectiveEventId);
    
    const channel = supabase
      .channel(`chat-messages-${effectiveEventId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `event_id=eq.${effectiveEventId}`
        },
        async (payload) => {
          console.log('New message received:', payload);
          
          // Get the user profile for the new message
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('id, name, photo_url')
            .eq('id', payload.new.user_id)
            .single();

          if (profileError) {
            console.error('Error fetching profile for new message:', profileError);
          }

          const newMessage = {
            ...payload.new,
            user_profile: profileData || { name: 'Unknown User' }
          } as ChatMessage;

          console.log('Adding new message to state:', newMessage);
          setMessages(prev => [...prev, newMessage]);
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
      });

    return () => {
      console.log('Cleaning up realtime subscription');
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async (content: string, quotedMessageId?: string) => {
    if (!currentUser) {
      toast({
        title: "Error",
        description: "You must be logged in to send messages",
        variant: "destructive",
      });
      return;
    }

    if (!effectiveEventId) {
      toast({
        title: "Error",
        description: "You must be in an event to send messages",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Sending message:', { content, quotedMessageId, userId: currentUser.id, eventId: effectiveEventId });
      
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          user_id: currentUser.id,
          content: content.trim(),
          quoted_message_id: quotedMessageId || null,
          event_id: effectiveEventId,
        });

      if (error) {
        console.error('Error sending message:', error);
        throw error;
      }

      console.log('Message sent successfully');
    } catch (error) {
      console.error('Error in sendMessage:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  return {
    messages,
    loading,
    sendMessage,
  };
};
