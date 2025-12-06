import { useState, useEffect } from 'react';
import AppLayout from '@/components/layouts/AppLayout';
import { useAttendeeContext } from '@/hooks/useAttendeeContext';
import { useWordSearchGames, useWordSearchScores } from '@/hooks/useWordSearchGames';
import { useWordSearchLeaderboard } from '@/hooks/useWordSearchLeaderboard';
import { useQuizGames, useQuizQuestions, useQuizScores } from '@/hooks/useQuizGames';
import { useAuth } from '@/contexts/AuthContext';
import { useQuizSession } from '@/hooks/useQuizSession';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WordSearchGrid } from '@/components/games/WordSearchGrid';
import { WordSearchLeaderboard } from '@/components/games/WordSearchLeaderboard';
import { QuizPlayer } from '@/components/games/QuizPlayer';
import { QuizResults } from '@/components/games/QuizResults';
import { GameCelebration } from '@/components/games/GameCelebration';
import { Gamepad2, Trophy, Clock, Sparkles, Lightbulb, Brain, Star, Zap, PartyPopper } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuizLeaderboard } from '@/hooks/useQuizLeaderboard';

const AttendeeGames = () => {
  const { context } = useAttendeeContext();
  const { currentUser } = useAuth();
  const { games, isLoading: gamesLoading } = useWordSearchGames(context?.currentEventId || null);
  const { quizGames, isLoading: quizGamesLoading } = useQuizGames(context?.currentEventId || null);
  
  const [selectedGame, setSelectedGame] = useState<any>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<any>(null);
  const [foundWords, setFoundWords] = useState<Set<string>>(new Set());
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isGameActive, setIsGameActive] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [gameScore, setGameScore] = useState({ points: 0, time: 0 });
  const [hintsUsed, setHintsUsed] = useState(0);
  const [isPlayingQuiz, setIsPlayingQuiz] = useState(false);
  const [showQuizResults, setShowQuizResults] = useState(false);
  const [quizResults, setQuizResults] = useState({ score: 0, correct: 0, time: 0 });

  const { submitScore } = useWordSearchScores(null);
  const { scores, isLoading: scoresLoading } = useWordSearchLeaderboard(context?.currentEventId || null);
  const { questions: quizQuestions } = useQuizQuestions(selectedQuiz?.id);
  const { scores: quizScores, isLoading: quizScoresLoading, submitScore: submitQuizScore } = useQuizScores(selectedQuiz?.id);
  const { scores: quizLeaderboardScores, isLoading: quizLeaderboardLoading } = useQuizLeaderboard(context?.currentEventId || null);
  const { session: quizSession } = useQuizSession(selectedQuiz?.id || null, context?.currentEventId || null);

  // Check if current user has already completed this game
  const userHasCompleted = scores.some(score => score.user_id === currentUser?.id);

  useEffect(() => {
    if (games.length > 0 && !selectedGame) {
      const activeGame = games.find((g) => g.is_active);
      if (activeGame) setSelectedGame(activeGame);
    }
  }, [games, selectedGame]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGameActive && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isGameActive, startTime]);

  const handleStartGame = () => {
    if (userHasCompleted) {
      toast.error("You've already completed this game!");
      return;
    }
    setFoundWords(new Set());
    setStartTime(Date.now());
    setIsGameActive(true);
    setElapsedTime(0);
    setHintsUsed(0);
    setShowCelebration(false);
  };

  const handleHint = () => {
    if (!selectedGame || hintsUsed >= 3) return;
    
    const remainingWords = selectedGame.words.filter(
      (w: string) => !foundWords.has(w.toUpperCase())
    );
    
    if (remainingWords.length > 0) {
      const randomWord = remainingWords[Math.floor(Math.random() * remainingWords.length)];
      toast.info(`🔍 Hint: Look for "${randomWord}"`, {
        duration: 5000,
      });
      setHintsUsed(prev => prev + 1);
    }
  };

  const handleWordFound = (word: string) => {
    setFoundWords((prev) => new Set([...prev, word]));
    toast.success(`🎯 Found: ${word}!`, {
      icon: '✨',
    });

    // Check if all words are found
    const allWords = new Set(selectedGame.words.map((w: string) => w.toUpperCase()));
    const newFoundWords = new Set([...foundWords, word]);
    
    if (newFoundWords.size === allWords.size) {
      handleGameComplete();
    }
  };

  const handleGameComplete = async () => {
    if (!startTime || !currentUser || !selectedGame) return;

    setIsGameActive(false);
    const timeSeconds = Math.floor((Date.now() - startTime) / 1000);
    
    // Calculate points: base 1000 points minus time penalty (5 points per second) and hint penalty (50 points per hint)
    let points = Math.max(100, 1000 - (timeSeconds * 5) - (hintsUsed * 50));
    
    // Bonus for speed (under 30 seconds gets bonus)
    if (timeSeconds < 30) {
      points += 200;
    }

    const finalPoints = Math.round(points);

    setGameScore({ points: finalPoints, time: timeSeconds });
    setShowCelebration(true);

    try {
      await submitScore.mutateAsync({
        game_id: selectedGame.id,
        user_id: currentUser.id,
        time_seconds: timeSeconds,
        points: finalPoints,
        completed_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Failed to submit score:", error);
      toast.error("Failed to save your score. Please try again.");
    }
  };

  if (!context?.currentEventId) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Please join an event to access games.</p>
      </div>
    );
  }

  const activeGames = games.filter((g) => g.is_active);

  const adaptedScores = scores.map((s) => ({
    id: s.user_id,
    user_id: s.user_id,
    points: s.points,
    time_seconds: s.time_seconds,
    completed_at: s.completed_at,
    name: s.name,
    photo_url: s.photo_url,
    profiles: { name: s.name, photo_url: s.photo_url }
  }));

  const activeQuizzes = quizGames.filter((q) => q.is_active);
  const quizAdaptedScores = quizLeaderboardScores.map((s: any) => ({
    id: s.user_id,
    user_id: s.user_id,
    points: s.total_score,
    time_seconds: s.total_time,
    completed_at: '',
    name: s.name,
    photo_url: s.photo_url,
    profiles: { name: s.name, photo_url: s.photo_url },
  }));
  const userHasCompletedQuiz = selectedQuiz && quizScores.some(s => s.user_id === currentUser?.id);

  const handleQuizComplete = async (score: number, correctAnswers: number, totalTime: number) => {
    if (!selectedQuiz || !currentUser) return;

    setQuizResults({ score, correct: correctAnswers, time: totalTime });
    setIsPlayingQuiz(false);
    setShowQuizResults(true);

    await submitQuizScore.mutateAsync({
      quiz_game_id: selectedQuiz.id,
      user_id: currentUser.id,
      total_score: score,
      correct_answers: correctAnswers,
      total_time: totalTime,
    });
  };

  const handleStartQuiz = () => {
    if (userHasCompletedQuiz) {
      toast.error("You've already completed this quiz!");
      return;
    }
    // Self-paced mode: start immediately without session
    if (selectedQuiz?.play_mode === 'self_paced') {
      setIsPlayingQuiz(true);
      return;
    }
    // Admin-directed mode: require session
    if (!quizSession) {
      toast.error("Quiz hasn't started yet. Please wait for the host.");
      return;
    }
    setIsPlayingQuiz(true);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Playful Header */}
      <div className="relative overflow-hidden rounded-2xl bg-cyan-400 border-4 border-blue-500 p-4 sm:p-6">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ y: [0, -10, 0], rotate: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute top-2 left-4 w-8 h-8 bg-yellow-400 rounded-full"
          />
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
            className="absolute top-4 right-8 w-6 h-6 bg-pink-500 rounded-full"
          />
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, delay: 0.5 }}
            className="absolute bottom-2 left-20 w-5 h-5 bg-green-500 rounded-full"
          />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            className="absolute top-3 left-1/2"
          >
            <Star className="w-6 h-6 text-orange-500 fill-orange-500" />
          </motion.div>
        </div>
        
        <div className="relative flex items-center gap-4">
          <motion.div
            animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-14 h-14 bg-red-500 rounded-xl border-4 border-red-700 flex items-center justify-center shadow-lg"
          >
            <Gamepad2 className="w-8 h-8 text-white" />
          </motion.div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-blue-800 drop-shadow-sm">
              🎮 Game Zone!
            </h1>
            <p className="text-blue-700 font-bold text-sm sm:text-base">
              Play games & win awesome prizes! ⭐
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="word-search" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-yellow-400 border-4 border-orange-500 p-1 rounded-xl h-auto">
          <TabsTrigger 
            value="word-search"
            className="data-[state=active]:bg-green-500 data-[state=active]:text-white data-[state=active]:border-green-700 data-[state=active]:border-2 rounded-lg font-bold text-orange-700 py-3"
          >
            <Gamepad2 className="w-5 h-5 mr-2" />
            🔍 Word Search
          </TabsTrigger>
          <TabsTrigger 
            value="quiz"
            className="data-[state=active]:bg-purple-500 data-[state=active]:text-white data-[state=active]:border-purple-700 data-[state=active]:border-2 rounded-lg font-bold text-orange-700 py-3"
          >
            <Brain className="w-5 h-5 mr-2" />
            🧠 Quiz Time
          </TabsTrigger>
        </TabsList>

        <TabsContent value="word-search" className="space-y-4 mt-6">
          {gamesLoading ? (
            <div className="text-center py-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="inline-block"
              >
                <Sparkles className="w-12 h-12 text-yellow-500" />
              </motion.div>
              <p className="font-bold text-lg mt-4">Loading games...</p>
            </div>
          ) : activeGames.length === 0 ? (
            <Card className="border-4 border-pink-400 bg-pink-100">
              <CardContent className="py-8 text-center">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Gamepad2 className="w-16 h-16 text-pink-500 mx-auto mb-4" />
                </motion.div>
                <p className="font-bold text-pink-700 text-lg">
                  No games right now! 🎮
                </p>
                <p className="text-pink-600">Check back soon for fun games!</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid lg:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-4">
                  {/* Game Card */}
                  <Card className="relative overflow-hidden border-4 border-green-500 bg-green-100">
                    {/* Decorative elements */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                      <motion.div
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="absolute top-4 right-4 w-4 h-4 bg-yellow-400 rounded-full"
                      />
                      <motion.div
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 1.8, repeat: Infinity, delay: 0.3 }}
                        className="absolute top-6 right-12 w-3 h-3 bg-pink-500 rounded-full"
                      />
                    </div>
                    
                    <CardHeader className="relative">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2 text-green-800">
                            <motion.div
                              animate={{ rotate: [0, 10, -10, 0] }}
                              transition={{ duration: 1, repeat: Infinity }}
                            >
                              <Sparkles className="w-6 h-6 text-yellow-500" />
                            </motion.div>
                            <span className="font-black text-lg sm:text-xl">
                              {selectedGame?.title || '🔍 Word Search'}
                            </span>
                          </CardTitle>
                          {selectedGame && (
                            <div className="flex gap-2 mt-2">
                              <span className="text-xs px-3 py-1 bg-blue-500 text-white rounded-full font-bold border-2 border-blue-700">
                                {selectedGame.difficulty || 'medium'}
                              </span>
                              {selectedGame.theme && selectedGame.theme !== 'general' && (
                                <span className="text-xs px-3 py-1 bg-purple-500 text-white rounded-full font-bold border-2 border-purple-700 capitalize">
                                  {selectedGame.theme}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        {isGameActive && (
                          <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ repeat: Infinity, duration: 0.8 }}
                            className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-xl font-black text-xl border-4 border-red-700"
                          >
                            <Clock className="w-5 h-5" />
                            <span className="font-mono">{elapsedTime}s</span>
                          </motion.div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4 relative">
                      {!isGameActive && !userHasCompleted && (
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button 
                            onClick={handleStartGame} 
                            className="w-full h-14 text-lg font-black bg-orange-500 hover:bg-orange-600 border-4 border-orange-700 text-white shadow-lg"
                          >
                            🎮 Start Game!
                          </Button>
                        </motion.div>
                      )}

                      {!isGameActive && userHasCompleted && (
                        <div className="w-full h-14 flex items-center justify-center bg-green-500 rounded-xl text-white font-black text-lg border-4 border-green-700">
                          ✅ Game Completed!
                        </div>
                      )}

                      {isGameActive && selectedGame?.hints_enabled && hintsUsed < 3 && (
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            onClick={handleHint}
                            variant="outline"
                            className="w-full bg-yellow-400 hover:bg-yellow-500 border-4 border-yellow-600 text-yellow-800 font-bold"
                            disabled={hintsUsed >= 3}
                          >
                            <Lightbulb className="w-5 h-5 mr-2" />
                            💡 Get Hint ({3 - hintsUsed} left)
                          </Button>
                        </motion.div>
                      )}

                      {selectedGame && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex flex-col items-center"
                        >
                          <WordSearchGrid
                            grid={selectedGame.grid_data.grid}
                            words={selectedGame.words}
                            onWordFound={handleWordFound}
                            foundWords={foundWords}
                            isGameActive={isGameActive}
                          />
                        </motion.div>
                      )}

                      {/* Words to Find Section */}
                      <div className="space-y-3 bg-blue-100 p-4 rounded-xl border-4 border-blue-400">
                        <div className="flex items-center justify-between">
                          <h3 className="font-black text-blue-800 flex items-center gap-2 text-lg">
                            <Trophy className="w-6 h-6 text-yellow-500" />
                            🎯 Find These Words!
                          </h3>
                          <div className="bg-purple-500 text-white px-4 py-2 rounded-xl font-black text-xl border-4 border-purple-700">
                            {foundWords.size}/{selectedGame?.words.length || 0}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <AnimatePresence>
                            {selectedGame?.words.map((word: string) => {
                              const isFound = foundWords.has(word.toUpperCase());
                              return (
                                <motion.div
                                  key={word}
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ 
                                    opacity: 1, 
                                    scale: 1,
                                  }}
                                  transition={{ duration: 0.3 }}
                                  className={`px-3 py-2 rounded-xl text-sm font-bold text-center border-3 ${
                                    isFound
                                      ? 'bg-green-500 text-white line-through border-4 border-green-700 shadow-lg'
                                      : 'bg-white border-4 border-gray-300 text-gray-700'
                                  }`}
                                >
                                  {isFound && '✅ '}{word}
                                </motion.div>
                              );
                            })}
                          </AnimatePresence>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  {scoresLoading ? (
                    <p className="text-center font-bold">Loading leaderboard...</p>
                  ) : (
                    <WordSearchLeaderboard scores={adaptedScores as any} />
                  )}
                </div>
              </div>

              <GameCelebration
                show={showCelebration}
                points={gameScore.points}
                timeSeconds={gameScore.time}
                onClose={() => setShowCelebration(false)}
              />
            </>
          )}
        </TabsContent>

        <TabsContent value="quiz" className="space-y-4 mt-6">
          {quizGamesLoading ? (
            <div className="text-center py-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="inline-block"
              >
                <Brain className="w-12 h-12 text-purple-500" />
              </motion.div>
              <p className="font-bold text-lg mt-4">Loading quizzes...</p>
            </div>
          ) : activeQuizzes.length === 0 ? (
            <Card className="border-4 border-purple-400 bg-purple-100">
              <CardContent className="py-8 text-center">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Brain className="w-16 h-16 text-purple-500 mx-auto mb-4" />
                </motion.div>
                <p className="font-bold text-purple-700 text-lg">
                  No quizzes right now! 🧠
                </p>
                <p className="text-purple-600">Check back soon for brain games!</p>
              </CardContent>
            </Card>
          ) : isPlayingQuiz ? (
            <QuizPlayer
              questions={quizQuestions}
              onComplete={handleQuizComplete}
              currentQuestionIndex={selectedQuiz?.play_mode === 'self_paced' ? 0 : (quizSession?.current_question_index ?? 0)}
              isLiveMode={selectedQuiz?.play_mode !== 'self_paced'}
              quizGameId={selectedQuiz.id}
            />
          ) : (
            <div className="grid lg:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-4">
                {!selectedQuiz ? (
                  <div className="grid gap-4">
                    {activeQuizzes.map((quiz) => (
                      <motion.div
                        key={quiz.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Card
                          className="cursor-pointer border-4 border-purple-500 bg-purple-100 hover:bg-purple-200 transition-colors"
                          onClick={() => setSelectedQuiz(quiz)}
                        >
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-purple-800">
                              <motion.div
                                animate={{ rotate: [0, 10, -10, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                              >
                                <Brain className="w-6 h-6 text-purple-600" />
                              </motion.div>
                              <span className="font-black">{quiz.title}</span>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            {quiz.description && (
                              <p className="text-sm text-purple-700 font-medium mb-4">
                                {quiz.description}
                              </p>
                            )}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold border-2 border-blue-700">
                                  {quiz.total_questions} Questions
                                </span>
                                <span className={`text-xs px-3 py-1 rounded-full font-bold border-2 ${
                                  quiz.play_mode === 'self_paced'
                                    ? 'bg-cyan-500 text-white border-cyan-700'
                                    : 'bg-pink-500 text-white border-pink-700'
                                }`}>
                                  {quiz.play_mode === 'self_paced' ? '🎯 Self-Paced' : '🔴 Live'}
                                </span>
                              </div>
                              <Button 
                                size="sm"
                                className="bg-green-500 hover:bg-green-600 border-2 border-green-700 font-bold"
                              >
                                {quiz.play_mode === 'self_paced' ? '🎮 Play!' : '🚀 Join!'}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <Card className="border-4 border-purple-500 bg-purple-100">
                    <CardHeader>
                      <CardTitle className="text-purple-800 font-black flex items-center gap-2">
                        <Brain className="w-6 h-6" />
                        {selectedQuiz.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {selectedQuiz.description && (
                        <p className="text-purple-700 font-medium">{selectedQuiz.description}</p>
                      )}
                      <div className="bg-white p-4 rounded-xl border-4 border-purple-300">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-purple-700 font-bold">Total Questions:</span>
                          <span className="bg-blue-500 text-white px-3 py-1 rounded-full font-black border-2 border-blue-700">
                            {quizQuestions.length}
                          </span>
                        </div>
                      </div>

                      {userHasCompletedQuiz ? (
                        <div className="p-4 bg-green-500 rounded-xl text-center text-white font-black text-lg border-4 border-green-700">
                          ✅ Quiz Completed!
                        </div>
                      ) : selectedQuiz.play_mode === 'self_paced' ? (
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            onClick={handleStartQuiz}
                            className="w-full h-14 bg-orange-500 hover:bg-orange-600 border-4 border-orange-700 font-black text-lg"
                            size="lg"
                            disabled={quizScoresLoading || !!userHasCompletedQuiz}
                          >
                            🧠 Start Quiz!
                          </Button>
                        </motion.div>
                      ) : !quizSession ? (
                        <div className="p-4 bg-yellow-400 rounded-xl text-center font-bold text-yellow-800 border-4 border-yellow-600">
                          ⏳ Waiting for quiz to start...
                        </div>
                      ) : (
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            onClick={handleStartQuiz}
                            className="w-full h-14 bg-green-500 hover:bg-green-600 border-4 border-green-700 font-black text-lg"
                            size="lg"
                            disabled={quizScoresLoading || !!userHasCompletedQuiz}
                          >
                            🚀 Join Quiz!
                          </Button>
                        </motion.div>
                      )}

                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          variant="outline"
                          onClick={() => setSelectedQuiz(null)}
                          className="w-full bg-gray-200 hover:bg-gray-300 border-4 border-gray-400 font-bold text-gray-700"
                        >
                          ← Back to Quiz List
                        </Button>
                      </motion.div>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div>
                {quizLeaderboardLoading ? (
                  <p className="text-center font-bold">Loading leaderboard...</p>
                ) : (
                  <WordSearchLeaderboard scores={quizAdaptedScores as any} />
                )}
              </div>
            </div>
          )}

          {showQuizResults && (
            <QuizResults
              score={quizResults.score}
              correctAnswers={quizResults.correct}
              totalQuestions={quizQuestions.length}
              totalTime={quizResults.time}
              onClose={() => {
                setShowQuizResults(false);
                setSelectedQuiz(null);
              }}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AttendeeGames;
