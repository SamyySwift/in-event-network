
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
import { ExternalLink, Image as ImageIcon, Star } from 'lucide-react';

// Mock data for advertisements
const mockAdvertisements: Advertisement[] = [
  {
    id: '1',
    title: 'TechCorp Platinum Sponsor',
    description: 'Leading technology solutions for enterprises',
    imageUrl: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400',
    sponsorName: 'TechCorp Inc.',
    sponsorLogo: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=100',
    linkUrl: 'https://techcorp.com',
    displayOrder: 1,
    isActive: true,
    startDate: '2025-06-01T00:00:00Z',
    endDate: '2025-06-30T23:59:59Z',
    createdAt: '2025-05-20T10:00:00Z',
    createdBy: 'admin1'
  },
  {
    id: '2',
    title: 'Innovation Partners',
    description: 'Driving innovation in AI and machine learning',
    imageUrl: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400',
    sponsorName: 'InnovateLab',
    sponsorLogo: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=100',
    linkUrl: 'https://innovatelab.com',
    displayOrder: 2,
    isActive: true,
    startDate: '2025-06-01T00:00:00Z',
    endDate: '2025-06-30T23:59:59Z',
    createdAt: '2025-05-21T14:30:00Z',
    createdBy: 'admin1'
  }
];

const AdvertisementForm = ({ onSubmit, initialData = null }) => {
  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm({
    defaultValues: initialData || {
      title: '',
      description: '',
      sponsorName: '',
      linkUrl: '',
      displayOrder: 1,
      isActive: true,
      startDate: '',
      endDate: ''
    }
  });

  const onFormSubmit = (data) => {
    const advertisementData = {
      ...data,
      displayOrder: parseInt(data.displayOrder)
    };
    onSubmit(advertisementData);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 pt-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <Label htmlFor="sponsorName">Sponsor Name</Label>
          <Input 
            id="sponsorName" 
            placeholder="Enter sponsor name" 
            {...register("sponsorName", { required: "Sponsor name is required" })}
          />
          {errors.sponsorName && <p className="text-sm text-destructive">{errors.sponsorName.message}</p>}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea 
          id="description" 
          placeholder="Enter advertisement description" 
          rows={3}
          {...register("description")}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="linkUrl">Website URL</Label>
          <Input 
            id="linkUrl" 
            type="url"
            placeholder="https://sponsor-website.com" 
            {...register("linkUrl")}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="displayOrder">Display Order</Label>
          <Input 
            id="displayOrder" 
            type="number"
            min="1"
            placeholder="1" 
            {...register("displayOrder", { required: "Display order is required" })}
          />
          {errors.displayOrder && <p className="text-sm text-destructive">{errors.displayOrder.message}</p>}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date</Label>
          <Input 
            id="startDate" 
            type="datetime-local"
            {...register("startDate")}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="endDate">End Date</Label>
          <Input 
            id="endDate" 
            type="datetime-local"
            {...register("endDate")}
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch 
          id="isActive"
          {...register("isActive")}
        />
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
      header: 'Advertisement',
      accessorKey: 'title',
      cell: (value: string, row: Advertisement) => (
        <div className="flex items-center gap-3">
          {row.imageUrl && (
            <img src={row.imageUrl} alt={value} className="w-12 h-12 object-cover rounded" />
          )}
          <div>
            <div className="font-medium">{value}</div>
            <div className="text-sm text-muted-foreground">{row.sponsorName}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Description',
      accessorKey: 'description',
      cell: (value: string) => (
        <div className="max-w-xs truncate">{value}</div>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'isActive',
      cell: (value: boolean) => (
        <Badge className={value 
          ? 'bg-green-100 text-green-800 hover:bg-green-200' 
          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
        }>
          {value ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      header: 'Order',
      accessorKey: 'displayOrder',
    },
    {
      header: 'Link',
      accessorKey: 'linkUrl',
      cell: (value: string) => value ? (
        <Button variant="ghost" size="sm" asChild>
          <a href={value} target="_blank" rel="noopener noreferrer">
            <ExternalLink size={16} />
          </a>
        </Button>
      ) : null,
    }
  ];

  const handleCreateAdvertisement = (advertisementData) => {
    const newAdvertisement = {
      id: `${advertisements.length + 1}`,
      ...advertisementData,
      createdAt: new Date().toISOString(),
      createdBy: 'admin1'
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
