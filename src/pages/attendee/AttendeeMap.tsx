import React, { useState } from "react";
import {
  MapPin,
  Search,
  Info,
  Phone,
  Compass,
  Coffee,
  Home,
  Utensils,
  HeartPulse,
  Bath,
  Car,
  CircleHelp,
  Clock,
  Building,
  Wifi,
  Users,
  Camera,
  Music,
  Tv,
  Gamepad2,
  Heart,
  ShoppingBag,
  Bed,
  MessageCircle,
} from "lucide-react";
import AttendeeRouteGuard from "@/components/attendee/AttendeeRouteGuard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useAttendeeFacilities } from "@/hooks/useAttendeeFacilities";
import { useIsMobile } from "@/hooks/use-mobile";
import FacilityIcon from "@/pages/admin/components/FacilityIcon";

// Facility type colors for visual distinction - updated to match admin icon types
const facilityTypeColors: Record<string, string> = {
  ambulance: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  hospital: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  car: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  "map-pin": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  building: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  coffee: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  shield: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  wifi: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  phone: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  user: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
  bath: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
  "chef-hat": "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  utensils: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  home: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  dumbbell: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  music: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  "gamepad-2": "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
  archive: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  "archive-restore": "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  box: "bg-brown-100 text-brown-800 dark:bg-brown-900 dark:text-brown-200",
  landmark: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  warehouse: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  siren: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  "alert-triangle": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  presentation: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  monitor: "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200",
  sofa: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  wine: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  "arrow-up": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  other: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
};

// Facility type labels - updated to match admin icon types
const facilityTypeLabels: Record<string, string> = {
  ambulance: "Ambulance",
  hospital: "Hospital", 
  car: "Parking",
  "map-pin": "Location",
  building: "Building",
  coffee: "Coffee",
  shield: "Security",
  wifi: "WiFi",
  phone: "Phone",
  user: "Information",
  bath: "Restroom",
  "chef-hat": "Kitchen",
  utensils: "Restaurant",
  home: "Accommodation",
  dumbbell: "Fitness",
  music: "Music",
  "gamepad-2": "Gaming",
  archive: "Storage",
  "archive-restore": "Archive",
  box: "Storage",
  landmark: "Landmark",
  warehouse: "Warehouse",
  siren: "Emergency",
  "alert-triangle": "Warning",
  presentation: "Conference",
  monitor: "Technology",
  sofa: "Lounge",
  wine: "Bar",
  "arrow-up": "Elevator",
  other: "Other",
};

