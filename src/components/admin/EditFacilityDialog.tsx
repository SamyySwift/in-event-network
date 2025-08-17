
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { useFormPersistence } from "@/hooks/useFormPersistence";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Facility } from "@/hooks/useAdminFacilities";
import { ImageUpload } from "@/components/ui/image-upload";
import { useToast } from "@/hooks/use-toast";
import {
  Ambulance,
  Hospital,
  Car,
  MapPin,
  Building,
  Coffee,
  Shield,
  Wifi,
  Phone,
  User,
  Bath,
  ChefHat,
  Utensils,
  Home,
  Dumbbell,
  Music,
  Gamepad2,
  Archive,
  ArchiveRestore,
  Box,
  Landmark,
  Warehouse,
  Siren,
  AlertTriangle,
  Presentation,
  Monitor,
  Sofa,
  Wine,
  ArrowUp,
} from "lucide-react";

const ICON_OPTIONS = [
  { value: "ambulance", label: "Ambulance", icon: Ambulance },
  { value: "hospital", label: "Hospital", icon: Hospital },
  { value: "car", label: "Car Park", icon: Car },
  { value: "map-pin", label: "Help Desk", icon: MapPin },
  { value: "building", label: "Building", icon: Building },
  { value: "coffee", label: "Cafeteria", icon: Coffee },
  { value: "shield", label: "Security/Shield", icon: Shield },
  { value: "wifi", label: "WiFi Zone", icon: Wifi },
  { value: "phone", label: "Phone", icon: Phone },
  { value: "user", label: "Reception/User", icon: User },
  { value: "bath", label: "Bathroom/Toilet", icon: Bath },
  { value: "chef-hat", label: "Kitchen/Chef Hat", icon: ChefHat },
  { value: "utensils", label: "Dining/Utensils", icon: Utensils },
  { value: "home", label: "Lodging/Rest Area", icon: Home },
  { value: "dumbbell", label: "Gym/Fitness", icon: Dumbbell },
  { value: "music", label: "Music/Entertainment", icon: Music },
  { value: "gamepad-2", label: "Games/Recreation", icon: Gamepad2 },
  { value: "archive", label: "Archive/Storage", icon: Archive },
  { value: "archive-restore", label: "Restore Storage", icon: ArchiveRestore },
  { value: "box", label: "Box/Locker", icon: Box },
  { value: "landmark", label: "Landmark/Entry", icon: Landmark },
  { value: "warehouse", label: "Warehouse", icon: Warehouse },
  { value: "siren", label: "Siren/Emergency", icon: Siren },
  { value: "alert-triangle", label: "Alert/Emergency", icon: AlertTriangle },
  { value: "presentation", label: "Conference/Presentation", icon: Presentation },
  { value: "monitor", label: "Monitor/Screen Room", icon: Monitor },
  { value: "sofa", label: "Lounge/Sofa", icon: Sofa },
  { value: "wine", label: "Bar/Wine", icon: Wine },
  { value: "arrow-up", label: "Elevator/Arrow Up", icon: ArrowUp },
];
const formSchema = z.object({
  name: z.string().min(2, { message: "Facility name must be at least 2 characters." }),
  description: z.string().optional(),
  location: z.string().optional(),
  rules: z.string().optional(),
  contactType: z.enum(["none", "phone", "whatsapp"]).default("none"),
  contactInfo: z.string().optional(),
  iconType: z.string().optional(),
  eventId: z.string().min(1, { message: "Please select an event for this facility." }),
  image: z.any().optional()
});

type FormData = z.infer<typeof formSchema>;

type EditFacilityDialogProps = {
  facility: Facility | null;
  events: { id: string; name: string }[];
  isUpdating: boolean;
  onSubmit: (form: FormData & { imageFile?: File }) => void;
  onClose: () => void;
  open: boolean;
};

