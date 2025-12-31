import React, { useState, useEffect, useRef } from "react";
// Remove this import:
// import AdminLayout from "@/components/layouts/AdminLayout";
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
import { useFormPersistence } from '@/hooks/useFormPersistence';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminEventContext } from "@/hooks/useAdminEventContext";
import ScheduleStatsCards from "./components/ScheduleStatsCards";
import ScheduleItemCard from "./components/ScheduleItemCard";
import ScheduleFilters from "@/components/admin/ScheduleFilters";
import { isToday, isTomorrow, parseISO } from "date-fns";
import PaymentGuard from "@/components/payment/PaymentGuard";

interface ScheduleItem {
  id: string;
  title: string;
  description: string | null;
  start_date?: string | null;
  end_date?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  start_time_full?: string; // For backward compatibility
  end_time_full?: string; // For backward compatibility
  time_allocation?: string | null;
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
  start_date?: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  time_allocation?: string;
  location: string;
  type: string;
  priority: string;
}

const AdminScheduleContent = () => {
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const formRef = useRef<HTMLDivElement>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const { selectedEventId, selectedEvent } = useAdminEventContext();
  const form = useForm<ScheduleFormData>({
    defaultValues: {
      title: "",
      description: "",
      start_date: "",
      end_date: "",
      start_time: "",
      end_time: "",
      time_allocation: "",
      location: "",
      type: "general",
      priority: "medium"
    }
  });

  const { register, handleSubmit, control, reset, watch, formState: { errors } } = form;

  // Form persistence
  const { saveFormData, clearSavedData, hasSavedData } = useFormPersistence(
    'schedule-form',
    form,
    !editingItem
  );

  // Watch form values for auto-save
  const watchedValues = watch();

  // Auto-save form data when values change
  useEffect(() => {
    if (!editingItem) {
      saveFormData(watchedValues);
    }
  }, [watchedValues, saveFormData, editingItem]);

  // Watch form values to enable conditional logic
  const watchStartDate = watch("start_date");
  const watchEndDate = watch("end_date");
  const watchStartTime = watch("start_time");
  const watchEndTime = watch("end_time");

  // Filter schedule items
  const filteredScheduleItems = scheduleItems.filter((item) => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = selectedType === "all" || item.type === selectedType;
    const matchesPriority = selectedPriority === "all" || item.priority === selectedPriority;

    const matchesDate = (() => {
      if (selectedDate === "all") return true;
      
      if (selectedDate.startsWith("date-")) {
        const targetDate = selectedDate.replace("date-", "");
        const itemDate = item.start_date || (item.start_time ? item.start_time.slice(0, 10) : null);
        return itemDate === targetDate;
      }

      const itemDate = item.start_date || (item.start_time ? item.start_time.slice(0, 10) : null);
      if (!itemDate) return selectedDate === "tba";

      try {
        const date = parseISO(itemDate);
        if (selectedDate === "today") return isToday(date);
        if (selectedDate === "tomorrow") return isTomorrow(date);
        if (selectedDate === "tba") return false;
      } catch {
        return selectedDate === "tba";
      }

      return true;
    })();

    return matchesSearch && matchesType && matchesPriority && matchesDate;
  });

  // Stats for cards
  const total = filteredScheduleItems.length;
  const sessions = filteredScheduleItems.filter(i => i.type === "session").length;
  const breaks = filteredScheduleItems.filter(i => i.type === "break").length;

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
      
      // Combine date and time if both are provided
      let startTimeForDb = null;
      let endTimeForDb = null;
      
      if (data.start_date && data.start_time) {
        // Create a local datetime and convert to ISO string
        const localDateTime = new Date(`${data.start_date}T${data.start_time}`);
        startTimeForDb = localDateTime.toISOString();
      } else if (data.start_date) {
        const localDateTime = new Date(`${data.start_date}T00:00:00`);
        startTimeForDb = localDateTime.toISOString();
      }
      
      if (data.end_date && data.end_time) {
        // Create a local datetime and convert to ISO string
        const localDateTime = new Date(`${data.end_date}T${data.end_time}`);
        endTimeForDb = localDateTime.toISOString();
      } else if (data.end_date) {
        const localDateTime = new Date(`${data.end_date}T23:59:59`);
        endTimeForDb = localDateTime.toISOString();
      }
      
      const scheduleData = {
        title: data.title,
        description: data.description || null,
        start_time: startTimeForDb,
        end_time: endTimeForDb,
        start_date: data.start_date || null,
        end_date: data.end_date || null,
        start_time_only: data.start_time || null,
        end_time_only: data.end_time || null,
        time_allocation: data.time_allocation || null,
        location: data.location || null,
        type: data.type,
        priority: data.priority,
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
        start_date: '',
        end_date: '',
        start_time: '',
        end_time: '',
        time_allocation: '',
        location: '',
        type: 'general',
        priority: 'medium'
      });
      
      setEditingItem(null);
      setSelectedImage(null);
      setImagePreview('');
      // Clear saved form data after successful submission
      clearSavedData();
      fetchScheduleItems();
    } catch (error) {
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
    
    // Extract date and time components with better handling
    let startDate = '';
    let endDate = '';
    let startTime = '';
    let endTime = '';
    
    // Handle start date
    if (item.start_date) {
      startDate = item.start_date;
    } else if (item.start_time) {
      // Extract date from timestamp
      startDate = item.start_time.slice(0, 10);
    } else if (item.start_time_full) {
      startDate = item.start_time_full.slice(0, 10);
    }
    
    // Handle end date
    if (item.end_date) {
      endDate = item.end_date;
    } else if (item.end_time) {
      // Extract date from timestamp
      endDate = item.end_time.slice(0, 10);
    } else if (item.end_time_full) {
      endDate = item.end_time_full.slice(0, 10);
    }
    
    // Handle start time - check multiple sources and convert to local time
    if (item.start_time) {
      // Convert UTC time to local time for datetime-local input
      const utcDate = new Date(item.start_time);
      const localDateTime = new Date(utcDate.getTime() - utcDate.getTimezoneOffset() * 60000);
      startTime = localDateTime.toISOString().slice(11, 16);
    } else if (item.start_time_full) {
      const utcDate = new Date(item.start_time_full);
      const localDateTime = new Date(utcDate.getTime() - utcDate.getTimezoneOffset() * 60000);
      startTime = localDateTime.toISOString().slice(11, 16);
    }
    
    // Handle end time - check multiple sources and convert to local time
    if (item.end_time) {
      // Convert UTC time to local time for datetime-local input
      const utcDate = new Date(item.end_time);
      const localDateTime = new Date(utcDate.getTime() - utcDate.getTimezoneOffset() * 60000);
      endTime = localDateTime.toISOString().slice(11, 16);
    } else if (item.end_time_full) {
      const utcDate = new Date(item.end_time_full);
      const localDateTime = new Date(utcDate.getTime() - utcDate.getTimezoneOffset() * 60000);
      endTime = localDateTime.toISOString().slice(11, 16);
    }
    
    reset({
      title: item.title,
      description: item.description || "",
      start_date: startDate,
      end_date: endDate,
      start_time: startTime,
      end_time: endTime,
      time_allocation: item.time_allocation || "",
      location: item.location || "",
      type: item.type,
      priority: item.priority
    });
    
    // Scroll to the form after a brief delay to ensure state is updated
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
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

          {/* Schedule Filters */}
          <ScheduleFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            selectedType={selectedType}
            onTypeChange={setSelectedType}
            selectedPriority={selectedPriority}
            onPriorityChange={setSelectedPriority}
            scheduleItems={scheduleItems}
          />

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
                    <Label htmlFor="title">Title *</Label>
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
                  
                  {/* Flexible Date Section */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Date Settings (Optional)</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="start_date" className="text-sm">Start Date</Label>
                        <Input
                          id="start_date"
                          type="date"
                          {...register("start_date")}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="end_date" className="text-sm">End Date</Label>
                        <Input
                          id="end_date"
                          type="date"
                          {...register("end_date")}
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Set dates independently from specific times
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-5">
                  {/* Flexible Time Section */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Time Settings (Optional)</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="start_time" className="text-sm">Start Time</Label>
                        <Input
                          id="start_time"
                          type="time"
                          {...register("start_time")}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="end_time" className="text-sm">End Time</Label>
                        <Input
                          id="end_time"
                          type="time"
                          {...register("end_time")}
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Set specific times independently from dates
                    </p>
                  </div>
                  
                  {/* Time Allocation */}
                  <div>
                    <Label htmlFor="time_allocation">Time Allocation</Label>
                    <Input
                      id="time_allocation"
                      {...register("time_allocation")}
                      placeholder="e.g., 30min, 1hr, 2hrs"
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Allocate duration without setting exact start time
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      {...register("location")}
                      placeholder="Enter location (optional)"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="type">Type *</Label>
                    <Controller
                      name="type"
                      control={control}
                      rules={{ required: "Type is required" }}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="mt-1">
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
                    <Label htmlFor="priority">Priority *</Label>
                    <Controller
                      name="priority"
                      control={control}
                      rules={{ required: "Priority is required" }}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="mt-1">
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
                  
                  {/* Form Status Indicator */}
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <p className="text-sm font-medium text-blue-800 mb-1">Scheduling Flexibility:</p>
                    <ul className="text-xs text-blue-600 space-y-1">
                      <li>✓ Dates: {watchStartDate || watchEndDate ? 'Set' : 'Not set'}</li>
                      <li>✓ Times: {watchStartTime || watchEndTime ? 'Set' : 'Not set'}</li>
                      <li>✓ Can save with any combination of the above</li>
                    </ul>
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
                            start_date: '',
                            end_date: '',
                            start_time: '',
                            end_time: '',
                            time_allocation: '',
                            location: '',
                            type: 'general',
                            priority: 'medium'
                          });
                          // Clear saved form data when canceling
                          if (!editingItem) {
                            clearSavedData();
                          }
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
                {filteredScheduleItems.length} of {scheduleItems.length} items scheduled for {selectedEvent?.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {scheduleItems.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No schedule items created yet. Add schedule items above to see them here.
                </p>
              ) : filteredScheduleItems.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No schedule items match your current filters. Try adjusting the filters above.
                </p>
              ) : (
                <div className="space-y-4">
                  {filteredScheduleItems.map((item) => (
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

const PaymentGuardWrapper = () => {
  const { selectedEventId, selectedEvent } = useAdminEventContext();

  if (!selectedEventId || !selectedEvent) {
    return <AdminScheduleContent />;
  }

  return (
    <PaymentGuard
      eventId={selectedEventId}
      eventName={selectedEvent.name}
      feature="schedule management"
    >
      <AdminScheduleContent />
    </PaymentGuard>
  );
};

const AdminSchedule = PaymentGuardWrapper;

export default AdminSchedule;
