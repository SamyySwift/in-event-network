
import React, { useState } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import EventSelector from '@/components/admin/EventSelector';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Users, Code, Briefcase, Loader, AlertTriangle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useAdminAttendees } from '@/hooks/useAdminAttendees';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminEventContext, AdminEventProvider } from '@/hooks/useAdminEventContext';
import AttendeeStatsCards from './components/AttendeeStatsCards';
import AttendeeCard from './components/AttendeeCard';

type AttendeeFormData = {
  name: string;
  email: string;
  role: 'technical' | 'business' | 'other';
};

const AdminAttendeesContent = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const { currentUser } = useAuth();
  const { selectedEvent, selectedEventId } = useAdminEventContext();
  const { attendees, isLoading } = useAdminAttendees(); // Only destructure available props

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AttendeeFormData>({
    defaultValues: {
      name: "",
      email: "",
      role: "technical",
    },
  });

  // Calculate metrics for stats cards
  const total = attendees.length;
  const technical = attendees.filter(a => a.role === 'technical').length;
  const business = attendees.filter(a => a.role === 'business').length;

  // Filter attendees based on search and role
  const filteredAttendees = attendees.filter(attendee => {
    const matchesSearch = attendee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         attendee.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || attendee.role === filterRole;
    return matchesSearch && matchesRole;
  });

  // Remove mutation and loading state handlers.
  // Remove the onSubmit since creation is not implemented in the hook.
  // Remove edit and delete handlers for now.
  // If you want to implement create/update/delete in the future, you should extend the hook and re-add these.

  if (isLoading) {
    return (
      <div className="flex flex-col gap-10">
        <div className="flex justify-between items-center">
          <EventSelector />
        </div>
        <div className="p-8 rounded-2xl bg-gradient-to-br from-primary-100 via-purple-100 to-blue-50 text-primary-900 dark:text-white shadow-2xl shadow-primary/10 mb-2 relative overflow-hidden">
          <div className="absolute -top-12 -right-10 w-56 h-56 bg-white/10 rounded-full opacity-40 blur-2xl pointer-events-none"></div>
          <div className="absolute -bottom-14 -left-14 w-36 h-36 bg-white/20 rounded-full opacity-30 pointer-events-none"></div>
          <div className="relative z-10">
            <h1 className="text-4xl font-bold tracking-tight">Attendees</h1>
            <p className="mt-2 max-w-2xl text-primary-700 dark:text-primary-100">
              Manage attendees for <span className="font-semibold">{selectedEvent?.name ?? "your event"}</span>.
            </p>
            <div className="mt-6">
              <AttendeeStatsCards total={0} technical={0} business={0} loading />
            </div>
          </div>
        </div>
        <div className="h-24 flex items-center justify-center"><Loader className="animate-spin" /></div>
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
            <svg className="h-8 w-8 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2v12a2 2 0 002 2z"/>
            </svg>
          </div>
          <p className="text-muted-foreground text-lg mb-2">No event selected</p>
          <p className="text-sm text-muted-foreground">Please select an event above to manage its attendees</p>
        </div>
      )}

      {/* Only show content when an event is selected */}
      {selectedEventId && (
        <>
          {/* Gradient Hero Section */}
          <div className="p-8 rounded-2xl bg-gradient-to-br from-primary-100 via-purple-100 to-blue-50 text-primary-900 dark:text-white shadow-2xl shadow-primary/10 mb-2 relative overflow-hidden">
            <div className="absolute -top-12 -right-10 w-56 h-56 bg-white/10 rounded-full opacity-40 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-14 -left-14 w-36 h-36 bg-white/20 rounded-full opacity-30 pointer-events-none" />
            <div className="relative z-10">
              <h1 className="text-4xl font-bold tracking-tight">Attendees</h1>
              <p className="mt-2 max-w-2xl text-primary-700 dark:text-primary-100">
                Manage attendees for <span className="font-semibold">{selectedEvent?.name ?? ''}</span>.
              </p>
              <div className="mt-6">
                <AttendeeStatsCards total={total} technical={technical} business={business} loading={isLoading} />
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-xl space-y-8 shadow-xl">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-fuchsia-400 via-purple-500 to-indigo-600 shadow-md">
                  <Users className="w-6 h-6 text-white" />
                </span>
                <div>
                  <div className="uppercase text-xs font-bold text-primary-600 tracking-wide">Attendees</div>
                  <div className="text-lg font-semibold text-primary-900 dark:text-primary-100">
                    {selectedEvent?.name ?? ''}
                  </div>
                </div>
              </div>
            </div>

            {/* Add Attendee Form (disabled for now, as creation not implemented) */}
            <Card className="mb-6 glass-card bg-gradient-to-br from-white/90 via-primary-50/70 to-primary-100/60 transition-all animate-fade-in shadow-lg">
              <CardHeader>
                <CardTitle>Add New Attendee (Coming soon)</CardTitle>
                <CardDescription>
                  Manual addition of attendees is currently not available in this admin panel.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Form is removed */}
                <div className="text-muted-foreground">
                  Please use the event registration link to add attendees.
                </div>
              </CardContent>
            </Card>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search attendees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Attendees List */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Current Attendees</CardTitle>
                  <CardDescription>
                    {filteredAttendees.length} of {attendees.length} attendees for {selectedEvent?.name ?? ''}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {filteredAttendees.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      {searchTerm || filterRole !== 'all' 
                        ? 'No attendees match your search criteria.'
                        : 'No attendees registered yet for this event.'
                      }
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {filteredAttendees.map((attendee) => (
                        <AttendeeCard
                          key={attendee.id}
                          attendee={attendee}
                          // Remove isUpdating and isDeleting props, as they are not on AttendeeCardProps and not used now
                          onEdit={() => {}} // no-op
                          onDelete={() => {}} // no-op
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
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
