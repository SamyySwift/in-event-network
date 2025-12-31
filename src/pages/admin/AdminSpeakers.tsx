import React, { useState } from 'react';
// Remove this import:
// import AdminLayout from '@/components/layouts/AdminLayout';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import EventSelector from '@/components/admin/EventSelector';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ImageUpload } from '@/components/ui/image-upload';
import { RefreshCw, Sparkles } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Switch } from '@/components/ui/switch';
import { useAdminSpeakers } from '@/hooks/useAdminSpeakers';
import { useAdminEventContext } from '@/hooks/useAdminEventContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useFormPersistence } from '@/hooks/useFormPersistence';
import { useEffect } from 'react';
import SpeakerStatsCards from './components/SpeakerStatsCards';
import SpeakersTable from './components/SpeakersTable';
import SpeakerFilters from '@/components/admin/SpeakerFilters';
import { isToday, isTomorrow, parseISO } from "date-fns";
import PaymentGuard from '@/components/payment/PaymentGuard';
type SpeakerFormData = {
  name: string;
  title?: string;
  company?: string;
  bio: string;
  session_title?: string;
  session_time?: string;
  time_allocation?: string;
  topic?: string;
  twitter_link?: string;
  linkedin_link?: string;
  website_link?: string;
  instagram_link?: string;
  tiktok_link?: string;
};
const AdminSpeakersContent = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingSpeaker, setEditingSpeaker] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isGeneratingBio, setIsGeneratingBio] = useState(false);
  const [isIdentifyingImage, setIsIdentifyingImage] = useState(false);
  const [aiAutoAnalysis, setAiAutoAnalysis] = useState(true); // Toggle for AI auto-analysis
  const formRef = React.useRef<HTMLDivElement>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedTopic, setSelectedTopic] = useState("all");
  const {
    selectedEventId,
    selectedEvent
  } = useAdminEventContext();
  const {
    speakers = [], // Provide default empty array
    isLoading,
    error,
    createSpeaker,
    updateSpeaker,
    deleteSpeaker,
    refetch
  } = useAdminSpeakers(selectedEventId || undefined);
  const {
    toast
  } = useToast();
  const {
    currentUser
  } = useAuth();
  const form = useForm<SpeakerFormData>();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: {
      errors
    }
  } = form;

  // Form persistence
  const { saveFormData, clearSavedData, hasSavedData } = useFormPersistence(
    'speaker-form',
    form,
    isCreating && !editingSpeaker
  );

  // Watch form values for auto-save
  const watchedValues = watch();

  // Auto-save form data when values change
  useEffect(() => {
    if (isCreating && !editingSpeaker) {
      saveFormData(watchedValues);
    }
  }, [watchedValues, saveFormData, isCreating, editingSpeaker]);

  // Filter and sort speakers by session time
  const filteredSpeakers = speakers
    .filter((speaker) => {
      const matchesSearch = 
        speaker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        speaker.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        speaker.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        speaker.topic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        speaker.session_title?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = (() => {
        if (selectedStatus === "all") return true;
        if (selectedStatus === "confirmed") return !!speaker.session_title;
        if (selectedStatus === "pending") return !speaker.session_title;
        if (selectedStatus === "with_topic") return !!speaker.topic;
        if (selectedStatus === "no_topic") return !speaker.topic;
        return true;
      })();

      const matchesTopic = selectedTopic === "all" || speaker.topic === selectedTopic;

      const matchesDate = (() => {
        if (selectedDate === "all") return true;
        
        if (selectedDate.startsWith("date-")) {
          const targetDate = selectedDate.replace("date-", "");
          const speakerDate = speaker.session_time ? speaker.session_time.slice(0, 10) : null;
          return speakerDate === targetDate;
        }

        const speakerDate = speaker.session_time ? speaker.session_time.slice(0, 10) : null;
        if (!speakerDate) return selectedDate === "tba";

        try {
          const date = parseISO(speakerDate);
          if (selectedDate === "today") return isToday(date);
          if (selectedDate === "tomorrow") return isTomorrow(date);
          if (selectedDate === "tba") return false;
        } catch {
          return selectedDate === "tba";
        }

        return true;
      })();

      return matchesSearch && matchesStatus && matchesTopic && matchesDate;
    })
    .sort((a, b) => {
      // Sort by session time - speakers with session times come first, sorted chronologically
      if (!a.session_time && !b.session_time) return 0;
      if (!a.session_time) return 1; // Move speakers without session time to end
      if (!b.session_time) return -1; // Move speakers without session time to end
      
      try {
        const timeA = new Date(a.session_time).getTime();
        const timeB = new Date(b.session_time).getTime();
        return timeA - timeB; // Sort in ascending order (earliest first, like 10am before 1pm)
      } catch (error) {
        console.error('Error sorting by session time:', error);
        return 0;
      }
    });

  // Calculate some simple speaker stats
  const totalSpeakers = filteredSpeakers.length;
  const sessions = filteredSpeakers.filter(s => s.session_title).length;
  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${currentUser?.id}/speakers/${Date.now()}.${fileExt}`;
    const {
      error: uploadError
    } = await supabase.storage.from('event-images').upload(fileName, file);
    if (uploadError) {
      throw uploadError;
    }
    const {
      data: {
        publicUrl
      }
    } = supabase.storage.from('event-images').getPublicUrl(fileName);
    return publicUrl;
  };
  const onSubmit = async (data: SpeakerFormData) => {
    if (!selectedEventId) {
      toast({
        title: "No Event Selected",
        description: "Please select an event before adding a speaker",
        variant: "destructive"
      });
      return;
    }
    try {
      let photoUrl = imagePreview;
      if (selectedImage) {
        photoUrl = await uploadImage(selectedImage);
      }
      // Convert local datetime (from input) to UTC ISO string for consistent storage
      let sessionTimeISO: string | undefined = undefined;
      if (data.session_time) {
        const localDate = new Date(data.session_time);
        if (!isNaN(localDate.getTime())) {
          sessionTimeISO = localDate.toISOString();
        } else {
          // Fallback: keep original with seconds
          sessionTimeISO = `${data.session_time}:00`;
        }
      }

      const speakerData = {
        ...data,
        event_id: selectedEventId,
        photo_url: photoUrl,
        session_time: sessionTimeISO,
      };
      if (editingSpeaker) {
        updateSpeaker({
          id: editingSpeaker,
          ...speakerData
        });
        setEditingSpeaker(null);
      } else {
        createSpeaker(speakerData);
      }
      reset();
      setSelectedImage(null);
      setImagePreview('');
      setIsCreating(false);
      // Clear saved form data after successful submission
      clearSavedData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload image. Please try again.",
        variant: "destructive"
      });
    }
  };
  const handleEdit = (speaker: any) => {
    setEditingSpeaker(speaker.id);
    setIsCreating(true);
    setImagePreview(speaker.photo_url || '');
    setValue('name', speaker.name);
    setValue('title', speaker.title || '');
    setValue('company', speaker.company || '');
    setValue('bio', speaker.bio);
    setValue('session_title', speaker.session_title || '');
    // Set session time for datetime-local input (convert UTC -> local string)
    if (speaker.session_time) {
      const d = new Date(speaker.session_time);
      if (!isNaN(d.getTime())) {
        const pad = (n: number) => String(n).padStart(2, '0');
        const localValue = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        setValue('session_time', localValue);
      } else {
        const timeValue = speaker.session_time.includes('T')
          ? speaker.session_time.slice(0, 16)
          : speaker.session_time;
        setValue('session_time', timeValue);
      }
    } else {
      setValue('session_time', '');
    }
    setValue('time_allocation', speaker.time_allocation || '');
    setValue('topic', speaker.topic || '');
    setValue('twitter_link', speaker.twitter_link || '');
    setValue('linkedin_link', speaker.linkedin_link || '');
    setValue('website_link', speaker.website_link || '');
    setValue('instagram_link', speaker.instagram_link || '');
    setValue('tiktok_link', speaker.tiktok_link || '');
    
    // Scroll to the form after a brief delay to ensure state is updated
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };
  const handleDelete = (speaker: any) => {
    if (confirm('Are you sure you want to delete this speaker?')) {
      deleteSpeaker(speaker.id);
    }
  };
  const handleCancel = () => {
    setIsCreating(false);
    setEditingSpeaker(null);
    setSelectedImage(null);
    setImagePreview('');
    reset();
    // Clear saved form data when canceling
    if (!editingSpeaker) {
      clearSavedData();
    }
  };
  const handleGenerateBio = async () => {
    const name = watch('name');
    if (!name?.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter the speaker's name first",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingBio(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-speaker-info', {
        body: { name: name.trim() }
      });

      if (error) throw error;

      if (data.error) {
        toast({
          title: "Generation Failed",
          description: data.error,
          variant: "destructive"
        });
        return;
      }

      // Fill in the form fields
      if (data.title) setValue('title', data.title);
      if (data.company) setValue('company', data.company);
      if (data.bio) setValue('bio', data.bio);
      if (data.twitter_link) setValue('twitter_link', data.twitter_link);
      if (data.linkedin_link) setValue('linkedin_link', data.linkedin_link);
      if (data.instagram_link) setValue('instagram_link', data.instagram_link);
      if (data.website_link) setValue('website_link', data.website_link);

      toast({
        title: "Bio Generated",
        description: "Speaker information and social links have been generated successfully"
      });
    } catch (error) {
      console.error('Error generating bio:', error);
      toast({
        title: "Error",
        description: "Failed to generate speaker information. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingBio(false);
    }
  };

  const handleImageSelect = async (file: File | null) => {
    setSelectedImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        setImagePreview(base64);
        
        // Only auto-identify if the toggle is enabled
        if (aiAutoAnalysis) {
          setIsIdentifyingImage(true);
          try {
            const { data, error } = await supabase.functions.invoke('generate-speaker-info', {
              body: { imageBase64: base64 }
            });

            if (error) throw error;

            if (data.error) {
              console.log('Image identification note:', data.error);
              return;
            }

            // Fill in the form fields if identification was successful
            if (data.name && !watch('name')) setValue('name', data.name);
            if (data.title) setValue('title', data.title);
            if (data.company) setValue('company', data.company);
            if (data.bio) setValue('bio', data.bio);
            if (data.twitter_link) setValue('twitter_link', data.twitter_link);
            if (data.linkedin_link) setValue('linkedin_link', data.linkedin_link);
            if (data.instagram_link) setValue('instagram_link', data.instagram_link);
            if (data.website_link) setValue('website_link', data.website_link);

            toast({
              title: "Speaker Identified",
              description: "Information and social links have been extracted from the image"
            });
          } catch (error) {
            console.error('Error identifying image:', error);
            // Don't show error toast for image identification as it's optional
          } finally {
            setIsIdentifyingImage(false);
          }
        }
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview('');
    }
  };
  if (isLoading) {
    return <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
        <p className="text-muted-foreground">Loading speakers...</p>
      </div>;
  }

  // Add better error handling in the render
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading speakers</h3>
          <p className="mt-1 text-sm text-gray-500">
            {error instanceof Error ? error.message : 'An unexpected error occurred'}
          </p>
        </div>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
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
          <p className="text-sm text-muted-foreground">Please select an event above to manage its speakers</p>
        </div>
      )}

      {/* Only show content when an event is selected */}
      {selectedEventId && (
        <PaymentGuard 
          eventId={selectedEventId} 
          eventName={selectedEvent?.name || 'this event'}
          feature="Speakers & Sessions Management"
        >
          {/* Gradient Hero Section */}
      <div className="p-8 rounded-2xl bg-gradient-to-br from-blue-100 to-primary-50 text-primary-900 shadow-2xl shadow-primary/10 mb-2 relative overflow-hidden">
        <div className="absolute -top-12 -right-10 w-56 h-56 bg-white/10 rounded-full opacity-40 blur-2xl pointer-events-none"></div>
        <div className="absolute -bottom-14 -left-14 w-36 h-36 bg-white/20 rounded-full opacity-30 pointer-events-none"></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold tracking-tight">Speakers</h1>
          <p className="mt-2 max-w-2xl text-primary-700">
            Manage all speakers and sessions for <span className="font-semibold">{selectedEvent?.name ?? "your event"}</span>.
          </p>
          <div className="mt-6">
            <SpeakerStatsCards totalSpeakers={totalSpeakers} sessions={sessions} />
          </div>
        </div>
      </div>

      <div className="glass-card p-6 rounded-xl space-y-8 shadow-xl">
        {/* Modern Section Header - Responsive for mobile */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-fuchsia-400 via-purple-500 to-indigo-600 shadow-md">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6 2a4 4 0 11-8 0 4 4 0 008 0zm6-8v2m0 4v2m0-8a4 4 0 10-8 0 4 4 0 008 0z" />
              </svg>
            </span>
            <div>
              <div className="uppercase text-xs font-bold text-primary-600 tracking-wide">Speakers</div>
              <div className="text-lg font-semibold text-primary-900 dark:text-primary-100">
                {selectedEvent?.name ? `For ${selectedEvent.name}` : "Select an Event"}
              </div>
            </div>
          </div>
          <Button onClick={() => setIsCreating(true)} variant="gradient" className="shadow hover-scale w-full md:w-auto" disabled={!selectedEventId}>
            Add Speaker
          </Button>
        </div>

        {/* Show message when no event is selected */}
        {!selectedEventId && <div className="text-center py-12">
            <div className="p-4 rounded-full bg-primary/10 inline-block mb-4">
              <svg className="h-8 w-8 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-muted-foreground text-lg mb-2">No event selected</p>
            <p className="text-sm text-muted-foreground">Please select an event above to manage its speakers</p>
          </div>}

        {/* Add/Edit Speaker Form */}
        {isCreating && selectedEventId && <Card className="mb-6 glass-card bg-gradient-to-br from-white/90 via-primary-50/70 to-primary-100/60 transition-all animate-fade-in shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {editingSpeaker ? 'Edit Speaker' : 'Add New Speaker'}
                {!editingSpeaker && hasSavedData && (
                  <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">
                    Draft Restored
                  </span>
                )}
              </CardTitle>
              <CardDescription>
                {editingSpeaker ? 'Update speaker information' : 'Add a speaker to the event'}
                {!editingSpeaker && hasSavedData && (
                  <span className="block text-amber-600 text-sm mt-1">
                    Your previous work has been restored automatically
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <Label htmlFor="ai-toggle" className="text-sm font-medium cursor-pointer">
                    AI Auto-Analysis
                  </Label>
                </div>
                <Switch
                  id="ai-toggle"
                  checked={aiAutoAnalysis}
                  onCheckedChange={setAiAutoAnalysis}
                />
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="grid md:grid-cols-2 gap-6">
                <div className="flex flex-col space-y-5">
                  <div className="relative">
                    <ImageUpload onImageSelect={handleImageSelect} currentImageUrl={imagePreview} label="Speaker Photo" />
                    {isIdentifyingImage && (
                      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-lg">
                        <div className="flex items-center gap-2 text-sm">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                          <span className="text-muted-foreground">Identifying speaker...</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        {...register('name', { required: 'Name is required' })}
                        placeholder="Speaker name"
                      />
                      {errors.name && (
                        <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        {...register('title')}
                        placeholder="Job title"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        {...register('company')}
                        placeholder="Company name"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="topic">Speaker Topic</Label>
                      <Input
                        id="topic"
                        {...register('topic')}
                        placeholder="Topic or area of expertise"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="bio">Bio *</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleGenerateBio}
                      disabled={isGeneratingBio || !watch('name')?.trim()}
                      className="text-xs"
                    >
                      {isGeneratingBio ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary mr-1"></div>
                          Generating...
                        </>
                      ) : (
                        <>
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          Generate Bio
                        </>
                      )}
                    </Button>
                  </div>
                  <Textarea
                    id="bio"
                    {...register('bio', { required: 'Bio is required' })}
                    placeholder="Speaker biography"
                    rows={4}
                  />
                  {errors.bio && (
                    <p className="text-sm text-red-500 mt-1">{errors.bio.message}</p>
                  )}
                </div>
                <div className="flex flex-col space-y-5">
                  <div>
                    <Label htmlFor="session_title">Session Title</Label>
                    <Input id="session_title" {...register("session_title")} placeholder="Session or talk title" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="session_time">Session Time</Label>
                    <Input id="session_time" type="datetime-local" {...register("session_time")} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="time_allocation">Time Allocation (Optional)</Label>
                    <Input
                      id="time_allocation"
                      {...register("time_allocation")}
                      placeholder="e.g., 30min, 1hr, 2hrs"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="twitter_link">Twitter</Label>
                    <Input id="twitter_link" {...register("twitter_link")} placeholder="https://twitter.com/username" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="linkedin_link">LinkedIn</Label>
                    <Input id="linkedin_link" {...register("linkedin_link")} placeholder="https://linkedin.com/in/username" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="website_link">Website</Label>
                    <Input id="website_link" {...register("website_link")} placeholder="https://website.com" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="instagram_link">Instagram</Label>
                    <Input id="instagram_link" {...register("instagram_link")} placeholder="https://instagram.com/username" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="tiktok_link">TikTok</Label>
                    <Input id="tiktok_link" {...register("tiktok_link")} placeholder="https://tiktok.com/@username" className="mt-1" />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button type="submit" className="flex-1">
                      {editingSpeaker ? 'Update Speaker' : 'Add Speaker'}
                    </Button>
                    <Button type="button" variant="outline" onClick={handleCancel}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>}

        {/* Speaker Filters */}
        {selectedEventId && (
          <SpeakerFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            selectedTopic={selectedTopic}
            onTopicChange={setSelectedTopic}
            speakers={speakers}
          />
        )}

        {/* Table with Modern Styling */}
        {selectedEventId && (
          <>
            {speakers.length === 0 ? (
              <div className="text-center py-12">
                <div className="p-4 rounded-full bg-primary/10 inline-block mb-4">
                  <svg className="h-8 w-8 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6 2a4 4 0 11-8 0 4 4 0 008 0zm6-8v2m0 4v2m0-8a4 4 0 10-8 0 4 4 0 008 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Speakers Yet</h3>
                <p className="text-gray-600 mb-4">
                  Get started by adding your first speaker to {selectedEvent?.name}.
                </p>
                <Button 
                  onClick={() => setIsCreating(true)} 
                  variant="gradient"
                  className="mx-auto"
                >
                  Add First Speaker
                </Button>
              </div>
            ) : filteredSpeakers.length === 0 ? (
              <div className="text-center py-12">
                <div className="p-4 rounded-full bg-primary/10 inline-block mb-4">
                  <svg className="h-8 w-8 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6 2a4 4 0 11-8 0 4 4 0 008 0zm6-8v2m0 4v2m0-8a4 4 0 10-8 0 4 4 0 008 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Speakers Match Your Filters</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting the filters above to find speakers.
                </p>
              </div>
            ) : (
              <SpeakersTable speakers={filteredSpeakers} onEdit={handleEdit} onDelete={handleDelete} />
            )}
          </>
        )}
      </div>
        </PaymentGuard>
      )}
    </div>
  );
};

const AdminSpeakers = AdminSpeakersContent;

export default AdminSpeakers;