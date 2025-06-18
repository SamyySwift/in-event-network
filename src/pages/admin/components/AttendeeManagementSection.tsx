import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminAttendees } from "@/hooks/useAdminAttendees";
import { ClearAttendeesDialog } from "./ClearAttendeesDialog";
import { useToast } from "@/hooks/use-toast";

type AttendeeManagementSectionProps = {
  eventName: string;
  children: React.ReactNode;
};

const AttendeeManagementSection: React.FC<AttendeeManagementSectionProps> = ({
  eventName,
  children,
}) => {
  const { attendees, clearAttendees, isClearing } = useAdminAttendees();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleClearAttendees = async () => {
    try {
      await clearAttendees();
      toast({
        title: "Attendees Cleared",
        description: "All attendee data for this event has been cleared.",
        variant: "default",
      });
      setDialogOpen(false);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "Failed to clear attendees.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="glass-card p-6 rounded-xl space-y-8 shadow-xl">
      {/* Section Header */}
      <div className="flex flex-col space-y-3 md:flex-row items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-fuchsia-400 via-purple-500 to-indigo-600 shadow-md">
            <Users className="w-6 h-6 text-white" />
          </span>
          <div>
            <div className="uppercase text-xs font-bold text-primary-600 tracking-wide">
              Attendees
            </div>
            <div className="text-lg font-semibold text-primary-900 dark:text-primary-100">
              {eventName}
            </div>
          </div>
        </div>
        {/* Clear All Attendees Button - destructive style */}
        <div>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDialogOpen(true)}
            disabled={isClearing || attendees.length === 0}
            className="flex gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Clear Attendee Data
          </Button>
          <ClearAttendeesDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            onConfirm={handleClearAttendees}
            isLoading={isClearing}
            attendeeCount={attendees.length}
            eventName={eventName}
          />
        </div>
      </div>

      {/* Add Attendee Form (disabled for now, as creation not implemented) */}
      <Card className="mb-6 glass-card bg-gradient-to-br from-white/90 via-primary-50/70 to-primary-100/60 transition-all animate-fade-in shadow-lg">
        <CardHeader>
          <CardTitle>Add New Attendee (Coming soon)</CardTitle>
          <CardDescription>
            Manual addition of attendees is currently not available in this
            admin panel.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">
            Please use the event registration link to add attendees.
          </div>
        </CardContent>
      </Card>

      {children}
    </div>
  );
};

export default AttendeeManagementSection;
