
import React from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminDataTable from '@/components/admin/AdminDataTable';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User } from '@/types';

// Extend User type for admin roles
type AdminUser = User & {
  adminRole: 'owner' | 'admin' | 'moderator' | 'support';
  department?: string;
  lastActive?: string;
};

// Mock data for admin team
const mockAdminTeam: AdminUser[] = [
  {
    id: '1',
    name: 'Jane Doe',
    email: 'jane@eventcompany.com',
    role: 'attendee', // base role
    adminRole: 'owner',
    photoUrl: 'https://i.pravatar.cc/150?img=10',
    department: 'Management',
    lastActive: '2025-06-19T08:45:12Z'
  },
  {
    id: '2',
    name: 'John Smith',
    email: 'john@eventcompany.com',
    role: 'attendee',
    adminRole: 'admin',
    photoUrl: 'https://i.pravatar.cc/150?img=11',
    department: 'Operations',
    lastActive: '2025-06-18T16:30:45Z'
  },
  {
    id: '3',
    name: 'Emily Chen',
    email: 'emily@eventcompany.com',
    role: 'attendee',
    adminRole: 'moderator',
    photoUrl: 'https://i.pravatar.cc/150?img=12',
    department: 'Content',
    lastActive: '2025-06-19T09:15:22Z'
  },
  {
    id: '4',
    name: 'Michael Johnson',
    email: 'michael@eventcompany.com',
    role: 'attendee',
    adminRole: 'support',
    photoUrl: 'https://i.pravatar.cc/150?img=13',
    department: 'Technical Support',
    lastActive: '2025-06-17T11:05:38Z'
  },
  {
    id: '5',
    name: 'Sarah Williams',
    email: 'sarah@eventcompany.com',
    role: 'attendee',
    adminRole: 'moderator',
    photoUrl: 'https://i.pravatar.cc/150?img=14',
    department: 'Marketing',
    lastActive: '2025-06-18T14:22:51Z'
  }
];

const AdminTeam = () => {
  // Helper function to format date
  const formatLastActive = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    
    if (diffHours < 1) {
      return 'Just now';
    } else if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    }
  };

  // Get role badge styling
  const getRoleBadgeClass = (role: string) => {
    switch(role) {
      case 'owner':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
      case 'admin':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'moderator':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'support':
      default:
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
    }
  };

  const columns = [
    {
      header: 'Team Member',
      accessorKey: 'name',
      cell: (value: string, row: AdminUser) => (
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
      header: 'Role',
      accessorKey: 'adminRole',
      cell: (value: string) => (
        <Badge className={getRoleBadgeClass(value)}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </Badge>
      ),
    },
    {
      header: 'Department',
      accessorKey: 'department',
    },
    {
      header: 'Last Active',
      accessorKey: 'lastActive',
      cell: (value: string) => formatLastActive(value),
    }
  ];

  const handleAddTeamMember = () => {
    console.log('Add new team member');
  };

  const handleEditTeamMember = (member: AdminUser) => {
    console.log('Edit team member', member);
  };

  const handleDeleteTeamMember = (member: AdminUser) => {
    console.log('Delete team member', member);
  };

  return (
    <AdminLayout>
      <AdminPageHeader
        title="Team Management"
        description="Manage admin team members and permissions"
        actionLabel="Add Team Member"
        onAction={handleAddTeamMember}
      >
        <AdminDataTable
          columns={columns}
          data={mockAdminTeam}
          onEdit={handleEditTeamMember}
          onDelete={handleDeleteTeamMember}
        />
      </AdminPageHeader>
    </AdminLayout>
  );
};

export default AdminTeam;
