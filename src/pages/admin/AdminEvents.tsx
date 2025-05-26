import React, { useState } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminDataTable from '@/components/admin/AdminDataTable';
import { TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { Event } from '@/types';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock data for events
const mockEvents: Event[] = [
  {
    id: '1',
    name: 'Annual Tech Conference 2025',
    description: 'The largest tech conference in the region',
    startDate: '2025-06-15T09:00:00Z',
    endDate: '2025-06-17T18:00:00Z',
    bannerUrl: 'https://example.com/banner1.jpg',
    logoUrl: 'https://example.com/logo1.png',
    website: 'https://techconf2025.com',
    location: 'San Francisco Convention Center',
    hostId: 'host1'
  },
  {
    id: '2',
    name: 'Developer Meetup',
    description: 'Monthly developer networking event',
    startDate: '2025-05-25T18:00:00Z',
    endDate: '2025-05-25T21:00:00Z',
    location: 'Downtown Coworking Space',
    hostId: 'host1'
  },
  {
    id: '3',
    name: 'Product Design Summit',
    description: 'Summit for product designers and UX professionals',
    startDate: '2025-07-10T09:00:00Z',
    endDate: '2025-07-11T17:00:00Z',
    bannerUrl: 'https://example.com/banner3.jpg',
    location: 'Design Hub',
    hostId: 'host2'
  }
];

const EventForm = ({ onSubmit, initialData = null }) => {
  const [startDate, setStartDate] = useState<Date | undefined>(
    initialData?.startDate ? new Date(initialData.startDate) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    initialData?.endDate ? new Date(initialData.endDate) : undefined
  );

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: initialData || {
      name: '',
      description: '',
      location: '',
      website: '',
      bannerUrl: '',
      logoUrl: ''
    }
  });

  const onFormSubmit = (data) => {
    if (!startDate) {
      toast.error("Start date is required");
      return;
    }
    if (!endDate) {
      toast.error("End date is required");
      return;
    }

    const eventData = {
      ...data,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      hostId: 'host1' // Default host ID
    };
    
    onSubmit(eventData);
    reset();
    setStartDate(undefined);
    setEndDate(undefined);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label htmlFor="name">Event Name</Label>
        <Input 
          id="name" 
          placeholder="Enter event name" 
          {...register("name", { required: "Name is required" })}
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Start Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="space-y-2">
          <Label>End Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input 
          id="location" 
          placeholder="Enter event location" 
          {...register("location", { required: "Location is required" })}
        />
        {errors.location && <p className="text-sm text-destructive">{errors.location.message}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="website">Website (optional)</Label>
        <Input 
          id="website" 
          placeholder="https://example.com" 
          {...register("website")}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="bannerUrl">Banner URL (optional)</Label>
          <Input 
            id="bannerUrl" 
            placeholder="Enter banner image URL" 
            {...register("bannerUrl")}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="logoUrl">Logo URL (optional)</Label>
          <Input 
            id="logoUrl" 
            placeholder="Enter logo image URL" 
            {...register("logoUrl")}
          />
        </div>
      </div>
      
      <div className="flex justify-end pt-2">
        <Button type="submit">Save Event</Button>
      </div>
    </form>
  );
};

const AdminEvents = () => {
  const [events, setEvents] = useState(mockEvents);
  const [activeTab, setActiveTab] = useState<string>('upcoming');

  // Event status helper function
  const getEventStatus = (event: Event) => {
    const now = new Date();
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);
    
    if (now < startDate) return 'upcoming';
    if (now > endDate) return 'past';
    return 'ongoing';
  };

  // Filter events based on tab
  const filteredEvents = events.filter(event => {
    if (activeTab === 'all') return true;
    return getEventStatus(event) === activeTab;
  });

  const columns = [
    {
      header: 'Name',
      accessorKey: 'name',
      cell: (value: string, row: Event) => (
        <div className="font-medium">{value}</div>
      ),
    },
    {
      header: 'Date',
      accessorKey: 'startDate',
      cell: (value: string, row: Event) => (
        <div>
          {format(new Date(row.startDate), 'MMM d, yyyy')}
          {row.startDate !== row.endDate && (
            <> – {format(new Date(row.endDate), 'MMM d, yyyy')}</>
          )}
        </div>
      ),
    },
    {
      header: 'Location',
      accessorKey: 'location',
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (_: any, row: Event) => {
        const status = getEventStatus(row);
        return (
          <Badge className={
            status === 'upcoming' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' :
            status === 'ongoing' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
            'bg-gray-100 text-gray-800 hover:bg-gray-200'
          }>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        );
      },
    },
  ];

  const handleCreateEvent = (eventData) => {
    const newEvent = {
      id: `${events.length + 1}`,
      ...eventData
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
        description="Create and manage your events"
        actionLabel="Create Event"
        actionForm={<EventForm onSubmit={handleCreateEvent} />}
        tabs={[
          { id: 'all', label: 'All Events' },
          { id: 'upcoming', label: 'Upcoming' },
          { id: 'ongoing', label: 'Ongoing' },
          { id: 'past', label: 'Past' },
        ]}
        defaultTab="upcoming"
        onTabChange={setActiveTab}
      >
        <TabsContent value="all" className="space-y-4">
          <AdminDataTable
            columns={columns}
            data={events}
            onEdit={handleEditEvent}
            onDelete={handleDeleteEvent}
          />
        </TabsContent>
        
        <TabsContent value="upcoming" className="space-y-4">
          <AdminDataTable
            columns={columns}
            data={filteredEvents}
            onEdit={handleEditEvent}
            onDelete={handleDeleteEvent}
          />
        </TabsContent>
        
        <TabsContent value="ongoing" className="space-y-4">
          <AdminDataTable
            columns={columns}
            data={filteredEvents}
            onEdit={handleEditEvent}
            onDelete={handleDeleteEvent}
          />
        </TabsContent>
        
        <TabsContent value="past" className="space-y-4">
          <AdminDataTable
            columns={columns}
            data={filteredEvents}
            onEdit={handleEditEvent}
            onDelete={handleDeleteEvent}
          />
        </TabsContent>
      </AdminPageHeader>
    </AdminLayout>
  );
};

export default AdminEvents;
