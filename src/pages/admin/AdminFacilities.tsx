import React, { useState, useMemo } from 'react';
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
  AlertCircle
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAdminFacilities, Facility } from "@/hooks/useAdminFacilities";
import { useAdminEvents } from "@/hooks/useAdminEvents";
import { format } from 'date-fns';
import FacilityStatsCards from "./components/FacilityStatsCards";
import FacilityCard from "./components/FacilityCard";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

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

// ... keep existing code (facilityIcons array)
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
  
  const { events, isLoading: eventsLoading } = useAdminEvents();
  const { facilities, isLoading, error, createFacility, updateFacility, deleteFacility, isCreating, isUpdating, isDeleting } = useAdminFacilities(selectedEventId || undefined);

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

  const onSubmit = async (values: FormData) => {
    console.log('Form submitted with values:', values);
    
    const facilityData = {
      name: values.name,
      description: values.description,
      location: values.location,
      rules: values.rules,
      contact_type: values.contactType,
      contact_info: values.contactInfo,
      icon_type: values.iconType,
      image_url: null,
      event_id: values.eventId,
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
    setValue("eventId", facility.event_id || "");
  };

  const handleCancelEdit = () => {
    setEditingFacility(null);
    reset();
  };

  const handleEventChange = (eventId: string) => {
    setSelectedEventId(eventId);
    setValue("eventId", eventId);
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

  // --- New: Compute stats for the hero section ---
  const stats = React.useMemo(() => {
    let total = facilities.length;
    let locations = facilities.filter((f) => f.location && f.location.trim() !== "").length;
    let withContact = facilities.filter((f) => f.contact_type && f.contact_type !== "none" && f.contact_info && f.contact_info.trim() !== "").length;
    return { total, locations, withContact };
  }, [facilities]);

  if (eventsLoading || isLoading) {
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

  if (error) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Facilities</h1>
            <p className="text-muted-foreground">
              Manage facilities and their details.
            </p>
          </div>
          
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
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
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Facilities</h1>
            <p className="text-muted-foreground">
              Manage facilities and their details.
            </p>
          </div>
          
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You need to create an event first before adding facilities.
            </AlertDescription>
          </Alert>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Gradient Hero Section */}
      <section className="py-8 bg-gradient-to-br from-primary via-secondary/20 to-background mb-10 rounded-b-2xl shadow-soft transition-all">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="flex flex-col gap-4">
            <h1 className="text-4xl font-black tracking-tight text-white drop-shadow">Facilities Management</h1>
            <div className="text-lg text-white/70 mb-2">
              Create, view, and manage event facilities in a beautiful modern experience.
            </div>
            {/* Event Selector */}
            <div className="max-w-md mt-2">
              <Card className="glass-effect bg-white/30 border-white/10">
                <CardHeader>
                  <CardTitle asChild>
                    <span className="text-base font-bold text-primary">Manage Facilities for Event</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={selectedEventId} onValueChange={handleEventChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an event" />
                    </SelectTrigger>
                    <SelectContent>
                      {events.map((event) => (
                        <SelectItem key={event.id} value={event.id}>
                          {event.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            </div>
            {/* Stats Cards */}
            <div className="mt-4">
              <FacilityStatsCards {...stats} />
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-screen-xl mx-auto px-2 py-8 space-y-10">
        {/* Facility Form */}
        <Card className="glass-effect shadow-soft max-w-xl mx-auto z-10 mb-8 border border-white/10">
          <CardHeader>
            <CardTitle>
              {editingFacility ? "Edit Facility" : "Add New Facility"}
            </CardTitle>
            <CardDescription>
              {editingFacility
                ? "Update the facility details for your event."
                : "Add a new event facility with rich details."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="eventId">Event *</Label>
                <Select value={selectedFormEventId} onValueChange={(value) => setValue("eventId", value)}>
                  <SelectTrigger>
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
                  <p className="text-sm text-destructive">{errors.eventId.message}</p>
                )}
              </div>

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
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelEdit}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isCreating || isUpdating || !selectedFormEventId}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {editingFacility
                    ? isUpdating
                      ? "Updating..."
                      : "Update Facility"
                    : isCreating
                    ? "Creating..."
                    : "Add Facility"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Facilities Grid */}
        <section>
          <h2 className="text-2xl font-bold mb-6 text-primary">Existing Facilities</h2>
          {facilities.length === 0 ? (
            <div className="text-center py-10">
              <Building className="h-12 w-12 mx-auto opacity-40 mb-4" />
              <div className="text-lg text-muted-foreground font-medium">
                No facilities added yet
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                Add your first facility to this event!
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {facilities.map((facility) => (
                <FacilityCard
                  key={facility.id}
                  facility={facility}
                  onEdit={handleEdit}
                  onDelete={deleteFacility}
                  isUpdating={isUpdating}
                  isDeleting={isDeleting}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </AdminLayout>
  );
};

export default AdminFacilities;