const EditFacilityDialog: React.FC<EditFacilityDialogProps> = ({
  facility,
  events,
  isUpdating,
  onSubmit,
  onClose,
  open
}) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const { toast } = useToast();
  const {
    register, handleSubmit, setValue, watch, reset, formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      location: "",
      rules: "",
      contactType: "none",
      contactInfo: "",
      iconType: ICON_OPTIONS[0].value,
      eventId: events[0]?.id || "",
    },
  });

  // Populate form when facility changes
  useEffect(() => {
    if (facility) {
      reset({
        name: facility.name || "",
        description: facility.description || "",
        location: facility.location || "",
        rules: facility.rules || "",
        contactType: facility.contact_type || "none",
        contactInfo: facility.contact_info || "",
        iconType: facility.icon_type || ICON_OPTIONS[0].value,
        eventId: facility.event_id || events[0]?.id || ""
      });
    }
  }, [facility, reset, events]);

  const contactType = watch("contactType");
  const selectedIcon = watch("iconType");

  const handleImageSelect = (file: File | null) => {
    if (file) {
      // Validate file size (maximum 2MB)
      const maxSize = 2 * 1024 * 1024; // 2MB in bytes
      if (file.size > maxSize) {
        toast({
          title: "Image too large",
          description: "Please select an image that is smaller than 2MB.",
          variant: "destructive",
        });
        return;
      }
    }
    setSelectedImage(file);
  };

  const handleDialogSubmit = (data: FormData) => {
    onSubmit({ ...data, imageFile: selectedImage || undefined });
  };

  return (
    <Dialog open={open} onOpenChange={(open) => (!open ? onClose() : undefined)}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Facility</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(handleDialogSubmit)}
          className="space-y-4 mt-3"
          autoComplete="off"
        >
          <div>
            <Label htmlFor="eventId">Event *</Label>
            <Select
              value={watch("eventId")}
              onValueChange={val => setValue("eventId", val, { shouldValidate: true })}
              disabled={isUpdating}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select event" />
              </SelectTrigger>
              <SelectContent>
                {events.map(ev => (
                  <SelectItem key={ev.id} value={ev.id}>
                    {ev.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.eventId?.message && <p className="text-sm text-destructive">{errors.eventId.message}</p>}
          </div>
          <div>
            <Label htmlFor="name">Facility Name *</Label>
            <Input id="name" {...register("name")} placeholder="Enter facility name" disabled={isUpdating} />
            {errors.name?.message && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register("description")} placeholder="Enter facility description" rows={2} disabled={isUpdating} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="location">Location</Label>
              <Input id="location" {...register("location")} placeholder="Enter facility location" disabled={isUpdating} />
            </div>
            <div>
              <Label>Icon</Label>
              <Select
                value={selectedIcon}
                onValueChange={val => setValue("iconType", val)}
                disabled={isUpdating}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select icon">
                    {(() => {
                      const iconObj = ICON_OPTIONS.find(icon => icon.value === selectedIcon);
                      if (iconObj) {
                        const IconComp = iconObj.icon;
                        return (
                          <span className="flex items-center gap-2">
                            <IconComp className="w-4 h-4" />
                            {iconObj.label}
                          </span>
                        );
                      }
                      return null;
                    })()}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {ICON_OPTIONS.map(icon => {
                    const IconComp = icon.icon;
                    return (
                      <SelectItem key={icon.value} value={icon.value}>
                        <span className="flex items-center gap-2">
                          <IconComp className="w-4 h-4" />
                          {icon.label}
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="rules">Rules (Optional)</Label>
            <Textarea id="rules" {...register("rules")} placeholder="Enter rules and guidelines" rows={2} disabled={isUpdating} />
          </div>

          <div>
            <Label>Facility Image (Optional)</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Upload an image for this facility (maximum 2MB allowed)
            </p>
            <ImageUpload
              onImageSelect={handleImageSelect}
              currentImageUrl={facility?.image_url}
              label="Upload facility image"
              accept="image/*"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Contact Type</Label>
              <Select
                value={contactType}
                onValueChange={val => setValue("contactType", val as "none" | "phone" | "whatsapp")}
                disabled={isUpdating}
              >
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
              <div>
                <Label htmlFor="contactInfo">Contact Number</Label>
                <Input id="contactInfo" {...register("contactInfo")} placeholder="Enter phone number" disabled={isUpdating} />
                {errors.contactInfo?.message && (
                  <p className="text-sm text-destructive">{errors.contactInfo.message}</p>
                )}
              </div>
            )}
          </div>
          <Button type="submit" disabled={isUpdating} className="w-full">
            {isUpdating ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditFacilityDialog;

// NOTE: This file is getting long (over 200 lines). Please consider asking to refactor it into smaller components!

