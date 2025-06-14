
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ui/image-upload";
import { Loader } from "lucide-react";
import { useForm } from "react-hook-form";

type EventFormData = {
  name: string;
  description?: string;
  start_time: string;
  end_time: string;
  location?: string;
  image?: File | null;
};

interface CreateEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: EventFormData) => void;
  isCreating?: boolean;
  isUpdating?: boolean;
  editingEvent?: any | null;
}

const CreateEventDialog: React.FC<CreateEventDialogProps> = ({
  open, onOpenChange, onSubmit, isCreating, isUpdating, editingEvent
}) => {
  const isEditing = Boolean(editingEvent);
  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<EventFormData>({
    defaultValues: {
      name: editingEvent?.name || "",
      description: editingEvent?.description || "",
      start_time: editingEvent ? new Date(editingEvent.start_time).toISOString().slice(0, 16) : "",
      end_time: editingEvent ? new Date(editingEvent.end_time).toISOString().slice(0, 16) : "",
      location: editingEvent?.location || "",
      image: null
    }
  });

  React.useEffect(() => {
    if (editingEvent) {
      setValue("name", editingEvent.name);
      setValue("description", editingEvent.description || "");
      setValue("start_time", new Date(editingEvent.start_time).toISOString().slice(0, 16));
      setValue("end_time", new Date(editingEvent.end_time).toISOString().slice(0, 16));
      setValue("location", editingEvent.location || "");
    } else {
      reset();
    }
  }, [editingEvent, setValue, reset]);

  const [selectedImage, setSelectedImage] = React.useState<File | null>(null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Event" : "Create New Event"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update event information."
              : "Add a new event to the schedule."
            }
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit((data) => {
            onSubmit({ ...data, image: selectedImage });
            setSelectedImage(null);
          })}
          className="space-y-4"
        >
          <div>
            <Label htmlFor="name" className="text-sm font-medium">Event Name *</Label>
            <Input
              id="name"
              {...register("name", { required: "Event name is required" })}
              placeholder="Enter event name"
            />
            {errors.name?.message && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
          <div>
            <Label htmlFor="description" className="text-sm font-medium">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Enter event description"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <Label htmlFor="start_time" className="text-sm font-medium">Start Time *</Label>
              <Input
                id="start_time"
                type="datetime-local"
                {...register("start_time", { required: "Start time is required" })}
              />
              {errors.start_time?.message && <p className="text-sm text-destructive">{errors.start_time.message}</p>}
            </div>
            <div>
              <Label htmlFor="end_time" className="text-sm font-medium">End Time *</Label>
              <Input
                id="end_time"
                type="datetime-local"
                {...register("end_time", { required: "End time is required" })}
              />
              {errors.end_time?.message && <p className="text-sm text-destructive">{errors.end_time.message}</p>}
            </div>
          </div>
          <div>
            <Label htmlFor="location" className="text-sm font-medium">Location</Label>
            <Input
              id="location"
              {...register("location")}
              placeholder="Enter event location"
            />
          </div>
          <div>
            <Label className="text-sm font-medium">Event Banner Image (Optional)</Label>
            <ImageUpload onImageSelect={setSelectedImage} label="" />
          </div>
          <div className="flex gap-2 pt-2">
            <Button
              type="submit"
              className="flex-1"
              disabled={isCreating || isUpdating}
            >
              {(isCreating || isUpdating) && <Loader className="h-4 w-4 mr-2 animate-spin" />}
              {isEditing ? "Update Event" : "Create Event"}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateEventDialog;
