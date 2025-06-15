
import React, { useState } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import FacilityStatsCards from "./components/FacilityStatsCards";
import FacilityCard from "./components/FacilityCard";
import CreateFacilityDialog from "@/components/admin/CreateFacilityDialog";
import EventSelector from "@/components/admin/EventSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useAdminFacilities, Facility } from "@/hooks/useAdminFacilities";
import { useAdminEventContext, AdminEventProvider } from "@/hooks/useAdminEventContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

// Helper: aggregate statistics
function getFacilityStats(facilities: Facility[]) {
  let withLocation = 0, withContact = 0;
  facilities.forEach(fac => {
    if (fac.location) withLocation++;
    if (fac.contact_type && fac.contact_type !== "none" && fac.contact_info) withContact++;
  });
  return {
    total: facilities.length,
    withLocation,
    withContact,
  };
}

const AdminFacilitiesContent = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const { selectedEventId, selectedEvent, adminEvents, isLoading: eventsLoading } = useAdminEventContext();
  const {
    facilities,
    isLoading,
    error,
    createFacility,
    deleteFacility,
    isCreating,
    isDeleting
  } = useAdminFacilities(selectedEventId || undefined);

  // Filter
  const filteredFacilities = facilities.filter((f) =>
    [f.name, f.description, f.location]
      .join(" ")
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  // Stats
  const stats = getFacilityStats(facilities);

  // Event missing/error states
  if (eventsLoading || isLoading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="flex justify-between items-center">
          <EventSelector />
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading facilities...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="flex justify-between items-center">
          <EventSelector />
        </div>
        <Alert variant="destructive" className="my-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load facilities. Please check your connection and try again.
            Error: {error.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (adminEvents.length === 0) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="flex justify-between items-center">
          <EventSelector />
        </div>
        <Alert className="my-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You need to create an event first before adding facilities.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

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
          <p className="text-sm text-muted-foreground">Please select an event above to manage facilities</p>
        </div>
      )}

      {/* Only show content when an event is selected */}
      {selectedEventId && (
        <>
          {/* Gradient Hero Section */}
          <div className="p-8 rounded-2xl bg-gradient-to-br from-primary-100 via-blue-100 to-indigo-50 text-primary-900 dark:text-white shadow-2xl shadow-primary/10 mb-2 relative overflow-hidden">
            <div className="absolute -top-12 -right-10 w-56 h-56 bg-white/10 rounded-full opacity-40 blur-2xl pointer-events-none"></div>
            <div className="absolute -bottom-14 -left-14 w-36 h-36 bg-white/20 rounded-full opacity-30 pointer-events-none"></div>
            <div className="relative z-10">
              <h1 className="text-4xl font-bold tracking-tight">Facilities Management</h1>
              <p className="mt-2 max-w-2xl text-primary-700 dark:text-primary-100">
                Manage facilities for <span className="font-semibold">{selectedEvent?.name}</span>.
              </p>
              <div className="mt-6">
                <FacilityStatsCards {...stats} loading={isLoading} />
              </div>
            </div>
          </div>

          {/* Quick Actions: Title, description, create btn */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">Facilities</h2>
              <p className="text-muted-foreground mt-1">Add, search, and manage your event facilities.</p>
            </div>
            <CreateFacilityDialog
              events={adminEvents}
              defaultEventId={selectedEventId}
              isCreating={isCreating}
              onSubmit={form => {
                createFacility({
                  name: form.name,
                  description: form.description,
                  location: form.location,
                  rules: form.rules,
                  contact_type: form.contactType,
                  contact_info: form.contactInfo,
                  icon_type: form.iconType,
                  event_id: form.eventId,
                  image_url: null,
                });
              }}
            >
              <Button>
                <Plus size={16} className="mr-1" />
                Add Facility
              </Button>
            </CreateFacilityDialog>
          </div>

          {/* Search Bar */}
          <div className="flex justify-between mb-4">
            <Input
              placeholder="Search facilities…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {/* Facilities List */}
          <div className="space-y-4">
            {filteredFacilities.length > 0 ? (
              filteredFacilities.map(facility => (
                <FacilityCard
                  key={facility.id}
                  facility={facility}
                  isDeleting={isDeleting}
                  onEdit={() => {/* can implement edit modal later */}}
                  onDelete={(facility) => deleteFacility(facility.id)}
                />
              ))
            ) : (
              <div className="text-center py-8">
                <Plus className="mx-auto h-12 w-12 text-muted-foreground opacity-30" />
                <h3 className="mt-4 text-lg font-medium">No facilities found</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  No facilities match your search criteria.
                </p>
                <CreateFacilityDialog
                  events={adminEvents}
                  defaultEventId={selectedEventId}
                  isCreating={isCreating}
                  onSubmit={form => {
                    createFacility({
                      name: form.name,
                      description: form.description,
                      location: form.location,
                      rules: form.rules,
                      contact_type: form.contactType,
                      contact_info: form.contactInfo,
                      icon_type: form.iconType,
                      event_id: form.eventId,
                      image_url: null,
                    });
                  }}
                >
                  <Button className="mt-4">
                    <Plus size={16} className="mr-1" />
                    Add Facility
                  </Button>
                </CreateFacilityDialog>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

const AdminFacilities = () => (
  <AdminLayout>
    <AdminEventProvider>
      <AdminFacilitiesContent />
    </AdminEventProvider>
  </AdminLayout>
);

export default AdminFacilities;
