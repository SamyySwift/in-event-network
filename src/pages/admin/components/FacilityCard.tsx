
import React from "react";
import {
  Card,
  CardHeader,
  CardContent,
} from "@/components/ui/card";
import FacilityHeader from "./FacilityHeader";
import FacilityBadges from "./FacilityBadges";
import FacilityDetails from "./FacilityDetails";
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
  return (
    <Card className="glass-card overflow-hidden hover:shadow-xl transition-all">
      <CardHeader>
        <FacilityHeader
          facility={facility}
          isDeleting={isDeleting}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </CardHeader>
      
      <CardContent>
        <FacilityBadges contactType={facility.contact_type} />
        
        <FacilityDetails
          description={facility.description}
          location={facility.location}
          rules={facility.rules}
          contactType={facility.contact_type}
          contactInfo={facility.contact_info}
          iconType={facility.icon_type}
        />
      </CardContent>
    </Card>
  );
};

export default FacilityCard;
