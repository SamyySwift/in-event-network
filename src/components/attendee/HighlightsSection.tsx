import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAttendeeHighlights } from '@/hooks/useAttendeeHighlights';
import { HighlightViewer } from './HighlightViewer';
import { Star, Play } from 'lucide-react';

interface HighlightsSectionProps {
  hideHeader?: boolean;
}

export const HighlightsSection = ({ hideHeader = false }: HighlightsSectionProps) => {
  const [selectedHighlight, setSelectedHighlight] = useState<string | null>(null);
  const { highlights, isLoading } = useAttendeeHighlights();

  // Track viewed highlights to style the ring like Instagram (unseen: gradient ring, seen: muted ring)
  const [viewedIds, setViewedIds] = useState<Set<string>>(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('viewedHighlights') : null;
      return new Set<string>(raw ? JSON.parse(raw) : []);
    } catch {
      return new Set<string>();
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('viewedHighlights', JSON.stringify([...viewedIds]));
    } catch {
      // ignore storage errors
    }
  }, [viewedIds]);

  useEffect(() => {
    if (selectedHighlight && !viewedIds.has(selectedHighlight)) {
      setViewedIds(prev => {
        const next = new Set(prev);
        next.add(selectedHighlight);
        return next;
      });
    }
  }, [selectedHighlight, viewedIds]);

  if (isLoading) {
    return (
      <Card className="glass-card">
        {!hideHeader && (
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gradient">
              <Star className="h-5 w-5" />
              Event Highlights
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex-shrink-0">
                {/* Circular skeleton to match new style */}
                <div className="w-20 h-20 rounded-full bg-muted animate-pulse" />
                <div className="mt-2 h-3 w-20 bg-muted animate-pulse rounded" />
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
        {!hideHeader && (
          <CardHeader className="bg-gradient-to-r from-primary-50/50 to-primary-100/30 dark:from-primary-900/20 dark:to-primary-800/20 pb-3">
            <CardTitle className="flex items-center gap-2 text-gradient text-lg">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                <Star className="h-4 w-4 text-white" />
              </div>
              Event Highlights
            </CardTitle>
          </CardHeader>
        )}
        <CardContent className="p-4">
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
            {highlights.map((highlight) => {
              const coverImage = highlight.cover_image_url || 
                highlight.highlight_media.find(m => m.media_type === 'image')?.media_url ||
                'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=100&h=100&fit=crop';

              const hasMedia = highlight.highlight_media.length > 0;
              const isViewed = viewedIds.has(highlight.id);
              const ringClass = hasMedia && !isViewed
                ? 'bg-[conic-gradient(#feda75,#fa7e1e,#d62976,#962fbf,#4f5bd5,#feda75)]'
                : 'bg-muted';

              return (
                <div key={highlight.id} className="flex-shrink-0 text-center group">
                  <button
                    onClick={() => hasMedia && setSelectedHighlight(highlight.id)}
                    className="relative focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-full transition-transform duration-300 hover:scale-105 disabled:opacity-50"
                    disabled={!hasMedia}
                    aria-label={highlight.title}
                  >
                    {/* Instagram-like circular gradient ring */}
                    <div className={`relative p-[3px] rounded-full ${ringClass}`}>
                      {/* inner separator ring for contrast */}
                      <div className="rounded-full p-[2px] bg-background dark:bg-zinc-950">
                        {/* avatar circle */}
                        <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-primary-100 to-primary-200 dark:from-zinc-900 dark:to-zinc-800 shadow-lg">
                          <img
                            src={coverImage}
                            alt={highlight.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />

                          {/* subtle glass overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

                          {/* Play icon overlay on hover */}
                          {hasMedia && (
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <div className="w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
                                <Play className="h-4 w-4 text-primary fill-current ml-0.5" />
                              </div>
                            </div>
                          )}

                          {/* Media count badge */}
                          {hasMedia && highlight.highlight_media.length > 1 && (
                            <div className="absolute top-1.5 right-1.5 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-medium shadow-md">
                              {highlight.highlight_media.length}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Title */}
                    <div className="mt-2 max-w-20">
                      <p className="text-xs font-medium text-foreground truncate group-hover:text-primary transition-colors duration-300">
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