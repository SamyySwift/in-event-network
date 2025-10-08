import React, { useState } from "react";
import {
  MapPin,
  Search,
  Phone,
  MessageCircle,
  Building,
  Star,
  ArrowRight,
  X,
  Navigation,
  Clock,
  Users,
  Sparkles,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import AttendeeRouteGuard from "@/components/attendee/AttendeeRouteGuard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAttendeeFacilities } from "@/hooks/useAttendeeFacilities";
import { useIsMobile } from "@/hooks/use-mobile";
import FacilityIcon from "@/pages/admin/components/FacilityIcon";

interface FacilityCardProps {
  facility: any;
  onClick: () => void;
  isSelected?: boolean;
}

// FacilityCard (clickable location icon + text)
const FacilityCard: React.FC<FacilityCardProps> = ({ facility, onClick, isSelected }) => {
  const getContactIcon = (contactType: string) => {
    if (contactType === "phone") return Phone;
    if (contactType === "whatsapp") return FaWhatsapp;
    return null;
  };

  const handleContactClick = (e: React.MouseEvent, contactType: string, contactInfo: string) => {
    e.stopPropagation();
    if (contactType === "phone") {
      window.location.href = `tel:${contactInfo}`;
    } else if (contactType === "whatsapp") {
      window.open(`https://wa.me/${contactInfo.replace(/[^0-9]/g, '')}`, '_blank');
    }
  };

  // Open Google Maps from facility card
  const handleLocationClick = (e: React.MouseEvent, location: string) => {
    e.stopPropagation();
    const encodedLocation = encodeURIComponent(location);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedLocation}`, "_blank");
  };

  const ContactIcon = getContactIcon(facility.contact_type);

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br from-background to-muted/30 border-0 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:scale-[1.02] ${
        isSelected ? 'ring-2 ring-primary shadow-primary/25' : ''
      }`}
      onClick={onClick}
    >
      {/* Hero Image Section */}
      <div className="relative h-48 overflow-hidden">
        {facility.image_url ? (
          <>
            <img
              src={facility.image_url}
              alt={facility.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
            {/* Tailwind conflict fix: move flex off the hidden element */}
            <div className="hidden absolute inset-0 bg-gradient-to-br from-primary/30 via-primary/20 to-transparent">
              <div className="flex items-center justify-center h-full w-full">
                <div className="bg-background/95 backdrop-blur-xl rounded-3xl p-8 border shadow-2xl">
                  <FacilityIcon iconType={facility.icon_type} className="h-12 w-12 text-primary mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground text-center font-medium">Image unavailable</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-primary/20 to-transparent flex items-center justify-center">
            <div className="bg-background/95 backdrop-blur-xl rounded-3xl p-8 border shadow-2xl">
              <FacilityIcon iconType={facility.icon_type} className="h-12 w-12 text-primary mx-auto mb-3" />
              <p className="text-sm text-muted-foreground text-center font-medium">No image</p>
            </div>
          </div>
        )}
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        {/* Contact Badge */}
        {facility.contact_type && facility.contact_type !== "none" && facility.contact_info && (
          <div className="absolute top-4 left-4">
            <Badge 
              className="bg-background/90 backdrop-blur-sm text-foreground border-0 shadow-lg hover:bg-primary/10 cursor-pointer transition-colors"
              onClick={(e) => handleContactClick(e, facility.contact_type, facility.contact_info)}
            >
              {ContactIcon && <ContactIcon className="h-3 w-3 mr-1" />}
              {facility.contact_type === "phone" ? "Call" : facility.contact_type === "whatsapp" ? "WhatsApp" : facility.contact_type}
            </Badge>
          </div>
        )}

        {/* Featured badge for facilities with all details */}
        {facility.description && facility.location && facility.contact_info && (
          <div className="absolute top-4 right-4">
            <Badge className="bg-primary/90 backdrop-blur-sm text-primary-foreground border-0 shadow-lg">
              <Star className="h-3 w-3 mr-1" />
              Featured
            </Badge>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-6">
        <div className="space-y-4">
          {/* Title & Quick Info */}
          <div>
            <h3 className="text-xl font-bold mb-2 line-clamp-1 group-hover:text-primary transition-colors">
              {facility.name}
            </h3>
            {facility.location && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin
                  className="h-4 w-4 text-primary cursor-pointer hover:text-primary/80 transition-colors"
                  onClick={(e) => handleLocationClick(e, facility.location)}
                  aria-label="Open in Google Maps"
                />
                <span
                  className="text-sm line-clamp-1 cursor-pointer hover:text-primary transition-colors"
                  onClick={(e) => handleLocationClick(e, facility.location)}
                >
                  {facility.location}
                </span>
              </div>
            )}
          </div>

          {/* Description */}
          {facility.description && (
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
              {facility.description}
            </p>
          )}

          {/* Action Button */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {facility.contact_info && ContactIcon && (
                <div className="flex items-center gap-1">
                  <ContactIcon className="h-3 w-3" />
                  <span>Available</span>
                </div>
              )}
            </div>
            
            <Button
              size="sm"
              className="bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground transition-all duration-300"
            >
              View Details
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// AttendeeMap (add modal maps handler + use it without title prop)
const AttendeeMap = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFacility, setSelectedFacility] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const isMobile = useIsMobile();

  const { facilities, isLoading, error } = useAttendeeFacilities();

  // Filter facilities based on search
  const filteredFacilities = facilities.filter((facility) => {
    const matchesSearch =
      facility.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      facility.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      facility.description?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const handleFacilityClick = (facility: any) => {
    setSelectedFacility(facility);
    setIsDialogOpen(true);
  };

  const getContactIcon = (contactType?: string) => {
    if (contactType === "phone") return Phone;
    if (contactType === "whatsapp") return FaWhatsapp;
    return null;
  };

  const handleModalContactClick = (contactType: string, contactInfo: string) => {
    if (contactType === "phone") {
      window.location.href = `tel:${contactInfo}`;
    } else if (contactType === "whatsapp") {
      window.open(`https://wa.me/${contactInfo.replace(/[^0-9]/g, '')}`, '_blank');
    }
  };

  const handleModalLocationClick = (location: string) => {
    const encodedLocation = encodeURIComponent(location);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedLocation}`, '_blank');
  };

  const ModalContactIcon = getContactIcon(selectedFacility?.contact_type);

  if (isLoading) {
    return (
      <AttendeeRouteGuard>
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/50">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="relative">
                  <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary/20 border-t-primary mx-auto"></div>
                  <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-primary animate-pulse" />
                </div>
                <p className="mt-4 text-muted-foreground font-medium">Loading facilities...</p>
              </div>
            </div>
          </div>
        </div>
      </AttendeeRouteGuard>
    );
  }

  if (error) {
    return (
      <AttendeeRouteGuard>
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/50">
          <div className="container mx-auto px-4 py-8">
            <Card className="max-w-md mx-auto mt-12">
              <CardContent className="p-8 text-center">
                <Building className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Unable to load facilities</h3>
                <p className="text-muted-foreground text-sm">
                  Please try again later or contact support if the problem persists.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </AttendeeRouteGuard>
    );
  }

  return (
    <AttendeeRouteGuard>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/50">
        {/* Ultra Modern Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/10 to-transparent" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-48 translate-x-48" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-secondary/5 rounded-full blur-3xl translate-y-36 -translate-x-36" />
          
          <div className="relative container mx-auto px-4 py-12 md:py-20">
            <div className="max-w-4xl mx-auto text-center">
              {/* Icon with gradient background */}
              <div className="relative inline-flex items-center justify-center w-20 h-20 mb-8">
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-2xl blur-lg opacity-30" />
                <div className="relative bg-gradient-to-br from-primary to-secondary rounded-2xl p-4">
                  <Navigation className="h-8 w-8 text-white" />
                </div>
              </div>

              {/* Title and Description */}
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent mb-6">
                Discover Facilities
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground font-medium mb-8 max-w-2xl mx-auto">
                Explore all venue amenities and services with our interactive facility guide
              </p>

              {/* Stats */}
              <div className="flex flex-wrap justify-center gap-4 mb-12">
                <div className="bg-background/60 backdrop-blur-xl border rounded-2xl px-6 py-3 shadow-lg">
                  <div className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-primary" />
                    <span className="font-semibold">{facilities.length}</span>
                    <span className="text-muted-foreground">Facilities</span>
                  </div>
                </div>
                <div className="bg-background/60 backdrop-blur-xl border rounded-2xl px-6 py-3 shadow-lg">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    <span className="font-semibold">24/7</span>
                    <span className="text-muted-foreground">Available</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="container mx-auto px-4 pb-8">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search facilities, services, or locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-4 text-lg border-0 bg-background/80 backdrop-blur-xl shadow-lg rounded-2xl focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        </div>

        {/* Facilities Grid */}
        <div className="container mx-auto px-4 pb-12">
          {filteredFacilities.length === 0 ? (
            <div className="text-center py-16">
              <Building className="h-16 w-16 mx-auto text-muted-foreground/30 mb-6" />
              <h3 className="text-2xl font-semibold mb-2">No facilities found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? "Try adjusting your search terms." : "No facilities are currently available."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredFacilities.map((facility) => (
                <FacilityCard
                  key={facility.id}
                  facility={facility}
                  onClick={() => handleFacilityClick(facility)}
                  isSelected={selectedFacility?.id === facility.id}
                />
              ))}
            </div>
          )}
        </div>

        {/* Facility Detail Modal */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="space-y-4">
              <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                <FacilityIcon iconType={selectedFacility?.icon_type} className="h-6 w-6 text-primary" />
                {selectedFacility?.name}
              </DialogTitle>
            </DialogHeader>

            {selectedFacility && (
              <div className="space-y-6">
                {/* Image */}
                {selectedFacility.image_url && (
                  <div className="w-full h-64 rounded-xl overflow-hidden shadow-lg">
                    <img
                      src={selectedFacility.image_url}
                      alt={selectedFacility.name}
                      className="w-full h-full object-cover"
                      onLoad={() => console.log('Modal image loaded:', selectedFacility.image_url)}
                      onError={(e) => {
                        console.error('Modal image failed to load:', selectedFacility.image_url);
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}

                {/* Description */}
                {selectedFacility.description && (
                  <div>
                    <h4 className="font-semibold mb-2">About this facility</h4>
                    <p className="text-muted-foreground leading-relaxed">
                      {selectedFacility.description}
                    </p>
                  </div>
                )}

                {/* Location */}
                {selectedFacility?.location && (
                  <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-xl">
                    <MapPin
                      className="h-5 w-5 text-primary mt-0.5 cursor-pointer hover:text-primary/80 transition-colors"
                      onClick={() => handleModalLocationClick(selectedFacility.location)}
                      aria-label="Open in Google Maps"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium mb-1">Location</h4>
                      <p
                        className="text-muted-foreground cursor-pointer hover:text-primary transition-colors"
                        onClick={() => handleModalLocationClick(selectedFacility.location)}
                      >
                        {selectedFacility.location}
                      </p>
                    </div>
                  </div>
                )}

                {/* Contact Info */}
                {selectedFacility.contact_type && selectedFacility.contact_type !== "none" && selectedFacility.contact_info && (
                  <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-xl">
                    {ModalContactIcon && <ModalContactIcon className="h-5 w-5 text-primary mt-0.5" />}
                    <div className="flex-1">
                      <h4 className="font-medium mb-1">Contact Information</h4>
                      <div className="flex items-center gap-3">
                        <p className="text-muted-foreground">
                          {selectedFacility.contact_info}
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleModalContactClick(selectedFacility.contact_type, selectedFacility.contact_info)}
                          className="hover:bg-primary hover:text-primary-foreground"
                        >
                          {ModalContactIcon && <ModalContactIcon className="h-3 w-3 mr-1" />}
                          {selectedFacility.contact_type === "phone" ? "Call" : "Message"}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Rules */}
                {selectedFacility.rules && (
                  <div>
                    <h4 className="font-semibold mb-3">Rules & Guidelines</h4>
                    <div className="bg-muted/30 rounded-xl p-4 border-l-4 border-primary">
                      <p className="text-sm leading-relaxed">{selectedFacility.rules}</p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  {selectedFacility.contact_info && ModalContactIcon && (
                    <Button 
                      className="flex-1"
                      onClick={() => handleModalContactClick(selectedFacility.contact_type, selectedFacility.contact_info)}
                    >
                      <ModalContactIcon className="h-4 w-4 mr-2" />
                      {selectedFacility.contact_type === "phone" ? "Call Now" : "Message on WhatsApp"}
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AttendeeRouteGuard>
  );
};

export default AttendeeMap;