const AttendeeMap = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedFacility, setSelectedFacility] = useState<any>(null);
  const isMobile = useIsMobile();

  const { facilities, isLoading, error } = useAttendeeFacilities();

  // Filter facilities based on search and type filter
  const filteredFacilities = facilities.filter((facility) => {
    const matchesSearch =
      facility.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      facility.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      facility.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = !selectedType || facility.icon_type === selectedType;

    return matchesSearch && matchesType;
  });

  // Get unique facility types from actual data
  const facilityTypes = Array.from(
    new Set(facilities.map((f) => f.icon_type).filter(Boolean))
  );

  const getContactIcon = (contactType?: string) => {
    switch (contactType) {
      case "phone":
        return <Phone className="h-4 w-4" />;
      case "whatsapp":
        return <MessageCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <AttendeeRouteGuard>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading facilities...</p>
          </div>
        </div>
      </AttendeeRouteGuard>
    );
  }

  if (error) {
    return (
      <AttendeeRouteGuard>
        <div className="animate-fade-in max-w-6xl mx-auto px-4 sm:px-6">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Find Your Way
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
              Locate facilities and services around the venue
            </p>
          </div>
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="text-center">
                <CircleHelp className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  Unable to load facilities
                </h3>
                <p className="text-gray-500">
                  Please try again later or contact support if the problem
                  persists.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </AttendeeRouteGuard>
    );
  }

  return (
    <AttendeeRouteGuard>
      <div className="container py-6">
        <div className="animate-fade-in max-w-6xl mx-auto px-4 sm:px-6">
          {/* Modern Header with Purple Gradient */}
          <div className="mb-8 relative overflow-hidden">
            <div className="relative bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-transparent"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>

              {/* Content */}
              <div className="relative z-10">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Icon */}
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4">
                      <MapPin className="h-6 w-6 text-white" />
                    </div>

                    {/* Title and Description */}
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
                      Find Your Way
                    </h1>
                    <p className="text-purple-100 text-sm sm:text-base lg:text-lg font-medium mb-4">
                      Locate facilities and services around the venue
                    </p>

                    {/* Stats or Additional Info */}
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1.5">
                        <span className="text-white text-xs sm:text-sm font-medium">
                          {facilities.length} Facilities
                        </span>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1.5">
                        <span className="text-white text-xs sm:text-sm font-medium">
                          {facilityTypes.length} Categories
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right side decorative element */}
                  <div className="hidden sm:block">
                    <div className="w-16 h-16 lg:w-20 lg:h-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                      <Compass className="h-8 w-8 lg:h-10 lg:w-10 text-white/80" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className={`grid gap-6 ${
            isMobile ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-4"
          }`}
        >
          {/* Search and Filter Sidebar */}
          <div
            className={`space-y-4 ${isMobile ? "order-1" : "lg:col-span-1"}`}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg sm:text-xl flex items-center">
                  <Search className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-connect-600 dark:text-connect-400" />
                  Find Facilities
                </CardTitle>
                <CardDescription className="text-sm">
                  Search for amenities and services
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search input */}
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search facilities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 text-sm"
                  />
                </div>

                {/* Facility type filters */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">Filter by Type:</p>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    <Badge
                      className={`cursor-pointer text-xs ${
                        !selectedType
                          ? "bg-connect-100 text-connect-800 dark:bg-connect-900 dark:text-connect-200"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                      }`}
                      onClick={() => setSelectedType(null)}
                    >
                      All
                    </Badge>
                    {facilityTypes.map((type) => (
                      <Badge
                        key={type}
                        className={`cursor-pointer text-xs ${
                          selectedType === type
                            ? facilityTypeColors[type] ||
                              facilityTypeColors.other
                            : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                        }`}
                        onClick={() => setSelectedType(type)}
                      >
                        {facilityTypeLabels[type] || type}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Quick facility list for mobile */}
                {isMobile && (
                  <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                    <p className="text-sm font-medium">Quick Access:</p>
                    {filteredFacilities.slice(0, 3).map((facility) => (
                      <div
                        key={facility.id}
                        className={`p-2 rounded-lg cursor-pointer transition-colors ${
                          selectedFacility?.id === facility.id
                            ? "bg-connect-50 dark:bg-connect-900/30 border-l-4 border-connect-500"
                            : "hover:bg-gray-50 dark:hover:bg-gray-800 border-l-4 border-transparent"
                        }`}
                        onClick={() => setSelectedFacility(facility)}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`p-1.5 rounded-full ${
                              (
                                facilityTypeColors[facility.icon_type] ||
                                facilityTypeColors.other
                              ).split(" ")[0]
                            } ${
                              (
                                facilityTypeColors[facility.icon_type] ||
                                facilityTypeColors.other
                              ).split(" ")[1]
                            }`}
                          >
                            <FacilityIcon 
                              iconType={facility.icon_type} 
                              className="h-5 w-5" 
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">
                              {facility.name}
                            </h4>
                            <p className="text-xs text-gray-500 truncate">
                              {facility.location}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Facilities List */}
          <div className={`${isMobile ? "order-2" : "lg:col-span-3"}`}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">
                  All Facilities ({filteredFacilities.length})
                </CardTitle>
                <CardDescription className="text-sm">
                  Comprehensive list of all venue facilities
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredFacilities.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No facilities found matching your criteria.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredFacilities.map((facility) => (
                      <div
                        key={facility.id}
                         className={`border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer ${
                          selectedFacility?.id === facility.id
                            ? "ring-2 ring-connect-500 bg-connect-50 dark:bg-connect-900/30"
                            : ""
                        }`}
                        onClick={() => setSelectedFacility(facility)}
                      >
                        <div className="flex items-start gap-4 mb-3">
                          {facility.image_url ? (
                            <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 shadow-md">
                              <img
                                src={facility.image_url}
                                alt={facility.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  // Fallback to icon if image fails to load
                                  const target = e.currentTarget;
                                  const container = target.parentElement;
                                  if (container) {
                                    container.innerHTML = `
                                      <div class="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
                                        <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                      </div>
                                    `;
                                  }
                                }}
                              />
                            </div>
                          ) : (
                            <div
                              className={`p-3 rounded-full flex-shrink-0 ${
                                (
                                  facilityTypeColors[facility.icon_type || 'other'] ||
                                  facilityTypeColors.other
                                ).split(" ")[0]
                              } ${
                                (
                                  facilityTypeColors[facility.icon_type || 'other'] ||
                                  facilityTypeColors.other
                                ).split(" ")[1]
                              }`}
                            >
                              <FacilityIcon 
                                iconType={facility.icon_type} 
                                className="h-6 w-6" 
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-lg font-medium line-clamp-2">
                                {facility.name}
                              </h4>
                              <Badge
                                className={`text-xs ${
                                  facilityTypeColors[facility.icon_type || 'other'] ||
                                  facilityTypeColors.other
                                }`}
                              >
                                {facilityTypeLabels[facility.icon_type || 'other'] ||
                                  facility.icon_type || 'Other'}
                              </Badge>
                            </div>
                            
                            {facility.location && (
                              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1 mb-2">
                                <MapPin className="inline h-4 w-4 mr-1" />
                                {facility.location}
                              </p>
                            )}
                            
                            {facility.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">
                                {facility.description}
                              </p>
                            )}
                            
                            {facility.rules && (
                              <div className="mb-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-2">
                                <p className="text-xs font-medium text-amber-800 dark:text-amber-200 mb-1 flex items-center">
                                  <Info className="h-3 w-3 mr-1" />
                                  Rules & Guidelines:
                                </p>
                                <p className="text-sm text-amber-700 dark:text-amber-300 line-clamp-2">
                                  {facility.rules}
                                </p>
                              </div>
                            )}
                            
                            {facility.contact_info &&
                              facility.contact_type !== "none" && (
                                <div className="flex items-center gap-2 text-sm text-connect-600 dark:text-connect-400">
                                  {getContactIcon(facility.contact_type)}
                                  <span className="font-medium">{facility.contact_info}</span>
                                </div>
                              )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Facility Detail Modal for Mobile */}
        {isMobile && selectedFacility && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
            <div className="bg-white dark:bg-gray-800 w-full rounded-t-2xl p-6 animate-slide-in-right max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">{selectedFacility.name}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedFacility(null)}
                >
                  ✕
                </Button>
              </div>

              {selectedFacility.image_url && (
                <div className="w-full h-48 rounded-lg overflow-hidden mb-4">
                  <img
                    src={selectedFacility.image_url}
                    alt={selectedFacility.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="space-y-4">
                {selectedFacility.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {selectedFacility.location}
                    </span>
                  </div>
                )}

                {selectedFacility.description && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {selectedFacility.description}
                    </p>
                  </div>
                )}

                {selectedFacility.rules && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Rules:
                    </h4>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {selectedFacility.rules}
                      </p>
                    </div>
                  </div>
                )}

                {selectedFacility.contact_info &&
                  selectedFacility.contact_type !== "none" && (
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                      {getContactIcon(selectedFacility.contact_type)}
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        {selectedFacility.contact_info}
                      </span>
                    </div>
                  )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AttendeeRouteGuard>
  );
};

export default AttendeeMap;
