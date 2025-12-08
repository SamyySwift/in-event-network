import React from 'react';
import { motion } from 'framer-motion';
import { Radio, Maximize2, Minimize2, ArrowLeft, Star, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { extractYouTubeVideoId } from '@/hooks/useLiveStream';

interface LiveStreamViewerProps {
  streamUrl: string;
  onBack?: () => void;
  showBackButton?: boolean;
}

export const LiveStreamViewer = ({ streamUrl, onBack, showBackButton = true }: LiveStreamViewerProps) => {
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const videoId = extractYouTubeVideoId(streamUrl);

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  if (!videoId) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-red-100 border-4 border-red-400 rounded-2xl">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Radio className="w-16 h-16 text-red-500 mb-4" />
        </motion.div>
        <h3 className="text-xl font-black text-red-600 mb-2">📺 Stream Not Available</h3>
        <p className="text-red-500 text-center font-bold">The live stream is not properly configured.</p>
      </div>
    );
  }

  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&rel=0&modestbranding=1`;

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Playful header */}
      <div className="bg-red-500 border-4 border-red-600 rounded-t-2xl p-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showBackButton && onBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-white hover:bg-red-600 font-bold"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
          )}
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="flex items-center gap-1"
            >
              <Circle className="w-3 h-3 text-white fill-white" />
            </motion.div>
            <span className="font-black text-white text-lg">🔴 LIVE</span>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            >
              <Star className="w-5 h-5 text-yellow-300 fill-yellow-300" />
            </motion.div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleFullscreen}
          className="text-white hover:bg-red-600"
        >
          {isFullscreen ? (
            <Minimize2 className="w-5 h-5" />
          ) : (
            <Maximize2 className="w-5 h-5" />
          )}
        </Button>
      </div>

      {/* Video container with playful border */}
      <div className="relative bg-black border-4 border-t-0 border-red-600 rounded-b-2xl overflow-hidden">
        {/* Decorative corners */}
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute top-2 left-2 w-4 h-4 bg-yellow-400 rounded-full z-10"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          className="absolute top-2 right-2 w-4 h-4 bg-cyan-400 rounded-full z-10"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity, delay: 1 }}
          className="absolute bottom-2 left-2 w-4 h-4 bg-pink-400 rounded-full z-10"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
          className="absolute bottom-2 right-2 w-4 h-4 bg-green-400 rounded-full z-10"
        />

        <div className="aspect-video w-full">
          <iframe
            src={embedUrl}
            title="Live Stream"
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
};
