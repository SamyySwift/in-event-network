import React, { useState, useEffect, useRef } from "react";
// Remove this line:
// import AdminLayout from "@/components/layouts/AdminLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Pencil,
  Trash2,
  Loader,
  Calendar,
  MapPin,
  Users,
  Clock,
  Lock,
  CalendarIcon,
  BarChart3,
  Activity,
  Unlock,
  Key,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { useFormPersistence } from '@/hooks/useFormPersistence';
import { Badge } from "@/components/ui/badge";
import { useAdminEvents } from "@/hooks/useAdminEvents";
import { useAuth } from "@/contexts/AuthContext";
import { ImageUpload } from "@/components/ui/image-upload";
import { usePayment } from "@/hooks/usePayment";
import EventQRCode from "@/components/admin/EventQRCode";
import PaymentGuard from '@/components/payment/PaymentGuard';
import { useReferralCode } from "@/hooks/useReferralCode";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type EventFormData = {
  name: string;
  description?: string;
  start_date: Date | undefined;
  start_time: string;
  end_date: Date | undefined;
  end_time: string;
  location?: string;
  image?: File;
};

const AdminEvents = () => {
  const [editingEvent, setEditingEvent] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [referralCode, setReferralCode] = useState("");
  const [showReferralCard, setShowReferralCard] = useState(true);
  const [isAnalyzingBanner, setIsAnalyzingBanner] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const {
    events,
    isLoading,
    createEvent,
    updateEvent,
    deleteEvent,
    isCreating,
    isUpdating,
    isDeleting,
  } = useAdminEvents();
  const { isEventPaid } = usePayment();
  const { submitReferralCode, isSubmittingCode, unlockedEvents } = useReferralCode();

  const form = useForm<EventFormData>({
    defaultValues: {
      name: "",
      description: "",
      start_date: undefined,
      start_time: "",
      end_date: undefined,
      end_time: "",
      location: "",
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = form;

  // Form persistence
  const { saveFormData, clearSavedData, hasSavedData } = useFormPersistence(
    'event-form',
    form,
    !editingEvent
  );

  // Watch form values for auto-save
  const watchedValues = watch();

  // Auto-save form data when values change
  useEffect(() => {
    if (!editingEvent) {
      saveFormData(watchedValues);
    }
  }, [watchedValues, saveFormData, editingEvent]);

  const startDate = watch("start_date");
  const endDate = watch("end_date");

  const onSubmit = (data: EventFormData) => {
    console.log("Submitting event data:", data);
    console.log("Current user:", currentUser?.id);

    if (
      !data.name ||
      !data.start_date ||
      !data.start_time ||
      !data.end_date ||
      !data.end_time
    ) {
      console.error("Missing required fields");
      return;
    }

    // Check if user is trying to create a second event without access code unlock
    if (!editingEvent && events.length >= 1) {
      // Check if any existing event has been paid for OR if admin has unlocked via access code
      const hasAnyPaidEvent = events.some(event => isEventPaid(event.id));
      const hasAccessCodeUnlock = unlockedEvents.length > 0; // Admin has used access code
      
      if (!hasAnyPaidEvent && !hasAccessCodeUnlock) {
        alert("You can only create one free event. Please enter an access code to unlock unlimited event creation.");
        return;
      }
    }

    // Combine date and time for start_time
    const startDateTime = new Date(data.start_date);
    const [startHours, startMinutes] = data.start_time.split(":");
    startDateTime.setHours(parseInt(startHours), parseInt(startMinutes));

    // Combine date and time for end_time
    const endDateTime = new Date(data.end_date);
    const [endHours, endMinutes] = data.end_time.split(":");
    endDateTime.setHours(parseInt(endHours), parseInt(endMinutes));

    const eventData = {
      name: data.name,
      description: data.description,
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
      location: data.location,
      host_id: currentUser?.id,
      image: selectedImage,
    };

    console.log("Final event data being sent:", eventData);

    if (editingEvent) {
      updateEvent({ id: editingEvent, ...eventData });
      setEditingEvent(null);
    } else {
      createEvent(eventData);
    }
    reset();
    setSelectedImage(null);
    // Clear saved form data after successful submission
    clearSavedData();
  };

  const handleEdit = (event: any) => {
    setEditingEvent(event.id);
    setValue("name", event.name);
    setValue("description", event.description || "");

    const startDateTime = new Date(event.start_time);
    const endDateTime = new Date(event.end_time);

    setValue("start_date", startDateTime);
    setValue("start_time", startDateTime.toTimeString().slice(0, 5));
    setValue("end_date", endDateTime);
    setValue("end_time", endDateTime.toTimeString().slice(0, 5));
    setValue("location", event.location || "");
    setSelectedImage(null);
    
    // Scroll to the form after a brief delay to ensure state is updated
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this event?")) {
      deleteEvent(id);
    }
  };

  const handleCancel = () => {
    setEditingEvent(null);
    setSelectedImage(null);
    reset();
    // Clear saved form data when canceling
    if (!editingEvent) {
      clearSavedData();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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

  const liveEvents = events.filter((event) =>
    isEventLive(event.start_time, event.end_time)
  );
  const upcomingEvents = events.filter((event) =>
    isEventUpcoming(event.start_time)
  );

  const handleReferralSubmit = () => {
    if (!referralCode.trim()) {
      return;
    }
    // Use a dummy event ID for admin unlock - we're just checking the code is valid
    submitReferralCode({ 
      accessCode: referralCode, 
      eventId: 'admin-unlock' 
    }, {
      onSuccess: () => {
        setShowReferralCard(false);
      }
    });
  };

  const isUnlocked = unlockedEvents.length > 0 || events.some(event => isEventPaid(event.id));

  const handleBannerSelect = async (file: File | null) => {
    setSelectedImage(file);
    
    if (file && !editingEvent) {
      setIsAnalyzingBanner(true);
      try {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const base64 = e.target?.result as string;
          
          const { data, error } = await supabase.functions.invoke('analyze-event-banner', {
            body: { imageBase64: base64 }
          });

          if (error) throw error;

          if (data.error) {
            console.log('Banner analysis note:', data.error);
            return;
          }

          // Fill in the form fields with extracted data
          if (data.name) setValue('name', data.name);
          if (data.description) setValue('description', data.description);
          if (data.location) setValue('location', data.location);
          
          // Handle dates
          if (data.start_date) {
            try {
              const startDate = new Date(data.start_date);
              if (!isNaN(startDate.getTime())) {
                setValue('start_date', startDate);
              }
            } catch (e) {
              console.error('Error parsing start date:', e);
            }
          }
          
          if (data.start_time) {
            setValue('start_time', data.start_time);
          }
          
          if (data.end_date) {
            try {
              const endDate = new Date(data.end_date);
              if (!isNaN(endDate.getTime())) {
                setValue('end_date', endDate);
              }
            } catch (e) {
              console.error('Error parsing end date:', e);
            }
          }
          
          if (data.end_time) {
            setValue('end_time', data.end_time);
          }

          toast({
            title: "Banner Analyzed",
            description: "Event information has been extracted from the banner image"
          });
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Error analyzing banner:', error);
        toast({
          title: "Analysis Failed",
          description: "Could not extract information from banner. Please fill in manually.",
          variant: "destructive"
        });
      } finally {
        setIsAnalyzingBanner(false);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/25">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
                    Event Management
                  </h1>
                  <p className="text-muted-foreground text-sm sm:text-base mt-1">
                    Create, manage, and monitor your events
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Access Code Unlock Card */}
        {!isUnlocked && showReferralCard && events.length >= 1 && (
          <Card className="mb-8 border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                    <Key className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Unlock Unlimited Events</CardTitle>
                    <CardDescription className="mt-1">
                      Enter your access code to unlock unlimited event creation
                    </CardDescription>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReferralCard(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Input
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  placeholder="Enter access code"
                  className="flex-1 h-11"
                  onKeyDown={(e) => e.key === 'Enter' && handleReferralSubmit()}
                />
                <Button
                  onClick={handleReferralSubmit}
                  disabled={isSubmittingCode || !referralCode.trim()}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                >
                  {isSubmittingCode ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Unlock className="h-4 w-4 mr-2" />
                      Unlock
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Have an access code? Enter it here to create unlimited events.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Success Message */}
        {isUnlocked && events.length >= 1 && (
          <Card className="mb-8 border-2 border-green-200 dark:border-green-800 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 shadow-md">
                  <Unlock className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-green-900 dark:text-green-100">
                    Unlimited Events Unlocked!
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    You can now create as many events as you need.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Statistics Overview */}
        <div className="mb-8 sm:mb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Total Events
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {events.length}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                    <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Live Events
                    </p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {liveEvents.length}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/30">
                    <Activity className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Upcoming
                    </p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {upcomingEvents.length}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                    <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Completed
                    </p>
                    <p className="text-2xl font-bold text-slate-600 dark:text-slate-400">
                      {events.length - liveEvents.length - upcomingEvents.length}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800">
                    <Users className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 lg:gap-8">
          {/* Event Creation Form - Left Side */}
          <div className="xl:col-span-2">
            <Card ref={formRef} className="border-0 shadow-lg bg-white dark:bg-slate-900">
              <CardHeader className="pb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-md">
                    <Plus className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-semibold">
                      {editingEvent ? "Edit Event" : "Create New Event"}
                    </CardTitle>
                    <CardDescription className="text-sm text-muted-foreground mt-1">
                      {editingEvent
                        ? "Update event information"
                        : "Add a new event to your schedule"}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Event Details Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent flex-1" />
                      <span className="text-xs font-medium text-muted-foreground px-3">EVENT DETAILS</span>
                      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent flex-1" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium">
                        Event Name *
                      </Label>
                      <Input
                        id="name"
                        {...register("name", {
                          required: "Event name is required",
                        })}
                        placeholder="Enter event name"
                        className="h-11 border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                      />
                      {errors.name?.message && (
                        <p className="text-sm text-red-500">
                          {errors.name.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-sm font-medium">
                        Description
                      </Label>
                      <Textarea
                        id="description"
                        {...register("description")}
                        placeholder="Enter event description"
                        rows={3}
                        className="border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400 transition-colors resize-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location" className="text-sm font-medium">
                        Location
                      </Label>
                      <Input
                        id="location"
                        {...register("location")}
                        placeholder="Enter event location"
                        className="h-11 border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Date & Time Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent flex-1" />
                      <span className="text-xs font-medium text-muted-foreground px-3">SCHEDULE</span>
                      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent flex-1" />
                    </div>

                    {/* Start Date & Time */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Start Date & Time *</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "h-11 justify-start text-left font-normal border-slate-200 dark:border-slate-700",
                                !startDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {startDate ? format(startDate, "PPP") : "Pick start date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={startDate}
                              onSelect={(date) => setValue("start_date", date)}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <Input
                          type="time"
                          {...register("start_time", {
                            required: "Start time is required",
                          })}
                          className="h-11 border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400"
                        />
                      </div>
                    </div>

                    {/* End Date & Time */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">End Date & Time *</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "h-11 justify-start text-left font-normal border-slate-200 dark:border-slate-700",
                                !endDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {endDate ? format(endDate, "PPP") : "Pick end date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={endDate}
                              onSelect={(date) => setValue("end_date", date)}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <Input
                          type="time"
                          {...register("end_time", {
                            required: "End time is required",
                          })}
                          className="h-11 border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400"
                        />
                      </div>
                    </div>

                    {(errors.start_time?.message || errors.end_time?.message) && (
                      <p className="text-sm text-red-500">
                        Start and end date/time are required
                      </p>
                    )}
                  </div>

                  {/* Media Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent flex-1" />
                      <span className="text-xs font-medium text-muted-foreground px-3">MEDIA</span>
                      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent flex-1" />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        Event Banner Image (Optional)
                        {isAnalyzingBanner && <span className="text-xs text-blue-600">(Analyzing...)</span>}
                      </Label>
                      <ImageUpload onImageSelect={handleBannerSelect} label="" />
                      {isAnalyzingBanner && (
                        <p className="text-xs text-muted-foreground">
                          AI is extracting event details from the banner...
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                    <Button
                      type="submit"
                      className="flex-1 h-11 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg transition-all"
                      disabled={isCreating || isUpdating}
                    >
                      {(isCreating || isUpdating) && (
                        <Loader className="h-4 w-4 mr-2 animate-spin" />
                      )}
                      <Plus className="h-4 w-4 mr-2" />
                      {editingEvent ? "Update Event" : "Create Event"}
                    </Button>
                    {editingEvent && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                        className="border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Events List - Right Side */}
          <div className="xl:col-span-3">
            <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
              <CardHeader className="pb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 shadow-md">
                      <Calendar className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-semibold">
                        Your Events
                      </CardTitle>
                      <CardDescription className="text-sm text-muted-foreground mt-1">
                        {events.length} {events.length === 1 ? 'event' : 'events'} in your schedule
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {events.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 inline-block mb-6">
                      <Calendar className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      No events scheduled yet
                    </h3>
                    <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                      Create your first event using the form to get started with event management
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2">
                    {events.map((event) => (
                      <div
                        key={event.id}
                        className="group p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0 space-y-4">
                            {/* Event Header */}
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                              <div className="space-y-2">
                                <h3 className="font-semibold text-lg text-foreground group-hover:text-blue-600 transition-colors">
                                  {event.name}
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                  {isEventLive(event.start_time, event.end_time) && (
                                    <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-sm">
                                      <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-1.5"></div>
                                      Live
                                    </Badge>
                                  )}
                                  {isEventUpcoming(event.start_time) && (
                                    <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-sm">
                                      <Clock className="w-3 h-3 mr-1.5" />
                                      Upcoming
                                    </Badge>
                                  )}
                                  {!isEventPaid(event.id) && (
                                    <Badge variant="outline" className="border-blue-500 text-blue-600">
                                      <Key className="w-3 h-3 mr-1.5" />
                                      Access Code Required
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-2 flex-shrink-0">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(event)}
                                  disabled={isUpdating}
                                  className="hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 transition-colors"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(event.id)}
                                  disabled={isDeleting}
                                  className="hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 transition-colors"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            {/* Event Description */}
                            {event.description && (
                              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                                {event.description}
                              </p>
                            )}

                            {/* Event Banner */}
                            {event.banner_url && (
                              <div className="rounded-lg overflow-hidden shadow-sm">
                                <img
                                  src={event.banner_url}
                                  alt="Event Banner"
                                  className="w-full h-32 object-cover hover:scale-105 transition-transform duration-300"
                                />
                              </div>
                            )}

                            {/* Event Details */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex-shrink-0">
                                  <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-medium text-muted-foreground mb-1">Schedule</p>
                                  <p className="text-sm font-medium text-foreground truncate">
                                    {formatDate(event.start_time)}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    to {formatDate(event.end_time)}
                                  </p>
                                </div>
                              </div>
                              {event.location && (
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                                  <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex-shrink-0">
                                    <MapPin className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-xs font-medium text-muted-foreground mb-1">Location</p>
                                    <p className="text-sm font-medium text-foreground truncate">
                                      {event.location}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* QR Code Section */}
                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                              <EventQRCode eventId={event.id} eventName={event.name} />
                            </div>
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
      </div>
    </div>
  );
};

export default AdminEvents;
