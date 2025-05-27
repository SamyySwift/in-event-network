import React from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, ExternalLink } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from '@/hooks/use-toast';

// Mock data for speakers
const mockSpeakers = [
  {
    id: '1',
    name: 'Dr. Jane Smith',
    title: 'AI Research Director',
    company: 'TechInnovate Labs',
    bio: 'Dr. Smith has over 15 years of experience in artificial intelligence and machine learning research.',
    photoUrl: '',
    sessionTitle: 'The Future of AI in Event Networking',
    sessionTime: '2023-06-15T14:00',
  },
  {
    id: '2',
    name: 'Michael Johnson',
    title: 'Chief Marketing Officer',
    company: 'Global Events Inc.',
    bio: 'Michael specializes in digital marketing strategies for large-scale events and conferences.',
    photoUrl: '',
    sessionTitle: 'Maximizing Attendee Engagement Through Digital Channels',
    sessionTime: '2023-06-16T10:30',
  },
  {
    id: '3',
    name: 'Sarah Chen',
    title: 'UX Research Lead',
    company: 'DesignForward',
    bio: 'Sarah has pioneered user-centered design approaches for event platforms and mobile applications.',
    photoUrl: '',
    sessionTitle: 'Creating Intuitive Event Experiences',
    sessionTime: '2023-06-16T15:45',
  },
];

type SpeakerFormData = {
  name: string;
  bio: string;
  title?: string;
  company?: string;
  sessionTitle?: string;
  sessionTime?: string;
};

const AdminSpeakers = () => {
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<SpeakerFormData>({
    defaultValues: {
      name: '',
      bio: '',
      title: '',
      company: '',
      sessionTitle: '',
      sessionTime: '',
    }
  });

  const onSubmit = (data: SpeakerFormData) => {
    console.log('Form submitted:', data);
    toast({
      title: 'Speaker Added',
      description: `${data.name} has been added as a speaker.`,
    });
    reset();
  };

  const handleEdit = (speaker: any) => {
    console.log('Edit speaker:', speaker);
    // Populate form with speaker data
    setValue('name', speaker.name);
    setValue('bio', speaker.bio);
    setValue('title', speaker.title);
    setValue('company', speaker.company);
    setValue('sessionTitle', speaker.sessionTitle);
    setValue('sessionTime', speaker.sessionTime);
  };

  const handleDelete = (id: string) => {
    console.log('Delete speaker with ID:', id);
    toast({
      title: 'Speaker Removed',
      description: 'The speaker has been removed successfully.',
      variant: 'destructive',
    });
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

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Speakers</h1>
          <p className="text-muted-foreground">
            Manage speakers and their sessions for your event
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Import Speakers
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Add New Speaker</CardTitle>
            <CardDescription>
              Add speakers and their session information
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
                <Label htmlFor="sessionTitle">Session Title</Label>
                <Input
                  id="sessionTitle"
                  {...register("sessionTitle")}
                  placeholder="Enter session title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sessionTime">Session Time</Label>
                <Input
                  id="sessionTime"
                  type="datetime-local"
                  {...register("sessionTime")}
                />
              </div>

              <Button type="submit" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Speaker
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Speakers</CardTitle>
              <CardDescription>
                {mockSpeakers.length} speakers scheduled for your event
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockSpeakers.map((speaker) => (
                  <div key={speaker.id} className="flex items-start space-x-4 p-3 rounded-lg border">
                    <Avatar className="h-12 w-12">
                      {speaker.photoUrl ? (
                        <AvatarImage src={speaker.photoUrl} alt={speaker.name} />
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
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(speaker)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(speaker.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {speaker.title} at {speaker.company}
                      </p>
                      <div className="pt-2">
                        <Badge variant="outline" className="mr-2">
                          {speaker.sessionTitle}
                        </Badge>
                        <Badge variant="secondary">
                          {formatDate(speaker.sessionTime)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSpeakers;
