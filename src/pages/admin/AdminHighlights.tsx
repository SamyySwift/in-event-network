import AdminLayout from '@/components/layouts/AdminLayout';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { CreateHighlightDialog } from '@/components/admin/CreateHighlightDialog';
import { HighlightCard } from '@/components/admin/HighlightCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdminHighlights } from '@/hooks/useAdminHighlights';
import { AdminEventProvider } from '@/hooks/useAdminEventContext';
import { Star, Image, Video, Eye } from 'lucide-react';

const AdminHighlightsContent = () => {
  const { highlights, isLoading } = useAdminHighlights();

  const totalHighlights = highlights.length;
  const publishedHighlights = highlights.filter(h => h.is_published).length;
  const totalMedia = highlights.reduce((sum, h) => sum + h.highlight_media.length, 0);
  const totalImages = highlights.reduce((sum, h) => 
    sum + h.highlight_media.filter(m => m.media_type === 'image').length, 0
  );
  const totalVideos = highlights.reduce((sum, h) => 
    sum + h.highlight_media.filter(m => m.media_type === 'video').length, 0
  );

  return (
    <AdminLayout>
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Event Highlights</h1>
            <p className="text-muted-foreground">Create and manage Instagram-style highlight reels for your event</p>
          </div>
          <CreateHighlightDialog />
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Highlights</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalHighlights}</div>
              <p className="text-xs text-muted-foreground">
                {publishedHighlights} published
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Media</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalMedia}</div>
              <p className="text-xs text-muted-foreground">
                Images and videos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Images</CardTitle>
              <Image className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalImages}</div>
              <p className="text-xs text-muted-foreground">
                Photo content
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Videos</CardTitle>
              <Video className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalVideos}</div>
              <p className="text-xs text-muted-foreground">
                Video content
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Highlights Grid */}
        <Card>
          <CardHeader>
            <CardTitle>Your Highlights</CardTitle>
            <CardDescription>
              Manage your event highlights. You can drag and drop to reorder them.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="h-48 w-full rounded-lg" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : highlights.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Star className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No highlights yet</h3>
                <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
                  Create your first highlight to showcase special moments from your event.
                </p>
                <CreateHighlightDialog />
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {highlights.map((highlight) => (
                  <HighlightCard key={highlight.id} highlight={highlight} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

const AdminHighlights = () => {
  return (
    <AdminEventProvider>
      <AdminHighlightsContent />
    </AdminEventProvider>
  );
};

export default AdminHighlights;