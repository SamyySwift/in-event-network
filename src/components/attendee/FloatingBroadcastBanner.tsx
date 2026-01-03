import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, X, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLiveStream, isJitsiStream } from '@/hooks/useLiveStream';
import { useAttendeeEventContext } from '@/contexts/AttendeeEventContext';
import { usePiP } from '@/contexts/PiPContext';

interface FloatingBroadcastBannerProps {
  onDismiss?: () => void;
  isDismissed?: boolean;
}

export const FloatingBroadcastBanner: React.FC<FloatingBroadcastBannerProps> = ({
  onDismiss,
  isDismissed = false,
}) => {
  const navigate = useNavigate();
  const { currentEventId } = useAttendeeEventContext();
  const { liveStreamUrl, isLive, isLoading } = useLiveStream(currentEventId);
  const { isVisible, streamType, setFullscreen } = usePiP();

  // Check if Jitsi PiP is already active
  const isJitsiPiPActive = isVisible && streamType === 'jitsi';

  // Don't show if not live, loading, or dismissed
  if (isLoading || !isLive || isDismissed) {
    return null;
  }

  // Don't show banner if Jitsi PiP is already active (user is in meeting)
  if (isJitsiPiPActive) {
    return null;
  }

  const handleJoinClick = () => {
    // If Jitsi PiP is active, just maximize it instead of navigating
    if (isJitsiPiPActive) {
      setFullscreen(true);
    } else {
      navigate('/attendee/broadcast');
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        className="fixed top-16 left-0 right-0 z-50 px-4"
      >
        <div className="max-w-md mx-auto bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl p-1 shadow-lg">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-3 flex items-center gap-3">
            {/* Animated icon */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
              }}
              className="flex items-center justify-center w-12 h-12 bg-blue-500 rounded-full"
            >
              <Video className="w-6 h-6 text-white" />
            </motion.div>

            {/* Text content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-black text-blue-600 dark:text-blue-400 text-sm">
                  🔴 LIVE NOW
                </span>
                <motion.div
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <Users className="w-4 h-4 text-purple-500" />
                </motion.div>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                {isJitsiStream(liveStreamUrl) ? 'Join the live session!' : 'Join the live session!'}
              </p>
            </div>

            {/* Join button */}
            <Button
              onClick={handleJoinClick}
              size="sm"
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold rounded-full px-4"
            >
              Join
            </Button>

            {/* Dismiss button */}
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};