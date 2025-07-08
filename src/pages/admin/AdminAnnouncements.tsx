import React, { useState } from 'react';
// Remove this import:
// import AdminLayout from '@/components/layouts/AdminLayout';
import EventSelector from '@/components/admin/EventSelector';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Send, Pencil, Trash2, Loader, Plus, Upload, Phone, AlertTriangle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useAdminAnnouncements } from '@/hooks/useAdminAnnouncements';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminEventContext, AdminEventProvider } from '@/hooks/useAdminEventContext';
import { ImageUpload } from '@/components/ui/image-upload';
import AnnouncementStatsCards from './components/AnnouncementStatsCards';
import AnnouncementCard from './components/AnnouncementCard';

type AnnouncementFormData = {
  title: string;
  content: string;
  priority: 'high' | 'normal' | 'low';
  send_immediately: boolean;
  image?: File;
};

const AdminAnnouncementsContent = () => {
  const [editingAnnouncement, setEditingAnnouncement] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const { currentUser } = useAuth();
  const { selectedEvent, selectedEventId } = useAdminEventContext();
  const { announcements, isLoading, createAnnouncement, updateAnnouncement, deleteAnnouncement, isCreating, isUpdating, isDeleting } = useAdminAnnouncements();

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<AnnouncementFormData>({
    defaultValues: {
      title: "",
      content: "",
      priority: "normal",
      send_immediately: false,
    },
  });

  // Metrics for stats cards
  const total = announcements.length;
  const highPriority = announcements.filter(a => a.priority === 'high').length;

  const onSubmit = (data: AnnouncementFormData) => {
    const announcementData = {
      ...data,
      created_by: currentUser?.id,
      image: selectedImage,
    };

    if (editingAnnouncement) {
      updateAnnouncement({ id: editingAnnouncement, ...announcementData });
      setEditingAnnouncement(null);
    } else {
      createAnnouncement(announcementData);
    }
    reset();
    setSelectedImage(null);
  };

  const handleEdit = (announcement: any) => {
    setEditingAnnouncement(announcement.id);
    setValue('title', announcement.title);
    setValue('content', announcement.content);
    setValue('priority', announcement.priority);
    setValue('send_immediately', announcement.send_immediately);
    setSelectedImage(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this announcement?')) {
      deleteAnnouncement(id);
    }
  };

  const handleCancel = () => {
    setEditingAnnouncement(null);
    setSelectedImage(null);
    reset();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-10">
        <div className="flex justify-between items-center">
          <EventSelector />
        </div>
        <div className="p-8 rounded-2xl bg-gradient-to-br from-primary-100 via-purple-100 to-blue-50 text-primary-900 dark:text-white shadow-2xl shadow-primary/10 mb-2 relative overflow-hidden">
          <div className="absolute -top-12 -right-10 w-56 h-56 bg-white/10 rounded-full opacity-40 blur-2xl pointer-events-none"></div>
          <div className="absolute -bottom-14 -left-14 w-36 h-36 bg-white/20 rounded-full opacity-30 pointer-events-none"></div>
          <div className="relative z-10">
            <h1 className="text-4xl font-bold tracking-tight">Announcements</h1>
            <p className="mt-2 max-w-2xl text-primary-700 dark:text-primary-100">
              Manage announcements for <span className="font-semibold">{selectedEvent?.name ?? "your event"}</span>.
            </p>
            <div className="mt-6">
              <AnnouncementStatsCards total={0} highPriority={0} loading />
            </div>
          </div>
        </div>
        <div className="h-24 flex items-center justify-center"><Loader className="animate-spin" /></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Event Selector */}
      <div className="flex justify-between items-center">
        <EventSelector />
      </div>

      {/* Show message when no event is selected */}
      {!selectedEventId && (
        <div className="text-center py-12">
          <div className="p-4 rounded-full bg-primary/10 inline-block mb-4">
            <svg className="h-8 w-8 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
          </div>
          <p className="text-muted-foreground text-lg mb-2">No event selected</p>
          <p className="text-sm text-muted-foreground">Please select an event above to manage its announcements</p>
        </div>
      )}

      {/* Only show content when an event is selected */}
      {selectedEventId && (
        <>
          {/* Gradient Hero Section */}
          <div className="p-8 rounded-2xl bg-gradient-to-br from-primary-100 via-purple-100 to-blue-50 text-primary-900 dark:text-white shadow-2xl shadow-primary/10 mb-2 relative overflow-hidden">
            <div className="absolute -top-12 -right-10 w-56 h-56 bg-white/10 rounded-full opacity-40 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-14 -left-14 w-36 h-36 bg-white/20 rounded-full opacity-30 pointer-events-none" />
            <div className="relative z-10">
              <h1 className="text-4xl font-bold tracking-tight">Announcements</h1>
              <p className="mt-2 max-w-2xl text-primary-700 dark:text-primary-100">
                Manage announcements for <span className="font-semibold">{selectedEvent.name}</span>.
              </p>
              <div className="mt-6">
                <AnnouncementStatsCards total={total} highPriority={highPriority} loading={isLoading} />
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-xl space-y-8 shadow-xl">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-fuchsia-400 via-purple-500 to-indigo-600 shadow-md">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </span>
                <div>
                  <div className="uppercase text-xs font-bold text-primary-600 tracking-wide">Announcements</div>
                  <div className="text-lg font-semibold text-primary-900 dark:text-primary-100">
                    {selectedEvent.name}
                  </div>
                </div>
              </div>
            </div>

            {/* Add/Edit Announcement Form */}
            <Card className="mb-6 glass-card bg-gradient-to-br from-white/90 via-primary-50/70 to-primary-100/60 transition-all animate-fade-in shadow-lg">
              <CardHeader>
                <CardTitle>{editingAnnouncement ? 'Edit Announcement' : 'Create Announcement'}</CardTitle>
                <CardDescription>
                  {editingAnnouncement ? 'Update announcement details' : 'Send important updates to all attendees'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="flex flex-col space-y-5">
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        {...register("title", { required: "Title is required" })}
                        placeholder="Enter announcement title"
                        className="mt-1"
                      />
                      {errors.title?.message && (
                        <p className="text-sm text-destructive">{errors.title.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="content">Content</Label>
                      <Textarea
                        id="content"
                        {...register("content", { required: "Content is required" })}
                        placeholder="Enter announcement content"
                        rows={4}
                        className="mt-1"
                      />
                      {errors.content?.message && (
                        <p className="text-sm text-destructive">{errors.content.message}</p>
                      )}
                    </div>
                    <ImageUpload
                      onImageSelect={setSelectedImage}
                      label="Announcement Image (Optional)"
                    />
                  </div>
                  <div className="flex flex-col space-y-5">
                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <Select onValueChange={(value) => setValue("priority", value as "high" | "normal" | "low")}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Send Immediately</Label>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={watch("send_immediately")}
                          onCheckedChange={(checked) => setValue("send_immediately", checked)}
                        />
                        <span className="text-sm text-muted-foreground">
                          Send notification now
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 pt-4">
                      <Button type="submit" className="flex-1" disabled={isCreating || isUpdating}>
                        {(isCreating || isUpdating) && <Loader className="h-4 w-4 mr-2 animate-spin" />}
                        <Send className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">{editingAnnouncement ? 'Update Announcement' : 'Create Announcement'}</span>
                        <span className="sm:hidden">{editingAnnouncement ? 'Update' : 'Create'}</span>
                      </Button>
                      {!!editingAnnouncement && (
                        <Button type="button" variant="outline" onClick={handleCancel} className="sm:w-auto">
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Announcements List */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Current Announcements</CardTitle>
                  <CardDescription>
                    {announcements.length} announcements published for {selectedEvent.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {announcements.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No announcements published yet for this event. Create your first announcement using the form.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {announcements.map((announcement) => (
                        <AnnouncementCard
                          key={announcement.id}
                          announcement={announcement}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          isUpdating={isUpdating}
                          isDeleting={isDeleting}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const AdminAnnouncements = () => {
  return (
    <AdminEventProvider>
      <AdminAnnouncementsContent />
    </AdminEventProvider>
  );
};

export default AdminAnnouncements;
