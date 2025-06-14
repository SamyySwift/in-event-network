
import React from "react";
import { Building, MapPin, Phone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type FacilityStatsCardsProps = {
  total: number;
  withLocation: number;
  withContact: number;
  loading?: boolean;
};

const icons = [
  {
    key: "total",
    icon: Building,
    bg: "from-blue-400 to-indigo-400",
    label: "Total Facilities",
  },
  {
    key: "withLocation",
    icon: MapPin,
    bg: "from-green-300 to-emerald-400",
    label: "With Location",
  },
  {
    key: "withContact",
    icon: Phone,
    bg: "from-yellow-300 to-orange-400",
    label: "With Contact",
  },
];

const FacilityStatsCards: React.FC<FacilityStatsCardsProps> = ({
  total, withLocation, withContact, loading
}) => {
  const values = {
    total,
    withLocation,
    withContact,
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
      {icons.map((stat) => (
        <Card
          key={stat.key}
          className={cn("glass-card flex items-center p-4 min-h-[84px] relative", loading && "animate-pulse")}
        >
          <div className={`bg-gradient-to-br ${stat.bg} rounded-full p-3 mr-4 flex items-center justify-center`}>
            <stat.icon className="text-white w-5 h-5" />
          </div>
          <CardContent className="p-0 flex flex-col">
            <span className="text-2xl font-bold">
              {loading ? "–" : values[stat.key as keyof typeof values]}
            </span>
            <span className="text-xs text-muted-foreground mt-1 font-medium">{stat.label}</span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default FacilityStatsCards;
