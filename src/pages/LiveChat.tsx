import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ChatMessage as ChatMessageComponent } from "@/components/chat/ChatMessage";
import { FloatingDidYouKnow } from "@/components/attendee/FloatingDidYouKnow";

type DBChatMessage = {
  id: string;
  user_id: string;
  content: string;
  quoted_message_id: string | null;
  event_id: string | null;
  created_at: string;
  updated_at: string;
};

type Profile = {
  id: string;
  name: string | null;
  photo_url: string | null;
  role?: string | null;
};

type Event = {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  start_time: string;
  end_time: string;
};

type ChatMessage = DBChatMessage & {
  user_profile?: {
    id?: string;
    name: string;
    role?: string;
    photo_url?: string | null;
  };
  quoted_message?: ChatMessage | null;
};

export default function LiveChat() {
  const { eventId } = useParams<{ eventId: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Load Event details
  useEffect(() => {
    let cancelled = false;
    const loadEvent = async () => {
      if (!eventId) return;
      const { data, error } = await supabase
        .from("events")
        .select("id, name, description, logo_url, start_time, end_time")
        .eq("id", eventId)
        .single();
      if (error) {
        console.error("Error fetching event:", error);
      }
      if (!cancelled) setEvent(data ?? null);
    };
    loadEvent();
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  // Fetch initial messages and hydrate with profiles (read-only)
  useEffect(() => {
    let cancelled = false;

    const fetchMessages = async () => {
      if (!eventId) return;
      setLoading(true);

      const { data: rows, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("event_id", eventId)
        .order("created_at", { ascending: true })
        .limit(200);

      if (error) {
        console.error("Error fetching chat messages:", error);
        setLoading(false);
        return;
      }

      const messagesData: DBChatMessage[] = rows || [];
      const userIds = [...new Set(messagesData.map((m) => m.user_id))];

      let profilesMap = new Map<string, Profile>();
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, name, photo_url, role")
          .in("id", userIds);
        (profiles || []).forEach((p) => profilesMap.set(p.id, p));
      }

      // hydrate quoted messages shallowly (no nested quoted-of-quoted)
      const quotedIds = [...new Set(messagesData.map((m) => m.quoted_message_id).filter(Boolean) as string[])];
      let quotedMap = new Map<string, ChatMessage>();
      if (quotedIds.length > 0) {
        const { data: quoted } = await supabase
          .from("chat_messages")
          .select("*")
          .in("id", quotedIds);

        if (quoted && quoted.length) {
          const quotedUserIds = [...new Set(quoted.map((q) => q.user_id))].filter((id) => !profilesMap.has(id));
          if (quotedUserIds.length > 0) {
            const { data: moreProfiles } = await supabase
              .from("profiles")
              .select("id, name, photo_url, role")
              .in("id", quotedUserIds as string[]);
            (moreProfiles || []).forEach((p) => profilesMap.set(p.id, p));
          }

          quoted.forEach((qm: DBChatMessage) => {
            const qp = profilesMap.get(qm.user_id);
            quotedMap.set(qm.id, {
              ...qm,
              user_profile: {
                id: qp?.id,
                name: qp?.name || "Unknown User",
                role: qp?.role || undefined,
                photo_url: qp?.photo_url || null,
              },
            });
          });
        }
      }

      const hydrated: ChatMessage[] = messagesData.map((m) => {
        const p = profilesMap.get(m.user_id);
        return {
          ...m,
          user_profile: {
            id: p?.id,
            name: p?.name || "Unknown User",
            role: p?.role || undefined,
            photo_url: p?.photo_url || null,
          },
          quoted_message: m.quoted_message_id ? quotedMap.get(m.quoted_message_id) || null : null,
        };
      });

      if (!cancelled) {
        setMessages(hydrated);
        setLoading(false);
      }
    };

    fetchMessages();

    return () => {
      cancelled = true;
    };
  }, [eventId]);

  // Real-time updates (INSERT/UPDATE/DELETE)
  useEffect(() => {
    if (!eventId) return;

    const channel = supabase
      .channel(`live-chat-${eventId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages", filter: `event_id=eq.${eventId}` },
        async (payload) => {
          const row = payload.new as DBChatMessage;

          // fetch profile
          const { data: p } = await supabase
            .from("profiles")
            .select("id, name, photo_url, role")
            .eq("id", row.user_id)
            .single();

          // fetch quoted if exists
          let quoted_message: ChatMessage | null = null;
          if (row.quoted_message_id) {
            const { data: qrow } = await supabase
              .from("chat_messages")
              .select("*")
              .eq("id", row.quoted_message_id)
              .single();
            if (qrow) {
              const { data: qp } = await supabase
                .from("profiles")
                .select("id, name, photo_url, role")
                .eq("id", qrow.user_id)
                .single();
              quoted_message = {
                ...qrow,
                user_profile: {
                  id: qp?.id,
                  name: qp?.name || "Unknown User",
                  photo_url: qp?.photo_url || null,
                  role: qp?.role || undefined,
                },
              } as ChatMessage;
            }
          }

          const newMsg: ChatMessage = {
            ...row,
            user_profile: {
              id: p?.id,
              name: p?.name || "Unknown User",
              photo_url: p?.photo_url || null,
              role: p?.role || undefined,
            },
            quoted_message,
          };

          setMessages((prev) => [...prev, newMsg]);
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "chat_messages", filter: `event_id=eq.${eventId}` },
        (payload) => {
          const deleted = payload.old as DBChatMessage;
          setMessages((prev) => prev.filter((m) => m.id !== deleted.id));
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "chat_messages", filter: `event_id=eq.${eventId}` },
        (payload) => {
          const updated = payload.new as DBChatMessage;
          setMessages((prev) => prev.map((m) => (m.id === updated.id ? { ...m, ...updated } : m)));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId]);

  const totalMessages = messages.length;
  const participants = useMemo(() => {
    const set = new Set(messages.map((m) => m.user_id));
    return set.size;
  }, [messages]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading live chat...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="p-4 rounded-full bg-destructive/10 inline-block mb-4">
              <MessageCircle className="h-8 w-8 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Event Not Found</h1>
            <p className="text-muted-foreground">The event you're looking for doesn't exist or has been removed.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Floating 'Did You Know' for Chat Room */}
      <FloatingDidYouKnow />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            {event.logo_url && (
              <Avatar className="h-16 w-16">
                <AvatarImage src={event.logo_url} alt={event.name} />
                <AvatarFallback>{event.name.charAt(0)}</AvatarFallback>
              </Avatar>
            )}
            <div>
              <h1 className="text-3xl font-bold">{event.name}</h1>
              <p className="text-muted-foreground">Live Chat</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                    <MessageCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totalMessages}</p>
                    <p className="text-sm text-muted-foreground">Messages</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
                    <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{participants}</p>
                    <p className="text-sm text-muted-foreground">Participants</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Live messages (read-only) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Live Chat Stream
            </CardTitle>
            <CardDescription>Updates in real-time as attendees interact</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[70vh] overflow-y-auto p-2 bg-muted/30 rounded-md">
              {messages.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  No messages yet. Waiting for attendees to start the conversation...
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((m) => (
                    <ChatMessageComponent
                      key={m.id}
                      message={m}
                      isOwn={false}
                      onQuote={undefined}
                      onDelete={undefined}
                      points={undefined}
                    />
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}