
import React from "react";
import { Badge } from "@/components/ui/badge";

interface FacilityBadgesProps {
  contactType?: string;
}

const FacilityBadges: React.FC<FacilityBadgesProps> = ({ contactType }) => {
  if (!contactType || contactType === "none") {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
        {contactType === "phone" ? "Phone" : "WhatsApp"}
      </Badge>
    </div>
  );
};

export default FacilityBadges;
