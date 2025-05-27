
import React, { useState } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminDataTable from '@/components/admin/AdminDataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Event } from '@/types';
import { format } from 'date-fns';

// Mock data for events
const mockEvents: Event[] = [
  {
    id: '1',
    name: 'TechConnect 2024',
    description: 'The premier networking event for tech professionals',
    startDate: '2025-06-15T09:00:00Z',
    endDate: '2025-06-15T18:00:00Z',
    bannerUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87',
    logoUrl: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43',
    website: 'https://techconnect2024.com',
    location: 'San Francisco Convention Center',
    hostId: 'host1',
    socialLinks: {
      twitter: '@techconnect2024',
      linkedin: 'techconnect-2024'
    },
    qrCode: 'QR_CODE_STRING',
    isEnded: false
  }
];

const EventForm = ({ onSubmit, initialData = null }) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: initialData || {
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      location: '',
      website: ''
    }
  });

  const onFormSubmit = (data) => {
    onSubmit(data);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label htmlFor="name">Event Name</Label>
        <Input 
          id="name" 
          placeholder="Enter event name" 
          {...register("name", { required: "Event name is required" })}
        />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea 
          id="description" 
          placeholder="Enter event description" 
          rows={3}
          {...register("description")}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date & Time</Label>
          <Input 
            id="startDate" 
            type="datetime-local"
            {...register("startDate", { required: "Start date is required" })}
          />
          {errors.startDate && <p className="text-sm text-destructive">{errors.startDate.message}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="endDate">End Date & Time</Label>
          <Input 
            id="endDate" 
            type="datetime-local"
            {...register("endDate", { required: "End date is required" })}
          />
          {errors.endDate && <p className="text-sm text-destructive">{errors.endDate.message}</p>}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input 
          id="location" 
          placeholder="Enter event location" 
          {...register("location")}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="website">Website</Label>
        <Input 
          id="website" 
          type="url"
          placeholder="https://example.com" 
          {...register("website")}
        />
      </div>
      
      <div className="flex justify-end pt-2">
        <Button type="submit">Create Event</Button>
      </div>
    </form>
  );
};

const AdminEvents = () => {
  const [events, setEvents] = useState(mockEvents);

  const columns = [
    {
      header: 'Event Name',
      accessorKey: 'name',
      cell: (value: string, row: Event) => (
        <div className="flex flex-col">
          <span className="font-medium">{value}</span>
          <span className="text-sm text-muted-foreground">{row.location}</span>
        </div>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'isEnded',
      cell: (value: boolean) => (
        <Badge variant={value ? 'secondary' : 'default'}>
          {value ? 'Ended' : 'Active'}
        </Badge>
      ),
    },
    {
      header: 'Start Date',
      accessorKey: 'startDate',
      cell: (value: string) => format(new Date(value), 'MMM d, yyyy h:mm a'),
    },
    {
      header: 'End Date',
      accessorKey: 'endDate',
      cell: (value: string) => format(new Date(value), 'MMM d, yyyy h:mm a'),
    }
  ];

  const handleCreateEvent = (eventData) => {
    const newEvent = {
      id: `${events.length + 1}`,
      ...eventData,
      hostId: 'current-host',
      isEnded: false
    };
    
    setEvents([...events, newEvent]);
    toast.success("Event created successfully!");
  };

  const handleEditEvent = (event: Event) => {
    console.log('Edit event', event);
    toast.info("Edit event dialog would open here");
  };

  const handleDeleteEvent = (event: Event) => {
    setEvents(events.filter(e => e.id !== event.id));
    toast.success("Event deleted successfully!");
  };

  return (
    <AdminLayout>
      <AdminPageHeader
        title="Events"
        description="Manage and organize your events"
        actionLabel="Create Event"
        actionForm={<EventForm onSubmit={handleCreateEvent} />}
      >
        <AdminDataTable
          columns={columns}
          data={events}
          onEdit={handleEditEvent}
          onDelete={handleDeleteEvent}
        />
      </AdminPageHeader>
    </AdminLayout>
  );
};

export default AdminEvents;
