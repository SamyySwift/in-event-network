
import React, { useState, useMemo } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import EventSelector from '@/components/admin/EventSelector';
import { AdminEventProvider, useAdminEventContext } from '@/hooks/useAdminEventContext';
import { useAdminAttendees } from '@/hooks/useAdminAttendees';
import AttendeeStatsCards from './components/AttendeeStatsCards';
import AttendeeCard from './components/AttendeeCard';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Users } from "lucide-react";
import { useToast } from '@/hooks/use-toast';

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'technical', label: 'Technical' },
  { id: 'design', label: 'Design' },
  { id: 'business', label: 'Business' },
  { id: 'recent', label: 'Recent' },
];

function getCategory(attendee) {
  const txt = attendee.bio?.toLowerCase() || "";
  if (txt.includes("tech") || txt.includes("dev") || txt.includes("engineer")) return "technical";
  if (txt.includes("design") || txt.includes("ux") || txt.includes("ui")) return "design";
  if (txt.includes("business") || txt.includes("management") || txt.includes("marketing")) return "business";
  return "other";
}

const AdminAttendeesContent = () => {
  const { selectedEvent } = useAdminEventContext();
  const { attendees, isLoading } = useAdminAttendees();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [search, setSearch] = useState("");

  // Stats calculation
  const stats = useMemo(() => {
    let technical = 0, business = 0;
    attendees.forEach(a => {
      const cat = getCategory(a);
      if (cat === "technical") technical++;
      if (cat === "business") business++;
    });
    return {
      total: attendees.length,
      technical,
      business,
    };
  }, [attendees]);

  // Filtering by tab/category
  const filteredAttendees = useMemo(() => {
    let result = attendees;
    if (activeTab !== 'all') {
      if (activeTab === "recent") {
        result = [...attendees].sort((a, b) => new Date(b.joined_at).getTime() - new Date(a.joined_at).getTime());
      } else {
        result = attendees.filter(a => getCategory(a) === activeTab);
      }
    }
    if (search.trim()) {
      const s = search.trim().toLowerCase();
      result = result.filter(a =>
        a.name.toLowerCase().includes(s) ||
        a.email.toLowerCase().includes(s) ||
        a.company?.toLowerCase().includes(s) ||
        a.bio?.toLowerCase().includes(s)
      );
    }
    return result;
  }, [attendees, activeTab, search]);

  // Actions
  const handleEditAttendee = (attendee: any) => {
    toast({
      title: "Edit Attendee",
      description: "Edit functionality will be implemented soon",
    });
  };

  const handleDeleteAttendee = (attendee: any) => {
    toast({
      title: "Delete Attendee",
      description: "Delete functionality will be implemented soon",
    });
  };

  // UI states
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-28">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading attendees...</p>
        </div>
      </div>
    );
  }
  if (!selectedEvent) {
    return (
      <div className="flex flex-col gap-5">
        <div className="border rounded-lg p-4 bg-card">
          <EventSelector />
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="mt-2 text-muted-foreground">Please select an event to view attendees</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Gradient Hero Section */}
      <div className="relative overflow-hidden rounded-2xl min-h-[178px] p-0 shadow-soft border bg-gradient-to-br from-primary-100 via-blue-100 to-indigo-50 flex flex-col">
        {/* Floating orbs */}
        <div className="absolute left-8 top-6 w-36 h-36 bg-blue-300/40 rounded-full blur-3xl animate-float hidden md:block" />
        <div className="absolute right-2 -top-16 w-40 h-40 bg-indigo-300/40 rounded-full blur-2xl animate-float hidden md:block" />
        <div className="p-6 z-10 relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1 flex items-center gap-2">Event Attendees</h1>
            <p className="max-w-2xl text-muted-foreground">
              Manage registered attendees for <span className="font-semibold">{selectedEvent ? selectedEvent.name : '-'}</span>.  
              View attendee details, filter by role, and manage access.
            </p>
            <div className="mt-2">
              <EventSelector />
            </div>
          </div>
          <div className=" shrink-0 w-full md:w-fit mt-2 md:mt-0">
            <AttendeeStatsCards total={stats.total} technical={stats.technical} business={stats.business} loading={isLoading}/>
          </div>
        </div>
      </div>

      {/* Quick actions section */}
      <div className="flex flex-col gap-4 mt-2">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-lg font-semibold">Attendees</h2>
            <span className="text-muted-foreground text-sm">Browse and filter all registered attendees.</span>
          </div>
          <div className="flex gap-2 items-center flex-wrap">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="h-9 bg-muted/60">
                {TABS.map(tab => (
                  <TabsTrigger value={tab.id} key={tab.id} className="px-3">{tab.label}</TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <Input
              type="text"
              className="max-w-sm ml-2"
              placeholder="Search attendees…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div>
          {/* Cards */}
          {
            filteredAttendees.length === 0 ? (
              <div className="w-full flex flex-col justify-center items-center py-16 text-muted-foreground">
                <Users size={40} className="mb-3"/>
                <div className="mb-1">No attendees found for this event!</div>
                <div className="text-sm">Try changing your filters or search term.</div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {filteredAttendees.map(attendee => (
                  <AttendeeCard
                    key={attendee.id}
                    attendee={attendee}
                    onEdit={handleEditAttendee}
                    onDelete={handleDeleteAttendee}
                  />
                ))}
              </div>
            )
          }
        </div>
      </div>
    </div>
  );
};

const AdminAttendees = () => (
  <AdminLayout>
    <AdminEventProvider>
      <AdminAttendeesContent />
    </AdminEventProvider>
  </AdminLayout>
);

export default AdminAttendees;
