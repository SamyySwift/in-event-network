
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
  AlertDialogAction
} from "@/components/ui/alert-dialog";
import { Loader, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type ClearAttendeesDialogProps = {
  onConfirm: () => Promise<void>;
  isClearing: boolean;
};

const ClearAttendeesDialog: React.FC<ClearAttendeesDialogProps> = ({
  onConfirm,
  isClearing,
}) => {
  const [open, setOpen] = React.useState(false);

  const handleConfirm = async () => {
    await onConfirm();
    setOpen(false);
  };

  return (
    <>
      <Button
        variant="destructive"
        onClick={() => setOpen(true)}
        disabled={isClearing}
        className="w-full"
      >
        {isClearing ? (
          <>
            <Loader className="animate-spin h-4 w-4 mr-2" />
            Clearing...
          </>
        ) : (
          <>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All Attendees
          </>
        )}
      </Button>
      
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              <span className="flex items-center gap-2 text-destructive">
                <Trash2 className="w-5 h-5" />
                Clear Attendee Data
              </span>
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will <span className="font-bold">permanently remove all attendees</span> from your events.
              <br />
              All users will still exist, but will no longer be associated with your events.<br/>
              <span className="text-destructive font-semibold">This action cannot be undone!</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isClearing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/80 text-white"
              onClick={handleConfirm}
              disabled={isClearing}
            >
              {isClearing && <Loader className="animate-spin h-4 w-4 mr-2" />}
              Yes, Clear Attendees
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ClearAttendeesDialog;
