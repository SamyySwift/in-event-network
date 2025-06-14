
import React from "react";
import { Building, MapPin, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogCancel, AlertDialogFooter, AlertDialogAction, AlertDialogDescription,
} from "@/components/ui/alert-dialog";

interface Facility {
  id: string;
  name: string;
  description?: string;
  location?: string;
  rules?: string;
  contact_type?: "none" | "phone" | "whatsapp";
  contact_info?: string;
  icon_type?: string;
  event_id: string;
  created_at: string;
}

interface FacilityCardProps {
  facility: Facility;
  onEdit: (f: Facility) => void;
  onDelete: (id: string) => void;
  isUpdating: boolean;
  isDeleting: boolean;
}

const ICONS: Record<string, React.ReactNode> = {
  building: <Building className="h-6 w-6" />,
  "map-pin": <MapPin className="h-6 w-6" />,
  phone: <Phone className="h-6 w-6" />,
};

export const FacilityCard: React.FC<FacilityCardProps> = ({
  facility,
  onEdit,
  onDelete,
  isDeleting,
  isUpdating,
}) => {
  return (
    <div className="glass-effect rounded-2xl p-5 flex flex-col justify-between transition-shadow shadow-soft hover:shadow-lg group">
      <div className="flex items-center gap-4 mb-2">
        <div className="bg-gradient-to-tr from-primary to-primary/60 p-3 rounded-full text-white mr-2 shadow-sm">
          {ICONS[facility.icon_type || "building"] || ICONS["building"]}
        </div>
        <div>
          <div className="font-semibold text-base">{facility.name}</div>
          {facility.location && (
            <div className="mt-1 flex gap-1 items-center text-xs text-muted-foreground">
              <MapPin className="h-4 w-4 mr-1 shrink-0" />
              {facility.location}
            </div>
          )}
        </div>
      </div>
      {facility.description && (
        <div className="text-sm text-muted-foreground mb-2">{facility.description}</div>
      )}
      {facility.rules && (
        <div className="bg-muted/60 mt-2 text-xs p-2 rounded text-muted-foreground">
          <strong>Rules:</strong> {facility.rules}
        </div>
      )}
      {facility.contact_type !== "none" && facility.contact_info && (
        <div className="flex items-center mt-2 gap-2 text-xs">
          <Phone className="h-4 w-4 text-primary"/>
          <span className="capitalize">{facility.contact_type}:</span> 
          <span className="font-semibold">{facility.contact_info}</span>
        </div>
      )}
      <div className="flex items-center justify-between mt-4">
        <span className="text-xs text-gray-400">
          Created {format(new Date(facility.created_at), "MMM d, yyyy")}
        </span>
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={() => onEdit(facility)} disabled={isUpdating}>
            Edit
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="ghost" className="text-destructive" disabled={isDeleting}>
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Facility</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this facility? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(facility.id)}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
};

export default FacilityCard;
