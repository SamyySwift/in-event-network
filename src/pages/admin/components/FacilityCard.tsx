
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Building, MapPin, Phone } from "lucide-react";
import { format } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogTrigger,   // <-- Add this import
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import { Facility } from "@/hooks/useAdminFacilities";

interface FacilityCardProps {
  facility: Facility;
  isDeleting: boolean;
  onEdit: (facility: Facility) => void;
  onDelete: (facility: Facility) => void;
}

const FacilityCard: React.FC<FacilityCardProps> = ({
  facility,
  isDeleting,
  onEdit,
  onDelete,
}) => {
  const getFacilityIcon = (icon: string) => {
    switch (icon) {
      case "map-pin":
        return <MapPin className="h-5 w-5 text-primary" />;
      case "phone":
        return <Phone className="h-5 w-5 text-primary" />;
      case "building":
      default:
        return <Building className="h-5 w-5 text-primary" />;
    }
  };

  return (
    <Card className="glass-card overflow-hidden hover:shadow-xl transition-all">
      <CardHeader className="pb-2 flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            {getFacilityIcon(facility.icon_type || "building")}
            {facility.name}
          </CardTitle>
          <CardDescription className="text-xs mt-1">
            Created: {format(new Date(facility.created_at), "MMM d, yyyy")}
          </CardDescription>
        </div>
        <div className="flex space-x-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  onClick={() => onEdit(facility)}
                >
                  <Edit size={16} />
                  <span className="sr-only">Edit</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit Facility</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                disabled={isDeleting}
              >
                <Trash2 size={16} />
                <span className="sr-only">Delete</span>
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
                <AlertDialogAction onClick={() => onDelete(facility)}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mt-2">
          {/* Just example badges, you can add more based on your facility schema */}
          {facility.location && (
            <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Has Location</Badge>
          )}
          {facility.contact_type && facility.contact_type !== "none" && (
            <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
              {facility.contact_type === "phone" ? "Phone" : "WhatsApp"}
            </Badge>
          )}
        </div>
        <div className="space-y-3 mt-4">
          {facility.description && (
            <div>
              <span className="font-medium text-muted-foreground">Description: </span>
              <span>{facility.description}</span>
            </div>
          )}
          {facility.location && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span>{facility.location}</span>
            </div>
          )}
          {facility.rules && (
            <div>
              <span className="text-muted-foreground">Rules:</span>
              <div className="bg-muted rounded p-2 text-xs mt-1">{facility.rules}</div>
            </div>
          )}
          {facility.contact_type && facility.contact_type !== "none" && facility.contact_info && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 flex-shrink-0" />
              <span>{facility.contact_type}:</span>
              <span className="font-medium">{facility.contact_info}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
export default FacilityCard;
