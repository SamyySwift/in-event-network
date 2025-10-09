
import React from "react";
import FacilityIcon from "./FacilityIcon";

interface FacilityDetailsProps {
  description?: string;
  location?: string;
  rules?: string;
  contactType?: string;
  contactInfo?: string;
  iconType?: string;
}

const FacilityDetails: React.FC<FacilityDetailsProps> = ({
  description,
  location,
  rules,
  contactType,
  contactInfo,
  iconType,
}) => {
  return (
    <div className="space-y-3 mt-4">
      {description && (
        <div>
          <span className="font-medium text-muted-foreground">Description: </span>
          <span className="whitespace-pre-line">{description}</span>
        </div>
      )}
      
      {location && (
        <div className="flex items-center gap-2 text-sm">
          <FacilityIcon iconType={iconType} />
          <span>{location}</span>
        </div>
      )}
      
      {rules && (
        <div>
          <span className="text-muted-foreground">Rules:</span>
          <div className="bg-muted rounded p-2 text-xs mt-1 whitespace-pre-line">{rules}</div>
        </div>
      )}
      
      {contactType && contactType !== "none" && contactInfo && (
        <div className="flex items-center gap-2 text-sm">
          <span>{contactType}:</span>
          <span className="font-medium">{contactInfo}</span>
        </div>
      )}
    </div>
  );
};

export default FacilityDetails;
