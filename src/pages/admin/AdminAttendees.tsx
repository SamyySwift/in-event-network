
import React, { useState } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminDataTable from '@/components/admin/AdminDataTable';
import { TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAdminAttendees } from '@/hooks/useAdminAttendees';
import { useToast } from '@/hooks/use-toast';

const AdminAttendees = () => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const { attendees, isLoading } = useAdminAttendees();
  const { toast } = useToast();

  // Filter attendees based on tab
  const getFilteredAttendees = () => {
    if (activeTab === 'all') return attendees;
    return attendees.filter(attendee => {
      switch (activeTab) {
        case 'technical':
          return attendee.bio?.toLowerCase().includes('tech') || 
                 attendee.bio?.toLowerCase().includes('dev') ||
                 attendee.bio?.toLowerCase().includes('engineer');
        case 'design':
          return attendee.bio?.toLowerCase().includes('design') || 
                 attendee.bio?.toLowerCase().includes('ux') ||
                 attendee.bio?.toLowerCase().includes('ui');
        case 'business':
          return attendee.bio?.toLowerCase().includes('business') || 
                 attendee.bio?.toLowerCase().includes('management') ||
                 attendee.bio?.toLowerCase().includes('marketing');
        default:
          return true;
      }
    });
  };

  const columns = [
    {
      header: 'Attendee',
      accessorKey: 'name',
      cell: (value: string, row: any) => (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={row.photo_url} alt={row.name} />
            <AvatarFallback>{row.name?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{row.name || 'Unknown'}</div>
            <div className="text-sm text-muted-foreground">{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Event',
      accessorKey: 'event_name',
      cell: (value: string) => (
        <Badge variant="outline">{value}</Badge>
      ),
    },
    {
      header: 'Company',
      accessorKey: 'company',
      cell: (value: string) => value || 'Not specified',
    },
    {
      header: 'Joined',
      accessorKey: 'joined_at',
      cell: (value: string) => new Date(value).toLocaleDateString(),
    },
  ];

  const handleEditAttendee = (attendee: any) => {
    console.log('Edit attendee', attendee);
    toast({
      title: "Edit Attendee",
      description: "Edit functionality will be implemented soon",
    });
  };

  const handleDeleteAttendee = (attendee: any) => {
    console.log('Delete attendee', attendee);
    toast({
      title: "Delete Attendee",
      description: "Delete functionality will be implemented soon",
    });
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading attendees...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <AdminPageHeader
        title="Your Event Attendees"
        description={`Manage attendees registered for your events (${attendees.length} total)`}
        tabs={[
          { id: 'all', label: `All Attendees (${attendees.length})` },
          { id: 'technical', label: 'Technical' },
          { id: 'design', label: 'Design' },
          { id: 'business', label: 'Business' },
        ]}
        defaultTab="all"
        onTabChange={setActiveTab}
      >
        {['all', 'technical', 'design', 'business'].map(tabId => (
          <TabsContent key={tabId} value={tabId} className="space-y-4">
            <AdminDataTable
              columns={columns}
              data={getFilteredAttendees()}
              onEdit={handleEditAttendee}
              onDelete={handleDeleteAttendee}
            />
          </TabsContent>
        ))}
      </AdminPageHeader>
    </AdminLayout>
  );
};

export default AdminAttendees;
