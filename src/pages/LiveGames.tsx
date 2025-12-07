import { useParams, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Medal, Trophy, Clock, ChevronRight, PlayCircle, StopCircle, Star, Sparkles, Gamepad2, Zap } from 'lucide-react';
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
  play_mode?: 'admin_directed' | 'self_paced';
}

const RANK_COLORS = [
  { bg: 'bg-yellow-400', border: 'border-yellow-500', text: 'text-yellow-900' },
  { bg: 'bg-gray-300', border: 'border-gray-400', text: 'text-gray-900' },
  { bg: 'bg-orange-400', border: 'border-orange-500', text: 'text-orange-900' },
];

const OPTION_COLORS = [
  { bg: 'bg-red-500', border: 'border-red-600', text: 'text-white' },
  { bg: 'bg-blue-500', border: 'border-blue-600', text: 'text-white' },
  { bg: 'bg-green-500', border: 'border-green-600', text: 'text-white' },
  { bg: 'bg-purple-500', border: 'border-purple-600', text: 'text-white' },
];

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
      const currentQuestionLocal = questions[session.current_question_index];
      if (!currentQuestionLocal) return;

      const { data, error } = await supabase
        .from('quiz_responses')
        .select(`
          user_id,
          time_taken,
          is_correct,
          profiles:user_id(name, photo_url)
        `)
        .eq('quiz_game_id', activeGame.id)
        .eq('question_id', (currentQuestionLocal as any).id)
        .order('time_taken', { ascending: true });

      if (error) throw error;

      const liveScores: LeaderboardEntry[] = (data || []).map((r: any) => ({
        user_id: r.user_id,
        points: r.is_correct ? 1000 : 0,
        time_seconds: r.time_taken,
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
        const { data, error } = await supabase.functions.invoke('get-quiz-leaderboard', {
          body: { eventId },
        });
        if (error) throw error;
        const newScores: LeaderboardEntry[] = (data?.scores || []).map((s: any) => ({
          user_id: s.user_id,
          points: s.total_score,
          time_seconds: s.total_time,
          name: s.name || s.profiles?.name || 'Anonymous',
          photo_url: s.photo_url || s.profiles?.photo_url || undefined,
          completed_at: s.completed_at || ''
        }));
        setScores(newScores);
      } else {
        const { data, error } = await supabase.functions.invoke('get-wordsearch-leaderboard', {
          body: { eventId },
        });
        if (error) throw error;
        const newScores: LeaderboardEntry[] = data.scores || [];
        setScores(newScores);
      }

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
      if (isQuiz) {
        const { data, error } = await supabase
          .from('quiz_games')
          .select('id, title, is_active, play_mode')
          .eq('event_id', eventId)
          .eq('is_active', true)
          .single();

        if (error) {
          console.error('Error fetching active game:', error);
          setIsLoading(false);
          return;
        }

        setActiveGame(data as Game);
        if (data) {
          await fetchScores();
          setIsLoading(false);
        }
      } else {
        const { data, error } = await supabase
          .from('word_search_games')
          .select('id, title, is_active')
          .eq('event_id', eventId)
          .eq('is_active', true)
          .single();

        if (error) {
          console.error('Error fetching active game:', error);
          setIsLoading(false);
          return;
        }

        setActiveGame(data as Game);
        if (data) {
          await fetchScores();
          setIsLoading(false);
        }
      }
    };

    fetchActiveGame();

    const channel = supabase
      .channel(isQuiz ? 'quiz-answers-changes' : 'word-search-scores-changes')
      .on(
        'postgres_changes',
        isQuiz
          ? {
              event: '*',
              schema: 'public',
              table: 'quiz_responses',
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
          table: 'quiz_responses',
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

  useEffect(() => {
    if (!eventId || !isQuiz) return;
    const id = setInterval(() => {
      fetchScores();
    }, 1500);
    return () => clearInterval(id);
  }, [eventId, isQuiz]);

  useEffect(() => {
    if (!session || !activeGame?.id) return;
    const id = setInterval(() => {
      fetchLiveQuestionScores();
    }, 1000);
    return () => clearInterval(id);
  }, [session?.current_question_index, activeGame?.id]);
 
  if (isLoading) {
    return (
      <div className="min-h-screen bg-cyan-400 flex items-center justify-center relative overflow-hidden">
        {/* Animated background shapes */}
        <motion.div
          className="absolute top-10 left-10 w-20 h-20 bg-pink-500 rounded-full"
          animate={{ y: [0, -20, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-20 right-20 w-16 h-16 bg-yellow-400 rounded-full"
          animate={{ y: [0, 20, 0], rotate: [0, 360] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 left-20 w-24 h-24 bg-green-400 rounded-full"
          animate={{ x: [0, 20, 0], scale: [1, 0.9, 1] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        />
        
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Gamepad2 className="w-20 h-20 text-yellow-300 mx-auto" />
          </motion.div>
          <p className="text-2xl font-black text-white mt-4 drop-shadow-lg">Loading Game...</p>
        </div>
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
      <div className="min-h-screen bg-cyan-400 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated background shapes */}
        <motion.div
          className="absolute top-10 left-10 w-20 h-20 bg-pink-500 rounded-full"
          animate={{ y: [0, -20, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-20 right-20 w-16 h-16 bg-yellow-400 rounded-full"
          animate={{ y: [0, 20, 0], rotate: [0, 360] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 left-20 w-24 h-24 bg-green-400 rounded-full"
          animate={{ x: [0, 20, 0], scale: [1, 0.9, 1] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-10 right-10 w-12 h-12 bg-purple-500 rounded-full"
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 1.8, repeat: Infinity }}
        />
        
        <Card className="max-w-md w-full bg-yellow-300 border-4 border-yellow-500 shadow-[8px_8px_0px_0px_rgba(234,179,8,1)]">
          <CardContent className="py-12 text-center">
            <motion.div
              animate={{ scale: [1, 1.1, 1], rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Trophy className="w-20 h-20 mx-auto mb-4 text-orange-500" />
            </motion.div>
            <p className="text-2xl font-black text-orange-600">
              No active game at the moment
            </p>
            <p className="text-lg font-bold text-orange-500 mt-2">
              Check back soon!
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = session ? questions[session.current_question_index] : null;

  return (
    <div className="min-h-screen bg-cyan-400 p-4 md:p-8 relative overflow-hidden">
      {/* Animated background decorations */}
      <motion.div
        className="absolute top-5 left-5 w-16 h-16 bg-pink-500 rounded-full z-0"
        animate={{ y: [0, -15, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <motion.div
        className="absolute top-20 right-10 w-12 h-12 bg-yellow-300 rounded-full z-0"
        animate={{ y: [0, 15, 0], rotate: [0, 360] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      <motion.div
        className="absolute top-40 left-20 w-8 h-8 bg-green-400 rounded-full z-0"
        animate={{ x: [0, 10, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-20 right-20 w-20 h-20 bg-purple-400 rounded-full z-0"
        animate={{ scale: [1, 0.9, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-40 left-10 w-10 h-10 bg-orange-400 rounded-full z-0"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 1.8, repeat: Infinity }}
      />
      
      {/* Animated stars */}
      <motion.div
        className="absolute top-32 right-32 z-0"
        animate={{ rotate: 360, scale: [1, 1.2, 1] }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        <Star className="w-8 h-8 text-red-500 fill-red-500" />
      </motion.div>
      <motion.div
        className="absolute bottom-32 left-32 z-0"
        animate={{ rotate: -360, scale: [1, 1.3, 1] }}
        transition={{ duration: 5, repeat: Infinity }}
      >
        <Star className="w-10 h-10 text-yellow-400 fill-yellow-400" />
      </motion.div>

      <div className="max-w-4xl mx-auto space-y-6 relative z-10">
        {/* Header */}
        <div className="text-center space-y-2">
          <motion.div
            className="flex items-center justify-center gap-3"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Trophy className="w-12 h-12 text-yellow-400 drop-shadow-lg" />
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-black text-white drop-shadow-[3px_3px_0px_rgba(0,0,0,0.3)]">
              LIVE LEADERBOARD
            </h1>
            <motion.div
              animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            >
              <Sparkles className="w-10 h-10 text-yellow-300" />
            </motion.div>
          </motion.div>
          <div className="inline-block bg-blue-500 px-6 py-2 rounded-full border-4 border-blue-600 shadow-[4px_4px_0px_0px_rgba(30,64,175,1)]">
            <p className="text-xl font-black text-white">{activeGame.title}</p>
          </div>
        </div>

        {/* Quiz Control Panel */}
        {isQuiz && activeGame?.play_mode !== 'self_paced' && (
          <Card className="bg-purple-400 border-4 border-purple-500 shadow-[8px_8px_0px_0px_rgba(126,34,206,1)]">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-white font-black text-xl">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  >
                    <Gamepad2 className="w-7 h-7 text-yellow-300" />
                  </motion.div>
                  Quiz Control Panel
                </span>
                {session && (
                  <span className="bg-yellow-400 px-4 py-1 rounded-full border-2 border-yellow-500 font-black text-yellow-900">
                    Question {session.current_question_index + 1} of {questions.length}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!session ? (
                <Button 
                  onClick={handleStartQuiz}
                  className="w-full h-16 text-xl font-black bg-green-500 hover:bg-green-600 border-4 border-green-600 shadow-[4px_4px_0px_0px_rgba(22,101,52,1)] text-white"
                  disabled={startSession.isPending}
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <PlayCircle className="w-8 h-8 mr-2" />
                  </motion.div>
                  START QUIZ!
                </Button>
              ) : (
                <>
                  {currentQuestion && (
                    <div className="space-y-4">
                      {/* Question Display */}
                      <div className="p-6 bg-yellow-300 rounded-xl border-4 border-yellow-400 shadow-[4px_4px_0px_0px_rgba(202,138,4,1)]">
                        <h3 className="text-2xl font-black text-yellow-900 mb-4">
                          {currentQuestion.question_text}
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                          {currentQuestion.options.map((option, index) => (
                            <div
                              key={index}
                              className={cn(
                                'p-4 rounded-xl border-4 font-black text-lg',
                                showCorrectAnswer && option === currentQuestion.correct_answer
                                  ? 'bg-green-400 border-green-500 text-green-900 shadow-[4px_4px_0px_0px_rgba(22,101,52,1)]'
                                  : `${OPTION_COLORS[index]?.bg} ${OPTION_COLORS[index]?.border} ${OPTION_COLORS[index]?.text} shadow-[3px_3px_0px_0px_rgba(0,0,0,0.2)]`
                              )}
                            >
                              <span className="mr-2">
                                {String.fromCharCode(65 + index)}.
                              </span>
                              {option}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Live Question Leaderboard */}
                      {liveQuestionScores.length > 0 && (
                        <Card className="bg-blue-400 border-4 border-blue-500 shadow-[4px_4px_0px_0px_rgba(30,64,175,1)]">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-black text-white flex items-center gap-2">
                              <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 0.5, repeat: Infinity }}
                              >
                                <Zap className="w-6 h-6 text-yellow-300" />
                              </motion.div>
                              Live Standings
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              {liveQuestionScores.map((entry, index) => (
                                <motion.div
                                  key={entry.user_id}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  className={cn(
                                    'flex items-center gap-3 p-3 rounded-xl border-3',
                                    index === 0 ? 'bg-yellow-400 border-yellow-500' :
                                    index === 1 ? 'bg-gray-300 border-gray-400' :
                                    index === 2 ? 'bg-orange-400 border-orange-500' :
                                    'bg-white border-gray-300'
                                  )}
                                >
                                  <span className="font-black text-lg min-w-[2rem] text-gray-800">#{index + 1}</span>
                                  <Avatar className="w-10 h-10 border-2 border-white">
                                    <AvatarImage src={entry.photo_url} />
                                    <AvatarFallback className="bg-pink-400 text-white font-bold">{entry.name?.charAt(0) || 'U'}</AvatarFallback>
                                  </Avatar>
                                  <span className="flex-1 font-bold text-gray-800">{entry.name}</span>
                                  <span className="bg-white px-3 py-1 rounded-full border-2 border-gray-300 font-bold text-gray-700 flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {entry.time_seconds.toFixed(1)}s
                                  </span>
                                </motion.div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Control Buttons */}
                      <div className="flex gap-3">
                        {!showCorrectAnswer && (
                          <Button
                            onClick={() => setShowCorrectAnswer(true)}
                            className="flex-1 h-14 text-lg font-black bg-yellow-400 hover:bg-yellow-500 border-4 border-yellow-500 text-yellow-900 shadow-[4px_4px_0px_0px_rgba(202,138,4,1)]"
                          >
                            <Sparkles className="w-5 h-5 mr-2" />
                            Show Answer
                          </Button>
                        )}
                        {session.current_question_index < questions.length - 1 ? (
                          <Button
                            onClick={handleNextQuestion}
                            className="flex-1 h-14 text-lg font-black bg-green-500 hover:bg-green-600 border-4 border-green-600 text-white shadow-[4px_4px_0px_0px_rgba(22,101,52,1)]"
                            disabled={nextQuestion.isPending}
                          >
                            <ChevronRight className="w-6 h-6 mr-2" />
                            Next Question
                          </Button>
                        ) : (
                          <Button
                            onClick={handleEndQuiz}
                            className="flex-1 h-14 text-lg font-black bg-red-500 hover:bg-red-600 border-4 border-red-600 text-white shadow-[4px_4px_0px_0px_rgba(153,27,27,1)]"
                            disabled={endSession.isPending}
                          >
                            <StopCircle className="w-6 h-6 mr-2" />
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

        {/* Leaderboard */}
        <Card className="bg-yellow-300 border-4 border-yellow-400 shadow-[8px_8px_0px_0px_rgba(202,138,4,1)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl font-black text-yellow-900">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Trophy className="w-8 h-8 text-orange-500" />
              </motion.div>
              TOP PLAYERS
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <Star className="w-6 h-6 text-red-500 fill-red-500" />
              </motion.div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {scores.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-12 text-center"
                >
                  <motion.div
                    animate={{ y: [0, -10, 0], rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Gamepad2 className="w-20 h-20 mx-auto mb-4 text-orange-500" />
                  </motion.div>
                  <p className="text-xl font-black text-orange-600">
                    No scores yet!
                  </p>
                  <p className="text-lg font-bold text-orange-500">
                    Be the first to play! 🎮
                  </p>
                </motion.div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {scores.map((entry, index) => {
                    const rank = index + 1;
                    const isTop3 = rank <= 3;
                    const isHighlighted = highlightedIds.has(entry.user_id);
                    const colorSet = isTop3 ? RANK_COLORS[index] : { bg: 'bg-white', border: 'border-gray-300', text: 'text-gray-800' };

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
                          'flex items-center gap-4 p-4 rounded-xl border-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.15)]',
                          colorSet.bg,
                          colorSet.border
                        )}
                      >
                        {/* Rank */}
                        <div className={cn(
                          'w-12 h-12 rounded-full flex items-center justify-center font-black text-xl border-3',
                          isTop3 ? 'bg-white border-gray-300' : 'bg-gray-100 border-gray-200'
                        )}>
                          {isTop3 ? (
                            <motion.div
                              animate={rank === 1 ? { rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] } : {}}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              <Medal className={cn(
                                'w-7 h-7',
                                rank === 1 ? 'text-yellow-500' : rank === 2 ? 'text-gray-400' : 'text-orange-500'
                              )} />
                            </motion.div>
                          ) : (
                            <span className="text-gray-600">#{rank}</span>
                          )}
                        </div>

                        {/* Avatar */}
                        <Avatar className="w-14 h-14 border-3 border-white shadow-md">
                          <AvatarImage src={entry.photo_url} />
                          <AvatarFallback className="bg-pink-400 text-white font-bold text-lg">
                            {entry.name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>

                        {/* Name */}
                        <div className="flex-1 min-w-0">
                          <p className={cn('font-black text-lg truncate', colorSet.text)}>
                            {entry.name}
                          </p>
                        </div>

                        {/* Score & Time */}
                        <div className="flex flex-col items-end gap-1">
                          <div className="bg-green-500 px-4 py-1 rounded-full border-2 border-green-600">
                            <span className="font-black text-white text-lg">
                              {entry.points.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 bg-blue-400 px-3 py-1 rounded-full border-2 border-blue-500">
                            <Clock className="w-4 h-4 text-white" />
                            <span className="text-sm font-bold text-white">
                              {entry.time_seconds.toFixed(1)}s
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LiveGames;
