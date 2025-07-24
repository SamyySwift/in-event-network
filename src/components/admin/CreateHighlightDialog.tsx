import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Plus } from 'lucide-react';
import { useAdminHighlights } from '@/hooks/useAdminHighlights';

const categories = [
  'Behind the Scenes',
  'Speaker Moments',
  'Announcements',
  'Networking',
  'Workshops',
  'Entertainment',
  'Other'
];

export const CreateHighlightDialog = () => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const { createHighlight } = useAdminHighlights();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;

    createHighlight.mutate({
      title: title.trim(),
      category: category || null,
      cover_image_url: coverImageUrl || null,
      is_published: false,
      display_order: 0,
    });

    // Reset form
    setTitle('');
    setCategory('');
    setCoverImageUrl('');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Highlight
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Highlight</DialogTitle>
          <DialogDescription>
            Create a new highlight to showcase special moments from your event.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter highlight title"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Category (Optional)</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cover">Cover Image URL (Optional)</Label>
            <Input
              id="cover"
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
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createHighlight.isPending || !title.trim()}
            >
              Create Highlight
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};