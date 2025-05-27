
import React, { useState } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminDataTable from '@/components/admin/AdminDataTable';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Speaker } from '@/types';

// Mock data for speakers
const mockSpeakers: Speaker[] = [
  {
    id: '1',
    name: 'Dr. Sarah Johnson',
    photoUrl: 'https://i.pravatar.cc/150?img=1',
    bio: 'Leading AI researcher and tech innovator with 15+ years of experience.',
    sessionTopics: ['Artificial Intelligence', 'Machine Learning', 'Future of Tech'],
    links: {
      twitter: '@sarahjohnson',
      linkedin: 'sarah-johnson-phd',
      website: 'https://sarahjohnson.dev'
    }
  },
  {
    id: '2',
    name: 'Marcus Chen',
    photoUrl: 'https://i.pravatar.cc/150?img=2',
    bio: 'Cybersecurity expert and founder of SecureTech Solutions.',
    sessionTopics: ['Cybersecurity', 'Data Protection', 'Privacy'],
    links: {
      twitter: '@marcuschen',
      linkedin: 'marcus-chen-security'
    }
  },
  {
    id: '3',
    name: 'Elena Rodriguez',
    photoUrl: 'https://i.pravatar.cc/150?img=3',
    bio: 'UX Design lead at major tech company, specializing in accessible design.',
    sessionTopics: ['UX Design', 'Accessibility', 'Design Systems'],
    links: {
      linkedin: 'elena-rodriguez-ux',
      website: 'https://elenarodriguez.design'
    }
  }
];

const SpeakerForm = ({ onSubmit, initialData = null }) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: initialData || {
      name: '',
      bio: '',
      photoUrl: '',
      twitter: '',
      linkedin: '',
      website: ''
    }
  });

  const onFormSubmit = (data) => {
    const speakerData = {
      ...data,
      links: {
        twitter: data.twitter,
        linkedin: data.linkedin,
        website: data.website
      }
    };
    
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
        <Label htmlFor="bio">Biography</Label>
        <Textarea 
          id="bio" 
          placeholder="Enter speaker biography" 
          rows={3}
          {...register("bio", { required: "Biography is required" })}
        />
        {errors.bio && <p className="text-sm text-destructive">{errors.bio.message}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="photoUrl">Photo URL</Label>
        <Input 
          id="photoUrl" 
          placeholder="https://example.com/photo.jpg" 
          type="url"
          {...register("photoUrl")}
        />
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="twitter">Twitter</Label>
          <Input 
            id="twitter" 
            placeholder="@username" 
            {...register("twitter")}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="linkedin">LinkedIn</Label>
          <Input 
            id="linkedin" 
            placeholder="username" 
            {...register("linkedin")}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input 
            id="website" 
            placeholder="https://example.com" 
            type="url"
            {...register("website")}
          />
        </div>
      </div>
      
      <div className="flex justify-end pt-2">
        <Button type="submit">Add Speaker</Button>
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
            <AvatarImage src={row.photoUrl} />
            <AvatarFallback>{value.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{value}</div>
            <div className="text-sm text-muted-foreground truncate max-w-xs">
              {row.bio}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Topics',
      accessorKey: 'sessionTopics',
      cell: (value: string[]) => (
        <div className="flex flex-wrap gap-1">
          {value?.slice(0, 2).map((topic, idx) => (
            <Badge key={idx} variant="outline" className="text-xs">
              {topic}
            </Badge>
          ))}
          {value?.length > 2 && (
            <Badge variant="secondary" className="text-xs">
              +{value.length - 2}
            </Badge>
          )}
        </div>
      ),
    },
    {
      header: 'Links',
      accessorKey: 'links',
      cell: (value: Speaker['links']) => (
        <div className="flex gap-1">
          {value?.twitter && <Badge variant="outline">Twitter</Badge>}
          {value?.linkedin && <Badge variant="outline">LinkedIn</Badge>}
          {value?.website && <Badge variant="outline">Website</Badge>}
        </div>
      ),
    }
  ];

  const handleCreateSpeaker = (speakerData) => {
    const newSpeaker = {
      id: `${speakers.length + 1}`,
      ...speakerData,
      sessionTopics: []
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
    toast.success("Speaker removed successfully!");
  };

  return (
    <AdminLayout>
      <AdminPageHeader
        title="Speakers"
        description="Manage event speakers and their information"
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
