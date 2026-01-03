import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, X, ChevronRight, Sparkles, Star, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLiveStream } from '@/hooks/useLiveStream';
import { usePiP } from '@/contexts/PiPContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface FloatingLiveBannerProps {
  eventId: string | null;
}

export const FloatingLiveBanner = ({ eventId }: FloatingLiveBannerProps) => {
  const { isLive, liveStreamUrl, isLoading } = useLiveStream(eventId);
  const { isVisible: isPiPVisible, showPiP } = usePiP();
  const [isDismissed, setIsDismissed] = React.useState(false);

  // Check if banner was dismissed in this session
  React.useEffect(() => {
    const dismissed = sessionStorage.getItem(`live_banner_dismissed_${eventId}`);
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, [eventId]);

  // Reset dismiss state when stream goes live again
  React.useEffect(() => {
    if (isLive) {
      const dismissed = sessionStorage.getItem(`live_banner_dismissed_${eventId}`);
      if (dismissed === 'true') {
        // Check if this is a new live session
        const lastLiveTime = sessionStorage.getItem(`live_banner_last_live_${eventId}`);
        const now = Date.now().toString();
        if (!lastLiveTime || Date.now() - parseInt(lastLiveTime) > 60000) {
          // If more than 1 minute has passed, show banner again
          setIsDismissed(false);
          sessionStorage.removeItem(`live_banner_dismissed_${eventId}`);
        }
        sessionStorage.setItem(`live_banner_last_live_${eventId}`, now);
      }
    }
  }, [isLive, eventId]);

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem(`live_banner_dismissed_${eventId}`, 'true');
  };

  const handleWatchNow = () => {
    if (eventId) {
      showPiP(eventId);
      setIsDismissed(true);
    }
  };

  // Check if this is a Jitsi meeting (not YouTube) - Jitsi URLs don't contain 'youtube' or 'youtu.be'
  const isJitsiMeeting = liveStreamUrl && !liveStreamUrl.includes('youtube') && !liveStreamUrl.includes('youtu.be');

  // Don't show YouTube banner if Jitsi is live (FloatingBroadcastBanner handles Jitsi)
  if (isLoading || !isLive || isJitsiMeeting) {
    return null;
  }
  
  // Don't show banner if PiP is already visible
  if (isPiPVisible) {
    return null;
  }

  return (
    <>
      {!isDismissed && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.4, ease: 'easeOut', type: 'spring', bounce: 0.4 }}
            className="relative w-full mb-4"
          >
            <div className="relative overflow-hidden rounded-2xl bg-red-500 shadow-xl border-4 border-red-700">
              {/* Colorful decorative elements */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Bouncing circles */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute top-2 left-4 w-6 h-6 bg-yellow-400 rounded-full"
                />
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
                  className="absolute top-3 left-14 w-4 h-4 bg-cyan-400 rounded-full"
                />
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
                  className="absolute bottom-2 right-20 w-5 h-5 bg-pink-400 rounded-full"
                />
                <motion.div
                  animate={{ y: [0, -12, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
                  className="absolute top-1 right-32 w-3 h-3 bg-green-400 rounded-full"
                />
                
                {/* Rotating stars */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                  className="absolute top-2 right-48"
                >
                  <Star className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                </motion.div>
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
                  className="absolute bottom-3 left-28"
                >
                  <Star className="w-3 h-3 text-white fill-white" />
                </motion.div>
              </div>

              <div className="relative flex items-center justify-between gap-3 p-4">
                {/* Left side - Icon and content */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.15, 1],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                    }}
                    className="flex-shrink-0 w-12 h-12 rounded-xl bg-white border-3 border-red-300 flex items-center justify-center shadow-lg"
                  >
                    <Radio className="w-6 h-6 text-red-600" />
                  </motion.div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <motion.div
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="flex items-center gap-1"
                      >
                        <Circle className="w-3 h-3 text-white fill-white" />
                      </motion.div>
                      <h3 className="font-black text-white text-base sm:text-lg truncate drop-shadow-sm">
                        🔴 We're LIVE!
                      </h3>
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                      >
                        <Sparkles className="w-5 h-5 text-yellow-300 flex-shrink-0" />
                      </motion.div>
                    </div>
                    <p className="text-red-100 text-xs sm:text-sm font-bold truncate">
                      📺 Watch the live session now!
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
                      onClick={handleWatchNow}
                      size="sm"
                      className="bg-white hover:bg-gray-100 text-red-600 font-black shadow-lg border-2 border-red-300 text-sm px-4"
                    >
                      <span className="hidden sm:inline">📺 Watch Now!</span>
                      <span className="sm:hidden">Watch!</span>
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </motion.div>
                  
                  <button
                    onClick={handleDismiss}
                    className="p-1.5 rounded-full bg-red-600 hover:bg-red-700 transition-colors border-2 border-red-800"
                    aria-label="Dismiss"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </>
  );
};
