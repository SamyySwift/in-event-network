
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useAttendeeEventContext } from '@/contexts/AttendeeEventContext';

export interface ChatMessage {
  id: string;
  content: string;
  user_id: string;
  event_id: string;
  created_at: string;
  quoted_message_id?: string | null;
  user_profile?: {
    id: string;
    name?: string | null;
    email?: string | null;
    photo_url?: string | null;
    bio?: string | null;
    company?: string | null;
    location?: string | null;
    niche?: string | null;
    links?: any;
    role?: string | null; // Added to support Admin label
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

  const fetchMessages = useCallback(async () => {
    if (!effectiveEventId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('id, content, user_id, event_id, created_at, quoted_message_id')
        .eq('event_id', effectiveEventId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      const baseMessages = data || [];
      const userIds = Array.from(new Set(baseMessages.map(m => m.user_id).filter(Boolean)));

      // Select only valid columns from profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, email, photo_url, bio, company, niche, role, linkedin_link, twitter_link, instagram_link, github_link, website_link')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      const profileMap = new Map<string, any>();
      (profiles || []).forEach(p => {
        profileMap.set(p.id, {
          ...p,
          // Build links object expected by UI
          links: {
            linkedin: p.linkedin_link || undefined,
            twitter: p.twitter_link || undefined,
            instagram: p.instagram_link || undefined,
            github: p.github_link || undefined,
            website: p.website_link || undefined,
          },
          // location is not in schema; leave undefined
          location: undefined,
        });
      });

      // Create a quick lookup for quoted messages
      const messagesMap = new Map<string, any>();
      baseMessages.forEach(m => messagesMap.set(m.id, { ...m }));

      const messagesWithProfiles = baseMessages.map((m) => {
        const user_profile = profileMap.get(m.user_id) || null;
        const msg = { ...m, user_profile } as ChatMessage;
        if (m.quoted_message_id) {
          const quoted = messagesMap.get(m.quoted_message_id);
          if (quoted) {
            const qp = profileMap.get(quoted.user_id) || null;
            msg.quoted_message = { ...quoted, user_profile: qp } as ChatMessage;
          }
        }
        return msg;
      });

      setMessages(messagesWithProfiles);
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  }, [effectiveEventId]);

  const setupRealtimeSubscription = useCallback(() => {
    if (!effectiveEventId) return;

    const channel = supabase
      .channel('chat_messages_changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `event_id=eq.${effectiveEventId}` },
        async (payload) => {
          try {
            const message = payload.new as any;
            const { data: p } = await supabase
              .from('profiles')
              .select('id, name, email, photo_url, bio, company, niche, role, linkedin_link, twitter_link, instagram_link, github_link, website_link')
              .eq('id', message.user_id)
              .maybeSingle();

            const profile = p
              ? {
                  ...p,
                  links: {
                    linkedin: p.linkedin_link || undefined,
                    twitter: p.twitter_link || undefined,
                    instagram: p.instagram_link || undefined,
                    github: p.github_link || undefined,
                    website: p.website_link || undefined,
                  },
                  location: undefined,
                }
              : null;

            let quoted_message: any = null;
            if (message.quoted_message_id) {
              const { data: quoted, error: quotedErr } = await supabase
                .from('chat_messages')
                .select('id, content, user_id, event_id, created_at, quoted_message_id')
                .eq('id', message.quoted_message_id)
                .maybeSingle();

              if (!quotedErr && quoted) {
                const { data: qpRaw } = await supabase
                  .from('profiles')
                  .select('id, name, email, photo_url, bio, company, niche, role, linkedin_link, twitter_link, instagram_link, github_link, website_link')
                  .eq('id', quoted.user_id)
                  .maybeSingle();

                const qp = qpRaw
                  ? {
                      ...qpRaw,
                      links: {
                        linkedin: qpRaw.linkedin_link || undefined,
                        twitter: qpRaw.twitter_link || undefined,
                        instagram: qpRaw.instagram_link || undefined,
                        github: qpRaw.github_link || undefined,
                        website: qpRaw.website_link || undefined,
                      },
                      location: undefined,
                    }
                  : null;

                quoted_message = { ...quoted, user_profile: qp };
              }
            }

            setMessages(prev => [...prev, { ...message, user_profile: profile, quoted_message }]);
          } catch (e) {
            console.error('Realtime INSERT handling error:', e);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'chat_messages', filter: `event_id=eq.${effectiveEventId}` },
        (payload) => {
          const deleted = payload.old as any;
          setMessages(prev => prev.filter(m => m.id !== deleted.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [effectiveEventId]);

  const sendMessage = async (content: string, quotedMessageId?: string) => {
    if (!effectiveEventId || !currentUser?.id) return;

    const { error } = await supabase
      .from('chat_messages')
      .insert({
        content,
        user_id: currentUser.id,
        event_id: effectiveEventId,
        quoted_message_id: quotedMessageId || null,
      });

    if (error) {
      console.error('Error sending message:', error);
    }
  };

  // New: delete a message (admin can delete any message; user can delete own)
  const deleteMessage = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .delete()
        .eq('id', messageId);

      if (error) throw error;
      setMessages(prev => prev.filter(m => m.id !== messageId));
    } catch (e) {
      console.error('Error deleting message:', e);
      throw e;
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    const cleanup = setupRealtimeSubscription();
    return () => {
      if (cleanup) cleanup();
    };
  }, [setupRealtimeSubscription]);

  return {
    messages,
    loading,
    sendMessage,
    deleteMessage,
  };
};
