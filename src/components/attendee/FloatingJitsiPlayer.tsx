import React, { useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Maximize2, Minimize2, Move, Video, Headphones } from 'lucide-react';
import { usePiP } from '@/contexts/PiPContext';
import { useAuth } from '@/contexts/AuthContext';

export const FloatingJitsiPlayer: React.FC = () => {
  const { isVisible, jitsiRoomName, isFullscreen, streamType, hidePiP, setFullscreen } = usePiP();
  const { currentUser } = useAuth();
  const constraintsRef = useRef<HTMLDivElement | null>(null);
  const [audioOnly, setAudioOnly] = useState(false);

  const shouldRender = isVisible && streamType === 'jitsi' && !!jitsiRoomName;
  const displayName = currentUser?.name || 'Attendee';

  const jitsiUrl = useMemo(() => {
    if (!jitsiRoomName) return '';
    return `https://meet.jit.si/${jitsiRoomName}#config.prejoinPageEnabled=false&config.startWithVideoMuted=true&config.startWithAudioMuted=true${audioOnly ? '&config.disableVideo=true&config.startWithVideoMuted=true' : ''}&userInfo.displayName=${encodeURIComponent(displayName)}`;
  }, [audioOnly, displayName, jitsiRoomName]);

  if (!shouldRender) return null;

  const isPiPMode = !isFullscreen;

  const containerClassName = isFullscreen
    ? 'fixed inset-0 z-[100] bg-black'
    : 'fixed right-4 bottom-20 md:bottom-4 z-50 cursor-move touch-none';

  const frameWrapperClassName = isFullscreen
    ? 'relative w-full h-full'
    : 'relative overflow-hidden rounded-2xl shadow-2xl border-4 border-green-500 bg-black w-72 h-48 sm:w-80 sm:h-52';

  const headerClassName = isFullscreen
    ? 'flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent absolute top-0 left-0 right-0 z-20'
    : 'absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-2 bg-gradient-to-b from-black/80 to-transparent';

  const leftBadge = isFullscreen ? (
    <div className="flex items-center gap-2">
      <Video className="w-4 h-4 text-white/70" />
      <span className="text-sm text-white/70 font-medium">LIVE MEETING</span>
      <motion.div
        animate={{ opacity: [1, 0.3, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="w-2 h-2 bg-green-500 rounded-full"
      />
    </div>
  ) : (
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
  );

  const iconBtnClass = (active?: boolean) =>
    `${isFullscreen ? 'p-2' : 'p-1.5'} rounded-full transition-colors ${
      active ? 'bg-amber-500 hover:bg-amber-600' : 'bg-white/20 hover:bg-white/30'
    }`;

  const iconSize = isFullscreen ? 'w-5 h-5' : 'w-3.5 h-3.5';

  return (
    <>
      {/* Invisible constraint boundary */}
      <div ref={constraintsRef} className="fixed inset-0 pointer-events-none z-40" />

      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 12 }}
          drag={isPiPMode}
          dragMomentum={false}
          dragConstraints={constraintsRef}
          dragElastic={0}
          className={containerClassName}
        >
          <div className={frameWrapperClassName}>
            {/* Header */}
            <div className={headerClassName}>
              {leftBadge}

              <div className={`flex items-center gap-2 ${isFullscreen ? 'mr-16' : ''}`}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setAudioOnly(!audioOnly);
                  }}
                  className={iconBtnClass(audioOnly)}
                  title={audioOnly ? 'Enable video' : 'Audio only (saves bandwidth)'}
                >
                  <Headphones className={iconSize} style={{ color: 'white' }} />
                </button>

                {isFullscreen ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFullscreen(false);
                    }}
                    className={`${isFullscreen ? 'p-2' : 'p-1.5'} rounded-full bg-white/20 hover:bg-white/30 transition-colors`}
                    title="Minimize to PiP"
                  >
                    <Minimize2 className={iconSize} style={{ color: 'white' }} />
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFullscreen(true);
                    }}
                    className={`${isFullscreen ? 'p-2' : 'p-1.5'} rounded-full bg-white/20 hover:bg-white/30 transition-colors`}
                    title="Expand to fullscreen"
                  >
                    <Maximize2 className={iconSize} style={{ color: 'white' }} />
                  </button>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    hidePiP();
                  }}
                  className={`${isFullscreen ? 'p-2' : 'p-1.5'} rounded-full bg-white/20 hover:bg-red-500 transition-colors`}
                  title="Leave meeting"
                >
                  <X className={iconSize} style={{ color: 'white' }} />
                </button>
              </div>
            </div>

            {/* Audio only overlay */}
            {audioOnly && (
              <div className={`absolute inset-0 flex items-center justify-center bg-black/80 ${isFullscreen ? 'z-[5]' : 'z-10'} rounded-2xl`}>
                <div className="text-center">
                  <Headphones className={isFullscreen ? 'w-16 h-16' : 'w-10 h-10'} style={{ color: 'hsl(45 93% 55%)' }} />
                  <p className={`${isFullscreen ? 'text-lg' : 'text-sm'} font-medium`} style={{ color: 'white' }}>
                    Audio Only
                  </p>
                  {isFullscreen && (
                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>
                      Video disabled to save bandwidth
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Jitsi iframe (single instance, never unmounts between PiP/fullscreen) */}
            <iframe
              src={jitsiUrl}
              title="Live Meeting"
              className="w-full h-full"
              allow="camera; microphone; fullscreen; display-capture; autoplay"
              allowFullScreen
            />

            {/* Bottom info bar (PiP only) */}
            {!isFullscreen && (
              <div className="absolute bottom-0 left-0 right-0 z-20 p-2 bg-gradient-to-t from-black/80 to-transparent">
                <p className="text-xs text-white/70 truncate">Connected as {displayName}</p>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
};
