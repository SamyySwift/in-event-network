
import React, { useState } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Plus, Upload, Phone, MessageSquare, MapPin, Info, Image } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Facility name must be at least 2 characters.",
  }),
  description: z.string().optional(),
  location: z.string().optional(),
  rules: z.string().optional(),
  iconType: z.enum(["text", "call", "image", "map-pin", "info"]).default("info"),
  contactNumber: z.string().optional(),
})

const AdminFacilities = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      location: "",
      rules: "",
      iconType: "info",
      contactNumber: "",
    },
  })

  const iconType = watch("iconType");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `facilities/${fileName}`;

      const { data, error } = await supabase.storage
        .from('media')
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const getIconComponent = (type: string) => {
    switch(type) {
      case 'call': return <Phone className="h-4 w-4" />;
      case 'text': return <MessageSquare className="h-4 w-4" />;
      case 'map-pin': return <MapPin className="h-4 w-4" />;
      case 'image': return <Image className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const handleContactAction = (facility: any) => {
    if (facility.icon_type === 'call' && facility.contact_number) {
      window.open(`tel:${facility.contact_number}`, '_self');
    } else if (facility.icon_type === 'text' && facility.contact_number) {
      window.open(`https://wa.me/${facility.contact_number.replace(/\D/g, '')}`, '_blank');
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      let imageUrl = null;
      
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
        if (!imageUrl) {
          toast({
            title: "Error",
            description: "Failed to upload image",
            variant: "destructive"
          });
          return;
        }
      }

      const { error } = await supabase
        .from('facilities')
        .insert({
          name: values.name,
          description: values.description || null,
          location: values.location || null,
          rules: values.rules || null,
          icon_type: values.iconType,
          contact_number: (values.iconType === 'call' || values.iconType === 'text') ? values.contactNumber || null : null,
          image_url: imageUrl
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Facility added successfully"
      });

      reset();
      setImageFile(null);
      setImagePreview("");
    } catch (error) {
      console.error('Error adding facility:', error);
      toast({
        title: "Error",
        description: "Failed to add facility",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Facilities</h1>
          <p className="text-muted-foreground">
            Manage facilities with images, contact options and rules.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Add New Facility</CardTitle>
              <CardDescription>
                Add facilities with images, contact options and rules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Facility Name</Label>
                  <Input
                    id="name"
                    {...register("name")}
                    placeholder="Enter facility name"
                  />
                  {errors.name && (
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

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    {...register("location")}
                    placeholder="Enter facility location"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">Facility Image (Optional)</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="flex-1"
                    />
                    <Upload className="h-4 w-4 text-muted-foreground" />
                  </div>
                  {imagePreview && (
                    <div className="mt-2">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-24 h-24 object-cover rounded-md border"
                      />
                    </div>
                  )}
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Icon Type</Label>
                    <Select onValueChange={(value) => setValue("iconType", value as "text" | "call" | "image" | "map-pin" | "info")}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select icon type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="info">
                          <div className="flex items-center gap-2">
                            <Info className="h-4 w-4" />
                            Information
                          </div>
                        </SelectItem>
                        <SelectItem value="call">
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            Call
                          </div>
                        </SelectItem>
                        <SelectItem value="text">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            WhatsApp
                          </div>
                        </SelectItem>
                        <SelectItem value="map-pin">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Location
                          </div>
                        </SelectItem>
                        <SelectItem value="image">
                          <div className="flex items-center gap-2">
                            <Image className="h-4 w-4" />
                            Image
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {(iconType === "call" || iconType === "text") && (
                    <div className="space-y-2">
                      <Label htmlFor="contactNumber">
                        {iconType === "call" ? "Phone Number" : "WhatsApp Number"}
                      </Label>
                      <Input
                        id="contactNumber"
                        {...register("contactNumber")}
                        placeholder={iconType === "call" ? "Enter phone number" : "Enter WhatsApp number"}
                      />
                      {errors.contactNumber && (
                        <p className="text-sm text-destructive">{errors.contactNumber.message}</p>
                      )}
                    </div>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  <Plus className="h-4 w-4 mr-2" />
                  {isSubmitting ? "Adding..." : "Add Facility"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Facilities List</CardTitle>
                <CardDescription>
                  View and manage existing facilities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Facilities will be displayed here once added.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminFacilities;
