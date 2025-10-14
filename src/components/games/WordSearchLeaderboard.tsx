import { Medal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

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
  return (
    <Card>
      <CardHeader>
        <CardTitle>Leaderboard</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {scores.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No scores yet. Be the first to play!
            </p>
          ) : (
            scores.map((entry, index) => {
              const rank = index + 1;
              const showMedal = rank <= 3;

              return (
                <div
                  key={entry.id}
                  className={cn(
                    'flex items-center gap-4 p-4 rounded-lg border',
                    rank === 1 && 'bg-yellow-50 dark:bg-yellow-950/20',
                    rank === 2 && 'bg-gray-50 dark:bg-gray-950/20',
                    rank === 3 && 'bg-amber-50 dark:bg-amber-950/20'
                  )}
                >
                  <div className="flex items-center gap-2 min-w-[3rem]">
                    <span className="text-lg font-bold text-muted-foreground">
                      #{rank}
                    </span>
                    {showMedal && (
                      <Medal
                        className={cn('w-5 h-5', MEDAL_COLORS[rank as keyof typeof MEDAL_COLORS])}
                      />
                    )}
                  </div>

                  <Avatar className="w-10 h-10">
                    <AvatarImage src={entry.profiles?.photo_url} />
                    <AvatarFallback>
                      {entry.profiles?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <p className="font-semibold">{entry.profiles?.name || 'Unknown'}</p>
                    <p className="text-sm text-muted-foreground">
                      Completed in {entry.time_seconds}s
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">{entry.points}</p>
                    <p className="text-xs text-muted-foreground">points</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};
