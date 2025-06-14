
import React, { useState } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ImageUpload } from '@/components/ui/image-upload';
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
  Bed,
  AlertCircle,
  Sparkles,
  Grid3X3,
  ChevronRight
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAdminFacilities, Facility } from "@/hooks/useAdminFacilities";
import { useAdminEvents } from "@/hooks/useAdminEvents";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

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
  eventId: z.string().min(1, {
    message: "Please select an event for this facility.",
  }),
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
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  
  const { events, isLoading: eventsLoading } = useAdminEvents();
  const { facilities, isLoading, error, createFacility, updateFacility, deleteFacility, isCreating, isUpdating, isDeleting } = useAdminFacilities(selectedEventId || undefined);
  const { currentUser } = useAuth();
  const { toast } = useToast();

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
      eventId: "",
    },
  });

  // Set default event when events load
  React.useEffect(() => {
    if (events.length > 0 && !selectedEventId) {
      const defaultEvent = events[0];
      setSelectedEventId(defaultEvent.id);
      setValue("eventId", defaultEvent.id);
    }
  }, [events, selectedEventId, setValue]);

  const contactType = watch("contactType");
  const selectedIcon = watch("iconType");
  const selectedFormEventId = watch("eventId");

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${currentUser?.id}/facilities/${Date.now()}.${fileExt}`;

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

  const onSubmit = async (values: FormData) => {
    console.log('Form submitted with values:', values);
    
    try {
      let imageUrl = imagePreview;
      
      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage);
      }

      const facilityData = {
        name: values.name,
        description: values.description,
        location: values.location,
        rules: values.rules,
        contact_type: values.contactType,
        contact_info: values.contactInfo,
        icon_type: values.iconType,
        image_url: imageUrl || null,
        event_id: values.eventId,
      };

      if (editingFacility) {
        updateFacility({ id: editingFacility.id, ...facilityData });
        setEditingFacility(null);
      } else {
        createFacility(facilityData);
      }
      
      reset();
      setSelectedImage(null);
      setImagePreview('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload image. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (facility: Facility) => {
    setEditingFacility(facility);
    setImagePreview(facility.image_url || '');
    setValue("name", facility.name);
    setValue("description", facility.description || "");
    setValue("location", facility.location || "");
    setValue("rules", facility.rules || "");
    setValue("contactType", facility.contact_type || "none");
    setValue("contactInfo", facility.contact_info || "");
    setValue("iconType", facility.icon_type || "building");
    setValue("eventId", facility.event_id || "");
  };

  const handleCancelEdit = () => {
    setEditingFacility(null);
    setSelectedImage(null);
    setImagePreview('');
    reset();
  };

  const handleEventChange = (eventId: string) => {
    setSelectedEventId(eventId);
    setValue("eventId", eventId);
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

  if (eventsLoading || isLoading) {
    return (
      <AdminLayout>
        <div className="animate-fade-in flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-lg text-muted-foreground">Loading facilities...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="animate-fade-in space-y-6">
          {/* Hero Header */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-600 via-pink-600 to-purple-500 p-8 text-white">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                  <AlertCircle className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold">Facilities Management</h1>
                  <p className="text-xl opacity-90">Unable to load facilities</p>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full"></div>
            <div className="absolute -top-16 -left-16 w-40 h-40 bg-white/5 rounded-full"></div>
          </div>
          
          <Alert variant="destructive" className="border-0 bg-red-50 border-l-4 border-l-red-500">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-800">
              Failed to load facilities. Please check your connection and try again.
              Error: {error.message}
            </AlertDescription>
          </Alert>
        </div>
      </AdminLayout>
    );
  }

  if (events.length === 0) {
    return (
      <AdminLayout>
        <div className="animate-fade-in space-y-6">
          {/* Hero Header */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-8 text-white">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Building className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold">Facilities Management</h1>
                  <p className="text-xl opacity-90">Create events first to add facilities</p>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full"></div>
            <div className="absolute -top-16 -left-16 w-40 h-40 bg-white/5 rounded-full"></div>
          </div>
          
          <Alert className="border-0 bg-blue-50 border-l-4 border-l-blue-500">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              You need to create an event first before adding facilities.
            </AlertDescription>
          </Alert>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="animate-fade-in space-y-8">
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-8 text-white">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Building className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold mb-2">Facilities Management</h1>
                  <p className="text-xl opacity-90">Create and manage event facilities</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm uppercase tracking-wider opacity-80">Live Dashboard</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge className="bg-white/20 text-white border-white/30 px-4 py-2 text-sm font-medium">
                  <Sparkles className="w-4 h-4 mr-2" />
                  {facilities.length} Facilities
                </Badge>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full"></div>
          <div className="absolute -top-16 -left-16 w-40 h-40 bg-white/5 rounded-full"></div>
        </div>

        {/* Event Selector */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 to-indigo-50/80"></div>
          <CardHeader className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Grid3X3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">Event Selection</CardTitle>
                <CardDescription className="text-base">Choose which event to manage facilities for</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <Select value={selectedEventId} onValueChange={handleEventChange}>
              <SelectTrigger className="w-full h-12 bg-white/80 border-0 shadow-sm">
                <SelectValue placeholder="Select an event" />
              </SelectTrigger>
              <SelectContent>
                {events.map((event) => (
                  <SelectItem key={event.id} value={event.id} className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-primary rounded-full"></div>
                      <span className="font-medium">{event.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Add/Edit Facility Form */}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden group hover:shadow-2xl transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-green-50/80 to-emerald-50/80"></div>
            <CardHeader className="relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <Plus className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">
                    {editingFacility ? 'Edit Facility' : 'Create New Facility'}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {editingFacility ? 'Update facility details and settings' : 'Add facilities with contact options and rules'}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-3">
                  <ImageUpload
                    onImageSelect={handleImageSelect}
                    currentImageUrl={imagePreview}
                    label="Facility Image"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="eventId" className="text-sm font-semibold">Event *</Label>
                  <Select value={selectedFormEventId} onValueChange={(value) => setValue("eventId", value)}>
                    <SelectTrigger className="h-12 bg-white/80 border-0 shadow-sm">
                      <SelectValue placeholder="Select event" />
                    </SelectTrigger>
                    <SelectContent>
                      {events.map((event) => (
                        <SelectItem key={event.id} value={event.id}>
                          {event.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.eventId?.message && (
                    <p className="text-sm text-destructive font-medium">{errors.eventId.message}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="name" className="text-sm font-semibold">Facility Name *</Label>
                  <Input
                    id="name"
                    {...register("name")}
                    placeholder="Enter facility name"
                    className="h-12 bg-white/80 border-0 shadow-sm"
                  />
                  {errors.name?.message && (
                    <p className="text-sm text-destructive font-medium">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="description" className="text-sm font-semibold">Description</Label>
                  <Textarea
                    id="description"
                    {...register("description")}
                    placeholder="Enter facility description"
                    rows={3}
                    className="bg-white/80 border-0 shadow-sm resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <Label htmlFor="location" className="text-sm font-semibold">Location</Label>
                    <Input
                      id="location"
                      {...register("location")}
                      placeholder="Enter facility location"
                      className="h-12 bg-white/80 border-0 shadow-sm"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">Icon</Label>
                    <Select value={selectedIcon} onValueChange={(value) => setValue("iconType", value)}>
                      <SelectTrigger className="h-12 bg-white/80 border-0 shadow-sm">
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

                <div className="space-y-3">
                  <Label htmlFor="rules" className="text-sm font-semibold">Rules (Optional)</Label>
                  <Textarea
                    id="rules"
                    {...register("rules")}
                    placeholder="Enter facility rules and guidelines"
                    rows={2}
                    className="bg-white/80 border-0 shadow-sm resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">Contact Type</Label>
                    <Select value={contactType} onValueChange={(value) => setValue("contactType", value as "none" | "phone" | "whatsapp")}>
                      <SelectTrigger className="h-12 bg-white/80 border-0 shadow-sm">
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
                    <div className="space-y-3">
                      <Label htmlFor="contactInfo" className="text-sm font-semibold">Contact Number</Label>
                      <Input
                        id="contactInfo"
                        {...register("contactInfo")}
                        placeholder="Enter phone number"
                        className="h-12 bg-white/80 border-0 shadow-sm"
                      />
                      {errors.contactInfo?.message && (
                        <p className="text-sm text-destructive font-medium">{errors.contactInfo.message}</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  {editingFacility && (
                    <Button type="button" variant="outline" onClick={handleCancelEdit} className="flex-1 h-12 bg-white/80 border-0 shadow-sm hover:bg-gray-50">
                      Cancel
                    </Button>
                  )}
                  <Button 
                    type="submit" 
                    className="flex-1 h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg"
                    disabled={isCreating || isUpdating || !selectedFormEventId}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {editingFacility ? (isUpdating ? 'Updating...' : 'Update Facility') : (isCreating ? 'Creating...' : 'Create Facility')}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Facilities List */}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50/80 to-pink-50/80"></div>
            <CardHeader className="relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                    <Building className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Facilities List ({facilities.length})</CardTitle>
                    <CardDescription className="text-base">
                      View and manage existing facilities
                      {selectedEventId && events.find(e => e.id === selectedEventId) && (
                        <span className="block mt-1 text-primary font-medium">
                          for {events.find(e => e.id === selectedEventId)?.name}
                        </span>
                      )}
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              {facilities.length === 0 ? (
                <div className="text-center py-16 px-6">
                  <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <Building className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No facilities yet</h3>
                  <p className="text-gray-500 mb-6">Create your first facility using the form on the left.</p>
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                    <Sparkles className="w-4 h-4" />
                    <span>Get started by adding facilities to your event</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2">
                  {facilities.map((facility, index) => (
                    <div 
                      key={facility.id} 
                      className="group border-0 bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                      style={{ 
                        animationDelay: `${index * 100}ms`,
                        animation: 'fade-in 0.5s ease-out forwards'
                      }}
                    >
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-4 mb-3">
                            {facility.image_url && (
                              <div className="relative">
                                <img 
                                  src={facility.image_url} 
                                  alt={facility.name}
                                  className="w-16 h-16 object-cover rounded-xl shadow-md"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl"></div>
                              </div>
                            )}
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                                  {getFacilityIcon(facility.icon_type)}
                                </div>
                                <h4 className="font-bold text-lg text-gray-900 break-words">{facility.name}</h4>
                              </div>
                              {facility.description && (
                                <p className="text-sm text-gray-600 break-words leading-relaxed">{facility.description}</p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(facility)}
                            disabled={isUpdating}
                            className="h-10 w-10 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-10 w-10 rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors"
                                disabled={isDeleting}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="rounded-2xl">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Facility</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this facility? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => deleteFacility(facility.id)}
                                  className="rounded-xl bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        {facility.location && (
                          <div className="flex items-center gap-3 text-sm">
                            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <MapPin className="h-4 w-4 text-gray-600" />
                            </div>
                            <span className="text-gray-700 font-medium break-words">{facility.location}</span>
                          </div>
                        )}
                        
                        {facility.contact_type !== 'none' && facility.contact_info && (
                          <div className="flex items-center gap-3 text-sm">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              {getContactIcon(facility.contact_type)}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-600 capitalize">{facility.contact_type}:</span>
                              <span className="font-semibold text-gray-900 break-words">{facility.contact_info}</span>
                            </div>
                          </div>
                        )}
                        
                        {facility.rules && (
                          <div className="mt-4">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-6 h-6 bg-yellow-100 rounded-lg flex items-center justify-center">
                                <AlertCircle className="h-3 w-3 text-yellow-600" />
                              </div>
                              <span className="text-sm font-semibold text-gray-700">Rules:</span>
                            </div>
                            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4">
                              <p className="text-sm text-gray-700 leading-relaxed break-words">{facility.rules}</p>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex justify-between items-center pt-4 mt-4 border-t border-gray-200/50">
                        <span className="text-xs text-gray-500 font-medium">
                          Created {format(new Date(facility.created_at), 'MMM d, yyyy')}
                        </span>
                        <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-400 transition-colors" />
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
