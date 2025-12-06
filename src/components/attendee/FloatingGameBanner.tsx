import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Gamepad2, Brain, X, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWordSearchGames } from '@/hooks/useWordSearchGames';
import { useQuizGames } from '@/hooks/useQuizGames';

interface FloatingGameBannerProps {
  eventId: string | null;
}

export const FloatingGameBanner = ({ eventId }: FloatingGameBannerProps) => {
  const navigate = useNavigate();
  const { games: wordSearchGames, isLoading: wsLoading } = useWordSearchGames(eventId);
  const { quizGames, isLoading: quizLoading } = useQuizGames(eventId);
  const [isDismissed, setIsDismissed] = React.useState(false);

  // Check if banner was dismissed in this session
  React.useEffect(() => {
    const dismissed = sessionStorage.getItem(`game_banner_dismissed_${eventId}`);
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, [eventId]);

  const activeWordSearchGames = wordSearchGames.filter(g => g.is_active);
  const activeQuizGames = quizGames.filter(q => q.is_active);
  
  const hasActiveGames = activeWordSearchGames.length > 0 || activeQuizGames.length > 0;
  const totalActiveGames = activeWordSearchGames.length + activeQuizGames.length;

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem(`game_banner_dismissed_${eventId}`, 'true');
  };

  const handlePlayNow = () => {
    navigate('/attendee/games');
  };

  // Determine primary game type to show
  const primaryGameType = activeQuizGames.length > 0 ? 'quiz' : 'wordsearch';
  const primaryGame = primaryGameType === 'quiz' ? activeQuizGames[0] : activeWordSearchGames[0];

  if (wsLoading || quizLoading || !hasActiveGames || isDismissed) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="relative w-full mb-4"
      >
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary via-primary/90 to-secondary shadow-lg">
          {/* Animated background particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              animate={{
                x: [0, 100, 0],
                y: [0, -50, 0],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: 'linear',
              }}
              className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"
            />
            <motion.div
              animate={{
                x: [0, -80, 0],
                y: [0, 60, 0],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: 'linear',
              }}
              className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"
            />
          </div>

          <div className="relative flex items-center justify-between gap-3 p-4">
            {/* Left side - Icon and content */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <motion.div
                animate={{ 
                  rotate: [0, -10, 10, -10, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3,
                }}
                className="flex-shrink-0 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"
              >
                {primaryGameType === 'quiz' ? (
                  <Brain className="w-5 h-5 text-white" />
                ) : (
                  <Gamepad2 className="w-5 h-5 text-white" />
                )}
              </motion.div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-yellow-300 flex-shrink-0" />
                  <h3 className="font-bold text-white text-sm sm:text-base truncate">
                    {totalActiveGames === 1
                      ? primaryGame?.title || 'Game Available!'
                      : `${totalActiveGames} Games Available!`}
                  </h3>
                </div>
                <p className="text-white/80 text-xs sm:text-sm truncate">
                  {primaryGameType === 'quiz'
                    ? 'Test your knowledge now'
                    : 'Find hidden words & win points'}
                </p>
              </div>
            </div>

            {/* Right side - Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                onClick={handlePlayNow}
                size="sm"
                className="bg-white text-primary hover:bg-white/90 font-semibold shadow-md"
              >
                <span className="hidden sm:inline">Play Now</span>
                <span className="sm:hidden">Play</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
              
              <button
                onClick={handleDismiss}
                className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4 text-white/80" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
