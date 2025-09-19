import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type PollOption = { id: string; text: string; votes?: number };
type Poll = {
  id: string;
  question: string;
  options: PollOption[];
  is_active: boolean;
  show_results: boolean;
  event_id?: string;
  created_at: string;
};

export default function LivePolls() {
  const { eventId } = useParams();
  const queryClient = useQueryClient();
  const [search, setSearch] = React.useState("");

  const { data: polls = [], isLoading, error } = useQuery({
    queryKey: ["live-polls", eventId],
    queryFn: async (): Promise<Poll[]> => {
      if (!eventId) return [];

      const { data: basePolls, error: pollsError } = await supabase
        .from("polls")
        .select("*")
        .eq("event_id", eventId)
        .order("created_at", { ascending: false });

      if (pollsError) throw pollsError;

      const enriched = await Promise.all(
        (basePolls || []).map(async (p: any) => {
          const { data: votes } = await supabase
            .from("poll_votes")
            .select("option_id")
            .eq("poll_id", p.id);

          const counts: Record<string, number> = {};
          votes?.forEach((v) => {
            counts[v.option_id] = (counts[v.option_id] || 0) + 1;
          });

          const options = (p.options as any[]) || [];
          const withVotes: PollOption[] = options.map((opt) => ({
            ...opt,
            votes: counts[opt.id] || 0,
          }));

          return {
            ...p,
            options: withVotes,
          } as Poll;
        })
      );

      return enriched;
    },
    enabled: !!eventId,
  });

  // Realtime: refresh when polls or poll_votes change
  useEffect(() => {
    if (!eventId) return;

    const channel = supabase
      .channel("live-polls-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "polls" }, () => {
        queryClient.invalidateQueries({ queryKey: ["live-polls", eventId] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "poll_votes" }, () => {
        queryClient.invalidateQueries({ queryKey: ["live-polls", eventId] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId, queryClient]);

  const filtered = polls.filter((p) =>
    p.question.toLowerCase().includes(search.toLowerCase())
  );

  const calcPercent = (opt: PollOption, all: PollOption[]) => {
    const total = all.reduce((a, o) => a + (o.votes || 0), 0);
    if (!total) return 0;
    return Math.round(((opt.votes || 0) / total) * 100);
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto p-4 sm:p-6">
        <div className="flex items-center justify-center h-48">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading live polls...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto p-4 sm:p-6">
        <p className="text-destructive">Failed to load polls.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <Badge variant="secondary" className="pl-2 pr-2">Live</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Live Poll Results</h1>
        </div>
        <p className="text-muted-foreground mt-1">Real-time poll results for this event.</p>
      </div>

      <div className="flex justify-between items-center mb-4">
        <Input
          placeholder="Search polls..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="grid gap-4">
        {filtered.length > 0 ? (
          filtered.map((poll) => {
            const total = poll.options.reduce((a, o) => a + (o.votes || 0), 0);
            return (
              <Card key={poll.id} className="glass-card overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg font-semibold">{poll.question}</CardTitle>
                    <div className="flex items-center gap-2">
                      {poll.is_active ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Active</Badge>
                      ) : (
                        <Badge variant="outline">Closed</Badge>
                      )}
                      {poll.show_results ? (
                        <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">Results Visible</Badge>
                      ) : (
                        <Badge variant="outline">Hidden</Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{total} total votes</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {poll.options.map((opt) => {
                    const pct = calcPercent(opt, poll.options);
                    return (
                      <div key={opt.id} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="truncate">{opt.text}</span>
                          <span className="font-medium">{pct}%</span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary to-indigo-400 transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">No polls found</h3>
            <p className="text-sm text-muted-foreground">Polls will appear here once available.</p>
          </div>
        )}
      </div>
    </div>
  );
}