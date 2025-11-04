import { useParams, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Medal, Trophy, Clock, ChevronRight, PlayCircle, StopCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuizSession } from '@/hooks/useQuizSession';
import { useQuizQuestions } from '@/hooks/useQuizGames';
import { toast } from 'sonner';

interface LeaderboardEntry {
  user_id: string;
  points: number;
  time_seconds: number;
  name: string;
  photo_url?: string;
  completed_at: string;
}

interface Game {
  id: string;
  title: string;
  is_active: boolean;
}

const MEDAL_COLORS = {
  1: 'text-yellow-500',
  2: 'text-gray-400',
  3: 'text-amber-600',
};

const LiveGames = () => {
  const { eventId } = useParams();
  const location = useLocation();
  const tab = new URLSearchParams(location.search).get('tab');
  const isQuiz = tab === 'quiz';
  const [scores, setScores] = useState<LeaderboardEntry[]>([]);
  const [activeGame, setActiveGame] = useState<Game | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [highlightedIds, setHighlightedIds] = useState<Set<string>>(new Set());
  const [liveQuestionScores, setLiveQuestionScores] = useState<LeaderboardEntry[]>([]);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  
  const { session, startSession, nextQuestion, endSession } = useQuizSession(
    activeGame?.id || null,
    eventId || null
  );
  const { questions } = useQuizQuestions(activeGame?.id || null);

  const fetchLiveQuestionScores = async () => {
    if (!eventId || !session || !activeGame?.id) return;

    try {
      const { data, error } = await supabase
        .from('quiz_answers')
        .select(`
          user_id,
          response_time,
          is_correct,
          profiles:user_id(name, photo_url)
        `)
        .eq('quiz_game_id', activeGame.id)
        .eq('question_index', session.current_question_index)
        .order('response_time', { ascending: true });

      if (error) throw error;

      const liveScores: LeaderboardEntry[] = (data || []).map((r: any) => ({
        user_id: r.user_id,
        points: r.is_correct ? 1000 : 0,
        time_seconds: r.response_time,
        name: r.profiles?.name || 'Anonymous',
        photo_url: r.profiles?.photo_url || undefined,
        completed_at: ''
      }));
      setLiveQuestionScores(liveScores);
    } catch (error) {
      console.error('Error fetching live question scores:', error);
    }
  };

  const fetchScores = async () => {
    if (!eventId) return;

    try {
      if (isQuiz) {
        if (!activeGame?.id) return;
        
        // Fetch cumulative scores from quiz_answers for live updating
        const { data, error } = await supabase
          .from('quiz_answers')
          .select(`
            user_id,
            points_earned,
            response_time,
            profiles:user_id(name, photo_url)
          `)
          .eq('quiz_game_id', activeGame.id);

        if (error) throw error;

        // Aggregate scores per user
        const userScoresMap = new Map<string, {
          points: number;
          time: number;
          name: string;
          photo_url?: string;
        }>();

        (data || []).forEach((answer: any) => {
          const existing = userScoresMap.get(answer.user_id);
          if (existing) {
            existing.points += answer.points_earned || 0;
            existing.time += answer.response_time || 0;
          } else {
            userScoresMap.set(answer.user_id, {
              points: answer.points_earned || 0,
              time: answer.response_time || 0,
              name: answer.profiles?.name || 'Anonymous',
              photo_url: answer.profiles?.photo_url || undefined,
            });
          }
        });

        // Convert to array and sort
        const newScores: LeaderboardEntry[] = Array.from(userScoresMap.entries())
          .map(([user_id, data]) => ({
            user_id,
            points: data.points,
            time_seconds: data.time,
            name: data.name,
            photo_url: data.photo_url,
            completed_at: ''
          }))
          .sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            return a.time_seconds - b.time_seconds;
          });

        setScores(newScores);
      } else {
        const { data, error } = await supabase.functions.invoke('get-wordsearch-leaderboard', {
          body: { eventId },
        });
        if (error) throw error;
        const newScores: LeaderboardEntry[] = data.scores || [];
        setScores(newScores);
      }

      // Highlight top 3 for animation
      const newHighlighted = new Set((scores || []).slice(0, 3).map((s: LeaderboardEntry) => s.user_id));
      setHighlightedIds(newHighlighted);
      setTimeout(() => setHighlightedIds(new Set()), 2000);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  useEffect(() => {
    if (!eventId) return;

    const fetchActiveGame = async () => {
      const table = isQuiz ? 'quiz_games' : 'word_search_games';
      const { data, error } = await supabase
        .from(table)
        .select('id, title, is_active')
        .eq('event_id', eventId)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error fetching active game:', error);
        setIsLoading(false);
        return;
      }

      setActiveGame(data);
      if (data) {
        await fetchScores();
        setIsLoading(false);
      }
    };

    fetchActiveGame();

    // Subscribe to real-time updates
    const channel = supabase
      .channel(isQuiz ? 'quiz-answers-changes' : 'word-search-scores-changes')
      .on(
        'postgres_changes',
        isQuiz
          ? {
              event: '*',
              schema: 'public',
              table: 'quiz_answers',
            }
          : {
              event: '*',
              schema: 'public',
              table: 'word_search_scores',
            },
        () => {
          fetchScores();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId, isQuiz]);

  // Subscribe to live question answers
  useEffect(() => {
    if (!session || !activeGame?.id) return;

    fetchLiveQuestionScores();

    const channel = supabase
      .channel('quiz-answers-live')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'quiz_answers',
          filter: `quiz_game_id=eq.${activeGame.id}`,
        },
        () => {
          fetchLiveQuestionScores();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.current_question_index, activeGame?.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center">
        <p className="text-muted-foreground text-lg">Loading leaderboard...</p>
      </div>
    );
  }

  const handleStartQuiz = async () => {
    if (!activeGame?.id || !eventId) return;
    try {
      await startSession.mutateAsync({ quizGameId: activeGame.id, eventId });
      setShowCorrectAnswer(false);
      setLiveQuestionScores([]);
      toast.success('Quiz started!');
    } catch (error) {
      console.error('Failed to start quiz:', error);
      toast.error('Failed to start quiz');
    }
  };

  const handleNextQuestion = async () => {
    if (!session || session.current_question_index >= questions.length - 1) return;
    try {
      await nextQuestion.mutateAsync({
        sessionId: session.id,
        currentIndex: session.current_question_index,
      });
      setShowCorrectAnswer(false);
      setLiveQuestionScores([]);
    } catch (error) {
      console.error('Failed to go to next question:', error);
      toast.error('Failed to advance question');
    }
  };

  const handleEndQuiz = async () => {
    if (!session) return;
    try {
      await endSession.mutateAsync(session.id);
      toast.success('Quiz ended!');
    } catch (error) {
      console.error('Failed to end quiz:', error);
      toast.error('Failed to end quiz');
    }
  };

  if (!activeGame) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="py-12 text-center">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground text-lg">
              No active game at the moment
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = session ? questions[session.current_question_index] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Live Leaderboard
          </h1>
          <p className="text-xl text-muted-foreground">{activeGame.title}</p>
        </div>

        {isQuiz && (
          <Card className="shadow-xl mb-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  Quiz Control Panel
                </span>
                {session && (
                  <span className="text-sm text-muted-foreground">
                    Question {session.current_question_index + 1} of {questions.length}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!session ? (
                <Button 
                  onClick={handleStartQuiz}
                  className="w-full h-16 text-lg"
                  disabled={startSession.isPending}
                >
                  <PlayCircle className="w-5 h-5 mr-2" />
                  Start Quiz
                </Button>
              ) : (
                <>
                  {currentQuestion && (
                    <div className="space-y-4">
                      <div className="p-6 bg-muted rounded-lg">
                        <h3 className="text-2xl font-bold mb-4">
                          {currentQuestion.question_text}
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                          {currentQuestion.options.map((option, index) => (
                            <div
                              key={index}
                              className={cn(
                                'p-4 rounded-lg border-2 font-medium',
                                showCorrectAnswer && option === currentQuestion.correct_answer
                                  ? 'bg-green-500/20 border-green-500 text-green-700 dark:text-green-300'
                                  : 'bg-card border-border'
                              )}
                            >
                              <span className="mr-2 font-bold">
                                {String.fromCharCode(65 + index)}.
                              </span>
                              {option}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Live Question Leaderboard */}
                      {liveQuestionScores.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Current Question - Live Standings</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              {liveQuestionScores.map((entry, index) => (
                                <motion.div
                                  key={entry.user_id}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  className="flex items-center gap-3 p-3 rounded-lg bg-muted"
                                >
                                  <span className="font-bold text-lg min-w-[2rem]">#{index + 1}</span>
                                  <Avatar className="w-8 h-8">
                                    <AvatarImage src={entry.photo_url} />
                                    <AvatarFallback>{entry.name?.charAt(0) || 'U'}</AvatarFallback>
                                  </Avatar>
                                  <span className="flex-1 font-medium">{entry.name}</span>
                                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {entry.time_seconds.toFixed(1)}s
                                  </span>
                                </motion.div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      <div className="flex gap-2">
                        {!showCorrectAnswer && (
                          <Button
                            onClick={() => setShowCorrectAnswer(true)}
                            variant="outline"
                            className="flex-1 h-14 text-lg"
                          >
                            Show Answer
                          </Button>
                        )}
                        {session.current_question_index < questions.length - 1 ? (
                          <Button
                            onClick={handleNextQuestion}
                            className="flex-1 h-14 text-lg"
                            disabled={nextQuestion.isPending}
                          >
                            <ChevronRight className="w-5 h-5 mr-2" />
                            Next Question
                          </Button>
                        ) : (
                          <Button
                            onClick={handleEndQuiz}
                            variant="destructive"
                            className="flex-1 h-14 text-lg"
                            disabled={endSession.isPending}
                          >
                            <StopCircle className="w-5 h-5 mr-2" />
                            End Quiz
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Trophy className="w-6 h-6 text-primary" />
              Top Players
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {scores.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-12 text-center"
                >
                  <Clock className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground text-lg">
                    No scores yet. Be the first to play!
                  </p>
                </motion.div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {scores.map((entry, index) => {
                    const rank = index + 1;
                    const showMedal = rank <= 3;
                    const isHighlighted = highlightedIds.has(entry.user_id);

                    return (
                      <motion.div
                        key={entry.user_id}
                        layout
                        initial={{ opacity: 0, scale: 0.9, x: -50 }}
                        animate={{ 
                          opacity: 1, 
                          scale: isHighlighted ? [1, 1.05, 1] : 1,
                          x: 0
                        }}
                        exit={{ opacity: 0, scale: 0.9, x: 50 }}
                        transition={{ 
                          layout: { duration: 0.3 },
                          scale: { duration: 0.6, repeat: isHighlighted ? 2 : 0 }
                        }}
                        className={cn(
                          'flex items-center gap-4 p-4 rounded-lg border-2 transition-all',
                          rank === 1 && 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-500',
                          rank === 2 && 'bg-gray-50 dark:bg-gray-950/20 border-gray-400',
                          rank === 3 && 'bg-amber-50 dark:bg-amber-950/20 border-amber-600',
                          rank > 3 && 'bg-card',
                          isHighlighted && 'ring-4 ring-primary/50 ring-offset-2'
                        )}
                      >
                        <div className="flex items-center gap-2 min-w-[4rem]">
                          <motion.span 
                            className="text-2xl font-bold text-muted-foreground"
                            animate={isHighlighted ? { scale: [1, 1.3, 1] } : {}}
                            transition={{ duration: 0.4 }}
                          >
                            #{rank}
                          </motion.span>
                          {showMedal && (
                            <motion.div
                              initial={{ rotate: -30, scale: 0 }}
                              animate={{ rotate: 0, scale: 1 }}
                              transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                            >
                              <Medal
                                className={cn('w-6 h-6', MEDAL_COLORS[rank as keyof typeof MEDAL_COLORS])}
                              />
                            </motion.div>
                          )}
                        </div>

                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Avatar className="w-12 h-12 border-2 border-primary/20">
                            <AvatarImage src={entry.photo_url} />
                            <AvatarFallback className="text-lg font-semibold bg-primary/10 text-primary">
                              {entry.name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                        </motion.div>

                        <div className="flex-1">
                          <p className="font-semibold text-lg">{entry.name || 'Anonymous'}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span className="font-medium">
                              ⚡ {entry.time_seconds}s
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <motion.p 
                            className="text-3xl font-bold text-primary"
                            animate={isHighlighted ? { scale: [1, 1.2, 1] } : {}}
                          >
                            {entry.points}
                          </motion.p>
                          <p className="text-xs text-muted-foreground">points</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          <p>Leaderboard updates in real-time</p>
        </div>
      </div>
    </div>
  );
};

export default LiveGames;
