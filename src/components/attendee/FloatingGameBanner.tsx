import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Gamepad2, Brain, X, ChevronRight, Sparkles, Star } from 'lucide-react';
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
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.4, ease: 'easeOut', type: 'spring', bounce: 0.4 }}
        className="relative w-full mb-4"
      >
        <div className="relative overflow-hidden rounded-2xl bg-yellow-400 shadow-xl border-4 border-orange-500">
          {/* Colorful decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Bouncing circles */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-2 left-4 w-6 h-6 bg-pink-500 rounded-full"
            />
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
              className="absolute top-3 left-14 w-4 h-4 bg-blue-500 rounded-full"
            />
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
              className="absolute bottom-2 right-20 w-5 h-5 bg-green-500 rounded-full"
            />
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
              className="absolute top-1 right-32 w-3 h-3 bg-purple-500 rounded-full"
            />
            
            {/* Rotating stars */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              className="absolute top-2 right-48"
            >
              <Star className="w-4 h-4 text-red-500 fill-red-500" />
            </motion.div>
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
              className="absolute bottom-3 left-28"
            >
              <Star className="w-3 h-3 text-cyan-500 fill-cyan-500" />
            </motion.div>
          </div>

          <div className="relative flex items-center justify-between gap-3 p-4">
            {/* Left side - Icon and content */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <motion.div
                animate={{ 
                  rotate: [0, -15, 15, -15, 0],
                  scale: [1, 1.15, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatDelay: 1,
                }}
                className="flex-shrink-0 w-12 h-12 rounded-xl bg-red-500 border-3 border-red-700 flex items-center justify-center shadow-lg"
              >
                {primaryGameType === 'quiz' ? (
                  <Brain className="w-6 h-6 text-white" />
                ) : (
                  <Gamepad2 className="w-6 h-6 text-white" />
                )}
              </motion.div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  >
                    <Sparkles className="w-5 h-5 text-orange-600 flex-shrink-0" />
                  </motion.div>
                  <h3 className="font-black text-red-700 text-base sm:text-lg truncate drop-shadow-sm">
                    {totalActiveGames === 1
                      ? primaryGame?.title || '🎮 Game Time!'
                      : `🎮 ${totalActiveGames} Games Ready!`}
                  </h3>
                </div>
                <p className="text-orange-700 text-xs sm:text-sm font-bold truncate">
                  {primaryGameType === 'quiz'
                    ? '🧠 Test your brain power!'
                    : '🔍 Find hidden words & win!'}
                </p>
              </div>
            </div>

            {/* Right side - Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={handlePlayNow}
                  size="sm"
                  className="bg-green-500 hover:bg-green-600 text-white font-black shadow-lg border-2 border-green-700 text-sm px-4"
                >
                  <span className="hidden sm:inline">🎯 Play Now!</span>
                  <span className="sm:hidden">Play!</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </motion.div>
              
              <button
                onClick={handleDismiss}
                className="p-1.5 rounded-full bg-orange-500 hover:bg-orange-600 transition-colors border-2 border-orange-700"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
