import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Maximize2, Minimize2, Move, Video, VideoOff, Headphones } from 'lucide-react';
import { usePiP } from '@/contexts/PiPContext';
import { useAuth } from '@/contexts/AuthContext';

export const FloatingJitsiPlayer: React.FC = () => {
  const { isVisible, jitsiRoomName, isFullscreen, streamType, hidePiP, setFullscreen } = usePiP();
  const { currentUser } = useAuth();
  const constraintsRef = useRef(null);
  const [audioOnly, setAudioOnly] = useState(false);

  // Only render for Jitsi streams
  if (!isVisible || streamType !== 'jitsi' || !jitsiRoomName) {
    return null;
  }

  const displayName = currentUser?.name || 'Attendee';
  const jitsiUrl = `https://meet.jit.si/${jitsiRoomName}#config.prejoinPageEnabled=false&config.startWithVideoMuted=true&config.startWithAudioMuted=true${audioOnly ? '&config.startWithVideoMuted=true&config.disableVideo=true' : ''}&userInfo.displayName=${encodeURIComponent(displayName)}`;

  // Fullscreen mode - fixed overlay
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-[100] bg-black flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent absolute top-0 left-0 right-0 z-10">
          <div className="flex items-center gap-2">
            <Video className="w-4 h-4 text-white/70" />
            <span className="text-sm text-white/70 font-medium">LIVE MEETING</span>
            <motion.div
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-2 h-2 bg-green-500 rounded-full"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAudioOnly(!audioOnly)}
              className={`p-2 rounded-full transition-colors ${audioOnly ? 'bg-amber-500 hover:bg-amber-600' : 'bg-white/20 hover:bg-white/30'}`}
              title={audioOnly ? "Enable video" : "Audio only (saves bandwidth)"}
            >
              {audioOnly ? <Headphones className="w-5 h-5 text-white" /> : <Video className="w-5 h-5 text-white" />}
            </button>
            <button
              onClick={() => setFullscreen(false)}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              title="Minimize to PiP"
            >
              <Minimize2 className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={hidePiP}
              className="p-2 rounded-full bg-white/20 hover:bg-red-500 transition-colors"
              title="Leave meeting"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Audio only indicator */}
        {audioOnly && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-[5]">
            <div className="text-center">
              <Headphones className="w-16 h-16 text-amber-400 mx-auto mb-4" />
              <p className="text-white text-lg font-medium">Audio Only Mode</p>
              <p className="text-white/60 text-sm">Video disabled to save bandwidth</p>
            </div>
          </div>
        )}

        {/* Jitsi iframe - fullscreen */}
        <iframe
          src={jitsiUrl}
          key={audioOnly ? 'audio-only' : 'with-video'}
          title="Live Meeting"
          className="w-full h-full"
          allow="camera; microphone; fullscreen; display-capture; autoplay"
          allowFullScreen
        />
      </div>
    );
  }

  // PiP mode - draggable floating player
  return (
    <>
      {/* Invisible constraint boundary */}
      <div ref={constraintsRef} className="fixed inset-0 pointer-events-none z-40" />
      
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 50 }}
          drag
          dragMomentum={false}
          dragConstraints={constraintsRef}
          dragElastic={0}
          className="fixed right-4 bottom-20 md:bottom-4 z-50 cursor-move touch-none"
        >
          <div className="relative overflow-hidden rounded-2xl shadow-2xl border-4 border-green-500 bg-black w-72 h-48 sm:w-80 sm:h-52">
            {/* Drag handle header */}
            <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-2 bg-gradient-to-b from-black/80 to-transparent">
              <div className="flex items-center gap-1.5">
                <Move className="w-3 h-3 text-white/70" />
                <Video className="w-3 h-3 text-green-400" />
                <span className="text-xs text-white/80 font-medium">LIVE</span>
                <motion.div
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-2 h-2 bg-green-500 rounded-full"
                />
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setAudioOnly(!audioOnly);
                  }}
                  className={`p-1.5 rounded-full transition-colors ${audioOnly ? 'bg-amber-500 hover:bg-amber-600' : 'bg-white/20 hover:bg-white/30'}`}
                  title={audioOnly ? "Enable video" : "Audio only"}
                >
                  {audioOnly ? <Headphones className="w-3.5 h-3.5 text-white" /> : <Video className="w-3.5 h-3.5 text-white" />}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setFullscreen(true);
                  }}
                  className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                  title="Expand to fullscreen"
                >
                  <Maximize2 className="w-3.5 h-3.5 text-white" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    hidePiP();
                  }}
                  className="p-1.5 rounded-full bg-white/20 hover:bg-red-500 transition-colors"
                  title="Leave meeting"
                >
                  <X className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
            </div>

            {/* Audio only overlay for PiP */}
            {audioOnly && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10 rounded-2xl">
                <div className="text-center">
                  <Headphones className="w-10 h-10 text-amber-400 mx-auto mb-2" />
                  <p className="text-white text-sm font-medium">Audio Only</p>
                </div>
              </div>
            )}

            {/* Jitsi iframe */}
            <iframe
              src={jitsiUrl}
              key={audioOnly ? 'audio-only-pip' : 'with-video-pip'}
              title="Live Meeting"
              className="w-full h-full"
              allow="camera; microphone; fullscreen; display-capture; autoplay"
              allowFullScreen
            />

            {/* Bottom info bar */}
            <div className="absolute bottom-0 left-0 right-0 z-20 p-2 bg-gradient-to-t from-black/80 to-transparent">
              <p className="text-xs text-white/70 truncate">
                Connected as {displayName}
              </p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
};
