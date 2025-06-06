
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface DirectMessage {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
  sender_profile?: {
    name: string;
    photo_url?: string;
  };
  recipient_profile?: {
    name: string;
    photo_url?: string;
  };
}

export interface Conversation {
  conversation_id: string;
  other_user_id: string;
  last_message: string;
  last_message_at: string;
  is_sent_by_me: boolean;
  unread_count: number;
  other_user_profile?: {
    name: string;
    photo_url?: string;
  };
}

export const useDirectMessages = (recipientId?: string) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      console.log('Current user found, initializing direct messages...');
      fetchConversations();
      if (recipientId) {
        fetchMessages(recipientId);
        setupRealtimeSubscription(recipientId);
      } else {
        setLoading(false);
      }
    } else {
      console.log('No current user, setting loading to false');
      setLoading(false);
    }
  }, [currentUser, recipientId]);

  const fetchConversations = async () => {
    if (!currentUser?.id) {
      console.log('No current user ID available');
      setConversations([]);
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching conversations for user:', currentUser.id);
      
      // First, get all direct messages involving the current user
      const { data: messagesData, error: messagesError } = await supabase
        .from('direct_messages')
        .select('*')
        .or(`sender_id.eq.${currentUser.id},recipient_id.eq.${currentUser.id}`)
        .order('created_at', { ascending: false });

      if (messagesError) {
        console.error('Error fetching direct messages:', messagesError);
        throw messagesError;
      }

      console.log('Direct messages fetched:', messagesData?.length || 0);

      if (!messagesData || messagesData.length === 0) {
        console.log('No direct messages found');
        setConversations([]);
        return;
      }

      // Group messages by conversation and get the latest message for each
      const conversationMap = new Map();
      
      messagesData.forEach(message => {
        const otherUserId = message.sender_id === currentUser.id ? message.recipient_id : message.sender_id;
        const conversationKey = [currentUser.id, otherUserId].sort().join('-');
        
        if (!conversationMap.has(conversationKey) || 
            new Date(message.created_at) > new Date(conversationMap.get(conversationKey).created_at)) {
          conversationMap.set(conversationKey, {
            conversation_id: conversationKey,
            other_user_id: otherUserId,
            last_message: message.content,
            last_message_at: message.created_at,
            is_sent_by_me: message.sender_id === currentUser.id,
            unread_count: 0 // We'll calculate this separately
          });
        }
      });

      const conversationsArray = Array.from(conversationMap.values());
      
      // Get user profiles for all other users
      const otherUserIds = conversationsArray.map(conv => conv.other_user_id);
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, photo_url')
        .in('id', otherUserIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      }

      // Create a map of user profiles
      const profilesMap = new Map();
      profilesData?.forEach(profile => {
        profilesMap.set(profile.id, profile);
      });

      // Calculate unread counts and combine with profiles
      const conversationsWithProfiles = await Promise.all(
        conversationsArray.map(async (conversation) => {
          // Count unread messages from the other user
          const { count } = await supabase
            .from('direct_messages')
            .select('*', { count: 'exact', head: true })
            .eq('sender_id', conversation.other_user_id)
            .eq('recipient_id', currentUser.id)
            .eq('is_read', false);

          return {
            ...conversation,
            unread_count: count || 0,
            other_user_profile: profilesMap.get(conversation.other_user_id) || { name: 'Unknown User' }
          };
        })
      );

      // Sort by last message time
      conversationsWithProfiles.sort((a, b) => 
        new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
      );

      console.log('Conversations with profiles:', conversationsWithProfiles.length);
      setConversations(conversationsWithProfiles);
    } catch (error) {
      console.error('Error in fetchConversations:', error);
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive",
      });
      setConversations([]);
    } finally {
      if (!recipientId) {
        setLoading(false);
      }
    }
  };

  const fetchMessages = async (otherUserId: string) => {
    if (!currentUser?.id) {
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching messages with user:', otherUserId);
      
      const { data: messagesData, error: messagesError } = await supabase
        .from('direct_messages')
        .select('*')
        .or(`and(sender_id.eq.${currentUser.id},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${currentUser.id})`)
        .order('created_at', { ascending: true });

      if (messagesError) {
        console.error('Error fetching messages:', messagesError);
        throw messagesError;
      }

      // Get user profiles for sender and recipient
      const userIds = [...new Set([
        ...messagesData?.map(msg => msg.sender_id) || [],
        ...messagesData?.map(msg => msg.recipient_id) || []
      ])];
      
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
        sender_profile: profilesMap.get(message.sender_id) || { name: 'Unknown User' },
        recipient_profile: profilesMap.get(message.recipient_id) || { name: 'Unknown User' }
      })) || [];

      setMessages(messagesWithProfiles);
      
      // Mark messages as read
      if (messagesData && messagesData.length > 0) {
        await markMessagesAsRead(otherUserId);
      }
    } catch (error) {
      console.error('Error in fetchMessages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = (otherUserId: string) => {
    if (!currentUser?.id) return;

    console.log('Setting up realtime subscription for direct messages...');
    
    const channel = supabase
      .channel('direct-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'direct_messages'
        },
        async (payload) => {
          console.log('New direct message received:', payload);
          
          // Only add if it's part of this conversation
          const newMessage = payload.new;
          if ((newMessage.sender_id === currentUser.id && newMessage.recipient_id === otherUserId) ||
              (newMessage.sender_id === otherUserId && newMessage.recipient_id === currentUser.id)) {
            
            // Get profiles for the new message
            const { data: profilesData } = await supabase
              .from('profiles')
              .select('id, name, photo_url')
              .in('id', [newMessage.sender_id, newMessage.recipient_id]);

            const profilesMap = new Map();
            profilesData?.forEach(profile => {
              profilesMap.set(profile.id, profile);
            });

            const messageWithProfiles = {
              ...newMessage,
              sender_profile: profilesMap.get(newMessage.sender_id) || { name: 'Unknown User' },
              recipient_profile: profilesMap.get(newMessage.recipient_id) || { name: 'Unknown User' }
            } as DirectMessage;

            setMessages(prev => [...prev, messageWithProfiles]);
            
            // Mark as read if I'm the recipient
            if (newMessage.recipient_id === currentUser.id) {
              await markMessagesAsRead(otherUserId);
            }
          }
          
          // Refresh conversations to update last message
          fetchConversations();
        }
      )
      .subscribe((status) => {
        console.log('Direct messages realtime subscription status:', status);
      });

    return () => {
      console.log('Cleaning up direct messages realtime subscription');
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async (recipientId: string, content: string) => {
    if (!currentUser) {
      toast({
        title: "Error",
        description: "You must be logged in to send messages",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Sending direct message:', { content, recipientId, senderId: currentUser.id });
      
      const { error } = await supabase
        .from('direct_messages')
        .insert({
          sender_id: currentUser.id,
          recipient_id: recipientId,
          content: content.trim(),
        });

      if (error) {
        console.error('Error sending direct message:', error);
        throw error;
      }

      console.log('Direct message sent successfully');
    } catch (error) {
      console.error('Error in sendMessage:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const markMessagesAsRead = async (otherUserId: string) => {
    if (!currentUser?.id) return;

    try {
      await supabase
        .from('direct_messages')
        .update({ is_read: true })
        .eq('sender_id', otherUserId)
        .eq('recipient_id', currentUser.id)
        .eq('is_read', false);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  return {
    messages,
    conversations,
    loading,
    sendMessage,
    fetchMessages,
    fetchConversations,
  };
};
