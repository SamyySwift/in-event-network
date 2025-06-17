import React, { useState } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import EventSelector from '@/components/admin/EventSelector';
import { Loader } from 'lucide-react';
import { useAdminAttendees } from '@/hooks/useAdminAttendees';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminEventContext, AdminEventProvider } from '@/hooks/useAdminEventContext';
import AttendeeHero from './components/AttendeeHero';
import AttendeeFilters from './components/AttendeeFilters';
import AttendeesList from './components/AttendeesList';
import AttendeeManagementSection from './components/AttendeeManagementSection';

const AdminAttendeesContent = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const { currentUser } = useAuth();
  const { selectedEvent, selectedEventId } = useAdminEventContext();
  const { attendees, isLoading, error } = useAdminAttendees();

  console.log('AdminAttendees - selectedEventId:', selectedEventId);
  console.log('AdminAttendees - attendees:', attendees);
  console.log('AdminAttendees - isLoading:', isLoading);
  console.log('AdminAttendees - error:', error);

  // Calculate metrics for stats cards
  const total = attendees.length;
  const technical = attendees.filter(a => a.role === 'technical').length;
  const business = attendees.filter(a => a.role === 'business').length;

  // Filter attendees based on search and role
  const filteredAttendees = attendees.filter(attendee => {
    const name = attendee.name || '';
    const email = attendee.email || '';
    
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || attendee.role === filterRole;
    return matchesSearch && matchesRole;
  });

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
            <svg className="h-8 w-8 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2v12a2 2 0 002 2z"/>
            </svg>
          </div>
          <p className="text-muted-foreground text-lg mb-2">No event selected</p>
          <p className="text-sm text-muted-foreground">Please select an event above to manage its attendees</p>
        </div>
      )}

      {/* Show loading state when an event is selected and loading */}
      {selectedEventId && isLoading && (
        <div className="space-y-8">
          <AttendeeHero
            eventName={selectedEvent?.name ?? "your event"}
            total={0}
            technical={0}
            business={0}
            loading
          />
          <div className="h-24 flex items-center justify-center">
            <Loader className="animate-spin" />
          </div>
        </div>
      )}

      {/* Show error state */}
      {selectedEventId && error && (
        <div className="text-center py-12">
          <div className="p-4 rounded-full bg-red-100 inline-block mb-4">
            <svg className="h-8 w-8 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <p className="text-red-600 text-lg mb-2">Error loading attendees</p>
          <p className="text-sm text-muted-foreground">{error?.message || 'Please try refreshing the page'}</p>
        </div>
      )}

      {/* Show content when event is selected and data is loaded */}
      {selectedEventId && !isLoading && !error && (
        <>
          <AttendeeHero
            eventName={selectedEvent?.name ?? ''}
            total={total}
            technical={technical}
            business={business}
            loading={false}
          />

          <AttendeeManagementSection eventName={selectedEvent?.name ?? ''}>
            <AttendeeFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filterRole={filterRole}
              setFilterRole={setFilterRole}
            />

            <AttendeesList
              filteredAttendees={filteredAttendees}
              totalAttendees={attendees.length}
              eventName={selectedEvent?.name ?? ''}
              searchTerm={searchTerm}
              filterRole={filterRole}
            />
          </AttendeeManagementSection>
        </>
      )}
    </div>
  );
};

const AdminAttendees = () => {
  return (
    <AdminLayout>
      <AdminEventProvider>
        <AdminAttendeesContent />
      </AdminEventProvider>
    </AdminLayout>
  );
};

export default AdminAttendees;
