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
        const optionA = { id: crypto.randomUUID(), text: "👍 Interested", label: "👍 Interested" };
        const optionB = { id: crypto.randomUUID(), text: "👎 Not interested", label: "👎 Not interested" };

        // Add required start/end times for polls
        const now = new Date();
        const endTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        const { data: poll, error: pollErr } = await (supabase.from as any)("polls")
          .insert({
            question: `Vote on topic: ${payload.title}`,
            options: [optionA, optionB] as any,
            is_active: true,
            show_results: true,
            event_id: currentEventId,
            created_by: currentUser.id,
            start_time: now.toISOString(),
            end_time: endTime.toISOString(),
            display_as_banner: false,
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

  const ensurePollForTopic = useMutation({
    mutationFn: async (topic: Topic) => {
      if (topic.poll_id) return topic;
      if (!currentUser?.id || !currentEventId) {
        throw new Error("Missing user or event context");
      }

      const optionA = { id: crypto.randomUUID(), text: "👍 Interested", label: "👍 Interested" };
      const optionB = { id: crypto.randomUUID(), text: "👎 Not interested", label: "👎 Not interested" };

      // Add required start/end times for polls
      const now = new Date();
      const endTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      const { data: poll, error: pollErr } = await (supabase.from as any)("polls")
        .insert({
          question: `Vote on topic: ${topic.title}`,
          options: [optionA, optionB] as any,
          is_active: true,
          show_results: true,
          event_id: currentEventId,
          created_by: currentUser.id,
          start_time: now.toISOString(),
          end_time: endTime.toISOString(),
          display_as_banner: false,
        } as any)
        .select("*")
        .single();

      if (pollErr) throw pollErr;

      const pollId = poll?.id ?? null;
      if (pollId) {
        const { error: linkErr } = await (supabase.from as any)("topics")
          .update({ poll_id: pollId } as any)
          .eq("id", topic.id);
        if (linkErr) throw linkErr;
      }

      return { ...topic, poll_id: pollId } as Topic;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["topics", currentEventId] });
      queryClient.invalidateQueries({ queryKey: ["attendee-polls"] });
      toast({ title: "Poll created", description: "👍/👎 voting is now available." });
    },
    onError: (e: any) => {
      toast({
        title: "Could not create poll",
        description: e?.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteTopic = useMutation({
    mutationFn: async (topic: Topic) => {
      // If there's a linked poll, delete it to keep data consistent
      if (topic.poll_id) {
        const { error: pollErr } = await (supabase.from as any)("polls")
          .delete()
          .eq("id", topic.poll_id);
        if (pollErr) throw pollErr;
      }
      // Delete the topic itself
      const { error } = await (supabase.from as any)("topics")
        .delete()
        .eq("id", topic.id);
      if (error) throw error;
    },
    // Optimistic update: remove the topic from cache immediately
    onMutate: async (topic: Topic) => {
      await queryClient.cancelQueries({ queryKey: ["topics", currentEventId] });
      const previousTopics = queryClient.getQueryData<Topic[]>(["topics", currentEventId]);
      queryClient.setQueryData<Topic[]>(
        ["topics", currentEventId],
        (old) => (old ? old.filter((t) => t.id !== topic.id) : old)
      );
      return { previousTopics };
    },
    // Roll back UI on error
    onError: (e: any, _topic, context) => {
      if (context?.previousTopics) {
        queryClient.setQueryData(["topics", currentEventId], context.previousTopics);
      }
      toast({
        title: "Could not delete topic",
        description: e?.message || "Please try again.",
        variant: "destructive",
      });
    },
    // Ensure cache and UI are in sync with the server
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["topics", currentEventId] });
      queryClient.invalidateQueries({ queryKey: ["attendee-polls"] });
    },
    // Success toast
    onSuccess: () => {
      toast({ title: "Topic deleted", description: "Topic has been permanently deleted." });
    },
  });

  return {
    topics,
    isLoading,
    createTopic: createTopic.mutateAsync,
    closing: closeTopic.isPending,
    closeTopic: closeTopic.mutateAsync,
    ensurePollForTopic: ensurePollForTopic.mutateAsync,
    ensuring: ensurePollForTopic.isPending,
    deleteTopic: deleteTopic.mutateAsync,
    deleting: deleteTopic.isPending,
  };
}