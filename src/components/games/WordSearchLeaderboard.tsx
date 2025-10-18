import { Medal, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

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

interface WordSearchLeaderboardProps {
  scores: LeaderboardEntry[];
}

const MEDAL_COLORS = {
  1: 'text-yellow-500',
  2: 'text-gray-400',
  3: 'text-amber-600',
};

export const WordSearchLeaderboard = ({ scores }: WordSearchLeaderboardProps) => {
  const [highlightedIds, setHighlightedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const newIds = new Set(scores.slice(0, 3).map(s => s.id));
    setHighlightedIds(newIds);

    // Clear highlights after animation
    const timer = setTimeout(() => {
      setHighlightedIds(new Set());
    }, 2000);

    return () => clearTimeout(timer);
  }, [scores]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {scores.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No scores yet. Be the first to play!
            </p>
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
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ 
                      opacity: 1, 
                      x: 0,
                      scale: isHighlighted ? [1, 1.03, 1] : 1
                    }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ 
                      layout: { duration: 0.3 },
                      scale: { duration: 0.5, repeat: isHighlighted ? 2 : 0 }
                    }}
                    className={cn(
                      'flex items-center gap-4 p-4 rounded-lg border transition-all duration-300',
                      rank === 1 && 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-300 dark:border-yellow-800',
                      rank === 2 && 'bg-gray-50 dark:bg-gray-950/20 border-gray-300 dark:border-gray-800',
                      rank === 3 && 'bg-amber-50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800',
                      isHighlighted && 'ring-2 ring-primary ring-offset-2'
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-[3rem]">
                      <motion.span 
                        className="text-lg font-bold text-muted-foreground"
                        animate={isHighlighted ? { scale: [1, 1.2, 1] } : {}}
                        transition={{ duration: 0.3 }}
                      >
                        #{rank}
                      </motion.span>
                      {showMedal && (
                        <motion.div
                          initial={{ rotate: -20, scale: 0 }}
                          animate={{ rotate: 0, scale: 1 }}
                          transition={{ type: "spring", stiffness: 200 }}
                        >
                          <Medal
                            className={cn('w-5 h-5', MEDAL_COLORS[rank as keyof typeof MEDAL_COLORS])}
                          />
                        </motion.div>
                      )}
                    </div>

                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Avatar className="w-10 h-10 border-2 border-primary/20">
                        <AvatarImage src={entry.profiles?.photo_url} />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {entry.profiles?.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </motion.div>

                    <div className="flex-1">
                      <p className="font-semibold">{entry.profiles?.name || 'Unknown'}</p>
                      <p className="text-sm text-muted-foreground">
                        ⚡ {entry.time_seconds}s
                      </p>
                    </div>

                    <div className="text-right">
                      <motion.p 
                        className="text-2xl font-bold text-primary"
                        animate={isHighlighted ? { scale: [1, 1.1, 1] } : {}}
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
  );
};
