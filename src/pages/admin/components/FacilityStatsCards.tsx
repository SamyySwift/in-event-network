
import React from "react";
import { Building, MapPin, Phone } from "lucide-react";

interface FacilityStatsCardsProps {
  total: number;
  locations: number;
  withContact: number;
}

const stats = [
  {
    label: "Total Facilities",
    icon: Building,
    color: "from-primary to-primary/70",
    bg: "bg-gradient-to-tr from-primary to-primary/70"
  },
  {
    label: "Facilities with Location",
    icon: MapPin,
    color: "from-green-500 to-green-300",
    bg: "bg-gradient-to-tr from-green-500 to-green-300"
  },
  {
    label: "With Contact",
    icon: Phone,
    color: "from-blue-500 to-blue-300",
    bg: "bg-gradient-to-tr from-blue-500 to-blue-300"
  },
];

export const FacilityStatsCards: React.FC<FacilityStatsCardsProps> = ({
  total,
  locations,
  withContact,
}) => {
  const values = [total, locations, withContact];
  return (
    <div className="grid gap-4 sm:grid-cols-3 w-full">
      {stats.map((s, i) => (
        <div
          key={s.label}
          className={`glass-effect p-4 rounded-lg flex items-center gap-3 shadow-soft`}
        >
          <div className={`rounded-full p-2 ${s.bg} text-white`}>
            <s.icon className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-semibold">{values[i]}</div>
            <div className="text-muted-foreground text-xs">{s.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FacilityStatsCards;
