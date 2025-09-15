// ... existing code ...
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAttendeeEventContext } from "@/contexts/AttendeeEventContext";
import { useToast } from "@/hooks/use-toast";

export interface Topic {
  id: string;
  event_id: string;
  user_id: string;
  title: string;
  description?: string | null;
  status: "open" | "closed";
  poll_id?: string | null;
  created_at: string;
}

// module: useTopics
export const useTopics = () => {
  const { currentUser } = useAuth();
  const { currentEventId } = useAttendeeEventContext();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: topics = [], isLoading } = useQuery({
    queryKey: ["topics", currentEventId],
    queryFn: async (): Promise<Topic[]> => {
      if (!currentEventId) return [];
      const { data, error } = await (supabase.from as any)("topics")
        .select("*")
        .eq("event_id", currentEventId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data ?? []) as unknown as Topic[];
    },
    enabled: !!currentEventId,
  });

  const createTopic = useMutation({
    mutationFn: async (payload: { title: string; description?: string }) => {
      if (!currentUser?.id || !currentEventId) {
        throw new Error("Missing user or event context");
      }

      // 1) Create topic and return single row
      const { data: topic, error: topicErr } = await (supabase.from as any)("topics")
        .insert({
          event_id: currentEventId,
          user_id: currentUser.id,
          title: payload.title,
          description: payload.description || null,
          status: "open",
        } as any)
        .select("*")
        .single();

      if (topicErr) throw topicErr;

      // 2) Attempt to create a poll for the topic (non-fatal on failure)
      let pollId: string | null = null;
      try {
        const optionA = { id: crypto.randomUUID(), text: "👍 Interested" };
        const optionB = { id: crypto.randomUUID(), text: "👎 Not interested" };

        const { data: poll, error: pollErr } = await (supabase.from as any)("polls")
          .insert({
            question: `Vote on topic: ${payload.title}`,
            options: [optionA, optionB] as any,
            is_active: true,
            show_results: true,
            event_id: currentEventId,
            created_by: currentUser.id,
            start_time: new Date().toISOString(),
            end_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          } as any)
          .select("*")
          .single();

        if (pollErr) throw pollErr;
        pollId = poll?.id ?? null;

        if (pollId) {
          const { error: linkErr } = await (supabase.from as any)("topics")
            .update({ poll_id: pollId } as any)
            .eq("id", (topic as any).id);
          if (linkErr) throw linkErr;
        }
      } catch (e) {
        console.warn("Topic created but poll could not be created/linked:", e);
      }

      return { ...(topic as unknown as Topic), poll_id: pollId } as Topic;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["topics", currentEventId] });
      queryClient.invalidateQueries({ queryKey: ["attendee-polls"] });
      toast({ title: "Topic created", description: "Your topic is now live!" });
    },
    onError: (e: any) => {
      toast({
        title: "Could not create topic",
        description: e?.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const closeTopic = useMutation({
    mutationFn: async (topicId: string) => {
      const { error } = await supabase
        .from("topics" as any) // <- cast
        .update({ status: "closed" })
        .eq("id", topicId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["topics", currentEventId] });
      toast({ title: "Topic closed", description: "This topic is now closed." });
    },
    onError: (e: any) => {
      toast({
        title: "Could not close topic",
        description: e?.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    topics,
    isLoading,
    createTopic: createTopic.mutateAsync,
    closing: closeTopic.isPending,
    closeTopic: closeTopic.mutateAsync,
  };
};