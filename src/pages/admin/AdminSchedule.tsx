import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import EventSelector from "@/components/admin/EventSelector";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageUpload } from "@/components/ui/image-upload";
import { Calendar, Plus, AlertTriangle, Loader, Building } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminEventContext, AdminEventProvider } from "@/hooks/useAdminEventContext";
import ScheduleStatsCards from "./components/ScheduleStatsCards";
import ScheduleItemCard from "./components/ScheduleItemCard";

interface ScheduleItem {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  location: string | null;
  type: string;
  priority: string;
  image_url: string | null;
  event_id: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

interface ScheduleFormData {
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  location: string;
  type: string;
  priority: string;
  time_allocation?: string; // Add optional time allocation
}

const AdminScheduleContent = () => {
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const { selectedEventId, selectedEvent } = useAdminEventContext();
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<ScheduleFormData>({
    defaultValues: {
      title: "",
      description: "",
      start_time: "",
      end_time: "",
      location: "",
      type: "general",
      priority: "medium"
    }
  });

  // Stats for cards
  const total = scheduleItems.length;
  const sessions = scheduleItems.filter(i => i.type === "session").length;
  const breaks = scheduleItems.filter(i => i.type === "break").length;

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${currentUser?.id}/schedule/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("event-images")
      .upload(fileName, file);

    if (uploadError) throw uploadError;
    const { data: { publicUrl } } = supabase.storage
      .from("event-images")
      .getPublicUrl(fileName);

    return publicUrl;
  };

