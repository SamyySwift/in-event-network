import React, { useState } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminDataTable from '@/components/admin/AdminDataTable';
import { Badge } from '@/components/ui/badge';
import { 
  Bath, 
  AlarmClock, 
  UtensilsCrossed, 
  Accessibility, 
  Car,
  DoorOpen,
  DoorClosed,
  HelpCircle
} from 'lucide-react';
import { Facility } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

// Mock data for facilities
const mockFacilities: Facility[] = [
  {
    id: '1',
    name: 'Main Restrooms',
    type: 'restroom',
    location: 'First Floor, Near Registration',
    description: 'Main restroom facilities with accessible stalls',
    icon: 'restroom'
  },
  {
    id: '2',
    name: 'Emergency Exit A',
    type: 'emergency',
    location: 'North Wing, End of Hall',
    description: 'Emergency exit with alarm',
    icon: 'alarm'
  },
  {
    id: '3',
    name: 'Food Court',
    type: 'food',
    location: 'Second Floor, Central Area',
    description: 'Multiple food vendors and seating area',
    icon: 'food'
  },
  {
    id: '4',
    name: 'Elevator',
    type: 'accessibility',
    location: 'East Wing, Near Stairs',
    description: 'Accessible elevator to all floors',
    icon: 'accessibility'
  },
  {
    id: '5',
    name: 'Parking Garage',
    type: 'parking',
    location: 'Basement Levels B1-B3',
    description: 'Paid parking with accessibility spots',
    icon: 'parking'
  },
  {
    id: '6',
    name: 'Main Entrance',
    type: 'entry',
    location: 'South Side of Building',
    description: 'Main entrance with security checkpoint',
    icon: 'entry'
  }
];

const FacilityForm = ({ onSubmit, initialData = null }) => {
  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm({
    defaultValues: initialData || {
      name: '',
      type: 'restroom',
      location: '',
      description: ''
    }
  });

  const facilityType = watch('type');

  const onFormSubmit = (data) => {
    const facilityData = {
      ...data,
      icon: data.type // Set the icon based on type
    };
    
    onSubmit(facilityData);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label htmlFor="name">Facility Name</Label>
        <Input 
          id="name" 
          placeholder="Enter facility name" 
          {...register("name", { required: "Name is required" })}
        />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="type">Facility Type</Label>
        <Select 
          defaultValue="restroom" 
          onValueChange={(value) => setValue('type', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select facility type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="restroom">Restroom</SelectItem>
            <SelectItem value="emergency">Emergency</SelectItem>
            <SelectItem value="food">Food</SelectItem>
            <SelectItem value="accessibility">Accessibility</SelectItem>
            <SelectItem value="parking">Parking</SelectItem>
            <SelectItem value="entry">Entry</SelectItem>
            <SelectItem value="exit">Exit</SelectItem>
          </SelectContent>
        </Select>
        <input type="hidden" {...register('type')} />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input 
          id="location" 
          placeholder="Enter facility location" 
          {...register("location", { required: "Location is required" })}
        />
        {errors.location && <p className="text-sm text-destructive">{errors.location.message}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea 
          id="description" 
          placeholder="Enter facility description" 
          rows={3}
          {...register("description")}
        />
      </div>
      
      <div className="flex justify-end pt-2">
        <Button type="submit">Save Facility</Button>
      </div>
    </form>
  );
};

const AdminFacilities = () => {
  const [facilities, setFacilities] = useState(mockFacilities);

  // Helper function to render icon based on facility type
  const getFacilityIcon = (type: Facility['type']) => {
    switch(type) {
      case 'restroom':
        return <Bath size={16} />;
      case 'emergency':
        return <AlarmClock size={16} />;
      case 'food':
        return <UtensilsCrossed size={16} />;
      case 'accessibility':
        return <Accessibility size={16} />;
      case 'parking':
        return <Car size={16} />;
      case 'entry':
        return <DoorOpen size={16} />;
      case 'exit':
        return <DoorClosed size={16} />;
      default:
        return <HelpCircle size={16} />;
    }
  };

  const columns = [
    {
      header: 'Name',
      accessorKey: 'name',
      cell: (value: string, row: Facility) => (
        <div className="flex items-center gap-2">
          <span className="text-primary-700">
            {getFacilityIcon(row.type)}
          </span>
          <span className="font-medium">{value}</span>
        </div>
      ),
    },
    {
      header: 'Type',
      accessorKey: 'type',
      cell: (value: string) => (
        <Badge className={
          value === 'restroom' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' :
          value === 'emergency' ? 'bg-red-100 text-red-800 hover:bg-red-200' :
          value === 'food' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' :
          value === 'accessibility' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
          value === 'parking' ? 'bg-purple-100 text-purple-800 hover:bg-purple-200' :
          value === 'entry' || value === 'exit' ? 'bg-orange-100 text-orange-800 hover:bg-orange-200' :
          'bg-gray-100 text-gray-800 hover:bg-gray-200'
        }>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </Badge>
      ),
    },
    {
      header: 'Location',
      accessorKey: 'location',
    },
    {
      header: 'Description',
      accessorKey: 'description',
    }
  ];

  const handleCreateFacility = (facilityData) => {
    const newFacility = {
      id: `${facilities.length + 1}`,
      ...facilityData
    };
    
    setFacilities([...facilities, newFacility]);
    toast.success("Facility added successfully!");
  };

  const handleEditFacility = (facility: Facility) => {
    console.log('Edit facility', facility);
    toast.info("Edit facility dialog would open here");
  };

  const handleDeleteFacility = (facility: Facility) => {
    setFacilities(facilities.filter(f => f.id !== facility.id));
    toast.success("Facility deleted successfully!");
  };

  return (
    <AdminLayout>
      <AdminPageHeader
        title="Facilities"
        description="Manage venue facilities and map locations"
        actionLabel="Add Facility"
        actionForm={<FacilityForm onSubmit={handleCreateFacility} />}
      >
        <AdminDataTable
          columns={columns}
          data={facilities}
          onEdit={handleEditFacility}
          onDelete={handleDeleteFacility}
        />
      </AdminPageHeader>
    </AdminLayout>
  );
};

export default AdminFacilities;
