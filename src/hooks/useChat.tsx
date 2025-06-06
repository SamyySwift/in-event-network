
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface ChatMessage {
  id: string;
  user_id: string;
  content: string;
  quoted_message_id: string | null;
  created_at: string;
  updated_at: string;
  user_profile?: {
    name: string;
    photo_url?: string;
  };
  quoted_message?: ChatMessage;
}

export const useChat = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      fetchMessages();
      setupRealtimeSubscription();
    }
  }, [currentUser]);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          *,
          user_profile:profiles!user_id(name, photo_url),
          quoted_message:chat_messages!quoted_message_id(
            *,
            user_profile:profiles!user_id(name, photo_url)
          )
        `)
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) throw error;

      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
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
    const channel = supabase
      .channel('chat-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages'
        },
        async (payload) => {
          // Fetch the complete message with user profile
          const { data, error } = await supabase
            .from('chat_messages')
            .select(`
              *,
              user_profile:profiles!user_id(name, photo_url),
              quoted_message:chat_messages!quoted_message_id(
                *,
                user_profile:profiles!user_id(name, photo_url)
              )
            `)
            .eq('id', payload.new.id)
            .single();

          if (!error && data) {
            setMessages(prev => [...prev, data]);
          }
        }
      )
      .subscribe();

    return () => {
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

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          user_id: currentUser.id,
          content: content.trim(),
          quoted_message_id: quotedMessageId || null,
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error sending message:', error);
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
