
import React, { useState } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminDataTable from '@/components/admin/AdminDataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Advertisement } from '@/types';
import { format } from 'date-fns';

// Mock data for advertisements
const mockAdvertisements: Advertisement[] = [
  {
    id: '1',
    title: 'Tech Innovation Summit 2024',
    description: 'Join us for the biggest tech event of the year',
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87',
    sponsorName: 'TechCorp Inc.',
    sponsorLogo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43',
    linkUrl: 'https://techcorp.com',
    displayOrder: 1,
    isActive: true,
    startDate: '2024-06-01T00:00:00Z',
    endDate: '2024-06-30T23:59:59Z',
    createdAt: '2024-05-15T10:00:00Z',
    createdBy: 'admin1'
  },
  {
    id: '2',
    title: 'Cloud Solutions Workshop',
    description: 'Learn about the latest cloud technologies',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa',
    sponsorName: 'CloudTech Solutions',
    sponsorLogo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3',
    linkUrl: 'https://cloudtech.com',
    displayOrder: 2,
    isActive: false,
    startDate: '2024-07-01T00:00:00Z',
    endDate: '2024-07-31T23:59:59Z',
    createdAt: '2024-05-20T14:30:00Z',
    createdBy: 'admin2'
  }
];

const AdvertisementForm = ({ onSubmit, initialData = null }) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: initialData || {
      title: '',
      description: '',
      sponsorName: '',
      linkUrl: '',
      displayOrder: 1,
      isActive: true
    }
  });

  const onFormSubmit = (data) => {
    onSubmit(data);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label htmlFor="title">Advertisement Title</Label>
        <Input 
          id="title" 
          placeholder="Enter advertisement title" 
          {...register("title", { required: "Title is required" })}
        />
        {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea 
          id="description" 
          placeholder="Enter advertisement description" 
          rows={3}
          {...register("description", { required: "Description is required" })}
        />
        {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="sponsorName">Sponsor Name</Label>
        <Input 
          id="sponsorName" 
          placeholder="Enter sponsor name" 
          {...register("sponsorName", { required: "Sponsor name is required" })}
        />
        {errors.sponsorName && <p className="text-sm text-destructive">{errors.sponsorName.message}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="linkUrl">Link URL</Label>
        <Input 
          id="linkUrl" 
          placeholder="https://example.com" 
          type="url"
          {...register("linkUrl")}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="displayOrder">Display Order</Label>
        <Input 
          id="displayOrder" 
          type="number"
          min="1"
          {...register("displayOrder", { 
            required: "Display order is required",
            min: { value: 1, message: "Display order must be at least 1" }
          })}
        />
        {errors.displayOrder && <p className="text-sm text-destructive">{errors.displayOrder.message}</p>}
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch id="isActive" {...register("isActive")} />
        <Label htmlFor="isActive">Active</Label>
      </div>
      
      <div className="flex justify-end pt-2">
        <Button type="submit">Save Advertisement</Button>
      </div>
    </form>
  );
};

const AdminAdvertisements = () => {
  const [advertisements, setAdvertisements] = useState(mockAdvertisements);

  const columns = [
    {
      header: 'Title',
      accessorKey: 'title',
      cell: (value: string, row: Advertisement) => (
        <div className="flex flex-col">
          <span className="font-medium">{value}</span>
          <span className="text-sm text-muted-foreground">{row.sponsorName}</span>
        </div>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'isActive',
      cell: (value: boolean) => (
        <Badge variant={value ? 'default' : 'secondary'}>
          {value ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      header: 'Display Order',
      accessorKey: 'displayOrder',
    },
    {
      header: 'Created',
      accessorKey: 'createdAt',
      cell: (value: string) => format(new Date(value), 'MMM d, yyyy'),
    }
  ];

  const handleCreateAdvertisement = (advertisementData) => {
    const newAdvertisement = {
      id: `${advertisements.length + 1}`,
      ...advertisementData,
      createdAt: new Date().toISOString(),
      createdBy: 'current-admin'
    };
    
    setAdvertisements([...advertisements, newAdvertisement]);
    toast.success("Advertisement created successfully!");
  };

  const handleEditAdvertisement = (advertisement: Advertisement) => {
    console.log('Edit advertisement', advertisement);
    toast.info("Edit advertisement dialog would open here");
  };

  const handleDeleteAdvertisement = (advertisement: Advertisement) => {
    setAdvertisements(advertisements.filter(a => a.id !== advertisement.id));
    toast.success("Advertisement deleted successfully!");
  };

  return (
    <AdminLayout>
      <AdminPageHeader
        title="Advertisements"
        description="Manage sponsor advertisements and promotional content"
        actionLabel="Add Advertisement"
        actionForm={<AdvertisementForm onSubmit={handleCreateAdvertisement} />}
      >
        <AdminDataTable
          columns={columns}
          data={advertisements}
          onEdit={handleEditAdvertisement}
          onDelete={handleDeleteAdvertisement}
        />
      </AdminPageHeader>
    </AdminLayout>
  );
};

export default AdminAdvertisements;
