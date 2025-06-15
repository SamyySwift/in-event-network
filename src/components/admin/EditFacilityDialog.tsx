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
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Facility } from "@/hooks/useAdminFacilities";
import {
  Ambulance,
  Bell,
  BellRing,
  BellElectric,
  Cafe,
  Hospital,
  ParkingMeter,
  Restroom,
  Toilet,
} from "lucide-react";

const ICON_OPTIONS = [
  { value: "ambulance", label: "Ambulance", icon: Ambulance },
  { value: "hospital", label: "Hospital", icon: Hospital },
  { value: "toilet", label: "Toilet", icon: Toilet },
  { value: "restroom", label: "Restroom", icon: Restroom },
  { value: "cafe", label: "Cafe", icon: Cafe },
  { value: "bell", label: "Bell", icon: Bell },
  { value: "bell-ring", label: "Bell Ring", icon: BellRing },
  { value: "bell-electric", label: "Bell Electric", icon: BellElectric },
  { value: "parking-meter", label: "Parking Meter", icon: ParkingMeter },
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
});

type FormData = z.infer<typeof formSchema>;

type EditFacilityDialogProps = {
  facility: Facility | null;
  events: { id: string; name: string }[];
  isUpdating: boolean;
  onSubmit: (form: FormData) => void;
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

  const handleDialogSubmit = (data: FormData) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={(open) => (!open ? onClose() : undefined)}>
      {/* Added scroll and constrained height to DialogContent */}
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
