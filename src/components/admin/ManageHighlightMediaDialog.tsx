import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Image, Video } from 'lucide-react';
import { HighlightWithMedia, useAdminHighlights } from '@/hooks/useAdminHighlights';

interface ManageHighlightMediaDialogProps {
  highlight: HighlightWithMedia;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ManageHighlightMediaDialog = ({ 
  highlight, 
  open, 
  onOpenChange 
}: ManageHighlightMediaDialogProps) => {
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [duration, setDuration] = useState(5);
  const [deleteMediaId, setDeleteMediaId] = useState<string | null>(null);
  const { addHighlightMedia, removeHighlightMedia } = useAdminHighlights();

  const handleAddMedia = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!mediaUrl.trim()) return;

    const nextOrder = Math.max(...highlight.highlight_media.map(m => m.media_order), -1) + 1;

    addHighlightMedia.mutate({
      highlight_id: highlight.id,
      media_url: mediaUrl.trim(),
      media_type: mediaType,
      media_order: nextOrder,
      duration_seconds: duration,
    });

    // Reset form
    setMediaUrl('');
    setMediaType('image');
    setDuration(5);
  };

  const handleDeleteMedia = () => {
    if (deleteMediaId) {
      removeHighlightMedia.mutate(deleteMediaId);
      setDeleteMediaId(null);
    }
  };

  const sortedMedia = [...highlight.highlight_media].sort((a, b) => a.media_order - b.media_order);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Manage Media - {highlight.title}</DialogTitle>
            <DialogDescription>
              Add, remove, and organize media for this highlight.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Add Media Form */}
            <Card>
              <CardContent className="pt-6">
                <form onSubmit={handleAddMedia} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="media-url">Media URL</Label>
                      <Input
                        id="media-url"
                        value={mediaUrl}
                        onChange={(e) => setMediaUrl(e.target.value)}
                        placeholder="https://example.com/media.jpg"
                        type="url"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="media-type">Media Type</Label>
                      <Select value={mediaType} onValueChange={(value: 'image' | 'video') => setMediaType(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="image">Image</SelectItem>
                          <SelectItem value="video">Video</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (seconds)</Label>
                    <Input
                      id="duration"
                      type="number"
                      min={1}
                      max={30}
                      value={duration}
                      onChange={(e) => setDuration(parseInt(e.target.value) || 5)}
                    />
                    <p className="text-xs text-muted-foreground">
                      How long this media should be displayed (1-30 seconds)
                    </p>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={addHighlightMedia.isPending || !mediaUrl.trim()}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Media
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Existing Media */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">
                  Current Media ({sortedMedia.length})
                </h3>
              </div>

              {sortedMedia.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                    <Image className="h-6 w-6" />
                  </div>
                  <p>No media added yet</p>
                  <p className="text-sm">Add images or videos to create your highlight</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sortedMedia.map((media, index) => (
                    <Card key={media.id} className="relative group">
                      <CardContent className="p-3">
                        <div className="aspect-video relative rounded-lg overflow-hidden bg-muted mb-3">
                          {media.media_type === 'image' ? (
                            <img
                              src={media.media_url}
                              alt={`Media ${index + 1}`}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <div className="flex items-center justify-center w-full h-full">
                              <Video className="h-8 w-8 text-muted-foreground" />
                            </div>
                          )}
                          <div className="absolute top-2 left-2">
                            <Badge variant="secondary" className="text-xs">
                              #{index + 1}
                            </Badge>
                          </div>
                          <div className="absolute top-2 right-2">
                            <Badge variant={media.media_type === 'image' ? 'default' : 'secondary'} className="text-xs">
                              {media.media_type === 'image' ? (
                                <Image className="h-3 w-3 mr-1" />
                              ) : (
                                <Video className="h-3 w-3 mr-1" />
                              )}
                              {media.duration_seconds}s
                            </Badge>
                          </div>
                        </div>
                        
                        <Button
                          variant="destructive"
                          size="sm"
                          className="w-full"
                          onClick={() => setDeleteMediaId(media.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteMediaId} onOpenChange={() => setDeleteMediaId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Media</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this media from the highlight? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteMedia} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
