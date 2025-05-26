import React, { useState } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminDataTable from '@/components/admin/AdminDataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { Announcement } from '@/types';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

// Mock data for announcements
const mockAnnouncements: Announcement[] = [
  {
    id: '1',
    title: 'Welcome to the Annual Tech Conference!',
    content: 'We\'re excited to welcome you to our annual tech conference. Check-in begins at 8 AM tomorrow.',
    createdAt: '2025-06-14T16:00:00Z',
    notificationType: 'in-app',
    duration: 48,
  },
  {
    id: '2',
    title: 'Schedule Change: Keynote Session',
    content: 'Please note that the keynote session has been moved to Hall B at 10 AM instead of Hall A.',
    createdAt: '2025-06-15T08:30:00Z',
    notificationType: 'push',
    duration: 3,
    imageUrl: 'https://example.com/schedule-change.jpg'
  },
  {
    id: '3',
    title: 'Networking Reception Tonight',
    content: 'Join us for the networking reception tonight at 6 PM in the Grand Ballroom.',
    createdAt: '2025-06-15T12:00:00Z',
    notificationType: 'email',
    duration: 6,
  }
];

const AnnouncementForm = ({ onSubmit, initialData = null }) => {
  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm({
    defaultValues: initialData || {
      title: '',
      content: '',
      notificationType: 'in-app',
      duration: 24,
      imageUrl: ''
    }
  });

  const notificationType = watch('notificationType');

  const onFormSubmit = (data) => {
    const announcementData = {
      ...data,
      createdAt: new Date().toISOString(),
      duration: parseInt(data.duration) || 0
    };
    
    onSubmit(announcementData);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label htmlFor="title">Announcement Title</Label>
        <Input 
          id="title" 
          placeholder="Enter announcement title" 
          {...register("title", { required: "Title is required" })}
        />
        {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="content">Content</Label>
        <Textarea 
          id="content" 
          placeholder="Enter announcement content" 
          rows={4}
          {...register("content", { required: "Content is required" })}
        />
        {errors.content && <p className="text-sm text-destructive">{errors.content.message}</p>}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="notificationType">Notification Type</Label>
          <Select 
            defaultValue="in-app" 
            onValueChange={(value) => setValue('notificationType', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select notification type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="in-app">In-App</SelectItem>
              <SelectItem value="push">Push Notification</SelectItem>
              <SelectItem value="email">Email</SelectItem>
            </SelectContent>
          </Select>
          <input type="hidden" {...register('notificationType')} />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="duration">Duration (hours, 0 for permanent)</Label>
          <Input 
            id="duration" 
            type="number" 
            min="0"
            defaultValue="24"
            {...register("duration", { valueAsNumber: true })}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="imageUrl">Image URL (optional)</Label>
        <Input 
          id="imageUrl" 
          placeholder="Enter image URL" 
          {...register("imageUrl")}
        />
      </div>
      
      <div className="flex justify-end pt-2">
        <Button type="submit">Create Announcement</Button>
      </div>
    </form>
  );
};

const AdminAnnouncements = () => {
  const [announcements, setAnnouncements] = useState(mockAnnouncements);

  const columns = [
    {
      header: 'Title',
      accessorKey: 'title',
      cell: (value: string, row: Announcement) => (
        <div className="font-medium">{value}</div>
      ),
    },
    {
      header: 'Created',
      accessorKey: 'createdAt',
      cell: (value: string) => format(new Date(value), 'MMM d, yyyy h:mm a'),
    },
    {
      header: 'Type',
      accessorKey: 'notificationType',
      cell: (value: string) => (
        <Badge className={
          value === 'push' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' :
          value === 'email' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' :
          'bg-green-100 text-green-800 hover:bg-green-200'
        }>
          {value?.toUpperCase() || 'IN-APP'}
        </Badge>
      ),
    },
    {
      header: 'Duration',
      accessorKey: 'duration',
      cell: (value: number) => value ? `${value} hours` : 'Permanent',
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (_: any, row: Announcement) => {
        const created = new Date(row.createdAt);
        const expires = row.duration 
          ? new Date(created.getTime() + row.duration * 60 * 60 * 1000) 
          : null;
        const now = new Date();
        
        const isActive = !expires || now < expires;
        
        return (
          <Badge className={isActive 
            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          }>
            {isActive ? 'Active' : 'Expired'}
          </Badge>
        );
      },
    },
  ];

  const handleCreateAnnouncement = (announcementData) => {
    const newAnnouncement = {
      id: `${announcements.length + 1}`,
      ...announcementData
    };
    
    setAnnouncements([...announcements, newAnnouncement]);
    toast.success("Announcement created successfully!");
  };

  const handleEditAnnouncement = (announcement: Announcement) => {
    console.log('Edit announcement', announcement);
    toast.info("Edit announcement dialog would open here");
  };

  const handleDeleteAnnouncement = (announcement: Announcement) => {
    setAnnouncements(announcements.filter(a => a.id !== announcement.id));
    toast.success("Announcement deleted successfully!");
  };

  return (
    <AdminLayout>
      <AdminPageHeader
        title="Announcements"
        description="Create and manage event announcements"
        actionLabel="Create Announcement"
        actionForm={<AnnouncementForm onSubmit={handleCreateAnnouncement} />}
      >
        <AdminDataTable
          columns={columns}
          data={announcements}
          onEdit={handleEditAnnouncement}
          onDelete={handleDeleteAnnouncement}
        />
      </AdminPageHeader>
    </AdminLayout>
  );
};

export default AdminAnnouncements;
