
import React from "react";
import {
  Ambulance,
  Hospital,
  Car,
  MapPin,
  Building,
  Coffee,
  Shield,
  Wifi,
  Phone,
  User,
  Bath,
  ChefHat,
  Utensils,
  Home,
  Dumbbell,
  Music,
  Gamepad2,
  Archive,
  ArchiveRestore,
  Box,
  Landmark,
  Warehouse,
  Siren,
  AlertTriangle,
  Presentation,
  Monitor,
  Sofa,
  Wine,
  ArrowUp,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  ambulance: Ambulance,
  hospital: Hospital,
  car: Car,
  "map-pin": MapPin,
  building: Building,
  coffee: Coffee,
  shield: Shield,
  wifi: Wifi,
  phone: Phone,
  user: User,
  bath: Bath,
  "chef-hat": ChefHat,
  utensils: Utensils,
  home: Home,
  dumbbell: Dumbbell,
  music: Music,
  "gamepad-2": Gamepad2,
  archive: Archive,
  "archive-restore": ArchiveRestore,
  box: Box,
  landmark: Landmark,
  warehouse: Warehouse,
  siren: Siren,
  "alert-triangle": AlertTriangle,
  presentation: Presentation,
  monitor: Monitor,
  sofa: Sofa,
  wine: Wine,
  "arrow-up": ArrowUp,
};

interface FacilityIconProps {
  iconType?: string;
  className?: string;
}

const FacilityIcon: React.FC<FacilityIconProps> = ({ iconType, className = "h-5 w-5 text-primary" }) => {
  const IconComp = iconMap[iconType || "ambulance"] || Ambulance;
  return <IconComp className={className} />;
};

export default FacilityIcon;
