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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Event Highlights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex-shrink-0">
                <div className="w-20 h-20 rounded-full bg-muted animate-pulse" />
                <div className="mt-2 h-3 w-16 bg-muted animate-pulse rounded" />
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Event Highlights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {highlights.map((highlight) => {
              const coverImage = highlight.cover_image_url || 
                highlight.highlight_media.find(m => m.media_type === 'image')?.media_url ||
                'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=100&h=100&fit=crop';

              const hasMedia = highlight.highlight_media.length > 0;

              return (
                <div key={highlight.id} className="flex-shrink-0 text-center">
                  <button
                    onClick={() => hasMedia && setSelectedHighlight(highlight.id)}
                    className="relative group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-full"
                    disabled={!hasMedia}
                  >
                    <div className="relative">
                      <div className={`w-20 h-20 rounded-full p-1 ${hasMedia ? 'bg-gradient-to-tr from-primary to-primary/60' : 'bg-muted'}`}>
                        <div className="w-full h-full rounded-full overflow-hidden bg-background p-1">
                          <img
                            src={coverImage}
                            alt={highlight.title}
                            className="w-full h-full object-cover rounded-full"
                          />
                        </div>
                      </div>
                      {hasMedia && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="bg-background/80 backdrop-blur-sm rounded-full p-1">
                            <Play className="h-4 w-4 text-primary fill-current" />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="mt-2 max-w-20">
                      <p className="text-xs font-medium truncate">
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