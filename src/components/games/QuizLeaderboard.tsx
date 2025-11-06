import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Clock, Target } from 'lucide-react';
import { motion } from 'framer-motion';

interface QuizScore {
  user_id: string;
  total_score: number;
  correct_answers: number;
  total_time: number;
  profiles: {
    name: string | null;
    photo_url: string | null;
  };
}

interface QuizLeaderboardProps {
  scores: QuizScore[];
}

const MEDAL_COLORS = {
  1: 'from-yellow-500 to-amber-600',      // Gold
  2: 'from-slate-300 to-slate-500',        // Silver
  3: 'from-orange-600 to-amber-800',       // Bronze
};

export const QuizLeaderboard = ({ scores }: QuizLeaderboardProps) => {
  if (scores.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No scores yet. Be the first to complete the quiz!
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        {scores.map((score, index) => {
          const rank = index + 1;
          const isMedal = rank <= 3;

          return (
            <motion.div
              key={score.user_id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                isMedal
                  ? `bg-gradient-to-r ${MEDAL_COLORS[rank as 1 | 2 | 3]} text-white shadow-lg`
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                isMedal ? 'bg-white/20' : 'bg-primary/10 text-primary'
              }`}>
                {rank}
              </div>

              <Avatar className="w-10 h-10">
                <AvatarImage src={score.profiles?.photo_url || ''} />
                <AvatarFallback>
                  {(score.profiles?.name || 'U')[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">
                  {score.profiles?.name || 'Anonymous'}
                </p>
                <div className="flex items-center gap-3 text-sm opacity-90">
                  <span className="flex items-center gap-1">
                    <Target className="w-3 h-3" />
                    {score.correct_answers} correct
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {score.total_time}s
                  </span>
                </div>
              </div>

              <div className={`text-2xl font-bold ${
                isMedal ? '' : 'text-primary'
              }`}>
                {score.total_score}
              </div>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
};
