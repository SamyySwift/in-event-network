import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAttendeeEventContext } from '@/contexts/AttendeeEventContext';
import { useToast } from '@/hooks/use-toast';

interface ChatMessage {
  id: string;
  content: string;
  user_id: string;
  event_id: string;
  created_at: string;
  updated_at: string;
  quoted_message_id?: string;
  profiles?: {
    name: string;
    photo_url?: string;
  };
  quoted_message?: {
    id: string;
    content: string;
    profiles?: {
      name: string;
    };
  };
}

interface ChatContextType {
  messages: ChatMessage[];
  isLoading: boolean;
  error: any;
  sendMessage: (content: string, quotedMessageId?: string) => void;
  isSending: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const { currentEventId } = useAttendeeEventContext(); // Now uses standardized event context
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading, error } = useQuery({
    queryKey: ['chat-messages', currentEventId],
    queryFn: async (): Promise<ChatMessage[]> => {
      if (!currentEventId) {
        return [];
      }

      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          *,
          profiles:user_id (
            name,
            photo_url
          ),
          quoted_message:quoted_message_id (
            id,
            content,
            profiles:user_id (
              name
            )
          )
        `)
        .eq('event_id', currentEventId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!currentEventId && !!currentUser,
    refetchInterval: 2000,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ content, quotedMessageId }: { content: string; quotedMessageId?: string }) => {
      if (!currentUser || !currentEventId) {
        throw new Error('User not authenticated or no event selected');
      }

      const { error } = await supabase
        .from('chat_messages')
        .insert([{
          content,
          user_id: currentUser.id,
          event_id: currentEventId,
          quoted_message_id: quotedMessageId || null,
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages', currentEventId] });
    },
    onError: (error) => {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Set up real-time subscription
  useEffect(() => {
    if (!currentEventId) return;

    const channel = supabase
      .channel('chat-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `event_id=eq.${currentEventId}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['chat-messages', currentEventId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentEventId, queryClient]);

  const sendMessage = (content: string, quotedMessageId?: string) => {
    sendMessageMutation.mutate({ content, quotedMessageId });
  };

  const value: ChatContextType = {
    messages,
    isLoading,
    error,
    sendMessage,
    isSending: sendMessageMutation.isPending,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
