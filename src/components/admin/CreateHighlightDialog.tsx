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
import { Plus, Upload, X } from 'lucide-react';
import { useAdminHighlights } from '@/hooks/useAdminHighlights';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { createHighlight } = useAdminHighlights();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (5MB for images)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        e.target.value = ''; // Clear the input
        return;
      }
      
      // Validate file type - be more specific about allowed formats
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
        e.target.value = ''; // Clear the input
        return;
      }
      
      setCoverImage(file);
    }
  };

  const uploadFile = async (file: File): Promise<string> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `highlights/${fileName}`;
  
      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
  
      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }
  
      const { data } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);
  
      return data.publicUrl;
    } catch (error) {
      console.error('File upload error:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('Please enter a title for the highlight');
      return;
    }

    setIsUploading(true);
    
    try {
      let coverImageUrl = null;
      
      if (coverImage) {
        try {
          coverImageUrl = await uploadFile(coverImage);
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError);
          toast.error('Failed to upload image. Please try again.');
          setIsUploading(false);
          return;
        }
      }

      await createHighlight.mutateAsync({
        title: title.trim(),
        category: category || null,
        cover_image_url: coverImageUrl,
        is_published: false,
        display_order: 0,
      });

      // Reset form
      setTitle('');
      setCategory('');
      setCoverImage(null);
      // Clear the file input
      const fileInput = document.getElementById('cover') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      setOpen(false);
      toast.success('Highlight created successfully!');
    } catch (error) {
      console.error('Error creating highlight:', error);
      toast.error('Failed to create highlight. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto">
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
            <Label htmlFor="cover">Cover Image (Optional)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="cover"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('cover')?.click()}
                className="w-full"
                disabled={isUploading}
              >
                <Upload className="h-4 w-4 mr-2" />
                {coverImage ? coverImage.name : 'Choose Image'}
              </Button>
              {coverImage && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setCoverImage(null);
                    const fileInput = document.getElementById('cover') as HTMLInputElement;
                    if (fileInput) fileInput.value = '';
                  }}
                  disabled={isUploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Maximum 5MB. Supported formats: JPEG, PNG, GIF, WebP. If not provided, the first media item will be used as cover.
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
              disabled={isUploading || !title.trim()}
            >
              {isUploading ? 'Creating...' : 'Create Highlight'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};