import React, { useState } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import CreatePollDialog from "@/components/admin/CreatePollDialog";
import EventSelector from "@/components/admin/EventSelector";
import PollStatsCards from "./components/PollStatsCards";
import PollCard from "./components/PollCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAdminPolls, Poll } from "@/hooks/useAdminPolls";
import { useAdminEventContext, AdminEventProvider } from "@/hooks/useAdminEventContext";
import { useToast } from "@/hooks/use-toast";

const AdminPollsContent = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const { selectedEventId, selectedEvent } = useAdminEventContext();
  const { polls, isLoading, updatePoll, deletePoll, isDeleting } = useAdminPolls(selectedEventId || undefined);

  // Stats for cards
  const total = polls.length;
  const active = polls.filter((p) => p.is_active).length;
  const totalVotes = polls.reduce((acc, poll) => {
    return acc + poll.options.reduce((sum, o) => sum + (o.votes || 0), 0);
  }, 0);

  // Filter polls based on search query
  const filteredPolls = polls.filter((poll) =>
    poll.question.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEditPoll = (poll: Poll) => {
    toast({
      title: "Edit functionality",
      description: "Poll editing will be available in the next update"
    });
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

  if (!selectedEvent) {
    return (
      <div className="flex flex-col gap-5">
        <div className="border rounded-lg p-4 bg-card">
          <EventSelector />
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Plus className="mx-auto h-12 w-12 text-muted-foreground opacity-30" />
            <p className="mt-2 text-muted-foreground">Please select an event to manage polls</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8 animate-fade-in">
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
            <p className="text-muted-foreground mt-1">
              Create and manage polls for your event.
            </p>
          </div>
          <CreatePollDialog>
            <Button>
              <Plus size={16} className="mr-1" />
              Create Poll
            </Button>
          </CreatePollDialog>
        </div>

        {/* Search */}
        <div className="flex justify-between mb-4">
          <Input 
            placeholder="Search polls..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
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
      </div>
    </AdminLayout>
  );
};

const AdminPolls = () => {
  return (
    <AdminEventProvider>
      <AdminPollsContent />
    </AdminEventProvider>
  );
};

export default AdminPolls;
