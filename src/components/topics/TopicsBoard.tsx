// ... existing code ...
import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTopics } from "@/hooks/useTopics";
import { useAttendeePolls } from "@/hooks/useAttendeePolls";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Textarea } from "@/components/ui/textarea"; // If not available, swap for <textarea>

type Props = {
  className?: string;
};

const TopicsBoard: React.FC<Props> = ({ className }) => {
  const { topics, isLoading, createTopic, closeTopic, closing, ensurePollForTopic, ensuring, deleteTopic, deleting } = useTopics();
  const { currentUser } = useAuth();
  const { polls, userVotes, submitVote, isSubmitting } = useAttendeePolls();

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");

  const pollById = useMemo(() => {
    const map = new Map<string, (typeof polls)[number]>();
    polls.forEach((p) => map.set(p.id, p));
    return map;
  }, [polls]);

  const getUserVoteForPoll = (pollId?: string | null) =>
    pollId ? userVotes.find((v) => v.poll_id === pollId)?.option_id : undefined;

  const getTotalVotes = (pollId?: string | null) => {
    if (!pollId) return 0;
    const p = pollById.get(pollId);
    if (!p) return 0;
    return (p.options || []).reduce((sum, o: any) => sum + (o.votes || 0), 0);
  };

  const handleCreate = async () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    await createTopic({ title: trimmed, description: desc.trim() || undefined });
    setTitle("");
    setDesc("");
  };

  const handleVote = async (pollId: string, optionId: string) => {
    await submitVote({ pollId, optionId });
  };

  return (
    <div className={`h-full flex flex-col ${className}`}>
      <Card className="rounded-2xl border-0 shadow-lg bg-white/90 backdrop-blur-sm mb-4 flex-shrink-0">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="text-purple-500" size={18} />
            Raise a Topic
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            placeholder="What's your topic?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Textarea
            placeholder="Add a short description (optional)"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            rows={2}
          />
          <div className="flex justify-end">
            <Button onClick={handleCreate} disabled={!title.trim() || isLoading}>
              {isLoading ? <Loader2 className="animate-spin mr-2" /> : null}
              Post Topic
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border/20">
        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-gray-500">
            <Loader2 className="animate-spin mr-2" /> Loading topics...
          </div>
        ) : topics.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No topics yet. Be the first to raise one!
          </div>
        ) : (
          <div className="space-y-4 p-4">
            {topics.map((t) => {
            const total = getTotalVotes(t.poll_id);
            const userChoice = getUserVoteForPoll(t.poll_id);
            const poll = t.poll_id ? pollById.get(t.poll_id) : undefined;
            const interested = poll?.options?.find((o: any) =>
              String(o.text).includes("Interested")
            );
            const notInterested = poll?.options?.find((o: any) =>
              String(o.text).includes("Not interested")
            );

            return (
              <Card
                key={t.id}
                className={`relative overflow-hidden rounded-2xl border-0 shadow-lg bg-white/95 backdrop-blur-sm ${t.status === "open" ? "topic-glow" : ""}`}
              >
                <CardHeader className="pb-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="text-base sm:text-lg">
                        {t.title}
                      </CardTitle>
                      {t.description ? (
                        <p className="mt-1 text-sm text-gray-600">{t.description}</p>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={t.status === "open" ? "success" : "secondary"}>
                        {t.status === "open" ? "Open" : "Closed"}
                      </Badge>
                      {typeof total === "number" ? (
                        <Badge variant="info">{total} votes</Badge>
                      ) : null}
                      {currentUser?.id === t.user_id && (
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={deleting}
                          onClick={() => deleteTopic(t.id)}
                          className="h-6 w-6 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  {t.poll_id && poll ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Button
                        variant={userChoice === interested?.id ? "default" : "secondary"}
                        disabled={isSubmitting || t.status !== "open" || !interested}
                        onClick={() =>
                          interested && handleVote(poll.id, interested.id)
                        }
                        className="justify-between"
                      >
                        <span>👍 Interested</span>
                        <span className="ml-3 text-xs opacity-80">
                          {interested?.votes || 0}
                        </span>
                      </Button>
                      <Button
                        variant={
                          userChoice === notInterested?.id ? "default" : "secondary"
                        }
                        disabled={isSubmitting || t.status !== "open" || !notInterested}
                        onClick={() =>
                          notInterested && handleVote(poll.id, notInterested.id)
                        }
                        className="justify-between"
                      >
                        <span>👎 Not interested</span>
                        <span className="ml-3 text-xs opacity-80">
                          {notInterested?.votes || 0}
                        </span>
                      </Button>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 flex items-center justify-between">
                      <span>No poll linked yet.</span>
                      {t.status === "open" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={ensuring}
                          onClick={() => ensurePollForTopic(t)}
                        >
                          {ensuring ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : null}
                          Create poll
                        </Button>
                      ) : null}
                    </div>
                  )}

                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Posted {new Date(t.created_at).toLocaleString()}
                    </span>
                    {t.status === "open" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={closing}
                        onClick={() => closeTopic(t.id)}
                      >
                        Close Topic
                      </Button>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TopicsBoard;