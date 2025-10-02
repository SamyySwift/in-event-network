
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
    role?: string;
  };
  recipient_profile?: {
    name: string;
    photo_url?: string;
    role?: string;
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
    role?: string;
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

  // Helper: treat role synonyms as admin
  const isAdminRole = (role?: string | null) => {
    const r = role?.toLowerCase();
    return !!r && ['admin', 'host', 'organizer', 'owner', 'moderator', 'staff'].includes(r);
  };

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
        .from('public_profiles')
        .select('id, name, photo_url, role')
        .in('id', otherUserIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      }

      // Create a map of user profiles (normalized names - use "Admin" if admin role and missing name)
      const profilesMap = new Map();
      profilesData?.forEach(profile => {
        const normalizedName =
          (profile.name || '').trim() || (isAdminRole(profile.role) ? 'Admin' : 'Unknown User');
        profilesMap.set(profile.id, { ...profile, name: normalizedName });
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
        .from('public_profiles')
        .select('id, name, photo_url, role')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      }

      // Create a map of user profiles (normalized names)
      const profilesMap = new Map();
      profilesData?.forEach(profile => {
        const normalizedName =
          (profile.name || '').trim() || (isAdminRole(profile.role) ? 'Admin' : 'Unknown User');
        profilesMap.set(profile.id, { ...profile, name: normalizedName });
      });

      // Combine messages with user profiles + safe current user fallback
      const messagesWithProfiles = messagesData?.map(message => {
        const sp = profilesMap.get(message.sender_id);
        const rp = profilesMap.get(message.recipient_id);

        const safeSender =
          sp || (message.sender_id === currentUser.id ? { name: currentUser.name || 'Me' } : { name: 'Unknown User' });

        const safeRecipient =
          rp || (message.recipient_id === currentUser.id ? { name: currentUser.name || 'Me' } : { name: 'Unknown User' });

        return {
          ...message,
          sender_profile: safeSender,
          recipient_profile: safeRecipient
        };
      }) || [];

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
              .from('public_profiles')
              .select('id, name, photo_url, role')
              .in('id', [newMessage.sender_id, newMessage.recipient_id]);

            const profilesMap = new Map();
            profilesData?.forEach(profile => {
              const normalizedName =
                (profile.name || '').trim() || (isAdminRole(profile.role) ? 'Admin' : 'Unknown User');
              profilesMap.set(profile.id, { ...profile, name: normalizedName });
            });

            const messageWithProfiles = {
              ...newMessage,
              sender_profile:
                profilesMap.get(newMessage.sender_id)
                || (newMessage.sender_id === currentUser.id ? { name: currentUser.name || 'Me' } : { name: 'Unknown User' }),
              recipient_profile:
                profilesMap.get(newMessage.recipient_id)
                || (newMessage.recipient_id === currentUser.id ? { name: currentUser.name || 'Me' } : { name: 'Unknown User' })
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

    const trimmed = content.trim();
    if (!trimmed) return;

    try {
      console.log('Sending direct message (with connection flow):', { content: trimmed, recipientId, senderId: currentUser.id });

      // 1) Get the most recent connection (if any) between the two users
      const { data: connectionRows, error: connectionError } = await supabase
        .from('connections')
        .select('*')
        .or(
          `and(requester_id.eq.${currentUser.id},recipient_id.eq.${recipientId}),and(requester_id.eq.${recipientId},recipient_id.eq.${currentUser.id})`
        )
        .order('created_at', { ascending: false })
        .limit(1);

      if (connectionError) {
        console.error('Error fetching connection between users:', connectionError);
        throw connectionError;
      }

      const latestConnection = connectionRows?.[0];

      // 2) Enforce rules based on connection status
      if (latestConnection?.status === 'rejected') {
        toast({
          title: "Messaging blocked",
          description: "Your previous connection request was declined. Send a new connection request and wait for acceptance to continue messaging.",
          variant: "destructive",
        });
        return;
      }

      if (latestConnection?.status === 'pending') {
        const isRequester = latestConnection.requester_id === currentUser.id;

        if (!isRequester) {
          // Recipient of a pending request cannot message until accepting
          toast({
            title: "Connection pending",
            description: "You have a pending connection request. Accept the request to start messaging.",
            variant: "destructive",
          });
          return;
        }

        // Requester can only send one introductory message while pending
        const { count: myMsgCount } = await supabase
          .from('direct_messages')
          .select('*', { count: 'exact', head: true })
          .eq('sender_id', currentUser.id)
          .eq('recipient_id', recipientId);

        if ((myMsgCount || 0) > 0) {
          toast({
            title: "Please wait",
            description: "You've already sent your introductory message. You'll be able to continue once your connection is accepted.",
            variant: "destructive",
          });
          return;
        }
      }

      // 3) If no connection exists, allow exactly one initial message and auto-create a pending request afterward
      let shouldCreatePendingConnection = false;
      if (!latestConnection) {
        // Ensure we haven't already sent a message (edge case)
        const { count: myMsgCountNoConn } = await supabase
          .from('direct_messages')
          .select('*', { count: 'exact', head: true })
          .eq('sender_id', currentUser.id)
          .eq('recipient_id', recipientId);

        if ((myMsgCountNoConn || 0) > 0) {
          // If somehow a prior message exists without a connection record, block additional messages
          toast({
            title: "Please wait",
            description: "You've already sent your introductory message. You'll be able to continue once your connection is accepted.",
            variant: "destructive",
          });
          return;
        }

        shouldCreatePendingConnection = true;
      }

      // 4) Insert the message
      const { error: dmError } = await supabase
        .from('direct_messages')
        .insert({
          sender_id: currentUser.id,
          recipient_id: recipientId,
          content: trimmed,
        });

      if (dmError) {
        console.error('Error sending direct message:', dmError);
        throw dmError;
      }

      // 5) If this was the first message with no connection, create the pending connection request automatically
      if (shouldCreatePendingConnection) {
        const { error: createConnError } = await supabase
          .from('connections')
          .insert({
            requester_id: currentUser.id,
            recipient_id: recipientId,
            status: 'pending',
          });

        if (createConnError) {
          console.error('Error creating pending connection after first message:', createConnError);
          // We won't throw here to avoid losing the message; but we do notify
          toast({
            title: "Warning",
            description: "Message sent, but creating the connection request failed. Please try sending a connection request manually.",
          });
        } else {
          console.log('Pending connection request created automatically after first message');
        }
      }

      console.log('Direct message sent successfully');
    } catch (error: any) {
      console.error('Error in sendMessage:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to send message",
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
