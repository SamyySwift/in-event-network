import { Medal, TrendingUp, Star, Trophy, Crown } from 'lucide-react';
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

const RANK_STYLES = {
  1: { bg: 'bg-yellow-400', border: 'border-yellow-600', text: 'text-yellow-800', icon: '🥇' },
  2: { bg: 'bg-gray-300', border: 'border-gray-500', text: 'text-gray-700', icon: '🥈' },
  3: { bg: 'bg-orange-400', border: 'border-orange-600', text: 'text-orange-800', icon: '🥉' },
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
    <Card className="border-4 border-yellow-500 bg-yellow-100 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute top-4 right-6 w-4 h-4 bg-pink-500 rounded-full"
        />
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, delay: 0.3 }}
          className="absolute top-8 right-14 w-3 h-3 bg-green-500 rounded-full"
        />
      </div>
      
      <CardHeader className="relative bg-orange-400 border-b-4 border-orange-600">
        <CardTitle className="flex items-center gap-2 text-orange-900">
          <motion.div
            animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Trophy className="w-7 h-7 text-yellow-300" />
          </motion.div>
          <span className="font-black text-xl">🏆 Leaderboard</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 relative">
        <div className="space-y-3">
          {scores.length === 0 ? (
            <div className="text-center py-8">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Star className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              </motion.div>
              <p className="font-bold text-yellow-700 text-lg">
                No scores yet! 🎮
              </p>
              <p className="text-yellow-600">Be the first to play!</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {scores.map((entry, index) => {
                const rank = index + 1;
                const isTopThree = rank <= 3;
                const rankStyle = RANK_STYLES[rank as keyof typeof RANK_STYLES];
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
                      'flex items-center gap-3 p-3 rounded-xl border-4 transition-all duration-300',
                      isTopThree && rankStyle
                        ? `${rankStyle.bg} ${rankStyle.border}`
                        : 'bg-white border-gray-300',
                      isHighlighted && 'ring-4 ring-blue-500 ring-offset-2'
                    )}
                  >
                    {/* Rank */}
                    <div className="flex items-center justify-center min-w-[3rem]">
                      {isTopThree && rankStyle ? (
                        <motion.span 
                          className="text-2xl"
                          animate={isHighlighted ? { scale: [1, 1.3, 1] } : {}}
                          transition={{ duration: 0.3 }}
                        >
                          {rankStyle.icon}
                        </motion.span>
                      ) : (
                        <span className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-black border-2 border-blue-700">
                          {rank}
                        </span>
                      )}
                    </div>

                    {/* Avatar */}
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Avatar className="w-10 h-10 border-3 border-purple-500">
                        <AvatarImage src={entry.profiles?.photo_url} />
                        <AvatarFallback className="bg-purple-400 text-white font-bold">
                          {entry.profiles?.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </motion.div>

                    {/* Name & Time */}
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "font-bold truncate",
                        isTopThree && rankStyle ? rankStyle.text : 'text-gray-800'
                      )}>
                        {entry.profiles?.name || 'Unknown'}
                      </p>
                      <p className="text-sm font-medium text-gray-600">
                        ⚡ {entry.time_seconds}s
                      </p>
                    </div>

                    {/* Points */}
                    <div className="text-right">
                      <motion.div 
                        className="bg-green-500 text-white px-3 py-1 rounded-lg font-black text-lg border-2 border-green-700"
                        animate={isHighlighted ? { scale: [1, 1.1, 1] } : {}}
                      >
                        {entry.points}
                      </motion.div>
                      <p className="text-xs font-bold text-gray-600 mt-1">points</p>
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
