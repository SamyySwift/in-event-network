import EventSelector from "@/components/admin/EventSelector";
import { CreateHighlightDialog } from "@/components/admin/CreateHighlightDialog";
import { HighlightCard } from "@/components/admin/HighlightCard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminHighlights } from "@/hooks/useAdminHighlights";
import {
  AdminEventProvider,
  useAdminEventContext,
} from "@/hooks/useAdminEventContext";
import { Star, Image, Video, Eye, Loader } from "lucide-react";
import PaymentGuard from '@/components/payment/PaymentGuard';

const AdminHighlightsContent = () => {
  const { highlights, isLoading } = useAdminHighlights();
  const { selectedEvent, selectedEventId } = useAdminEventContext();

  const totalHighlights = highlights.length;
  const publishedHighlights = highlights.filter((h) => h.is_published).length;
  const totalMedia = highlights.reduce(
    (sum, h) => sum + h.highlight_media.length,
    0
  );
  const totalImages = highlights.reduce(
    (sum, h) =>
      sum + h.highlight_media.filter((m) => m.media_type === "image").length,
    0
  );
  const totalVideos = highlights.reduce(
    (sum, h) =>
      sum + h.highlight_media.filter((m) => m.media_type === "video").length,
    0
  );

  if (isLoading) {
    return (
      <div className="space-y-6 p-4 sm:p-6">
        <div className="flex justify-between items-center">
          <EventSelector />
        </div>
        <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-primary-100 via-purple-100 to-blue-50 text-primary-900 dark:text-white shadow-2xl shadow-primary/10 mb-2 relative overflow-hidden">
          <div className="absolute -top-12 -right-10 w-56 h-56 bg-white/10 rounded-full opacity-40 blur-2xl pointer-events-none"></div>
          <div className="absolute -bottom-14 -left-14 w-36 h-36 bg-white/20 rounded-full opacity-30 pointer-events-none"></div>
          <div className="relative z-10">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
              Event Highlights
            </h1>
            <p className="mt-2 max-w-2xl text-primary-700 dark:text-primary-100 text-sm sm:text-base">
              Create and manage Instagram-style highlight reels for{" "}
              <span className="font-semibold">
                {selectedEvent?.name ?? "your event"}
              </span>
            </p>
          </div>
        </div>
        <div className="h-24 flex items-center justify-center">
          <Loader className="animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Event Selector */}
      <div className="flex justify-between items-center">
        <EventSelector />
      </div>

      {/* Show message when no event is selected */}
      {!selectedEventId && (
        <div className="text-center py-12">
          <div className="p-4 rounded-full bg-primary/10 inline-block mb-4">
            <Star className="h-8 w-8 text-primary" />
          </div>
          <p className="text-muted-foreground text-lg mb-2">
            No event selected
          </p>
          <p className="text-sm text-muted-foreground">
            Please select an event above to manage its highlights
          </p>
        </div>
      )}

      {/* Only show content when an event is selected */}
      {selectedEventId && (
        <PaymentGuard 
          eventId={selectedEventId} 
          eventName={selectedEvent?.name || 'this event'}
          feature="Event Highlights"
        >
          {/* Gradient Hero Section */}
          <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-primary-100 via-purple-100 to-blue-50 text-primary-900 dark:text-white shadow-2xl shadow-primary/10 mb-2 relative overflow-hidden">
            <div className="absolute -top-12 -right-10 w-56 h-56 bg-white/10 rounded-full opacity-40 blur-2xl pointer-events-none"></div>
            <div className="absolute -bottom-14 -left-14 w-36 h-36 bg-white/20 rounded-full opacity-30 pointer-events-none"></div>
            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
                    Event Highlights
                  </h1>
                  <p className="mt-2 max-w-2xl text-primary-700 dark:text-primary-100 text-sm sm:text-base">
                    Create and manage Instagram-style highlight reels for{" "}
                    <span className="font-semibold">{selectedEvent?.name}</span>
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <CreateHighlightDialog />
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Highlights
                </CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold">
                  {totalHighlights}
                </div>
                <p className="text-xs text-muted-foreground">
                  {publishedHighlights} published
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Media
                </CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold">
                  {totalMedia}
                </div>
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
                <div className="text-xl sm:text-2xl font-bold">
                  {totalImages}
                </div>
                <p className="text-xs text-muted-foreground">Photo content</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Videos</CardTitle>
                <Video className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold">
                  {totalVideos}
                </div>
                <p className="text-xs text-muted-foreground">Video content</p>
              </CardContent>
            </Card>
          </div>

          {/* Highlights Grid */}
          <Card>
            <CardHeader>
              <CardTitle>Your Highlights</CardTitle>
              <CardDescription>
                Manage your event highlights. You can drag and drop to reorder
                them.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {highlights.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Star className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">
                    No highlights yet
                  </h3>
                  <p className="text-muted-foreground mb-4 max-w-sm mx-auto text-sm sm:text-base">
                    Create your first highlight to showcase special moments from
                    your event.
                  </p>
                  <CreateHighlightDialog />
                </div>
              ) : (
                <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                  {highlights.map((highlight) => (
                    <HighlightCard key={highlight.id} highlight={highlight} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </PaymentGuard>
      )}
    </div>
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

//chamges
