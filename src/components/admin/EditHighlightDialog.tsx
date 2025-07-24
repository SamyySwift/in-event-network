import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { HighlightWithMedia, useAdminHighlights } from '@/hooks/useAdminHighlights';

const categories = [
  'Behind the Scenes',
  'Speaker Moments',
  'Announcements',
  'Networking',
  'Workshops',
  'Entertainment',
  'Other'
];

interface EditHighlightDialogProps {
  highlight: HighlightWithMedia;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditHighlightDialog = ({ highlight, open, onOpenChange }: EditHighlightDialogProps) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const { updateHighlight } = useAdminHighlights();

  useEffect(() => {
    if (open) {
      setTitle(highlight.title);
      setCategory(highlight.category || '');
      setCoverImageUrl(highlight.cover_image_url || '');
    }
  }, [open, highlight]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;

    updateHighlight.mutate({
      id: highlight.id,
      updates: {
        title: title.trim(),
        category: category || null,
        cover_image_url: coverImageUrl || null,
      }
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Highlight</DialogTitle>
          <DialogDescription>
            Update the highlight details below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Title</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter highlight title"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-category">Category (Optional)</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No category</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-cover">Cover Image URL (Optional)</Label>
            <Input
              id="edit-cover"
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              type="url"
            />
            <p className="text-xs text-muted-foreground">
              If not provided, the first media item will be used as cover
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={updateHighlight.isPending || !title.trim()}
            >
              Update Highlight
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};