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
import { Gamepad2, Trophy, Clock, Sparkles, Lightbulb, Brain } from 'lucide-react';
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
      toast.info(`Hint: Look for "${randomWord}"`, {
        duration: 5000,
      });
      setHintsUsed(prev => prev + 1);
    }
  };

  const handleWordFound = (word: string) => {
    setFoundWords((prev) => new Set([...prev, word]));
    toast.success(`✨ Found: ${word}!`, {
      icon: '🎯',
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
      <Tabs defaultValue="word-search" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="word-search">
            <Gamepad2 className="w-4 h-4 mr-2" />
            Word Search
          </TabsTrigger>
          <TabsTrigger value="quiz">
            <Brain className="w-4 h-4 mr-2" />
            Quiz Games
          </TabsTrigger>
        </TabsList>

        <TabsContent value="word-search" className="space-y-4 mt-6">
      {gamesLoading ? (
        <p>Loading games...</p>
      ) : activeGames.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No active word search games at the moment. Check back later!
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid lg:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-4">
              <Card className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary" />
                        {selectedGame?.title || 'Word Search'}
                      </CardTitle>
                      {selectedGame && (
                        <div className="flex gap-2 mt-2">
                          <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                            {selectedGame.difficulty || 'medium'}
                          </span>
                          {selectedGame.theme && selectedGame.theme !== 'general' && (
                        <span className="text-xs px-2 py-1 bg-secondary/10 text-secondary-foreground rounded-full capitalize">
                          {selectedGame.theme}
                        </span>
                      )}
                        </div>
                      )}
                    </div>
                    {isGameActive && (
                      <motion.div
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                        className="flex items-center gap-2 text-primary font-bold text-xl"
                      >
                        <Clock className="w-5 h-5" />
                        <span className="font-mono">{elapsedTime}s</span>
                        {selectedGame?.time_limit && (
                          <span className="text-sm text-muted-foreground">
                            / {selectedGame.time_limit}s
                          </span>
                        )}
                      </motion.div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!isGameActive && !userHasCompleted && (
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button onClick={handleStartGame} className="w-full h-12 text-base md:text-lg font-semibold bg-gradient-to-r from-primary to-secondary">
                        ▶️ Start Game
                      </Button>
                    </motion.div>
                  )}

                  {!isGameActive && userHasCompleted && (
                    <div className="w-full h-12 flex items-center justify-center bg-muted rounded-lg text-muted-foreground font-medium">
                      ✓ Game Completed
                    </div>
                  )}

                  {isGameActive && selectedGame?.hints_enabled && hintsUsed < 3 && (
                    <Button
                      onClick={handleHint}
                      variant="outline"
                      className="w-full"
                      disabled={hintsUsed >= 3}
                    >
                      <Lightbulb className="w-4 h-4 mr-2" />
                      Get Hint ({3 - hintsUsed} remaining)
                    </Button>
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

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        Words to Find
                      </h3>
                      <div className="text-2xl font-bold text-primary">
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
                                backgroundColor: isFound ? 'rgb(34, 197, 94)' : undefined
                              }}
                              transition={{ duration: 0.3 }}
                              className={`px-3 py-2 rounded-lg text-sm font-medium text-center ${
                                isFound
                                  ? 'bg-green-500 text-white line-through shadow-md'
                                  : 'bg-muted hover:bg-muted/80'
                              }`}
                            >
                              {isFound && '✓ '}{word}
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
                <p>Loading leaderboard...</p>
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
            <p>Loading quiz games...</p>
          ) : activeQuizzes.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No active quiz games at the moment. Check back later!
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
                      <Card
                        key={quiz.id}
                        className="cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => setSelectedQuiz(quiz)}
                      >
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Brain className="w-5 h-5 text-primary" />
                            {quiz.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {quiz.description && (
                            <p className="text-sm text-muted-foreground mb-4">
                              {quiz.description}
                            </p>
                          )}
                          <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                              <span>{quiz.total_questions} Questions</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                quiz.play_mode === 'self_paced'
                                  ? 'bg-blue-500/20 text-blue-700 dark:text-blue-300'
                                  : 'bg-purple-500/20 text-purple-700 dark:text-purple-300'
                              }`}>
                                {quiz.play_mode === 'self_paced' ? 'Self-Paced' : 'Live'}
                              </span>
                            </div>
                            <Button size="sm">
                              {quiz.play_mode === 'self_paced' ? 'Play Now' : 'Join Quiz'}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>{selectedQuiz.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {selectedQuiz.description && (
                        <p className="text-muted-foreground">{selectedQuiz.description}</p>
                      )}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Total Questions:</span>
                          <span className="font-semibold">{quizQuestions.length}</span>
                        </div>
                      </div>

                      {userHasCompletedQuiz ? (
                        <div className="p-4 bg-muted rounded-lg text-center">
                          ✓ Quiz Completed
                        </div>
                      ) : selectedQuiz.play_mode === 'self_paced' ? (
                        <Button
                          onClick={handleStartQuiz}
                          className="w-full"
                          size="lg"
                          disabled={quizScoresLoading || !!userHasCompletedQuiz}
                        >
                          Start Quiz
                        </Button>
                      ) : !quizSession ? (
                        <div className="p-4 bg-muted rounded-lg text-center text-muted-foreground">
                          ⏳ Waiting for quiz to start...
                        </div>
                      ) : (
                        <Button
                          onClick={handleStartQuiz}
                          className="w-full"
                          size="lg"
                          disabled={quizScoresLoading || !!userHasCompletedQuiz}
                        >
                          Join Quiz
                        </Button>
                      )}

                      <Button
                        variant="outline"
                        onClick={() => setSelectedQuiz(null)}
                        className="w-full"
                      >
                        Back to Quiz List
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div>
                {quizLeaderboardLoading ? (
                  <p>Loading leaderboard...</p>
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
