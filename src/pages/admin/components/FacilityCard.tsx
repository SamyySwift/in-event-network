
import React from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, MapPin, Phone, MessageCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import FacilityIcon from "./FacilityIcon";
import {
  AlertDialog,
  AlertDialogTrigger,
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
  const ContactIcon = facility.contact_type === "phone" ? Phone : 
                     facility.contact_type === "whatsapp" ? MessageCircle : null;

  return (
    <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-background via-background to-muted/20">
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden">
        {facility.image_url ? (
          <>
            <img
              src={facility.image_url}
              alt={facility.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <div className="hidden absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent flex items-center justify-center">
              <div className="bg-background/90 backdrop-blur-sm rounded-2xl p-8 border shadow-lg">
                <FacilityIcon iconType={facility.icon_type} className="h-12 w-12 text-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground text-center">Image unavailable</p>
              </div>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent flex items-center justify-center">
            <div className="bg-background/90 backdrop-blur-sm rounded-2xl p-8 border shadow-lg">
              <FacilityIcon iconType={facility.icon_type} className="h-12 w-12 text-primary mx-auto mb-2" />
              <p className="text-sm text-muted-foreground text-center">No image</p>
            </div>
          </div>
        )}
        
        {/* Action Buttons Overlay */}
        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Button
            size="sm"
            variant="secondary"
            className="h-8 w-8 p-0 bg-background/90 backdrop-blur-sm hover:bg-background shadow-lg"
            onClick={() => onEdit(facility)}
          >
            <Edit size={14} />
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                variant="secondary"
                className="h-8 w-8 p-0 bg-background/90 backdrop-blur-sm hover:bg-destructive hover:text-destructive-foreground shadow-lg"
                disabled={isDeleting}
              >
                <Trash2 size={14} />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Facility</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{facility.name}"? This action cannot be undone.
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

        {/* Contact Type Badge */}
        {facility.contact_type && facility.contact_type !== "none" && (
          <div className="absolute top-3 left-3">
            <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm border-0 shadow-lg">
              {ContactIcon && <ContactIcon className="h-3 w-3 mr-1" />}
              {facility.contact_type}
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-6">
        {/* Header */}
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="font-semibold text-lg leading-tight line-clamp-1">
                {facility.name}
              </h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>Created {format(new Date(facility.created_at), "MMM d, yyyy")}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          {facility.description && (
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
              {facility.description}
            </p>
          )}

          {/* Location */}
          {facility.location && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="line-clamp-1">{facility.location}</span>
            </div>
          )}

          {/* Contact Info */}
          {facility.contact_type && facility.contact_type !== "none" && facility.contact_info && (
            <div className="flex items-center gap-2 text-sm">
              {ContactIcon && <ContactIcon className="h-4 w-4 text-primary flex-shrink-0" />}
              <span className="font-medium">{facility.contact_info}</span>
            </div>
          )}

          {/* Rules */}
          {facility.rules && (
            <div className="pt-2 border-t border-border/50">
              <p className="text-xs text-muted-foreground mb-2">Rules & Guidelines:</p>
              <div className="bg-muted/50 rounded-lg p-3 text-xs leading-relaxed">
                {facility.rules}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FacilityCard;
