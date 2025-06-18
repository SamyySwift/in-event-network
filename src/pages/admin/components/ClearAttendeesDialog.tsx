import * as React from "react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Loader, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type ClearAttendeesDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
  attendeeCount: number;
  eventName?: string;
};

export const ClearAttendeesDialog: React.FC<ClearAttendeesDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  isLoading,
  attendeeCount,
  eventName,
}) => (
  <AlertDialog open={open} onOpenChange={onOpenChange}>
    <AlertDialogTrigger asChild>
      {/* This trigger is managed outside: do not render, just satisfy type */}
      <span />
    </AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>
          <span className="flex items-center gap-2 text-destructive">
            <Trash2 className="w-5 h-5" />
            Clear Attendee Data
          </span>
        </AlertDialogTitle>
        <AlertDialogDescription>
          This will{" "}
          <span className="font-bold">
            permanently remove all {attendeeCount} attendees
          </span>{" "}
          from{" "}
          <span className="font-semibold">{eventName || "this event"}</span>.
          <br />
          All users will still exist, but will no longer be associated with this
          event.
          <br />
          <span className="text-destructive font-semibold">
            This action cannot be undone!
          </span>
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
        <AlertDialogAction
          className="bg-destructive hover:bg-destructive/80 text-white"
          onClick={onConfirm}
          disabled={isLoading}
        >
          {isLoading && <Loader className="animate-spin h-4 w-4 mr-2" />}
          Yes, Clear Attendees
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);
