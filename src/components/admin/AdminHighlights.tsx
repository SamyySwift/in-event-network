import React, { useState } from 'react';
import { Calendar, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdminHighlights } from '@/hooks/useAdminHighlights';

interface AdminHighlightsContentProps {
  selectedEventId: string | null;
}

const AdminHighlightsContent: React.FC<AdminHighlightsContentProps> = ({
  selectedEventId,
}) => {
  const { highlights, isLoading, createHighlight, deleteHighlight } =
    useAdminHighlights();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg h-48"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!selectedEventId) {
    return (
      <div className="text-center py-12">
        <Calendar className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          No event selected
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Please select an event to manage highlights.
        </p>
      </div>
    );
  }

  const totalHighlights = highlights.length;
  const publishedHighlights = highlights.filter(
    (h) => h.is_published
  ).length;
  const totalMedia = highlights.reduce(
    (acc, highlight) => acc + (highlight.highlight_media?.length || 0),
    0
  );
  const totalImages = highlights.reduce(
    (acc, highlight) =>
      acc +
      (highlight.highlight_media?.filter((m) => m.media_type === "image").length || 0),
    0
  );
  const totalVideos = highlights.reduce(
    (acc, highlight) =>
      acc +
      (highlight.highlight_media?.filter((m) => m.media_type === "video").length || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Event Highlights</h1>
            <p className="mt-2 text-sm text-gray-600">
              Create and manage Instagram-style highlight reels for{" "}
              <span className="font-medium text-purple-600">
                ABUJA EDUCATORS CONFERENCE
              </span>
            </p>
          </div>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="mt-4 sm:mt-0 bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Highlight
          </Button>
        </div>
      </div>

      {/* Stats and content would go here */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <div className="bg-white p-4 rounded-lg border">
          <h3 className="text-sm font-medium text-gray-500">Total Highlights</h3>
          <p className="text-2xl font-bold">{totalHighlights}</p>
          <p className="text-xs text-gray-500">{publishedHighlights} published</p>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <h3 className="text-sm font-medium text-gray-500">Total Media</h3>
          <p className="text-2xl font-bold">{totalMedia}</p>
          <p className="text-xs text-gray-500">Images and videos</p>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <h3 className="text-sm font-medium text-gray-500">Images</h3>
          <p className="text-2xl font-bold">{totalImages}</p>
          <p className="text-xs text-gray-500">Photo content</p>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <h3 className="text-sm font-medium text-gray-500">Videos</h3>
          <p className="text-2xl font-bold">{totalVideos}</p>
          <p className="text-xs text-gray-500">Video content</p>
        </div>
      </div>

      {/* Highlights grid */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-4">Your Highlights</h2>
        {highlights.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium mb-2">No highlights yet</h3>
            <p className="text-gray-500 mb-4 max-w-sm mx-auto">
              Create your first highlight to showcase special moments from your event.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Highlight
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {highlights.map((highlight) => (
              <div key={highlight.id} className="border rounded-lg p-4">
                <h3 className="font-medium">{highlight.title}</h3>
                <p className="text-sm text-gray-500">{highlight.category}</p>
                <p className="text-xs text-gray-400 mt-2">
                  {highlight.highlight_media.length} media items
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminHighlightsContent;