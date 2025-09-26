import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTopics } from "@/hooks/useTopics";
import { useAttendeePolls } from "@/hooks/useAttendeePolls";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, MessageSquare, TrendingUp, Clock, Users2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  className?: string;
};

const TopicsBoard: React.FC<Props> = ({ className }) => {
  const { topics, isLoading, createTopic, closeTopic, closing, ensurePollForTopic, ensuring } = useTopics();
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
    <div className={`${className} min-w-0 overflow-hidden`}>
      {/* Modern Header */}
      <div className="mb-6 p-6 rounded-3xl bg-gradient-to-br from-primary-50/50 to-accent/30 border border-border/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-2xl bg-primary/10 text-primary">
            <MessageSquare className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-bold text-xl text-gradient">Discussion Topics</h2>
            <p className="text-sm text-muted-foreground">Share ideas and spark conversations</p>
          </div>
        </div>
        
        <Card className="glass-card border-0 shadow-sm">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">Start a New Topic</span>
            </div>
            
            <Input
              placeholder="What would you like to discuss?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="min-w-0 border-border/50 bg-background/50 focus:bg-background transition-colors h-12 text-base"
            />
            <Textarea
              placeholder="Add context or details (optional)"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={3}
              className="min-w-0 resize-none border-border/50 bg-background/50 focus:bg-background transition-colors"
            />
            <Button 
              onClick={handleCreate} 
              disabled={!title.trim() || isLoading}
              className="w-full bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-lg hover:shadow-xl transition-all duration-300 h-12"
            >
              {isLoading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Share Topic
            </Button>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center space-y-4">
            <div className="animate-spin h-10 w-10 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="text-muted-foreground">Loading discussions...</p>
          </div>
        </div>
      ) : topics.length === 0 ? (
        <div className="text-center py-16 space-y-6">
          <div className="p-6 rounded-3xl bg-muted/30 w-fit mx-auto">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto" />
          </div>
          <div className="space-y-2">
            <p className="text-lg font-semibold text-foreground">No topics yet</p>
            <p className="text-muted-foreground">Be the first to start a discussion!</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
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
            const isPopular = total >= 10;
            const isTrending = total >= 5 && t.status === "open";

            return (
              <Card
                key={t.id}
                className={`group relative overflow-hidden glass-card min-w-0 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl ${
                  t.status === "open" ? "topic-glow" : ""
                } ${isPopular ? "fire-border" : ""}`}
              >
                <CardHeader className="pb-4 space-y-4">
                  <div className="flex items-start justify-between gap-4 min-w-0">
                    <div className="min-w-0 flex-1 space-y-3">
                      <div className="flex items-center gap-2">
                        {isTrending && (
                          <div className="p-1.5 rounded-lg bg-gradient-to-br from-orange-400 to-red-500 text-white animate-pulse">
                            <TrendingUp className="h-3 w-3" />
                          </div>
                        )}
                        <CardTitle className="text-lg sm:text-xl break-words font-bold group-hover:text-primary transition-colors">
                          {t.title}
                        </CardTitle>
                      </div>
                      {t.description && (
                        <p className="text-sm text-muted-foreground break-words leading-relaxed bg-muted/30 p-3 rounded-xl">
                          {t.description}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <Badge 
                        variant={t.status === "open" ? "default" : "secondary"} 
                        className={`text-xs font-medium px-3 py-1 ${
                          t.status === "open" 
                            ? "bg-gradient-to-r from-green-400 to-green-600 text-white shadow-lg" 
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <div className={`h-2 w-2 rounded-full mr-2 ${t.status === "open" ? "bg-white animate-pulse" : "bg-muted-foreground"}`} />
                        {t.status === "open" ? "Live" : "Closed"}
                      </Badge>
                      {typeof total === "number" && total > 0 && (
                        <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
                          <Users2 className="h-3 w-3 mr-1" />
                          {total} votes
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0 space-y-4">
                  {t.poll_id && poll ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Button
                        variant={userChoice === interested?.id ? "default" : "outline"}
                        disabled={isSubmitting || t.status !== "open" || !interested}
                        onClick={() => interested && handleVote(poll.id, interested.id)}
                        className={`justify-between min-w-0 h-12 transition-all duration-300 ${
                          userChoice === interested?.id 
                            ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg hover:shadow-xl" 
                            : "hover:bg-green-50 hover:border-green-300 hover:text-green-700"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">👍</span>
                          <span className="truncate font-medium">Interested</span>
                        </div>
                        <Badge 
                          variant="secondary" 
                          className={`ml-3 ${userChoice === interested?.id ? "bg-white/20 text-white" : "bg-muted"}`}
                        >
                          {interested?.votes || 0}
                        </Badge>
                      </Button>
                      <Button
                        variant={userChoice === notInterested?.id ? "default" : "outline"}
                        disabled={isSubmitting || t.status !== "open" || !notInterested}
                        onClick={() => notInterested && handleVote(poll.id, notInterested.id)}
                        className={`justify-between min-w-0 h-12 transition-all duration-300 ${
                          userChoice === notInterested?.id 
                            ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg hover:shadow-xl" 
                            : "hover:bg-red-50 hover:border-red-300 hover:text-red-700"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">👎</span>
                          <span className="truncate font-medium">Not interested</span>
                        </div>
                        <Badge 
                          variant="secondary" 
                          className={`ml-3 ${userChoice === notInterested?.id ? "bg-white/20 text-white" : "bg-muted"}`}
                        >
                          {notInterested?.votes || 0}
                        </Badge>
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-muted/30">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MessageSquare className="h-4 w-4" />
                        <span>No voting available yet</span>
                      </div>
                      {t.status === "open" && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={ensuring}
                          onClick={() => ensurePollForTopic(t)}
                          className="flex-shrink-0 hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                        >
                          {ensuring ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Sparkles className="h-3 w-3 mr-2" />}
                          Enable Voting
                        </Button>
                      )}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-border/50">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>Posted {new Date(t.created_at).toLocaleString()}</span>
                    </div>
                    {t.status === "open" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={closing}
                        onClick={() => closeTopic(t.id)}
                        className="flex-shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-300"
                      >
                        {closing ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : null}
                        Close Topic
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TopicsBoard;