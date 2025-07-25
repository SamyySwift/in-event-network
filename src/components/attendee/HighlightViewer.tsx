import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { X, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { HighlightWithMedia } from '@/hooks/useAttendeeHighlights';

interface HighlightViewerProps {
  highlightId: string;
  highlights: HighlightWithMedia[];
  isOpen: boolean;
  onClose: () => void;
  onNext: (nextId: string) => void;
  onPrevious: (prevId: string) => void;
}

export const HighlightViewer = ({
  highlightId,
  highlights,
  isOpen,
  onClose,
  onNext,
  onPrevious,
}: HighlightViewerProps) => {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  const currentHighlight = highlights.find(h => h.id === highlightId);
  const currentHighlightIndex = highlights.findIndex(h => h.id === highlightId);
  
  if (!currentHighlight) return null;

  const currentMedia = currentHighlight.highlight_media[currentMediaIndex];
  const duration = currentMedia?.duration_seconds || 5;

  const nextHighlight = () => {
    const nextIndex = (currentHighlightIndex + 1) % highlights.length;
    onNext(highlights[nextIndex].id);
  };

  const previousHighlight = () => {
    const prevIndex = currentHighlightIndex === 0 ? highlights.length - 1 : currentHighlightIndex - 1;
    onPrevious(highlights[prevIndex].id);
  };

  const nextMedia = useCallback(() => {
    if (currentMediaIndex < currentHighlight.highlight_media.length - 1) {
      setCurrentMediaIndex(prev => prev + 1);
      setProgress(0);
    } else {
      nextHighlight();
    }
  }, [currentMediaIndex, currentHighlight.highlight_media.length]);

  const previousMedia = () => {
    if (currentMediaIndex > 0) {
      setCurrentMediaIndex(prev => prev - 1);
      setProgress(0);
    } else {
      previousHighlight();
    }
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  // Progress timer
  useEffect(() => {
    if (!isOpen || isPaused || !currentMedia) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + (100 / (duration * 10)); // Update every 100ms
        if (newProgress >= 100) {
          nextMedia();
          return 0;
        }
        return newProgress;
      });
    }, 100);

    setIntervalId(interval);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen, isPaused, currentMedia, duration, nextMedia]);

  // Reset when highlight changes
  useEffect(() => {
    setCurrentMediaIndex(0);
    setProgress(0);
    setIsPaused(false);
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  }, [highlightId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [intervalId]);

  if (!currentMedia) return null;

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md p-0 bg-black border-none">
        <div className="relative aspect-[9/16] bg-black overflow-hidden">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/60 to-transparent p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-primary/60 p-0.5">
                  <div className="w-full h-full rounded-full overflow-hidden bg-background">
                    <img
                      src={currentHighlight.cover_image_url || currentHighlight.highlight_media[0]?.media_url || ''}
                      alt={currentHighlight.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{currentHighlight.title}</p>
                  <p className="text-white/70 text-xs">
                    {currentMediaIndex + 1} of {currentHighlight.highlight_media.length}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white/20 p-2 h-auto"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Progress bars */}
            <div className="flex gap-1 mt-3">
              {currentHighlight.highlight_media.map((_, index) => (
                <div key={index} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white transition-all duration-100 ease-linear"
                    style={{
                      width: index < currentMediaIndex 
                        ? '100%' 
                        : index === currentMediaIndex 
                          ? `${progress}%` 
                          : '0%'
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Media Content */}
          <div className="absolute inset-0">
            {currentMedia.media_type === 'image' ? (
              <img
                src={currentMedia.media_url}
                alt={`${currentHighlight.title} - ${currentMediaIndex + 1}`}
                className="w-full h-full object-contain"
              />
            ) : (
              <video
                src={currentMedia.media_url}
                className="w-full h-full object-contain"
                autoPlay
                muted
                loop
                playsInline
              />
            )}
          </div>

          {/* Navigation Areas */}
          <div className="absolute inset-0 flex">
            {/* Left side - Previous */}
            <button
              onClick={previousMedia}
              className="flex-1 bg-transparent"
              aria-label="Previous"
            />
            
            {/* Center - Play/Pause */}
            <button
              onClick={togglePause}
              className="flex-1 bg-transparent flex items-center justify-center"
              aria-label={isPaused ? 'Play' : 'Pause'}
            >
              {isPaused && (
                <div className="bg-black/50 backdrop-blur-sm rounded-full p-3">
                  <Play className="h-6 w-6 text-white fill-current" />
                </div>
              )}
            </button>
            
            {/* Right side - Next */}
            <button
              onClick={nextMedia}
              className="flex-1 bg-transparent"
              aria-label="Next"
            />
          </div>

          {/* Navigation Arrows */}
          {highlights.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={previousHighlight}
                className="absolute left-2 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 p-2 h-auto"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={nextHighlight}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 p-2 h-auto"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </>
          )}

          {/* Pause Indicator */}
          {isPaused && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
              <div className="bg-black/50 backdrop-blur-sm rounded-full px-3 py-1">
                <div className="flex items-center gap-2 text-white text-sm">
                  <Pause className="h-3 w-3" />
                  Paused
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};