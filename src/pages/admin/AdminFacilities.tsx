
import React, { useState } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Edit, 
  Trash2, 
  MapPin, 
  Phone, 
  MessageCircle, 
  Building, 
  Wifi, 
  Car, 
  Coffee, 
  Utensils, 
  Users, 
  Camera, 
  Music, 
  Tv, 
  Gamepad2,
  Heart,
  ShoppingBag,
  Bath,
  Bed
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useFacilities, Facility } from "@/hooks/useFacilities";
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Facility name must be at least 2 characters.",
  }),
  description: z.string().optional(),
  location: z.string().optional(),
  rules: z.string().optional(),
  contactType: z.enum(["none", "phone", "whatsapp"]).default("none"),
  contactInfo: z.string().optional(),
  iconType: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const facilityIcons = [
  { value: 'building', label: 'Building', icon: Building },
  { value: 'wifi', label: 'WiFi', icon: Wifi },
  { value: 'parking', label: 'Parking', icon: Car },
  { value: 'coffee', label: 'Coffee', icon: Coffee },
  { value: 'restaurant', label: 'Restaurant', icon: Utensils },
  { value: 'conference', label: 'Conference Room', icon: Users },
  { value: 'photography', label: 'Photography', icon: Camera },
  { value: 'music', label: 'Music/Audio', icon: Music },
  { value: 'entertainment', label: 'Entertainment', icon: Tv },
  { value: 'gaming', label: 'Gaming', icon: Gamepad2 },
  { value: 'health', label: 'Health/Medical', icon: Heart },
  { value: 'shopping', label: 'Shopping', icon: ShoppingBag },
  { value: 'restroom', label: 'Restroom', icon: Bath },
  { value: 'accommodation', label: 'Accommodation', icon: Bed },
];

const AdminFacilities = () => {
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null);
  const { facilities, isLoading, createFacility, updateFacility, deleteFacility, isCreating, isUpdating, isDeleting } = useFacilities();

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      location: "",
      rules: "",
      contactType: "none",
      contactInfo: "",
      iconType: "building",
    },
  });

  const contactType = watch("contactType");
  const selectedIcon = watch("iconType");

  const onSubmit = (values: FormData) => {
    console.log('Form submitted with values:', values);
    
    const facilityData = {
      name: values.name,
      description: values.description,
      location: values.location,
      rules: values.rules,
      contact_type: values.contactType,
      contact_info: values.contactInfo,
      icon_type: values.iconType,
    };

    if (editingFacility) {
      updateFacility({ id: editingFacility.id, ...facilityData });
      setEditingFacility(null);
    } else {
      createFacility(facilityData);
    }
    reset();
  };

  const handleEdit = (facility: Facility) => {
    setEditingFacility(facility);
    setValue("name", facility.name);
    setValue("description", facility.description || "");
    setValue("location", facility.location || "");
    setValue("rules", facility.rules || "");
    setValue("contactType", facility.contact_type || "none");
    setValue("contactInfo", facility.contact_info || "");
    setValue("iconType", facility.icon_type || "building");
  };

  const handleCancelEdit = () => {
    setEditingFacility(null);
    reset();
  };

  const getContactIcon = (contactType?: string) => {
    switch (contactType) {
      case 'phone':
        return <Phone className="h-4 w-4" />;
      case 'whatsapp':
        return <MessageCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getFacilityIcon = (iconType?: string) => {
    const iconData = facilityIcons.find(icon => icon.value === iconType);
    if (iconData) {
      const IconComponent = iconData.icon;
      return <IconComponent className="h-5 w-5 text-primary" />;
    }
    return <Building className="h-5 w-5 text-primary" />;
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading facilities...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Facilities</h1>
          <p className="text-muted-foreground">
            Manage facilities and their details.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>{editingFacility ? 'Edit Facility' : 'Add New Facility'}</CardTitle>
              <CardDescription>
                {editingFacility ? 'Update the facility details' : 'Add facilities with contact options and rules'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Facility Name *</Label>
                  <Input
                    id="name"
                    {...register("name")}
                    placeholder="Enter facility name"
                  />
                  {errors.name?.message && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    {...register("description")}
                    placeholder="Enter facility description"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      {...register("location")}
                      placeholder="Enter facility location"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Icon</Label>
                    <Select value={selectedIcon} onValueChange={(value) => setValue("iconType", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select icon" />
                      </SelectTrigger>
                      <SelectContent>
                        {facilityIcons.map((icon) => {
                          const IconComponent = icon.icon;
                          return (
                            <SelectItem key={icon.value} value={icon.value}>
                              <div className="flex items-center gap-2">
                                <IconComponent className="h-4 w-4" />
                                {icon.label}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rules">Rules (Optional)</Label>
                  <Textarea
                    id="rules"
                    {...register("rules")}
                    placeholder="Enter facility rules and guidelines"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Contact Type</Label>
                    <Select value={contactType} onValueChange={(value) => setValue("contactType", value as "none" | "phone" | "whatsapp")}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select contact type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Contact</SelectItem>
                        <SelectItem value="phone">Phone Call</SelectItem>
                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {(contactType === "phone" || contactType === "whatsapp") && (
                    <div className="space-y-2">
                      <Label htmlFor="contactInfo">Contact Number</Label>
                      <Input
                        id="contactInfo"
                        {...register("contactInfo")}
                        placeholder="Enter phone number"
                      />
                      {errors.contactInfo?.message && (
                        <p className="text-sm text-destructive">{errors.contactInfo.message}</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {editingFacility && (
                    <Button type="button" variant="outline" onClick={handleCancelEdit} className="flex-1">
                      Cancel
                    </Button>
                  )}
                  <Button 
                    type="submit" 
                    className="flex-1"
                    disabled={isCreating || isUpdating}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {editingFacility ? (isUpdating ? 'Updating...' : 'Update Facility') : (isCreating ? 'Creating...' : 'Add Facility')}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Facilities List ({facilities.length})</CardTitle>
              <CardDescription>
                View and manage existing facilities
              </CardDescription>
            </CardHeader>
            <CardContent>
              {facilities.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No facilities added yet.</p>
                  <p className="text-sm mt-2">Create your first facility using the form on the left.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {facilities.map((facility) => (
                    <div key={facility.id} className="border rounded-lg p-4 space-y-3 hover:shadow-sm transition-shadow">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            {getFacilityIcon(facility.icon_type)}
                            <h4 className="font-medium text-sm sm:text-base break-words">{facility.name}</h4>
                          </div>
                          {facility.description && (
                            <p className="text-sm text-muted-foreground break-words">{facility.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(facility)}
                            disabled={isUpdating}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-destructive hover:text-destructive"
                                disabled={isDeleting}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Facility</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this facility? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteFacility(facility.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {facility.location && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4 flex-shrink-0" />
                            <span className="break-words">{facility.location}</span>
                          </div>
                        )}
                        
                        {facility.contact_type !== 'none' && facility.contact_info && (
                          <div className="flex items-center gap-2 text-sm">
                            {getContactIcon(facility.contact_type)}
                            <span className="text-muted-foreground capitalize">{facility.contact_type}:</span>
                            <span className="font-medium break-words">{facility.contact_info}</span>
                          </div>
                        )}
                        
                        {facility.rules && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Rules:</span>
                            <p className="text-sm mt-1 p-2 bg-muted rounded break-words">{facility.rules}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="text-xs text-muted-foreground">
                          Created {format(new Date(facility.created_at), 'MMM d, yyyy')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminFacilities;
