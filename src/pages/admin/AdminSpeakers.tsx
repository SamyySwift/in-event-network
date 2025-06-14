import React, { useState } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminDataTable from '@/components/admin/AdminDataTable';
import EventSelector from '@/components/admin/EventSelector';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ImageUpload } from '@/components/ui/image-upload';
import { useForm } from 'react-hook-form';
import { useAdminSpeakers } from '@/hooks/useAdminSpeakers';
import { useAdminEventContext, AdminEventProvider } from '@/hooks/useAdminEventContext';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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

  const columns = [
    {
      header: 'Speaker',
      accessorKey: 'name',
      cell: (value: string, row: any) => (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={row.photo_url} alt={row.name} />
            <AvatarFallback>{row.name?.charAt(0) || 'S'}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{row.name}</div>
            <div className="text-sm text-muted-foreground">
              {row.title && row.company ? `${row.title} at ${row.company}` : (row.title || row.company || 'Speaker')}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Session',
      accessorKey: 'session_title',
      cell: (value: string, row: any) => (
        <div>
          <div className="font-medium">{value || 'No session assigned'}</div>
          {row.session_time && (
            <div className="text-sm text-muted-foreground">
              {new Date(row.session_time).toLocaleDateString()} at {new Date(row.session_time).toLocaleTimeString()}
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Bio',
      accessorKey: 'bio',
      cell: (value: string) => (
        <div className="max-w-xs truncate" title={value}>
          {value}
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading speakers...</p>
        </div>
      </div>
    );
  }

  if (!selectedEvent) {
    return (
      <div className="flex flex-col gap-5">
        <div className="border rounded-lg p-4 bg-card">
          <EventSelector />
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="mt-2 text-muted-foreground">Please select an event to manage speakers</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="border rounded-lg p-4 bg-card">
        <EventSelector />
      </div>

      <AdminPageHeader
        title="Speakers"
        description={`Manage speakers for ${selectedEvent.name}`}
        actionLabel="Add Speaker"
        onAction={() => setIsCreating(true)}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {isCreating && (
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>{editingSpeaker ? 'Edit Speaker' : 'Add New Speaker'}</CardTitle>
                <CardDescription>
                  {editingSpeaker ? 'Update speaker information' : 'Add a speaker to the event'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <ImageUpload
                      onImageSelect={handleImageSelect}
                      currentImageUrl={imagePreview}
                      label="Speaker Photo"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      {...register("name", { required: "Name is required" })}
                      placeholder="Speaker name"
                    />
                    {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      {...register("title")}
                      placeholder="Job title"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      {...register("company")}
                      placeholder="Company name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio *</Label>
                    <Textarea
                      id="bio"
                      {...register("bio", { required: "Bio is required" })}
                      placeholder="Speaker biography"
                      rows={3}
                    />
                    {errors.bio && <p className="text-sm text-destructive">{errors.bio.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="session_title">Session Title</Label>
                    <Input
                      id="session_title"
                      {...register("session_title")}
                      placeholder="Session or talk title"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="session_time">Session Time</Label>
                    <Input
                      id="session_time"
                      type="datetime-local"
                      {...register("session_time")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="twitter_link">Twitter</Label>
                    <Input
                      id="twitter_link"
                      {...register("twitter_link")}
                      placeholder="https://twitter.com/username"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="linkedin_link">LinkedIn</Label>
                    <Input
                      id="linkedin_link"
                      {...register("linkedin_link")}
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website_link">Website</Label>
                    <Input
                      id="website_link"
                      {...register("website_link")}
                      placeholder="https://website.com"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">
                      {editingSpeaker ? 'Update Speaker' : 'Add Speaker'}
                    </Button>
                    <Button type="button" variant="outline" onClick={handleCancel}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
          
          <div className={isCreating ? "lg:col-span-2" : "lg:col-span-3"}>
            <AdminDataTable
              columns={columns}
              data={speakers}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        </div>
      </AdminPageHeader>
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
