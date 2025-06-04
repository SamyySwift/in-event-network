
import React, { useState } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Send, Pencil, Trash2, Loader, Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { useAuth } from '@/contexts/AuthContext';

type AnnouncementFormData = {
  title: string;
  content: string;
  priority: 'high' | 'normal' | 'low';
  send_immediately: boolean;
};

const AdminAnnouncements = () => {
  const [editingAnnouncement, setEditingAnnouncement] = useState<string | null>(null);
  const { currentUser } = useAuth();
  const { announcements, isLoading, createAnnouncement, updateAnnouncement, deleteAnnouncement, isCreating, isUpdating, isDeleting } = useAnnouncements();

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<AnnouncementFormData>({
    defaultValues: {
      title: "",
      content: "",
      priority: "normal",
      send_immediately: false,
    },
  });

  const onSubmit = (data: AnnouncementFormData) => {
    const announcementData = {
      ...data,
      created_by: currentUser?.id,
    };

    if (editingAnnouncement) {
      updateAnnouncement({ id: editingAnnouncement, ...announcementData });
      setEditingAnnouncement(null);
    } else {
      createAnnouncement(announcementData);
    }
    reset();
  };

  const handleEdit = (announcement: any) => {
    setEditingAnnouncement(announcement.id);
    setValue('title', announcement.title);
    setValue('content', announcement.content);
    setValue('priority', announcement.priority);
    setValue('send_immediately', announcement.send_immediately);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this announcement?')) {
      deleteAnnouncement(id);
    }
  };

  const handleCancel = () => {
    setEditingAnnouncement(null);
    reset();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 hover:bg-red-200';
      case 'normal': return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'low': return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
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
        <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
        <p className="text-muted-foreground">
          Create and manage event announcements.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{editingAnnouncement ? 'Edit Announcement' : 'Create Announcement'}</CardTitle>
            <CardDescription>
              {editingAnnouncement ? 'Update announcement details' : 'Send important updates to all attendees'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  {...register("title", { required: "Title is required" })}
                  placeholder="Enter announcement title"
                />
                {errors.title?.message && (
                  <p className="text-sm text-destructive">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  {...register("content", { required: "Content is required" })}
                  placeholder="Enter announcement content"
                  rows={4}
                />
                {errors.content?.message && (
                  <p className="text-sm text-destructive">{errors.content.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
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

                <div className="space-y-2">
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
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1" disabled={isCreating || isUpdating}>
                  {(isCreating || isUpdating) && <Loader className="h-4 w-4 mr-2 animate-spin" />}
                  <Send className="h-4 w-4 mr-2" />
                  {editingAnnouncement ? 'Update Announcement' : 'Create Announcement'}
                </Button>
                {editingAnnouncement && (
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Current Announcements</CardTitle>
              <CardDescription>
                {announcements.length} announcements published
              </CardDescription>
            </CardHeader>
            <CardContent>
              {announcements.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No announcements published yet. Create your first announcement using the form.
                </p>
              ) : (
                <div className="space-y-4">
                  {announcements.map((announcement) => (
                    <div key={announcement.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{announcement.title}</h3>
                            <Badge className={getPriorityColor(announcement.priority)}>
                              {announcement.priority}
                            </Badge>
                            {announcement.send_immediately && (
                              <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                                Immediate
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {announcement.content}
                          </p>
                          <div className="text-xs text-muted-foreground">
                            Created: {new Date(announcement.created_at).toLocaleString()}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleEdit(announcement)}
                            disabled={isUpdating}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDelete(announcement.id)}
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
      </div>
    </AdminLayout>
  );
};

export default AdminAnnouncements;
