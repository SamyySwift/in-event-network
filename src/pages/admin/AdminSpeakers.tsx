import React, { useState } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminDataTable from '@/components/admin/AdminDataTable';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Speaker } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

// Mock data for speakers
const mockSpeakers: Speaker[] = [
  {
    id: '1',
    name: 'Dr. Eliza Martinez',
    photoUrl: 'https://i.pravatar.cc/150?img=5',
    bio: 'AI Research Lead at TechCorp with 15+ years of experience in machine learning.',
    sessionTopics: ['Artificial Intelligence', 'Machine Learning Ethics', 'Future of AI'],
    links: {
      twitter: 'https://twitter.com/elizamartinez',
      linkedin: 'https://linkedin.com/in/elizamartinez',
      website: 'https://elizamartinez.com'
    }
  },
  {
    id: '2',
    name: 'James Wilson',
    photoUrl: 'https://i.pravatar.cc/150?img=6',
    bio: 'Cybersecurity expert and author of "Secure By Design."',
    sessionTopics: ['Cybersecurity Trends', 'Secure Development'],
    links: {
      twitter: 'https://twitter.com/jameswilson',
      linkedin: 'https://linkedin.com/in/jameswilson'
    }
  },
  {
    id: '3',
    name: 'Sophia Chen',
    photoUrl: 'https://i.pravatar.cc/150?img=7',
    bio: 'Product design leader specializing in user-centered design methodologies.',
    sessionTopics: ['UX Research', 'Product Design', 'Design Systems'],
    links: {
      linkedin: 'https://linkedin.com/in/sophiachen',
      website: 'https://sophiachen.design'
    }
  }
];

const SpeakerForm = ({ onSubmit, initialData = null }) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: initialData || {
      name: '',
      photoUrl: '',
      bio: '',
      sessionTopics: '',
      twitter: '',
      linkedin: '',
      website: ''
    }
  });

  const onFormSubmit = (data) => {
    // Process the form data
    const speakerData = {
      ...data,
      sessionTopics: data.sessionTopics.split(',').map(topic => topic.trim()),
      links: {
        twitter: data.twitter || undefined,
        linkedin: data.linkedin || undefined,
        website: data.website || undefined
      }
    };

    // Remove the individual link fields as they're now in the links object
    delete speakerData.twitter;
    delete speakerData.linkedin;
    delete speakerData.website;

    onSubmit(speakerData);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label htmlFor="name">Speaker Name</Label>
        <Input 
          id="name" 
          placeholder="Enter speaker name" 
          {...register("name", { required: "Name is required" })}
        />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="photoUrl">Photo URL</Label>
        <Input 
          id="photoUrl" 
          placeholder="Enter photo URL" 
          {...register("photoUrl")}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea 
          id="bio" 
          placeholder="Enter speaker bio" 
          rows={4}
          {...register("bio", { required: "Bio is required" })}
        />
        {errors.bio && <p className="text-sm text-destructive">{errors.bio.message}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="sessionTopics">Session Topics (comma separated)</Label>
        <Input 
          id="sessionTopics" 
          placeholder="AI, Machine Learning, Security" 
          {...register("sessionTopics", { required: "At least one topic is required" })}
        />
        {errors.sessionTopics && <p className="text-sm text-destructive">{errors.sessionTopics.message}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="twitter">Twitter URL</Label>
        <Input 
          id="twitter" 
          placeholder="https://twitter.com/username" 
          {...register("twitter")}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="linkedin">LinkedIn URL</Label>
        <Input 
          id="linkedin" 
          placeholder="https://linkedin.com/in/username" 
          {...register("linkedin")}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="website">Website URL</Label>
        <Input 
          id="website" 
          placeholder="https://example.com" 
          {...register("website")}
        />
      </div>
      
      <div className="flex justify-end pt-2">
        <Button type="submit">Save Speaker</Button>
      </div>
    </form>
  );
};

const AdminSpeakers = () => {
  const [speakers, setSpeakers] = useState(mockSpeakers);
  
  const columns = [
    {
      header: 'Speaker',
      accessorKey: 'name',
      cell: (value: string, row: Speaker) => (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={row.photoUrl} alt={row.name} />
            <AvatarFallback>{row.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{row.name}</div>
            <div className="text-sm text-muted-foreground truncate max-w-[300px]">{row.bio?.substring(0, 60)}...</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Topics',
      accessorKey: 'sessionTopics',
      cell: (value: string[]) => (
        <div className="flex flex-wrap gap-1">
          {value?.map((topic, i) => (
            <Badge key={i} variant="outline">{topic}</Badge>
          ))}
        </div>
      ),
    },
    {
      header: 'Links',
      accessorKey: 'links',
      cell: (value: Speaker['links']) => (
        <div className="flex gap-2">
          {value?.twitter && (
            <a href={value.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
              Twitter
            </a>
          )}
          {value?.linkedin && (
            <a href={value.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline">
              LinkedIn
            </a>
          )}
          {value?.website && (
            <a href={value.website} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">
              Website
            </a>
          )}
        </div>
      ),
    }
  ];

  const handleCreateSpeaker = (speakerData) => {
    const newSpeaker = {
      id: `${speakers.length + 1}`,
      ...speakerData
    };
    
    setSpeakers([...speakers, newSpeaker]);
    toast.success("Speaker added successfully!");
  };

  const handleEditSpeaker = (speaker: Speaker) => {
    console.log('Edit speaker', speaker);
    toast.info("Edit speaker dialog would open here");
  };

  const handleDeleteSpeaker = (speaker: Speaker) => {
    setSpeakers(speakers.filter(s => s.id !== speaker.id));
    toast.success("Speaker deleted successfully!");
  };

  return (
    <AdminLayout>
      <AdminPageHeader
        title="Speakers"
        description="Manage speakers and their sessions"
        actionLabel="Add Speaker"
        actionForm={<SpeakerForm onSubmit={handleCreateSpeaker} />}
      >
        <AdminDataTable
          columns={columns}
          data={speakers}
          onEdit={handleEditSpeaker}
          onDelete={handleDeleteSpeaker}
        />
      </AdminPageHeader>
    </AdminLayout>
  );
};

export default AdminSpeakers;
