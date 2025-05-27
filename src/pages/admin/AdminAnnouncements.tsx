
import React, { useState } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminDataTable from '@/components/admin/AdminDataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Announcement } from '@/types';
import { format } from 'date-fns';

// Mock data for announcements
const mockAnnouncements: Announcement[] = [
  {
    id: '1',
    title: 'Welcome to TechConnect 2024!',
    content: 'We are excited to have you join us for this amazing networking event. Please check your schedule and don\'t miss the keynote at 9 AM.',
    createdAt: '2025-06-15T08:00:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87',
    duration: 300,
    notificationType: 'push'
  },
  {
    id: '2',
    title: 'Lunch Break Extended',
    content: 'Due to popular demand, we have extended the lunch break by 30 minutes. Please be back for the afternoon sessions at 2:30 PM.',
    createdAt: '2025-06-15T12:00:00Z',
    duration: 60,
    notificationType: 'in-app'
  },
  {
    id: '3',
    title: 'Networking Session Moved',
    content: 'The evening networking session has been moved to the rooftop garden. Enjoy the sunset while connecting with fellow attendees!',
    createdAt: '2025-06-15T16:30:00Z',
    duration: 120,
    notificationType: 'email'
  }
];

const AnnouncementForm = ({ onSubmit, initialData = null }) => {
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm({
    defaultValues: initialData || {
      title: '',
      content: '',
      duration: 60,
      notificationType: 'push'
    }
  });

  const onFormSubmit = (data) => {
    onSubmit(data);
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
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="duration">Duration (minutes)</Label>
          <Input 
            id="duration" 
            type="number"
            min="5"
            max="1440"
            {...register("duration", { 
              required: "Duration is required",
              min: { value: 5, message: "Duration must be at least 5 minutes" },
              max: { value: 1440, message: "Duration cannot exceed 24 hours" }
            })}
          />
          {errors.duration && <p className="text-sm text-destructive">{errors.duration.message}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="notificationType">Notification Type</Label>
          <Select defaultValue="push" onValueChange={(value) => setValue('notificationType', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select notification type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="push">Push Notification</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="in-app">In-App Only</SelectItem>
            </SelectContent>
          </Select>
          <input type="hidden" {...register('notificationType')} />
        </div>
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
    },
    {
      header: 'Content',
      accessorKey: 'content',
      cell: (value: string) => (
        <div className="max-w-xs truncate">
          {value}
        </div>
      ),
    },
    {
      header: 'Type',
      accessorKey: 'notificationType',
      cell: (value: string) => (
        <Badge variant={
          value === 'push' ? 'default' : 
          value === 'email' ? 'secondary' : 
          'outline'
        }>
          {value?.charAt(0).toUpperCase() + value?.slice(1)}
        </Badge>
      ),
    },
    {
      header: 'Duration',
      accessorKey: 'duration',
      cell: (value: number) => `${value} min`,
    },
    {
      header: 'Created',
      accessorKey: 'createdAt',
      cell: (value: string) => format(new Date(value), 'MMM d, yyyy h:mm a'),
    }
  ];

  const handleCreateAnnouncement = (announcementData) => {
    const newAnnouncement = {
      id: `${announcements.length + 1}`,
      ...announcementData,
      createdAt: new Date().toISOString()
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
        actionLabel="Add Announcement"
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
