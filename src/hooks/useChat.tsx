
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useAttendeeEventContext } from '@/contexts/AttendeeEventContext';

// Top-level of file: ChatMessage interface and useChat hook
export interface ChatMessage {
  id: string;
  user_id: string;
  content: string;
  quoted_message_id: string | null;
  event_id: string | null;
  created_at: string;
  updated_at: string;
  // NEW: room_id for room-bound messages
  room_id?: string | null;
  user_profile?: {
    id?: string;
    name: string;
    email?: string;
    role?: 'host' | 'attendee' | string;
    photo_url?: string;
    bio?: string | null;
    niche?: string | null;
    location?: string | null;
    company?: string | null;
    links?: {
      twitter?: string | null;
      linkedin?: string | null;
      instagram?: string | null;
      github?: string | null;
      website?: string | null;
    };
  };
  quoted_message?: ChatMessage;
}

export const useChat = (overrideEventId?: string, overrideRoomId?: string) => {
  const { currentUser } = useAuth();
  const { currentEventId } = useAttendeeEventContext();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [participantPoints, setParticipantPoints] = useState<Record<string, number>>({});

  // Pagination for older messages
  const PAGE_SIZE = 50;
  const [oldestCursor, setOldestCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);
  
  // Profile cache to reduce redundant queries
  const profileCache = useRef(new Map<string, any>());
  const quotedMessageCache = useRef(new Map<string, ChatMessage>());

  const effectiveEventId = overrideEventId ?? currentEventId;
  const effectiveRoomId = overrideRoomId ?? null;

  // Re-run fetch + subscription setup when room changes
  useEffect(() => {
    if (currentUser && effectiveEventId) {
      fetchMessages();
      const cleanup = setupRealtimeSubscription();
      return () => {
        if (typeof cleanup === 'function') cleanup();
      };
    } else {
      setMessages([]);
    }
  }, [currentUser, effectiveEventId, effectiveRoomId]);

  const fetchMessages = async () => {
    if (!effectiveEventId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching chat messages for event:', effectiveEventId, 'room:', effectiveRoomId);

      let query = supabase
        .from('chat_messages')
        .select('*')
        .eq('event_id', effectiveEventId as string);

      // NEW: room scoping — null means global chat
      if (effectiveRoomId) {
        query = query.eq('room_id', effectiveRoomId);
      } else {
        query = query.is('room_id', null);
      }

      const { data: messagesData, error: messagesError } = await query
        .order('created_at', { ascending: false })
        .limit(PAGE_SIZE);

      if (messagesError) {
        console.error('Error fetching messages:', messagesError);
        throw messagesError;
      }

      console.log('Messages fetched:', messagesData);

      const messagesDataAsc = (messagesData || []).reverse();

      const userIds = [...new Set(messagesDataAsc?.map((msg) => msg.user_id) || [])];

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, email, role, photo_url, bio, niche, company, twitter_link, linkedin_link, instagram_link, github_link, website_link')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      }

      // Create a map of user profiles
      const profilesMap = new Map<string, any>();
      profiles?.forEach((p) => {
        profilesMap.set(p.id, p);
      });

      // NEW: fetch and hydrate quoted messages (and ensure their profiles exist)
      const quotedIds = [
        ...new Set(
          (messagesDataAsc || [])
            .map((m: any) => m.quoted_message_id)
            .filter(Boolean) as string[]
        ),
      ];

      let quotedMessagesMap = new Map<string, ChatMessage>();
      if (quotedIds.length > 0) {
        const { data: quotedMsgs, error: quotedErr } = await supabase
          .from('chat_messages')
          .select('*')
          .in('id', quotedIds);

        if (!quotedErr && quotedMsgs) {
          const quotedUserIds = [...new Set(quotedMsgs.map((q: any) => q.user_id))];
          const missingUserIds = quotedUserIds.filter((id) => !profilesMap.has(id));

          if (missingUserIds.length > 0) {
            const { data: moreProfiles } = await supabase
              .from('profiles')
              .select(
                'id, name, email, role, photo_url, bio, niche, company, twitter_link, linkedin_link, instagram_link, github_link, website_link'
              )
              .in('id', missingUserIds);

            moreProfiles?.forEach((p: any) => profilesMap.set(p.id, p));
          }

          quotedMsgs.forEach((qm: any) => {
            const qp = profilesMap.get(qm.user_id);
            const q_user_profile = qp
              ? {
                  id: qp.id,
                  name: qp.name,
                  email: qp.email,
                  role: qp.role,
                  photo_url: qp.photo_url,
                  bio: qp.bio,
                  niche: qp.niche,
                  company: qp.company,
                  links: {
                    twitter: qp.twitter_link ?? null,
                    linkedin: qp.linkedin_link ?? null,
                    instagram: qp.instagram_link ?? null,
                    github: qp.github_link ?? null,
                    website: qp.website_link ?? null,
                  },
                }
              : { name: 'Unknown User' };

            quotedMessagesMap.set(qm.id, { ...qm, user_profile: q_user_profile } as ChatMessage);
          });
        }
      }

      // Combine messages with user profiles and attach quoted_message
      const messagesWithProfiles: ChatMessage[] = (messagesDataAsc || []).map((message: any) => {
        const p = profilesMap.get(message.user_id);
        const user_profile = p
          ? {
              id: p.id,
              name: p.name,
              email: p.email,
              role: p.role,
              photo_url: p.photo_url,
              bio: p.bio,
              niche: p.niche,
              company: p.company,
              links: {
                twitter: p.twitter_link ?? null,
                linkedin: p.linkedin_link ?? null,
                instagram: p.instagram_link ?? null,
                github: p.github_link ?? null,
                website: p.website_link ?? null,
              },
            }
          : { name: 'Unknown User' };

        const quoted_message = message.quoted_message_id
          ? quotedMessagesMap.get(message.quoted_message_id) ?? null
          : null;

        return { ...message, user_profile, quoted_message };
      });

      // Setup pagination cursors
      setOldestCursor(messagesWithProfiles[0]?.created_at ?? null);
      setHasMore((messagesDataAsc?.length ?? 0) === PAGE_SIZE);


      // Fetch points for all users in this chat/event and build a map
      type ChatPointsRow = { user_id: string; points: number };

      const basePointsQuery =
        (supabase.from('chat_participation_points' as any) as any)
          .select('user_id, points')
          .eq('event_id', effectiveEventId);

      const { data: pointsRows, error: pointsErr } = userIds.length
        ? await basePointsQuery.in('user_id', userIds as string[])
        : await basePointsQuery;

      if (pointsErr) {
        console.error('Error fetching chat points:', pointsErr);
      }

      const pointsMap: Record<string, number> = {};
      (pointsRows as ChatPointsRow[] | null)?.forEach((r) => {
        pointsMap[r.user_id] = r.points;
      });
      setParticipantPoints(pointsMap);
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

    console.log('Setting up realtime subscription for event:', effectiveEventId, 'room:', effectiveRoomId);

    // Simplified filter - let server handle the filtering
    const channel = supabase
      .channel(`chat-messages-${effectiveEventId}-${effectiveRoomId ?? 'global'}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `event_id=eq.${effectiveEventId}`,
        },
        async (payload) => {
          const newMsg: any = payload.new;
          console.log('New message received:', payload);
          
          // Client-side room filtering
          const newRoomId = newMsg.room_id ?? null;
          const expectedRoomId = effectiveRoomId ?? null;
          
          if (newRoomId !== expectedRoomId) {
            console.log('Message filtered out - wrong room:', { newRoomId, expectedRoomId });
            return;
          }

          // Create optimistic message first (fast display)
          const optimisticMessage = {
            ...newMsg,
            user_profile: { name: 'Loading...' },
            quoted_message: null,
          } as ChatMessage;

          // Add optimistic message immediately
          setMessages(prev => {
            const exists = prev.some(msg => msg.id === optimisticMessage.id);
            return exists ? prev : [...prev, optimisticMessage];
          });

          // Then fetch profile data in background and update
          try {
            let profileData = profileCache.current.get(newMsg.user_id);
            if (!profileData) {
              const { data, error: profileError } = await supabase
                .from('profiles')
                .select('id, name, email, role, photo_url, bio, niche, company, twitter_link, linkedin_link, instagram_link, github_link, website_link')
                .eq('id', newMsg.user_id)
                .single();

              if (!profileError && data) {
                profileData = data;
                profileCache.current.set(newMsg.user_id, data);
              }
            }

            // Handle quoted message if needed
            let quoted_message: ChatMessage | null = null;
            if (newMsg.quoted_message_id) {
              quoted_message = quotedMessageCache.current.get(newMsg.quoted_message_id) || null;
              
              if (!quoted_message) {
                const { data: qmsg } = await supabase
                  .from('chat_messages')
                  .select('*')
                  .eq('id', newMsg.quoted_message_id)
                  .single();

                if (qmsg) {
                  let qprofile = profileCache.current.get(qmsg.user_id);
                  if (!qprofile) {
                    const { data } = await supabase
                      .from('profiles')
                      .select('id, name, email, role, photo_url, bio, niche, company, twitter_link, linkedin_link, instagram_link, github_link, website_link')
                      .eq('id', qmsg.user_id)
                      .single();
                    if (data) {
                      qprofile = data;
                      profileCache.current.set(qmsg.user_id, data);
                    }
                  }

                  quoted_message = {
                    ...qmsg,
                    user_profile: qprofile
                      ? {
                          id: qprofile.id,
                          name: qprofile.name,
                          email: qprofile.email,
                          role: qprofile.role,
                          photo_url: qprofile.photo_url,
                          bio: qprofile.bio,
                          niche: qprofile.niche,
                          company: qprofile.company,
                          links: {
                            twitter: qprofile.twitter_link ?? null,
                            linkedin: qprofile.linkedin_link ?? null,
                            instagram: qprofile.instagram_link ?? null,
                            github: qprofile.github_link ?? null,
                            website: qprofile.website_link ?? null,
                          },
                        }
                      : { name: 'Unknown User' },
                  } as ChatMessage;
                  
                  quotedMessageCache.current.set(newMsg.quoted_message_id, quoted_message);
                }
              }
            }

            // Update message with complete profile data
            const completeMessage = {
              ...newMsg,
              user_profile: profileData
                ? {
                    id: profileData.id,
                    name: profileData.name,
                    email: profileData.email,
                    role: profileData.role,
                    photo_url: profileData.photo_url,
                    bio: profileData.bio,
                    niche: profileData.niche,
                    company: profileData.company,
                    links: {
                      twitter: profileData.twitter_link ?? null,
                      linkedin: profileData.linkedin_link ?? null,
                      instagram: profileData.instagram_link ?? null,
                      github: profileData.github_link ?? null,
                      website: profileData.website_link ?? null,
                    },
                  }
                : { name: 'Unknown User' },
              quoted_message,
            } as ChatMessage;

            // Replace optimistic message with complete data
            setMessages(prev => prev.map(msg => 
              msg.id === completeMessage.id ? completeMessage : msg
            ));

            // Update points
            const senderId = newMsg.user_id as string;
            setParticipantPoints(prev => ({
              ...prev,
              [senderId]: (prev?.[senderId] ?? 0) + 1,
            }));

          } catch (error) {
            console.error('Error updating message with profile data:', error);
            // Keep optimistic message with default profile
            setMessages(prev => prev.map(msg => 
              msg.id === optimisticMessage.id 
                ? { ...msg, user_profile: { name: 'Unknown User' } }
                : msg
            ));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'chat_messages' },
        (payload) => {
          const deleted = payload.old as any;
          setMessages((prev) => prev.filter((m) => m.id !== deleted.id));
        }
      )
      .subscribe();

    // Points subscription
    const pointsChannel = supabase
      .channel(`chat-points-${effectiveEventId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_participation_points',
          filter: `event_id=eq.${effectiveEventId}`,
        },
        (payload) => {
          const row = payload.new as any;
          setParticipantPoints(prev => ({ ...prev, [row.user_id]: row.points }));
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_participation_points',
          filter: `event_id=eq.${effectiveEventId}`,
        },
        (payload) => {
          const row = payload.new as any;
          setParticipantPoints(prev => ({ ...prev, [row.user_id]: row.points }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(pointsChannel);
    };
  };

  // Ensure instant reflection: refresh after sending (in addition to realtime)
  const sendMessage = async (content: string, quoted_message_id?: string) => {
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

    // Create optimistic message for instant display
    const tempId = `temp-${Date.now()}-${Math.random()}`;
    const optimisticMessage: ChatMessage = {
      id: tempId,
      user_id: currentUser.id,
      content,
      quoted_message_id: quoted_message_id ?? null,
      event_id: effectiveEventId,
      room_id: effectiveRoomId ?? null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_profile: {
        id: currentUser.id,
        name: currentUser.email?.split('@')[0] || 'You',
        email: currentUser.email,
        role: 'attendee',
      },
      quoted_message: quoted_message_id 
        ? quotedMessageCache.current.get(quoted_message_id) || null 
        : null,
    };

    // Add optimistic message immediately
    setMessages(prev => [...prev, optimisticMessage]);

    try {
      console.log('Sending message:', {
        content,
        quoted_message_id,
        userId: currentUser.id,
        eventId: effectiveEventId,
        roomId: effectiveRoomId,
      });

      const { data, error } = await supabase.from('chat_messages').insert({
        user_id: currentUser.id,
        content,
        quoted_message_id: quoted_message_id ?? null,
        event_id: effectiveEventId,
        room_id: effectiveRoomId ?? null,
      }).select().single();

      if (error) {
        console.error('Error sending message:', error);
        // Remove optimistic message on error
        setMessages(prev => prev.filter(msg => msg.id !== tempId));
        throw error;
      }

      // Replace optimistic message with real message
      if (data) {
        setMessages(prev => prev.map(msg => 
          msg.id === tempId 
            ? { ...optimisticMessage, id: data.id, created_at: data.created_at, updated_at: data.updated_at }
            : msg
        ));
      }

      console.log('Message sent successfully');
    } catch (error) {
      console.error('Error in sendMessage:', error);
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  // Load older messages when user scrolls to top
  const loadOlder = async () => {
    if (loadingOlder || !effectiveEventId || !oldestCursor) return;
    setLoadingOlder(true);
    try {
      let query = supabase
        .from('chat_messages')
        .select('*')
        .eq('event_id', effectiveEventId as string)
        .lt('created_at', oldestCursor);

      if (effectiveRoomId) {
        query = query.eq('room_id', effectiveRoomId);
      } else {
        query = query.is('room_id', null);
      }

      const { data: olderData, error } = await query
        .order('created_at', { ascending: false })
        .limit(PAGE_SIZE);

      if (error) throw error;

      const batchDesc = olderData || [];
      const batch = batchDesc.reverse();

      // Hydrate profiles
      const userIds = [...new Set(batch.map((m: any) => m.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name, email, role, photo_url, bio, niche, company, twitter_link, linkedin_link, instagram_link, github_link, website_link')
        .in('id', userIds);

      const profilesMap = new Map<string, any>();
      profiles?.forEach((p: any) => profilesMap.set(p.id, p));

      // Quoted messages
      const quotedIds = [...new Set(batch.map((m: any) => m.quoted_message_id).filter(Boolean) as string[])];
      const quotedMessagesMap = new Map<string, ChatMessage>();
      if (quotedIds.length) {
        const { data: quotedMsgs } = await supabase
          .from('chat_messages')
          .select('*')
          .in('id', quotedIds);
        if (quotedMsgs) {
          const quotedUserIds = [...new Set(quotedMsgs.map((q: any) => q.user_id))];
          const missingUserIds = quotedUserIds.filter((id) => !profilesMap.has(id));
          if (missingUserIds.length) {
            const { data: moreProfiles } = await supabase
              .from('profiles')
              .select('id, name, email, role, photo_url, bio, niche, company, twitter_link, linkedin_link, instagram_link, github_link, website_link')
              .in('id', missingUserIds);
            moreProfiles?.forEach((p: any) => profilesMap.set(p.id, p));
          }
          quotedMsgs.forEach((qm: any) => {
            const qp = profilesMap.get(qm.user_id);
            const q_user_profile = qp
              ? {
                  id: qp.id,
                  name: qp.name,
                  email: qp.email,
                  role: qp.role,
                  photo_url: qp.photo_url,
                  bio: qp.bio,
                  niche: qp.niche,
                  company: qp.company,
                  links: {
                    twitter: qp.twitter_link ?? null,
                    linkedin: qp.linkedin_link ?? null,
                    instagram: qp.instagram_link ?? null,
                    github: qp.github_link ?? null,
                    website: qp.website_link ?? null,
                  },
                }
              : { name: 'Unknown User' };
            const hydrated = { ...qm, user_profile: q_user_profile } as ChatMessage;
            quotedMessagesMap.set(qm.id, hydrated);
            quotedMessageCache.current.set(qm.id, hydrated);
          });
        }
      }

      const hydratedBatch: ChatMessage[] = batch.map((message: any) => {
        const p = profilesMap.get(message.user_id);
        const user_profile = p
          ? {
              id: p.id,
              name: p.name,
              email: p.email,
              role: p.role,
              photo_url: p.photo_url,
              bio: p.bio,
              niche: p.niche,
              company: p.company,
              links: {
                twitter: p.twitter_link ?? null,
                linkedin: p.linkedin_link ?? null,
                instagram: p.instagram_link ?? null,
                github: p.github_link ?? null,
                website: p.website_link ?? null,
              },
            }
          : { name: 'Unknown User' };

        const quoted_message = message.quoted_message_id
          ? quotedMessagesMap.get(message.quoted_message_id) ?? null
          : null;

        return { ...message, user_profile, quoted_message } as ChatMessage;
      });

      setMessages((prev) => [...hydratedBatch, ...prev]);
      if (hydratedBatch.length) {
        setOldestCursor(hydratedBatch[0].created_at);
      }
      setHasMore(batch.length === PAGE_SIZE);
    } catch (err) {
      console.error('Error loading older messages:', err);
    } finally {
      setLoadingOlder(false);
    }
  };

  const deleteMessage = async (messageId: string) => {
    try {
      const { error } = await supabase.from('chat_messages').delete().eq('id', messageId);
      if (error) throw error;
      // Optimistic UI in case realtime is delayed
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
      toast({
        title: 'Message deleted',
        description: 'The message has been removed.',
      });
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        title: 'Delete failed',
        description: 'Could not delete the message.',
        variant: 'destructive',
      });
    }
  };

  return {
    messages,
    loading,
    sendMessage,
    deleteMessage,
    participantPoints,
    // pagination helpers
    hasMore,
    loadOlder,
    loadingOlder,
  };
};
