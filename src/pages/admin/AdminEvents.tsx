import React, { useState } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Define the schema for event validation
const eventSchema = z.object({
  name: z.string().min(3, { message: "Event name must be at least 3 characters." }),
  description: z.string().optional(),
  startTime: z.string().refine((date) => {
    try {
      new Date(date);
      return true;
    } catch (error) {
      return false;
    }
  }, {
    message: "Invalid start time"
  }),
  endTime: z.string().refine((date) => {
    try {
      new Date(date);
      return true;
    } catch (error) {
      return false;
    }
  }, {
    message: "Invalid end time"
  }),
  location: z.string().min(3, { message: "Location must be at least 3 characters." }),
});

type EventSchemaType = z.infer<typeof eventSchema>;

const AdminEvents = () => {
  const [events, setEvents] = useState([]);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<EventSchemaType>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      name: '',
      description: '',
      startTime: '',
      endTime: '',
      location: ''
    }
  });

  const onSubmit = (data: EventSchemaType) => {
    console.log("Form Data:", data);
    setEvents([...events, data]);
  };

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
            <CardTitle>Create New Event</CardTitle>
            <CardDescription>
              Add a new event to the schedule
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Event Name</Label>
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
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="datetime-local"
                    {...register("startTime", { required: "Start time is required" })}
                  />
                  {errors.startTime?.message && (
                    <p className="text-sm text-destructive">{errors.startTime.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="datetime-local"
                    {...register("endTime", { required: "End time is required" })}
                  />
                  {errors.endTime?.message && (
                    <p className="text-sm text-destructive">{errors.endTime.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  {...register("location", { required: "Location is required" })}
                  placeholder="Enter event location"
                />
                {errors.location?.message && (
                  <p className="text-sm text-destructive">{errors.location.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Events List */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>
              List of scheduled events
            </CardDescription>
          </CardHeader>
          <CardContent>
            {events.length === 0 ? (
              <p>No events scheduled yet.</p>
            ) : (
              <div className="grid gap-4">
                {events.map((event, index) => (
                  <div key={index} className="border rounded-md p-4">
                    <h3 className="font-semibold">{event.name}</h3>
                    <p className="text-sm text-muted-foreground">{event.description}</p>
                    <div className="text-xs text-muted-foreground">
                      Start Time: {new Date(event.startTime).toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      End Time: {new Date(event.endTime).toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Location: {event.location}
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
