import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAttendeeHighlights } from '@/hooks/useAttendeeHighlights';
import { HighlightViewer } from './HighlightViewer';
import { Star, Play } from 'lucide-react';

export const HighlightsSection = () => {
  const [selectedHighlight, setSelectedHighlight] = useState<string | null>(null);
  const { highlights, isLoading } = useAttendeeHighlights();

  if (isLoading) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gradient">
            <Star className="h-5 w-5" />
            Event Highlights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex-shrink-0">
                <div className="w-24 h-24 rounded-full bg-muted animate-pulse" />
                <div className="mt-3 h-3 w-20 bg-muted animate-pulse rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (highlights.length === 0) {
    return null; // Don't show the section if there are no highlights
  }

  return (
    <>
      <Card className="glass-card overflow-hidden relative">
        <CardHeader className="bg-gradient-to-r from-primary-50/50 to-primary-100/30 dark:from-primary-900/20 dark:to-primary-800/20">
          <CardTitle className="flex items-center gap-2 text-gradient">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
              <Star className="h-4 w-4 text-white" />
            </div>
            Event Highlights
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
            {highlights.map((highlight) => {
              const coverImage = highlight.cover_image_url || 
                highlight.highlight_media.find(m => m.media_type === 'image')?.media_url ||
                'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=100&h=100&fit=crop';

              const hasMedia = highlight.highlight_media.length > 0;

              return (
                <div key={highlight.id} className="flex-shrink-0 text-center group">
                  <button
                    onClick={() => hasMedia && setSelectedHighlight(highlight.id)}
                    className="relative focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-2xl transition-all duration-500 hover:scale-105"
                    disabled={!hasMedia}
                  >
                    {/* Animated border container */}
                    <div className={`relative p-1 rounded-2xl ${hasMedia ? 'fire-border' : ''}`}>
                      {/* Main image container */}
                      <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 shadow-lg">
                        <img
                          src={coverImage}
                          alt={highlight.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        
                        {/* Glass overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                        
                        {/* Play icon overlay */}
                        {hasMedia && (
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                            <div className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
                              <Play className="h-4 w-4 text-primary fill-current ml-0.5" />
                            </div>
                          </div>
                        )}
                        
                        {/* Media count badge */}
                        {hasMedia && highlight.highlight_media.length > 1 && (
                          <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium shadow-md">
                            {highlight.highlight_media.length}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Title */}
                    <div className="mt-3 max-w-24">
                      <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors duration-300">
                        {highlight.title}
                      </p>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Highlight Viewer Modal */}
      {selectedHighlight && (
        <HighlightViewer
          highlightId={selectedHighlight}
          highlights={highlights}
          isOpen={!!selectedHighlight}
          onClose={() => setSelectedHighlight(null)}
          onNext={(nextId) => setSelectedHighlight(nextId)}
          onPrevious={(prevId) => setSelectedHighlight(prevId)}
        />
      )}
    </>
  );
};