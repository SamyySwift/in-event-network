import React, { useState } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, Loader, Calendar, MapPin, Users, Clock, Lock } from 'lucide-react';
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { Badge } from '@/components/ui/badge';
import { useAdminEvents } from '@/hooks/useAdminEvents';
import { useAuth } from '@/contexts/AuthContext';
import { ImageUpload } from '@/components/ui/image-upload';
import { usePayment } from '@/hooks/usePayment';
import EventQRCode from '@/components/admin/EventQRCode';

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
  const { isEventPaid } = usePayment();

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

  const liveEvents = events.filter(event => isEventLive(event.start_time, event.end_time));
  const upcomingEvents = events.filter(event => isEventUpcoming(event.start_time));

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8 animate-fade-in px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="p-4 sm:p-6 lg:p-8 rounded-2xl bg-gradient-to-br from-blue-600 via-primary-500 to-blue-400 text-white shadow-2xl shadow-primary/20 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full opacity-50"></div>
          <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-white/10 rounded-full opacity-50"></div>
          
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">Event Management</h1>
                <p className="text-white/80 mt-1 text-sm sm:text-base">Create and manage your events</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-6 sm:mt-8">
              <div className="bg-white/10 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-white/70">Total Events</p>
                    <p className="text-2xl sm:text-3xl font-bold text-white">{events.length}</p>
                  </div>
                  <div className="p-2 sm:p-3 rounded-lg bg-green-500/20">
                    <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-green-200" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-white/70">Live Events</p>
                    <p className="text-2xl sm:text-3xl font-bold text-green-200">{liveEvents.length}</p>
                  </div>
                  <div className="p-2 sm:p-3 rounded-lg bg-green-500/20">
                    <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-green-200" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-white/20 sm:col-span-2 lg:col-span-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-white/70">Upcoming Events</p>
                    <p className="text-2xl sm:text-3xl font-bold text-blue-200">{upcomingEvents.length}</p>
                  </div>
                  <div className="p-2 sm:p-3 rounded-lg bg-blue-500/20">
                    <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-200" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
          {/* Event Creation/Edit Form */}
          <Card className="glass-card hover:shadow-xl hover:shadow-primary/10 transition-all duration-300">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 shadow-md shadow-blue-500/20">
                  <Plus className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg sm:text-xl">{editingEvent ? 'Edit Event' : 'Create New Event'}</CardTitle>
                  <CardDescription className="text-muted-foreground text-sm">
                    {editingEvent ? 'Update event information' : 'Add a new event to the schedule'}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">Event Name *</Label>
                  <Input
                    id="name"
                    {...register("name", { required: "Event name is required" })}
                    placeholder="Enter event name"
                    className="bg-background/50 border-primary/20 focus:border-primary/50 transition-colors"
                  />
                  {errors.name?.message && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                  <Textarea
                    id="description"
                    {...register("description")}
                    placeholder="Enter event description"
                    rows={3}
                    className="bg-background/50 border-primary/20 focus:border-primary/50 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_time" className="text-sm font-medium">Start Time *</Label>
                    <Input
                      id="start_time"
                      type="datetime-local"
                      {...register("start_time", { required: "Start time is required" })}
                      className="bg-background/50 border-primary/20 focus:border-primary/50 transition-colors"
                    />
                    {errors.start_time?.message && (
                      <p className="text-sm text-destructive">{errors.start_time.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="end_time" className="text-sm font-medium">End Time *</Label>
                    <Input
                      id="end_time"
                      type="datetime-local"
                      {...register("end_time", { required: "End time is required" })}
                      className="bg-background/50 border-primary/20 focus:border-primary/50 transition-colors"
                    />
                    {errors.end_time?.message && (
                      <p className="text-sm text-destructive">{errors.end_time.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="text-sm font-medium">Location</Label>
                  <Input
                    id="location"
                    {...register("location")}
                    placeholder="Enter event location"
                    className="bg-background/50 border-primary/20 focus:border-primary/50 transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Event Banner Image (Optional)</Label>
                  <ImageUpload
                    onImageSelect={setSelectedImage}
                    label=""
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button 
                    type="submit" 
                    className="flex-1 bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-md hover:shadow-lg" 
                    disabled={isCreating || isUpdating}
                  >
                    {(isCreating || isUpdating) && <Loader className="h-4 w-4 mr-2 animate-spin" />}
                    <Plus className="h-4 w-4 mr-2" />
                    {editingEvent ? 'Update Event' : 'Create Event'}
                  </Button>
                  {editingEvent && (
                    <Button type="button" variant="outline" onClick={handleCancel} className="border-primary/20 hover:bg-primary/5">
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Events List */}
          <Card className="glass-card hover:shadow-xl hover:shadow-primary/10 transition-all duration-300">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-violet-400 shadow-md shadow-purple-500/20">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg sm:text-xl">Your Events</CardTitle>
                  <CardDescription className="text-muted-foreground text-sm">
                    {events.length} events in your schedule
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              {events.length === 0 ? (
                <div className="text-center py-12">
                  <div className="p-4 rounded-full bg-primary/10 inline-block mb-4">
                    <Calendar className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-muted-foreground text-lg mb-2">No events scheduled yet</p>
                  <p className="text-sm text-muted-foreground">Create your first event using the form on the left</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                  {events.map((event) => (
                    <div key={event.id} className="group p-3 sm:p-4 rounded-xl border border-primary/10 bg-gradient-to-br from-background to-primary/5 hover:from-primary/5 hover:to-primary/10 transition-all duration-300 hover:shadow-lg">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                            <h3 className="font-semibold text-base sm:text-lg text-foreground group-hover:text-primary transition-colors truncate">{event.name}</h3>
                            <div className="flex flex-wrap gap-2">
                              {isEventLive(event.start_time, event.end_time) && (
                                <Badge className="bg-gradient-to-r from-green-500 to-emerald-400 text-white border-0 shadow-md text-xs">
                                  <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-1"></div>
                                  Live
                                </Badge>
                              )}
                              {isEventUpcoming(event.start_time) && (
                                <Badge className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white border-0 shadow-md text-xs">
                                  <Clock className="w-3 h-3 mr-1" />
                                  Upcoming
                                </Badge>
                              )}
                              {!isEventPaid(event.id) && (
                                <Badge variant="outline" className="border-amber-500 text-amber-600 text-xs">
                                  <Lock className="w-3 h-3 mr-1" />
                                  Payment Required
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          {event.description && (
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{event.description}</p>
                          )}
                          
                          {event.banner_url && (
                            <div className="mb-3 rounded-lg overflow-hidden shadow-md">
                              <img 
                                src={event.banner_url} 
                                alt="Event Banner" 
                                className="w-full h-24 sm:h-32 object-cover hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                          )}
                          
                          <div className="flex flex-col gap-2 text-xs text-muted-foreground mb-3">
                            <div className="flex items-center gap-2">
                              <div className="p-1 rounded bg-primary/10 flex-shrink-0">
                                <Calendar className="h-3 w-3 text-primary" />
                              </div>
                              <span className="font-medium text-xs break-all">
                                {formatDate(event.start_time)} - {formatDate(event.end_time)}
                              </span>
                            </div>
                            {event.location && (
                              <div className="flex items-center gap-2">
                                <div className="p-1 rounded bg-orange-100 dark:bg-orange-900 flex-shrink-0">
                                  <MapPin className="h-3 w-3 text-orange-600" />
                                </div>
                                <span className="text-xs truncate">{event.location}</span>
                              </div>
                            )}
                          </div>

                          {/* QR Code / Payment Section */}
                          <EventQRCode eventId={event.id} eventName={event.name} />
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 ml-2 flex-shrink-0">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleEdit(event)}
                            disabled={isUpdating}
                            className="hover:bg-primary/10 hover:text-primary transition-colors h-8 w-8"
                          >
                            <Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDelete(event.id)}
                            disabled={isDeleting}
                            className="hover:bg-destructive/10 hover:text-destructive transition-colors h-8 w-8"
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
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
      </div>
    </AdminLayout>
  );
};

export default AdminEvents;