  useEffect(() => {
    if (selectedEventId) {
      fetchScheduleItems();
    } else {
      setScheduleItems([]);
      setLoading(false);
    }

    const channel = supabase
      .channel("admin-schedule-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "schedule_items" },
        () => {
          if (selectedEventId) fetchScheduleItems();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedEventId]);

  const fetchScheduleItems = async () => {
    if (!selectedEventId) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("schedule_items")
        .select("*")
        .eq("event_id", selectedEventId)
        .order("start_time", { ascending: true });
      if (error) throw error;
      setScheduleItems(data || []);
    } catch {
      toast({
        title: "Error",
        description: "Failed to fetch schedule items. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ScheduleFormData) => {
    if (!selectedEventId) {
      toast({
        title: "Error",
        description: "Please select an event first.",
        variant: "destructive",
      });
      return;
    }
    try {
      let imageUrl = imagePreview;
      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage);
      }
      const scheduleData = {
        ...data,
        image_url: imageUrl || null,
        event_id: selectedEventId,
        created_by: currentUser?.id,
      };
      let result;
      if (editingItem) {
        result = await supabase
          .from("schedule_items")
          .update(scheduleData)
          .eq("id", editingItem.id);
      } else {
        result = await supabase
          .from("schedule_items")
          .insert([scheduleData]);
      }
      if (result.error) throw result.error;
      toast({
        title: "Success",
        description: `Schedule item ${editingItem ? "updated" : "created"} successfully`,
      });
      reset({
        title: '',
        description: '',
        start_time: '',
        end_time: '',
        location: '',
        type: 'general',
        priority: 'medium'
      });
      setEditingItem(null);
      setSelectedImage(null);
      setImagePreview('');
      fetchScheduleItems();
    } catch {
      toast({
        title: "Error",
        description: "Failed to save schedule item",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (item: ScheduleItem) => {
    setEditingItem(item);
    setImagePreview(item.image_url || "");
    reset({
      title: item.title,
      description: item.description || "",
      start_time: item.start_time.slice(0, 16),
      end_time: item.end_time.slice(0, 16),
      location: item.location || "",
      type: item.type,
      priority: item.priority
    });
  };

  const handleImageSelect = (file: File | null) => {
    setSelectedImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setImagePreview('');
    }
  };

  const handleDelete = async (item: ScheduleItem) => {
    try {
      const { error } = await supabase
        .from("schedule_items")
        .delete()
        .eq("id", item.id);
      if (error) throw error;
      toast({
        title: "Success",
        description: "Schedule item deleted successfully",
      });
      fetchScheduleItems();
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete schedule item",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in">
        {/* Event Selector */}
        <div className="flex justify-between items-center">
          <EventSelector />
        </div>
        <div className="p-8 rounded-2xl bg-gradient-to-br from-primary-100 via-blue-100 to-indigo-50 text-primary-900 dark:text-white shadow-2xl shadow-primary/10 mb-2 relative overflow-hidden">
          <div className="absolute -top-12 -right-10 w-56 h-56 bg-white/10 rounded-full opacity-40 blur-2xl pointer-events-none"></div>
          <div className="absolute -bottom-14 -left-14 w-36 h-36 bg-white/20 rounded-full opacity-30 pointer-events-none"></div>
          <div className="relative z-10">
            <h1 className="text-4xl font-bold tracking-tight">Schedule</h1>
            <p className="mt-2 max-w-2xl text-primary-700 dark:text-primary-100">
              Manage schedule for <span className="font-semibold">{selectedEvent?.name ?? "your event"}</span>.
            </p>
            <div className="mt-6">
              <ScheduleStatsCards total={0} sessions={0} breaks={0} loading />
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
            <Calendar className="h-8 w-8 text-primary" />
          </div>
          <p className="text-muted-foreground text-lg mb-2">No event selected</p>
          <p className="text-sm text-muted-foreground">Please select an event above to manage schedule</p>
        </div>
      )}

      {/* Only show content when an event is selected */}
      {selectedEventId && (
        <>
          {/* Gradient Hero Section */}
          <div className="p-8 rounded-2xl bg-gradient-to-br from-primary-100 via-blue-100 to-indigo-50 text-primary-900 dark:text-white shadow-2xl shadow-primary/10 mb-2 relative overflow-hidden">
            <div className="absolute -top-12 -right-10 w-56 h-56 bg-white/10 rounded-full opacity-40 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-14 -left-14 w-36 h-36 bg-white/20 rounded-full opacity-30 pointer-events-none" />
            <div className="relative z-10">
              <h1 className="text-4xl font-bold tracking-tight">Schedule</h1>
              <p className="mt-2 max-w-2xl text-primary-700 dark:text-primary-100">
                Manage schedule for <span className="font-semibold">{selectedEvent?.name}</span>.
              </p>
              <div className="mt-6">
                <ScheduleStatsCards total={total} sessions={sessions} breaks={breaks} loading={loading} />
              </div>
            </div>
          </div>

          {/* Schedule Form */}
          <Card className="mb-6 glass-card bg-gradient-to-br from-white/90 via-primary-50/70 to-primary-100/60 transition-all animate-fade-in shadow-lg">
            <CardHeader>
              <CardTitle>{editingItem ? "Edit Schedule Item" : "Create Schedule Item"}</CardTitle>
              <CardDescription>
                {editingItem ? "Update schedule item details" : "Add a new item attendees will see"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="grid md:grid-cols-2 gap-6">
                <div className="flex flex-col space-y-5">
                  <ImageUpload
                    onImageSelect={handleImageSelect}
                    currentImageUrl={imagePreview}
                    label="Schedule Item Image"
                  />
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      {...register("title", { required: "Title is required" })}
                      placeholder="Enter schedule item title"
                      className="mt-1"
                    />
                    {errors.title?.message && (
                      <p className="text-sm text-destructive">{errors.title.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      {...register("description")}
                      placeholder="Enter schedule item description"
                      rows={3}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="flex flex-col space-y-5">
                  <div>
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
                  <div>
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
                  <div>
                    <Label htmlFor="time_allocation">Time Allocation (Optional)</Label>
                    <Input
                      id="time_allocation"
                      {...register("time_allocation")}
                      placeholder="e.g., 30min, 1hr, 2hrs"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      {...register("location")}
                      placeholder="Enter location (optional)"
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Controller
                      name="type"
                      control={control}
                      rules={{ required: "Type is required" }}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">General</SelectItem>
                            <SelectItem value="session">Session</SelectItem>
                            <SelectItem value="break">Break</SelectItem>
                            <SelectItem value="networking">Networking</SelectItem>
                            <SelectItem value="meal">Meal</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.type?.message && (
                      <p className="text-sm text-destructive">{errors.type.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Controller
                      name="priority"
                      control={control}
                      rules={{ required: "Priority is required" }}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.priority?.message && (
                      <p className="text-sm text-destructive">{errors.priority.message}</p>
                    )}
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button type="submit" className="flex-1">
                      <Plus className="h-4 w-4 mr-2" />
                      {editingItem ? "Update Item" : "Add Schedule Item"}
                    </Button>
                    {editingItem && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setEditingItem(null);
                          setSelectedImage(null);
                          setImagePreview('');
                          reset({
                            title: '',
                            description: '',
                            start_time: '',
                            end_time: '',
                            location: '',
                            type: 'general',
                            priority: 'medium'
                          });
                        }}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Schedule List */}
          <Card>
            <CardHeader>
              <CardTitle>Current Schedule</CardTitle>
              <CardDescription>
                {scheduleItems.length} items scheduled for {selectedEvent?.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {scheduleItems.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No schedule items created yet. Add schedule items above to see them here.
                </p>
              ) : (
                <div className="space-y-4">
                  {scheduleItems.map((item) => (
                    <ScheduleItemCard
                      key={item.id}
                      item={item}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

const AdminSchedule = () => {
  return (
    <AdminLayout>
      <AdminEventProvider>
        <AdminScheduleContent />
      </AdminEventProvider>
    </AdminLayout>
  );
};

export default AdminSchedule;
