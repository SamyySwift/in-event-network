import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { MoreHorizontal, Edit, Trash2, Plus, Image, Video } from 'lucide-react';
import { HighlightWithMedia, useAdminHighlights } from '@/hooks/useAdminHighlights';
import { EditHighlightDialog } from './EditHighlightDialog';
import { ManageHighlightMediaDialog } from './ManageHighlightMediaDialog';

interface HighlightCardProps {
  highlight: HighlightWithMedia;
}

export const HighlightCard = ({ highlight }: HighlightCardProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showMediaDialog, setShowMediaDialog] = useState(false);
  const { updateHighlight, deleteHighlight } = useAdminHighlights();

  const handlePublishToggle = (checked: boolean) => {
    updateHighlight.mutate({
      id: highlight.id,
      updates: { is_published: checked }
    });
  };

  const handleDelete = () => {
    deleteHighlight.mutate(highlight.id);
    setShowDeleteDialog(false);
  };

  const coverImage = highlight.cover_image_url || 
    highlight.highlight_media.find(m => m.media_type === 'image')?.media_url ||
    'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=400&h=300&fit=crop';

  const mediaCount = highlight.highlight_media.length;
  const imageCount = highlight.highlight_media.filter(m => m.media_type === 'image').length;
  const videoCount = highlight.highlight_media.filter(m => m.media_type === 'video').length;

  return (
    <>
      <Card className="group hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg">{highlight.title}</CardTitle>
              {highlight.category && (
                <Badge variant="secondary" className="text-xs">
                  {highlight.category}
                </Badge>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowMediaDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Manage Media
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Cover Image */}
          <div className="aspect-video relative rounded-lg overflow-hidden bg-muted">
            <img
              src={coverImage}
              alt={highlight.title}
              className="object-cover w-full h-full"
            />
            {mediaCount > 0 && (
              <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-full px-2 py-1">
                <span className="text-xs font-medium">{mediaCount}</span>
              </div>
            )}
          </div>

          {/* Media Stats */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Image className="h-4 w-4" />
              <span>{imageCount} images</span>
            </div>
            <div className="flex items-center gap-1">
              <Video className="h-4 w-4" />
              <span>{videoCount} videos</span>
            </div>
          </div>

          {/* Publish Toggle */}
          <div className="flex items-center justify-between pt-2 border-t">
            <Label htmlFor={`publish-${highlight.id}`} className="text-sm">
              Published
            </Label>
            <Switch
              id={`publish-${highlight.id}`}
              checked={highlight.is_published}
              onCheckedChange={handlePublishToggle}
            />
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <EditHighlightDialog
        highlight={highlight}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />

      {/* Media Management Dialog */}
      <ManageHighlightMediaDialog
        highlight={highlight}
        open={showMediaDialog}
        onOpenChange={setShowMediaDialog}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Highlight</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{highlight.title}"? This will also remove all associated media. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};