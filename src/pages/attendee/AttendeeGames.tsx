import { useState, useEffect } from 'react';
import AppLayout from '@/components/layouts/AppLayout';
import { useAttendeeContext } from '@/hooks/useAttendeeContext';
import { useWordSearchGames, useWordSearchScores } from '@/hooks/useWordSearchGames';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WordSearchGrid } from '@/components/games/WordSearchGrid';
import { WordSearchLeaderboard } from '@/components/games/WordSearchLeaderboard';
import { GameCelebration } from '@/components/games/GameCelebration';
import { Gamepad2, Trophy, Clock, Sparkles, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const AttendeeGames = () => {
  const { context } = useAttendeeContext();
  const { currentUser } = useAuth();
  const { games, isLoading: gamesLoading } = useWordSearchGames(context?.currentEventId || null);
  
  const [selectedGame, setSelectedGame] = useState<any>(null);
  const [foundWords, setFoundWords] = useState<Set<string>>(new Set());
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isGameActive, setIsGameActive] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [gameScore, setGameScore] = useState({ points: 0, time: 0 });
  const [hintsUsed, setHintsUsed] = useState(0);

  const { scores, isLoading: scoresLoading, submitScore } = useWordSearchScores(
    selectedGame?.id || null
  );

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

    await submitScore.mutateAsync({
      game_id: selectedGame.id,
      user_id: currentUser.id,
      time_seconds: timeSeconds,
      points: finalPoints,
    });
  };

  if (!context?.currentEventId) {
    return (
      <AppLayout>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Please join an event to access games.</p>
        </div>
      </AppLayout>
    );
  }

  const activeGames = games.filter((g) => g.is_active);

  return (
    <AppLayout>
      <div className="space-y-6 p-6">
        {gamesLoading ? (
          <p>Loading games...</p>
        ) : activeGames.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No active games at the moment. Check back later!
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid lg:grid-cols-2 gap-6">
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
                    {!isGameActive && (
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button onClick={handleStartGame} className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-primary to-secondary">
                          {foundWords.size > 0 ? '🔄 Play Again' : '▶️ Start Game'}
                        </Button>
                      </motion.div>
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
                  <WordSearchLeaderboard scores={scores} />
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
      </div>
    </AppLayout>
  );
};

export default AttendeeGames;
