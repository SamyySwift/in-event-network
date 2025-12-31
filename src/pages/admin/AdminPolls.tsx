
import React, { useState } from "react";
// Remove this import:
// import AdminLayout from "@/components/layouts/AdminLayout";
import CreatePollDialog from "@/components/admin/CreatePollDialog";
import EventSelector from "@/components/admin/EventSelector";
import EditPollDialog from "@/components/admin/EditPollDialog";
import PollStatsCards from "./components/PollStatsCards";
import PollCard from "./components/PollCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Share2, Copy, ExternalLink } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAdminPolls, Poll } from "@/hooks/useAdminPolls";
import { useAdminEventContext } from "@/hooks/useAdminEventContext";
import { useToast } from "@/hooks/use-toast";
import PaymentGuard from '@/components/payment/PaymentGuard';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const AdminPollsContent = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const { selectedEventId, selectedEvent } = useAdminEventContext();
  const { polls, isLoading, updatePoll, deletePoll, isDeleting } = useAdminPolls(selectedEventId || undefined);
  const total = polls.length;

  // Stats for cards
  const active = polls.filter((p) => p.is_active).length;
  const totalVotes = polls.reduce((acc, poll) => {
    return acc + poll.options.reduce((sum, o) => sum + (o.votes || 0), 0);
  }, 0);

  // Add: edit state
  const [editingPoll, setEditingPoll] = useState<Poll | null>(null);

  // Filter polls based on search query
  const filteredPolls = polls.filter((poll) =>
    poll.question.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEditPoll = (poll: Poll) => {
    // Open edit dialog instead of toast
    setEditingPoll(poll);
  };

  const handleDeletePoll = (poll: Poll) => {
    deletePoll(poll.id);
  };

  const handleTogglePollActive = (poll: Poll) => {
    updatePoll({
      id: poll.id,
      is_active: !poll.is_active
    });
  };

  const handleToggleShowResults = (poll: Poll) => {
    updatePoll({
      id: poll.id,
      show_results: !poll.show_results
    });
  };

  // Add: share link dialog state and helpers
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  const generateShareableLink = () => {
    if (!selectedEventId) return '';
    const baseUrl = window.location.origin;
    return `${baseUrl}/live-polls/${selectedEventId}`;
  };

  const copyShareableLink = () => {
    const link = generateShareableLink();
    navigator.clipboard.writeText(link);
    toast({
      title: "Link copied!",
      description: "Shareable link has been copied to clipboard",
    });
  };

  const openInNewTab = () => {
    const link = generateShareableLink();
    window.open(link, '_blank');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Event Selector */}
      <div className="flex justify-between items-center">
        <EventSelector />
      </div>

      {/* Show message when no event is selected */}
      {!selectedEventId && (
        <div className="text-center py-12">
          <div className="p-4 rounded-full bg-primary/10 inline-block mb-4">
            <Plus className="h-8 w-8 text-primary" />
          </div>
          <p className="text-muted-foreground text-lg mb-2">No event selected</p>
          <p className="text-sm text-muted-foreground">Please select an event above to manage polls</p>
        </div>
      )}

      {/* Only show content when an event is selected */}
      {selectedEventId && (
        <PaymentGuard 
          eventId={selectedEventId} 
          eventName={selectedEvent?.name || 'this event'}
          feature="Polls & Surveys"
        >
          {/* Gradient Hero Section */}
          <div className="p-8 rounded-2xl bg-gradient-to-br from-primary-100 via-blue-100 to-indigo-50 text-primary-900 dark:text-white shadow-2xl shadow-primary/10 mb-2 relative overflow-hidden">
            <div className="absolute -top-12 -right-10 w-56 h-56 bg-white/10 rounded-full opacity-40 blur-2xl pointer-events-none"></div>
            <div className="absolute -bottom-14 -left-14 w-36 h-36 bg-white/20 rounded-full opacity-30 pointer-events-none"></div>
            <div className="relative z-10">
              <h1 className="text-4xl font-bold tracking-tight">Polls & Surveys</h1>
              <p className="mt-2 max-w-2xl text-primary-700 dark:text-primary-100">
                Manage polls for <span className="font-semibold">{selectedEvent?.name}</span>.
              </p>
              <div className="mt-6">
                <PollStatsCards total={total} active={active} totalVotes={totalVotes} loading={isLoading} />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className={`flex ${isMobile ? "flex-col gap-4" : "flex-row items-center justify-between"}`}>
            <div>
              <h2 className="text-2xl font-bold">Polls</h2>
              <p className="text-muted-foreground">Create and manage polls for your event.</p>
            </div>
            <CreatePollDialog>
              <Button>
                <Plus size={16} className="mr-1" />
                Create Poll
              </Button>
            </CreatePollDialog>
          </div>

          {/* Search */}
          <div className="flex justify-between items-center mb-4">
            <Input 
              placeholder="Search polls..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
            <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 hover-scale">
                  <Share2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Share Live View</span>
                  <span className="sm:hidden">Share</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg max-w-[95vw] w-full mx-4 rounded-xl border-0 bg-gradient-to-br from-background via-background to-primary/5 shadow-2xl">
                <DialogHeader className="space-y-3 pb-4">
                  <DialogTitle className="flex items-center gap-3 text-xl font-semibold">
                    <div className="p-2 rounded-full bg-primary/10">
                      <Share2 className="h-5 w-5 text-primary" />
                    </div>
                    Share Live Poll Results
                  </DialogTitle>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Share this link so anyone can view live poll results in real-time without logging in.
                  </p>
                </DialogHeader>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Shareable Link</label>
                    <div className="relative">
                      <div className="flex items-center rounded-lg border border-border bg-muted/50 p-3 pr-12 min-h-[44px] overflow-hidden">
                        <span className="text-sm text-foreground break-all font-mono leading-relaxed max-w-full">
                          {generateShareableLink()}
                        </span>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={copyShareableLink} 
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 px-3 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                      >
                        <Copy className="h-3.5 w-3.5" />
                        <span className="sr-only">Copy link</span>
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <Button 
                      onClick={openInNewTab} 
                      variant="outline" 
                      className="flex-1 gap-2 h-11 border-primary/20 hover:border-primary/40 hover:bg-primary/5"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Preview Live View
                    </Button>
                    <Button 
                      onClick={() => setShareDialogOpen(false)} 
                      className="flex-1 h-11 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                    >
                      Done
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          {/* Polls List */}
          <div className="space-y-4">
            {filteredPolls.length > 0 ? (
              filteredPolls.map((poll) => (
                <PollCard
                  key={poll.id}
                  poll={poll}
                  isDeleting={isDeleting}
                  onEdit={handleEditPoll}
                  onDelete={handleDeletePoll}
                  onToggleActive={handleTogglePollActive}
                  onToggleShowResults={handleToggleShowResults}
                />
              ))
            ) : (
              <div className="col-span-2 text-center py-8">
                <Plus className="mx-auto h-12 w-12 text-muted-foreground opacity-30" />
                <h3 className="mt-4 text-lg font-medium">No polls found</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  No polls match your search criteria.
                </p>
                <CreatePollDialog>
                  <Button className="mt-4">
                    <Plus size={16} className="mr-1" />
                    Create Poll
                  </Button>
                </CreatePollDialog>
              </div>
            )}
          </div>
        </PaymentGuard>
      )}

      {/* Edit Poll Dialog */}
      {editingPoll && (
        <EditPollDialog
          open={!!editingPoll}
          onOpenChange={(open) => !open && setEditingPoll(null)}
          poll={editingPoll}
        />
      )}
    </div>
  );
};

const AdminPolls = AdminPollsContent;

export default AdminPolls;
