
import React, { useState } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, Loader, Calendar, MapPin } from 'lucide-react';
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { Badge } from '@/components/ui/badge';
import { useAdminEvents } from '@/hooks/useAdminEvents';
import { useAuth } from '@/contexts/AuthContext';
import { ImageUpload } from '@/components/ui/image-upload';

type EventFormData = {
  name: string;
  description?: string;
  start_time: string;
  end_time: string;
  location?: string;
  image?: File;
};

const AdminEvents = () => {
  const [editingEvent, setEditingEvent] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const { currentUser } = useAuth();
  const { events, isLoading, createEvent, updateEvent, deleteEvent, isCreating, isUpdating, isDeleting } = useAdminEvents();

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<EventFormData>({
    defaultValues: {
      name: '',
      description: '',
      start_time: '',
      end_time: '',
      location: ''
    }
  });

  const onSubmit = (data: EventFormData) => {
    console.log('Submitting event data:', data);
    console.log('Current user:', currentUser?.id);
    
    // Ensure we have the required data
    if (!data.name || !data.start_time || !data.end_time) {
      console.error('Missing required fields:', { name: data.name, start_time: data.start_time, end_time: data.end_time });
      return;
    }

    const eventData = {
      ...data,
      host_id: currentUser?.id,
      image: selectedImage,
    };

    console.log('Final event data being sent:', eventData);

    if (editingEvent) {
      updateEvent({ id: editingEvent, ...eventData });
      setEditingEvent(null);
    } else {
      createEvent(eventData);
    }
    reset();
    setSelectedImage(null);
  };

  const handleEdit = (event: any) => {
    setEditingEvent(event.id);
    setValue('name', event.name);
    setValue('description', event.description || '');
    setValue('start_time', new Date(event.start_time).toISOString().slice(0, 16));
    setValue('end_time', new Date(event.end_time).toISOString().slice(0, 16));
    setValue('location', event.location || '');
    setSelectedImage(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      deleteEvent(id);
    }
  };

  const handleCancel = () => {
    setEditingEvent(null);
    setSelectedImage(null);
    reset();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isEventLive = (startTime: string, endTime: string) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);
    return now >= start && now <= end;
  };

  const isEventUpcoming = (startTime: string) => {
    const now = new Date();
    const start = new Date(startTime);
    return now < start;
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader className="h-8 w-8 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Events</h1>
        <p className="text-muted-foreground">
          Manage and schedule events for your attendees.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{editingEvent ? 'Edit Event' : 'Create New Event'}</CardTitle>
            <CardDescription>
              {editingEvent ? 'Update event information' : 'Add a new event to the schedule'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Event Name *</Label>
                <Input
                  id="name"
                  {...register("name", { required: "Event name is required" })}
                  placeholder="Enter event name"
                />
                {errors.name?.message && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Enter event description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_time">Start Time *</Label>
                  <Input
                    id="start_time"
                    type="datetime-local"
                    {...register("start_time", { required: "Start time is required" })}
                  />
                  {errors.start_time?.message && (
                    <p className="text-sm text-destructive">{errors.start_time.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_time">End Time *</Label>
                  <Input
                    id="end_time"
                    type="datetime-local"
                    {...register("end_time", { required: "End time is required" })}
                  />
                  {errors.end_time?.message && (
                    <p className="text-sm text-destructive">{errors.end_time.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  {...register("location")}
                  placeholder="Enter event location"
                />
              </div>

              <ImageUpload
                onImageSelect={setSelectedImage}
                label="Event Banner Image (Optional)"
              />

              <div className="flex gap-2">
                <Button type="submit" className="flex-1" disabled={isCreating || isUpdating}>
                  {(isCreating || isUpdating) && <Loader className="h-4 w-4 mr-2 animate-spin" />}
                  <Plus className="h-4 w-4 mr-2" />
                  {editingEvent ? 'Update Event' : 'Create Event'}
                </Button>
                {editingEvent && (
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Events</CardTitle>
            <CardDescription>
              {events.length} events in your schedule
            </CardDescription>
          </CardHeader>
          <CardContent>
            {events.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No events scheduled yet. Create your first event using the form.
              </p>
            ) : (
              <div className="space-y-4">
                {events.map((event) => (
                  <div key={event.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{event.name}</h3>
                          {isEventLive(event.start_time, event.end_time) && (
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Live</Badge>
                          )}
                          {isEventUpcoming(event.start_time) && (
                            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Upcoming</Badge>
                          )}
                        </div>
                        {event.description && (
                          <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                        )}
                        {event.banner_url && (
                          <img 
                            src={event.banner_url} 
                            alt="Event Banner" 
                            className="w-full h-32 object-cover rounded mb-2"
                          />
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(event.start_time)} - {formatDate(event.end_time)}
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {event.location}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleEdit(event)}
                          disabled={isUpdating}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDelete(event.id)}
                          disabled={isDeleting}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminEvents;
