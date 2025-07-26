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
import { Plus, Trash2, Image, Video, Upload, X } from 'lucide-react';
import { HighlightWithMedia, useAdminHighlights } from '@/hooks/useAdminHighlights';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [duration, setDuration] = useState(5);
  const [deleteMediaId, setDeleteMediaId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { addHighlightMedia, removeHighlightMedia } = useAdminHighlights();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size - 5MB for both images and videos
      const maxSize = 5 * 1024 * 1024; // 5MB for both images and videos
      if (file.size > maxSize) {
        toast.error(`${mediaType === 'image' ? 'Image' : 'Video'} must be less than 5MB`);
        return;
      }
      
      // Validate file type
      const expectedType = mediaType === 'image' ? 'image/' : 'video/';
      if (!file.type.startsWith(expectedType)) {
        toast.error(`Please select a ${mediaType} file`);
        return;
      }
      
      setMediaFile(file);
    }
  };

  const uploadFile = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `highlights/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('media')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleAddMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!mediaFile) {
      toast.error('Please select a file');
      return;
    }

    setIsUploading(true);
    
    try {
      const mediaUrl = await uploadFile(mediaFile);
      const nextOrder = Math.max(...highlight.highlight_media.map(m => m.media_order), -1) + 1;

      await addHighlightMedia.mutateAsync({
        highlight_id: highlight.id,
        media_url: mediaUrl,
        media_type: mediaType,
        media_order: nextOrder,
        duration_seconds: duration,
      });

      // Reset form
      setMediaFile(null);
      setMediaType('image');
      setDuration(5);
    } catch (error) {
      console.error('Error adding media:', error);
      toast.error('Failed to add media');
    } finally {
      setIsUploading(false);
    }
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
                      <Label htmlFor="media-type">Media Type</Label>
                      <Select value={mediaType} onValueChange={(value: 'image' | 'video') => {
                        setMediaType(value);
                        setMediaFile(null); // Reset file when type changes
                      }}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="image">Image</SelectItem>
                          <SelectItem value="video">Video</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration (seconds)</Label>
                      <Input
                        id="duration"
                        type="number"
                        min={5}
                        max={30}
                        value={duration}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          if (val >= 5 && val <= 30) {
                            setDuration(val);
                          } else if (val < 5) {
                            setDuration(5);
                          } else if (val > 30) {
                            setDuration(30);
                          }
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="media-file">{mediaType === 'image' ? 'Image' : 'Video'} File</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="media-file"
                        type="file"
                        accept={mediaType === 'image' ? 'image/*' : 'video/*'}
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('media-file')?.click()}
                        className="w-full"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {mediaFile ? mediaFile.name : `Choose ${mediaType === 'image' ? 'Image' : 'Video'}`}
                      </Button>
                      {mediaFile && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setMediaFile(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Maximum 5MB for all media files. Duration: 5-30 seconds.
                    </p>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isUploading || !mediaFile}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {isUploading ? 'Uploading...' : 'Add Media'}
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
                            <video
                              src={media.media_url}
                              className="object-cover w-full h-full"
                              controls
                            />
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
