
import React, { useState } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Loader } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useSpeakers } from '@/hooks/useSpeakers';

type SpeakerFormData = {
  name: string;
  bio: string;
  title?: string;
  company?: string;
  session_title?: string;
  session_time?: string;
  twitter_link?: string;
  linkedin_link?: string;
  website_link?: string;
};

const AdminSpeakers = () => {
  const [editingSpeaker, setEditingSpeaker] = useState<string | null>(null);
  const { speakers, isLoading, createSpeaker, updateSpeaker, deleteSpeaker, isCreating, isUpdating, isDeleting } = useSpeakers();

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<SpeakerFormData>({
    defaultValues: {
      name: '',
      bio: '',
      title: '',
      company: '',
      session_title: '',
      session_time: '',
      twitter_link: '',
      linkedin_link: '',
      website_link: '',
    }
  });

  const onSubmit = (data: SpeakerFormData) => {
    const speakerData = {
      ...data,
      session_time: data.session_time || undefined,
    };

    if (editingSpeaker) {
      updateSpeaker({ id: editingSpeaker, ...speakerData });
      setEditingSpeaker(null);
    } else {
      createSpeaker(speakerData);
    }
    reset();
  };

  const handleEdit = (speaker: any) => {
    setEditingSpeaker(speaker.id);
    setValue('name', speaker.name);
    setValue('bio', speaker.bio);
    setValue('title', speaker.title || '');
    setValue('company', speaker.company || '');
    setValue('session_title', speaker.session_title || '');
    setValue('session_time', speaker.session_time ? new Date(speaker.session_time).toISOString().slice(0, 16) : '');
    setValue('twitter_link', speaker.twitter_link || '');
    setValue('linkedin_link', speaker.linkedin_link || '');
    setValue('website_link', speaker.website_link || '');
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this speaker?')) {
      deleteSpeaker(id);
    }
  };

  const handleCancel = () => {
    setEditingSpeaker(null);
    reset();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Speakers</h1>
          <p className="text-muted-foreground">
            Manage speakers and their sessions for your event
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{editingSpeaker ? 'Edit Speaker' : 'Add New Speaker'}</CardTitle>
            <CardDescription>
              {editingSpeaker ? 'Update speaker information' : 'Add speakers and their session information'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Speaker Name</Label>
                <Input
                  id="name"
                  {...register("name", { required: "Speaker name is required" })}
                  placeholder="Enter speaker name"
                />
                {errors.name?.message && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Biography</Label>
                <Textarea
                  id="bio"
                  {...register("bio", { required: "Biography is required" })}
                  placeholder="Enter speaker biography"
                  rows={3}
                />
                {errors.bio?.message && (
                  <p className="text-sm text-destructive">{errors.bio.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title/Position</Label>
                <Input
                  id="title"
                  {...register("title")}
                  placeholder="Enter speaker title or position"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  {...register("company")}
                  placeholder="Enter speaker company"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="session_title">Session Title</Label>
                <Input
                  id="session_title"
                  {...register("session_title")}
                  placeholder="Enter session title"
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
                <Label htmlFor="twitter_link">Twitter Link</Label>
                <Input
                  id="twitter_link"
                  {...register("twitter_link")}
                  placeholder="https://twitter.com/username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedin_link">LinkedIn Link</Label>
                <Input
                  id="linkedin_link"
                  {...register("linkedin_link")}
                  placeholder="https://linkedin.com/in/username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website_link">Website Link</Label>
                <Input
                  id="website_link"
                  {...register("website_link")}
                  placeholder="https://website.com"
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1" disabled={isCreating || isUpdating}>
                  {(isCreating || isUpdating) && <Loader className="h-4 w-4 mr-2 animate-spin" />}
                  <Plus className="h-4 w-4 mr-2" />
                  {editingSpeaker ? 'Update Speaker' : 'Add Speaker'}
                </Button>
                {editingSpeaker && (
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Speakers</CardTitle>
              <CardDescription>
                {speakers.length} speakers scheduled for your event
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {speakers.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No speakers added yet. Add your first speaker using the form.
                  </p>
                ) : (
                  speakers.map((speaker) => (
                    <div key={speaker.id} className="flex items-start space-x-4 p-3 rounded-lg border">
                      <Avatar className="h-12 w-12">
                        {speaker.photo_url ? (
                          <AvatarImage src={speaker.photo_url} alt={speaker.name} />
                        ) : (
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {speaker.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{speaker.name}</h4>
                          <div className="flex space-x-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleEdit(speaker)}
                              disabled={isUpdating}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleDelete(speaker.id)}
                              disabled={isDeleting}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {speaker.title} {speaker.company && `at ${speaker.company}`}
                        </p>
                        <div className="pt-2">
                          {speaker.session_title && (
                            <Badge variant="outline" className="mr-2">
                              {speaker.session_title}
                            </Badge>
                          )}
                          {speaker.session_time && (
                            <Badge variant="secondary">
                              {formatDate(speaker.session_time)}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSpeakers;
