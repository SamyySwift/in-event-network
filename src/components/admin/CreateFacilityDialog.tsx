import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

type CreateFacilityDialogProps = {
  onSubmit: (form: FormData) => void;
  events: { id: string; name: string }[];
  defaultEventId?: string;
  isCreating: boolean;
  children?: React.ReactNode;
};

const iconTypes = [
  { value: "building", label: "Building" },
  { value: "map-pin", label: "Location" },
  { value: "phone", label: "Phone" },
];

const CreateFacilityDialog: React.FC<CreateFacilityDialogProps> = ({
  children,
  onSubmit,
  events,
  defaultEventId,
  isCreating,
}) => {
  const [open, setOpen] = useState(false);

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
      iconType: "building",
      eventId: defaultEventId || "",
    },
  });

  // keep eventId in sync with external change
  useEffect(() => {
    if (defaultEventId) setValue("eventId", defaultEventId);
  }, [defaultEventId, setValue]);

  // Always reset form when dialog is closed
  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  const contactType = watch("contactType");
  const selectedIcon = watch("iconType");

  const handleDialogSubmit = (data: FormData) => {
    onSubmit(data);
    setOpen(false); // close on submit
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Plus size={16} className="mr-1" />
            Add Facility
          </Button>
        )}
      </DialogTrigger>
      {/* Added scroll and constrained height to DialogContent */}
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Facility</DialogTitle>
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
              onValueChange={(val) => setValue("eventId", val, { shouldValidate: true })}
              disabled={isCreating}
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
            <Input id="name" {...register("name")} placeholder="Enter facility name" disabled={isCreating} />
            {errors.name?.message && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register("description")} placeholder="Enter facility description" rows={2} disabled={isCreating} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="location">Location</Label>
              <Input id="location" {...register("location")} placeholder="Enter facility location" disabled={isCreating} />
            </div>
            <div>
              <Label>Icon</Label>
              <Select
                value={selectedIcon}
                onValueChange={val => setValue("iconType", val)}
                disabled={isCreating}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select icon" />
                </SelectTrigger>
                <SelectContent>
                  {iconTypes.map(icon => (
                    <SelectItem key={icon.value} value={icon.value}>
                      {icon.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="rules">Rules (Optional)</Label>
            <Textarea id="rules" {...register("rules")} placeholder="Enter rules and guidelines" rows={2} disabled={isCreating} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Contact Type</Label>
              <Select
                value={contactType}
                onValueChange={val => setValue("contactType", val as "none" | "phone" | "whatsapp")}
                disabled={isCreating}
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
                <Input id="contactInfo" {...register("contactInfo")} placeholder="Enter phone number" disabled={isCreating} />
                {errors.contactInfo?.message && (
                  <p className="text-sm text-destructive">{errors.contactInfo.message}</p>
                )}
              </div>
            )}
          </div>
          <Button type="submit" disabled={isCreating} className="w-full">
            {isCreating ? "Creating..." : "Create Facility"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateFacilityDialog;
