
import React, { useState } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminDataTable from '@/components/admin/AdminDataTable';
import { TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from '@/types';

// Mock data for attendees
const mockAttendees: User[] = [
  {
    id: '1',
    name: 'Alex Johnson',
    email: 'alex@example.com',
    role: 'attendee',
    photoUrl: 'https://i.pravatar.cc/150?img=1',
    niche: 'Frontend Development',
    networkingPreferences: ['Coffee Chats', 'Technical Discussions']
  },
  {
    id: '2',
    name: 'Morgan Smith',
    email: 'morgan@example.com',
    role: 'attendee',
    photoUrl: 'https://i.pravatar.cc/150?img=2',
    niche: 'UX Design',
    networkingPreferences: ['Portfolio Reviews', 'Design Critiques']
  },
  {
    id: '3',
    name: 'Jamie Wilson',
    email: 'jamie@example.com',
    role: 'attendee',
    photoUrl: 'https://i.pravatar.cc/150?img=3',
    niche: 'Data Science',
    networkingPreferences: ['Research Collaborations', 'Technical Discussions']
  },
  {
    id: '4',
    name: 'Taylor Brown',
    email: 'taylor@example.com',
    role: 'attendee',
    photoUrl: 'https://i.pravatar.cc/150?img=4',
    niche: 'Backend Development',
    networkingPreferences: ['Code Reviews', 'Technical Discussions']
  }
];

const AdminAttendees = () => {
  const [activeTab, setActiveTab] = useState<string>('all');

  // Filter attendees based on tab
  const getFilteredAttendees = () => {
    if (activeTab === 'all') return mockAttendees;
    return mockAttendees.filter(attendee => 
      attendee.networkingPreferences?.some(pref => 
        pref.toLowerCase().includes(activeTab.toLowerCase())
      )
    );
  };

  const columns = [
    {
      header: 'Attendee',
      accessorKey: 'name',
      cell: (value: string, row: User) => (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={row.photoUrl} alt={row.name} />
            <AvatarFallback>{row.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{row.name}</div>
            <div className="text-sm text-muted-foreground">{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Niche/Industry',
      accessorKey: 'niche',
      cell: (value: string) => value || 'Not specified',
    },
    {
      header: 'Networking Preferences',
      accessorKey: 'networkingPreferences',
      cell: (value: string[]) => (
        <div className="flex flex-wrap gap-1">
          {value && value.length > 0 ? (
            value.map((pref, i) => (
              <Badge key={i} variant="outline">{pref}</Badge>
            ))
          ) : (
            'None specified'
          )}
        </div>
      ),
    }
  ];

  const handleEditAttendee = (attendee: User) => {
    console.log('Edit attendee', attendee);
  };

  const handleDeleteAttendee = (attendee: User) => {
    console.log('Delete attendee', attendee);
  };

  return (
    <AdminLayout>
      <AdminPageHeader
        title="Attendees"
        description="Manage event attendees and their profiles"
        tabs={[
          { id: 'all', label: 'All Attendees' },
          { id: 'technical', label: 'Technical' },
          { id: 'design', label: 'Design' },
          { id: 'business', label: 'Business' },
        ]}
        defaultTab="all"
        onTabChange={setActiveTab}
      >
        <TabsContent value="all" className="space-y-4">
          <AdminDataTable
            columns={columns}
            data={getFilteredAttendees()}
            onEdit={handleEditAttendee}
            onDelete={handleDeleteAttendee}
          />
        </TabsContent>
        
        <TabsContent value="technical" className="space-y-4">
          <AdminDataTable
            columns={columns}
            data={getFilteredAttendees()}
            onEdit={handleEditAttendee}
            onDelete={handleDeleteAttendee}
          />
        </TabsContent>
        
        <TabsContent value="design" className="space-y-4">
          <AdminDataTable
            columns={columns}
            data={getFilteredAttendees()}
            onEdit={handleEditAttendee}
            onDelete={handleDeleteAttendee}
          />
        </TabsContent>
        
        <TabsContent value="business" className="space-y-4">
          <AdminDataTable
            columns={columns}
            data={getFilteredAttendees()}
            onEdit={handleEditAttendee}
            onDelete={handleDeleteAttendee}
          />
        </TabsContent>
      </AdminPageHeader>
    </AdminLayout>
  );
};

export default AdminAttendees;
