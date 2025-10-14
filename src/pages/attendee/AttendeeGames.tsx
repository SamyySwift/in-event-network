import { useState, useEffect } from 'react';
import AppLayout from '@/components/layouts/AppLayout';
import { useAttendeeContext } from '@/hooks/useAttendeeContext';
import { useWordSearchGames, useWordSearchScores } from '@/hooks/useWordSearchGames';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WordSearchGrid } from '@/components/games/WordSearchGrid';
import { WordSearchLeaderboard } from '@/components/games/WordSearchLeaderboard';
import { Gamepad2, Trophy, Clock } from 'lucide-react';
import { toast } from 'sonner';

const AttendeeGames = () => {
  const { context } = useAttendeeContext();
  const { currentUser } = useAuth();
  const { games, isLoading: gamesLoading } = useWordSearchGames(context?.currentEventId || null);
  
  const [selectedGame, setSelectedGame] = useState<any>(null);
  const [foundWords, setFoundWords] = useState<Set<string>>(new Set());
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isGameActive, setIsGameActive] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

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
  };

  const handleWordFound = (word: string) => {
    setFoundWords((prev) => new Set([...prev, word]));
    toast.success(`Found: ${word}`);

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
    
    // Calculate points: base 1000 points minus time penalty (10 points per second)
    const points = Math.max(100, 1000 - (timeSeconds * 10));

    await submitScore.mutateAsync({
      game_id: selectedGame.id,
      user_id: currentUser.id,
      time_seconds: timeSeconds,
      points: Math.round(points),
    });

    toast.success(`Game completed in ${timeSeconds} seconds! You earned ${Math.round(points)} points!`);
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
        <div className="flex items-center gap-3">
          <Gamepad2 className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Games</h1>
            <p className="text-muted-foreground">Play word search and compete on the leaderboard</p>
          </div>
        </div>

        {gamesLoading ? (
          <p>Loading games...</p>
        ) : activeGames.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No active games at the moment. Check back later!
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{selectedGame?.title || 'Word Search'}</CardTitle>
                    {isGameActive && (
                      <div className="flex items-center gap-2 text-primary">
                        <Clock className="w-4 h-4" />
                        <span className="font-mono text-lg">{elapsedTime}s</span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!isGameActive && (
                    <Button onClick={handleStartGame} className="w-full">
                      {foundWords.size > 0 ? 'Restart Game' : 'Start Game'}
                    </Button>
                  )}

                  {selectedGame && (
                    <div className="flex flex-col items-center">
                      <WordSearchGrid
                        grid={selectedGame.grid_data.grid}
                        words={selectedGame.words}
                        onWordFound={handleWordFound}
                        foundWords={foundWords}
                        isGameActive={isGameActive}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Trophy className="w-4 h-4" />
                      Words to Find ({foundWords.size}/{selectedGame?.words.length || 0})
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedGame?.words.map((word: string) => (
                        <div
                          key={word}
                          className={`px-3 py-2 rounded text-sm ${
                            foundWords.has(word.toUpperCase())
                              ? 'bg-primary text-primary-foreground line-through'
                              : 'bg-muted'
                          }`}
                        >
                          {word}
                        </div>
                      ))}
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
        )}
      </div>
    </AppLayout>
  );
};

export default AttendeeGames;
