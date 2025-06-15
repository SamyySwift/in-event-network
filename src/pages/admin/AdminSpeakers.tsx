import React, { useState } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import EventSelector from '@/components/admin/EventSelector';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ImageUpload } from '@/components/ui/image-upload';
import { useForm } from 'react-hook-form';
import { useAdminSpeakers } from '@/hooks/useAdminSpeakers';
import { useAdminEventContext, AdminEventProvider } from '@/hooks/useAdminEventContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import SpeakerStatsCards from './components/SpeakerStatsCards';
import SpeakersTable from './components/SpeakersTable';

type SpeakerFormData = {
  name: string;
  title?: string;
  company?: string;
  bio: string;
  session_title?: string;
  session_time?: string;
  twitter_link?: string;
  linkedin_link?: string;
  website_link?: string;
};

const AdminSpeakersContent = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingSpeaker, setEditingSpeaker] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const { selectedEventId, selectedEvent } = useAdminEventContext();
  const { speakers, isLoading, createSpeaker, updateSpeaker, deleteSpeaker } = useAdminSpeakers(selectedEventId || undefined);
  const { toast } = useToast();
  const { currentUser } = useAuth();

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<SpeakerFormData>();

  // Calculate some simple speaker stats
  const totalSpeakers = speakers.length;
  const sessions = speakers.filter(s => s.session_title).length;

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${currentUser?.id}/speakers/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('event-images')
      .upload(fileName, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('event-images')
      .getPublicUrl(fileName);

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
      const speakerData = {
        ...data,
        event_id: selectedEventId,
        photo_url: photoUrl,
        session_time: data.session_time ? new Date(data.session_time).toISOString() : undefined,
      };

      if (editingSpeaker) {
        updateSpeaker({ id: editingSpeaker, ...speakerData });
        setEditingSpeaker(null);
      } else {
        createSpeaker(speakerData);
      }
      reset();
      setSelectedImage(null);
      setImagePreview('');
      setIsCreating(false);
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
    setValue('session_time', speaker.session_time ? new Date(speaker.session_time).toISOString().slice(0, 16) : '');
    setValue('twitter_link', speaker.twitter_link || '');
    setValue('linkedin_link', speaker.linkedin_link || '');
    setValue('website_link', speaker.website_link || '');
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
  };

  const handleImageSelect = (file: File | null) => {
    setSelectedImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview('');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
        <p className="text-muted-foreground">Loading speakers...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Event Selector */}
      <div className="flex justify-between items-center">
        <EventSelector />
      </div>

      {/* Gradient Hero Section */}
      <div className="p-8 rounded-2xl bg-gradient-to-br from-blue-100 to-primary-100 text-primary-900 shadow-2xl shadow-primary/10 mb-2 relative overflow-hidden">
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
        {/* Modern Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-fuchsia-400 via-purple-500 to-indigo-600 shadow-md">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6 2a4 4 0 11-8 0 4 4 0 008 0zm6-8v2m0 4v2m0-8a4 4 0 10-8 0 4 4 0 008 0z"/>
              </svg>
            </span>
            <div>
              <div className="uppercase text-xs font-bold text-primary-600 tracking-wide">Speakers</div>
              <div className="text-lg font-semibold text-primary-900 dark:text-primary-100">
                {selectedEvent?.name ? `For ${selectedEvent.name}` : "Select an Event"}
              </div>
            </div>
          </div>
          <Button 
            onClick={() => setIsCreating(true)} 
            variant="gradient" 
            className="shadow hover-scale"
            disabled={!selectedEventId}
          >
            Add Speaker
          </Button>
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

        {/* Add/Edit Speaker Form */}
        {isCreating && selectedEventId && (
          <Card className="mb-6 glass-card bg-gradient-to-br from-white/90 via-primary-50/70 to-primary-100/60 transition-all animate-fade-in shadow-lg">
            <CardHeader>
              <CardTitle>{editingSpeaker ? 'Edit Speaker' : 'Add New Speaker'}</CardTitle>
              <CardDescription>
                {editingSpeaker ? 'Update speaker information' : 'Add a speaker to the event'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="grid md:grid-cols-2 gap-6">
                <div className="flex flex-col space-y-5">
                  <ImageUpload
                    onImageSelect={handleImageSelect}
                    currentImageUrl={imagePreview}
                    label="Speaker Photo"
                  />
                  <div>
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      {...register("name", { required: "Name is required" })}
                      placeholder="Speaker name"
                      className="mt-1"
                    />
                    {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      {...register("title")}
                      placeholder="Job title"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      {...register("company")}
                      placeholder="Company name"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bio">Bio *</Label>
                    <Textarea
                      id="bio"
                      {...register("bio", { required: "Bio is required" })}
                      placeholder="Speaker biography"
                      rows={3}
                      className="mt-1"
                    />
                    {errors.bio && <p className="text-sm text-destructive">{errors.bio.message}</p>}
                  </div>
                </div>
                <div className="flex flex-col space-y-5">
                  <div>
                    <Label htmlFor="session_title">Session Title</Label>
                    <Input
                      id="session_title"
                      {...register("session_title")}
                      placeholder="Session or talk title"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="session_time">Session Time</Label>
                    <Input
                      id="session_time"
                      type="datetime-local"
                      {...register("session_time")}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="twitter_link">Twitter</Label>
                    <Input
                      id="twitter_link"
                      {...register("twitter_link")}
                      placeholder="https://twitter.com/username"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="linkedin_link">LinkedIn</Label>
                    <Input
                      id="linkedin_link"
                      {...register("linkedin_link")}
                      placeholder="https://linkedin.com/in/username"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="website_link">Website</Label>
                    <Input
                      id="website_link"
                      {...register("website_link")}
                      placeholder="https://website.com"
                      className="mt-1"
                    />
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
          </Card>
        )}

        {/* Table with Modern Styling */}
        {selectedEventId && (
          <SpeakersTable
            speakers={speakers}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>
    </div>
  );
};

const AdminSpeakers = () => {
  return (
    <AdminLayout>
      <AdminEventProvider>
        <AdminSpeakersContent />
      </AdminEventProvider>
    </AdminLayout>
  );
};

export default AdminSpeakers;
