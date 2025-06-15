
import React from "react";
import { CardTitle, CardDescription } from "@/components/ui/card";
import { format } from "date-fns";
import FacilityIcon from "./FacilityIcon";
import FacilityActions from "./FacilityActions";
import { Facility } from "@/hooks/useAdminFacilities";

interface FacilityHeaderProps {
  facility: Facility;
  isDeleting: boolean;
  onEdit: (facility: Facility) => void;
  onDelete: (facility: Facility) => void;
}

const FacilityHeader: React.FC<FacilityHeaderProps> = ({
  facility,
  isDeleting,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="pb-2 flex flex-row items-start justify-between">
      <div>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <FacilityIcon iconType={facility.icon_type} />
          {facility.name}
        </CardTitle>
        <CardDescription className="text-xs mt-1">
          Created: {format(new Date(facility.created_at), "MMM d, yyyy")}
        </CardDescription>
      </div>
      <FacilityActions
        facility={facility}
        isDeleting={isDeleting}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
};

export default FacilityHeader;
