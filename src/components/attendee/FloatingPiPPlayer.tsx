import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { X, Maximize2, Minimize2, Move } from 'lucide-react';
import { useLiveStream, extractYouTubeVideoId } from '@/hooks/useLiveStream';

interface FloatingPiPPlayerProps {
  eventId: string | null;
  onClose: () => void;
}

export const FloatingPiPPlayer = ({ eventId, onClose }: FloatingPiPPlayerProps) => {
  const { liveStreamUrl } = useLiveStream(eventId);
  const [isExpanded, setIsExpanded] = useState(false);
  const constraintsRef = useRef(null);

  const videoId = liveStreamUrl ? extractYouTubeVideoId(liveStreamUrl) : null;

  if (!videoId) {
    return null;
  }

  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&playsinline=1`;

  return (
    <>
      {/* Invisible constraint boundary */}
      <div ref={constraintsRef} className="fixed inset-0 pointer-events-none z-40" />
      
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          drag
          dragMomentum={false}
          dragConstraints={constraintsRef}
          dragElastic={0}
          className="fixed right-4 bottom-4 z-50 cursor-move touch-none"
        >
        <div 
          className={`relative overflow-hidden rounded-2xl shadow-2xl border-4 border-red-500 bg-black transition-all duration-300 ${
            isExpanded ? 'w-80 h-48 sm:w-96 sm:h-56' : 'w-48 h-28 sm:w-56 sm:h-32'
          }`}
        >
          {/* Drag handle */}
          <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-2 bg-gradient-to-b from-black/80 to-transparent">
            <div className="flex items-center gap-1">
              <Move className="w-3 h-3 text-white/70" />
              <span className="text-xs text-white/70 font-medium">LIVE</span>
              <motion.div
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-2 h-2 bg-red-500 rounded-full"
              />
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
                className="p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              >
                {isExpanded ? (
                  <Minimize2 className="w-3 h-3 text-white" />
                ) : (
                  <Maximize2 className="w-3 h-3 text-white" />
                )}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="p-1 rounded-full bg-white/20 hover:bg-red-500 transition-colors"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          </div>

          {/* YouTube iframe */}
          <iframe
            src={embedUrl}
            title="Live Stream"
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
};
