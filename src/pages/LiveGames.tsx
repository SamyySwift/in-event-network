import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Medal, Trophy, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface LeaderboardEntry {
  id: string;
  user_id: string;
  points: number;
  time_seconds: number;
  profiles: {
    name: string;
    photo_url?: string;
  };
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
  const [scores, setScores] = useState<LeaderboardEntry[]>([]);
  const [activeGame, setActiveGame] = useState<Game | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [highlightedIds, setHighlightedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!eventId) return;

    const fetchActiveGame = async () => {
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

      setActiveGame(data);
      if (data) {
        fetchScores(data.id);
      }
    };

    const fetchScores = async (gameId: string) => {
      const { data, error } = await supabase
        .from('word_search_scores')
        .select(`
          *,
          profiles:user_id (
            name,
            photo_url
          )
        `)
        .eq('game_id', gameId)
        .order('time_seconds', { ascending: true });

      if (error) {
        console.error('Error fetching scores:', error);
      } else {
        const newScores = data || [];
        setScores(newScores);
        
        // Highlight top 3 for animation
        const newHighlighted = new Set(newScores.slice(0, 3).map((s: LeaderboardEntry) => s.id));
        setHighlightedIds(newHighlighted);
        
        // Clear highlight after animation
        setTimeout(() => setHighlightedIds(new Set()), 2000);
      }
      setIsLoading(false);
    };

    fetchActiveGame();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('word-search-scores-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'word_search_scores',
        },
        () => {
          if (activeGame) {
            fetchScores(activeGame.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId, activeGame?.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center">
        <p className="text-muted-foreground text-lg">Loading leaderboard...</p>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Live Leaderboard
          </h1>
          <p className="text-xl text-muted-foreground">{activeGame.title}</p>
        </div>

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
                    const isHighlighted = highlightedIds.has(entry.id);

                    return (
                      <motion.div
                        key={entry.id}
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
                            <AvatarImage src={entry.profiles?.photo_url} />
                            <AvatarFallback className="text-lg font-semibold bg-primary/10 text-primary">
                              {entry.profiles?.name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                        </motion.div>

                        <div className="flex-1">
                          <p className="font-semibold text-lg">{entry.profiles?.name || 'Unknown'}</p>
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
