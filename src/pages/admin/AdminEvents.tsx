import React, { useState, useMemo } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { useAdminEvents } from '@/hooks/useAdminEvents';
import EventStatsCards from './components/EventStatsCards';
import EventCard from './components/EventCard';
import CreateEventDialog from '@/components/admin/CreateEventDialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Calendar, Plus } from 'lucide-react';

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'live', label: 'Live' },
  { id: 'upcoming', label: 'Upcoming' },
  // { id: 'past', label: 'Past' }, // If needed later
];

function isLive(start: string, end: string) {
  const now = new Date();
  const s = new Date(start);
  const e = new Date(end);
  return now >= s && now <= e;
}
function isUpcoming(start: string) {
  const now = new Date();
  const s = new Date(start);
  return now < s;
}
// function isPast(end: string) { ... }

const AdminEvents = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any | null>(null);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");

  const {
    events, isLoading, createEvent, updateEvent, deleteEvent, isCreating, isUpdating, isDeleting
  } = useAdminEvents();

  // Stats
  const stats = useMemo(() => {
    let live = 0, upcoming = 0;
    events.forEach(event => {
      if (isLive(event.start_time, event.end_time)) live++;
      else if (isUpcoming(event.start_time)) upcoming++;
    });
    return {
      total: events.length,
      live,
      upcoming,
    };
  }, [events]);

  // Filtering logic
  const filteredEvents = useMemo(() => {
    let arr = events;
    if (tab === "live") {
      arr = arr.filter(event => isLive(event.start_time, event.end_time));
    } else if (tab === "upcoming") {
      arr = arr.filter(event => isUpcoming(event.start_time));
    }
    if (search.trim()) {
      const s = search.trim().toLowerCase();
      arr = arr.filter(e =>
        e.name.toLowerCase().includes(s) ||
        (e.description?.toLowerCase().includes(s)) ||
        (e.location?.toLowerCase().includes(s))
      );
    }
    return arr;
  }, [events, tab, search]);

  // Handlers
  const handleEdit = (event: any) => {
    setEditingEvent(event);
    setDialogOpen(true);
  };
  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      deleteEvent(id);
    }
  };
  const handleDialogSubmit = (data: any) => {
    if (editingEvent) {
      updateEvent({ id: editingEvent.id, ...data });
    } else {
      createEvent(data);
    }
    setDialogOpen(false);
    setEditingEvent(null);
  };
  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingEvent(null);
  };

  return (
    <AdminLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl min-h-[178px] p-0 shadow-soft border bg-gradient-to-br from-primary-100 via-blue-100 to-indigo-50 flex flex-col">
          {/* Floating orbs */}
          <div className="absolute left-8 top-6 w-36 h-36 bg-blue-300/40 rounded-full blur-3xl animate-float hidden md:block" />
          <div className="absolute right-2 -top-16 w-40 h-40 bg-indigo-300/40 rounded-full blur-2xl animate-float hidden md:block" />
          <div className="p-6 z-10 relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1 flex items-center gap-2">
                Event Management
              </h1>
              <p className="max-w-2xl text-muted-foreground">
                Create and manage your events with full control.
              </p>
            </div>
            <div className="shrink-0 w-full md:w-fit mt-2 md:mt-0">
              <EventStatsCards total={stats.total} live={stats.live} upcoming={stats.upcoming} loading={isLoading} />
            </div>
          </div>
        </div>

        {/* Quick actions section */}
        <div className="flex flex-col gap-4 mt-2">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-lg font-semibold">Your Events</h2>
              <span className="text-muted-foreground text-sm">Browse and filter all created events.</span>
            </div>
            <div className="flex gap-2 items-center flex-wrap">
              <Tabs value={tab} onValueChange={setTab}>
                <TabsList className="h-9 bg-muted/60">
                  {TABS.map(tabItem => (
                    <TabsTrigger value={tabItem.id} key={tabItem.id} className="px-3">{tabItem.label}</TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
              <Input
                type="text"
                className="max-w-sm ml-2"
                placeholder="Search events…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <Button className="ml-2" onClick={() => { setDialogOpen(true); setEditingEvent(null); }}>
                <Plus className="w-4 h-4 mr-1" />
                Create Event
              </Button>
            </div>
          </div>
          <div>
            {/* Event cards */}
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-muted-foreground">Loading events...</p>
                </div>
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="w-full flex flex-col justify-center items-center py-16 text-muted-foreground">
                <Calendar size={40} className="mb-3"/>
                <div className="mb-1">No events found!</div>
                <div className="text-sm">Try changing your filters or search term.</div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {filteredEvents.map(event => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dialog for creating/editing events */}
      <CreateEventDialog
        open={dialogOpen}
        onOpenChange={open => open ? setDialogOpen(true) : handleDialogClose()}
        onSubmit={handleDialogSubmit}
        isCreating={isCreating}
        isUpdating={isUpdating}
        editingEvent={editingEvent}
      />
    </AdminLayout>
  );
};

export default AdminEvents;
