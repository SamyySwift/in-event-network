import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Phone, MessageCircle, ExternalLink, Building } from "lucide-react";
import { useAttendeeFacilities } from "@/hooks/useAttendeeFacilities";
import { useAttendeeEventContext } from "@/contexts/AttendeeEventContext";
import FacilityIcon from "@/pages/admin/components/FacilityIcon";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import AttendeeRouteGuard from "@/components/attendee/AttendeeRouteGuard";

const AttendeeFacilitiesContent = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { facilities, isLoading, error } = useAttendeeFacilities();
  const { hasJoinedEvent, isLoading: contextLoading } = useAttendeeEventContext();

  // Filter facilities based on search
  const filteredFacilities = facilities.filter((facility) =>
    [facility.name, facility.description, facility.location]
      .join(" ")
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  // Group facilities by type for better organization
  const groupedFacilities = filteredFacilities.reduce((groups, facility) => {
    const type = facility.icon_type || 'general';
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(facility);
    return groups;
  }, {} as Record<string, typeof facilities>);

  const handleContact = (facility: any) => {
    if (facility.contact_type === 'phone' && facility.contact_info) {
      window.location.href = `tel:${facility.contact_info}`;
    } else if (facility.contact_type === 'whatsapp' && facility.contact_info) {
      window.open(`https://wa.me/${facility.contact_info.replace(/\D/g, '')}`, '_blank');
    }
  };

  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Event Facilities</h1>
            <p className="text-muted-foreground mt-1">Explore facilities available at this event</p>
          </div>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load facilities. Please check your connection and try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Event Facilities</h1>
          <p className="text-muted-foreground mt-1">
            Explore facilities available at this event
          </p>
        </div>
      </div>

      {/* Information Card */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
            <Building className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Event Facilities Guide
            </h3>
            <p className="text-blue-700 dark:text-blue-200 text-sm leading-relaxed">
              Find all the facilities available at this event including exhibitor booths, restrooms, 
              registration desks, first aid stations, food courts, networking lounges, parking areas, 
              WiFi zones, and more. Click on contact options to get in touch with facility managers.
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search facilities..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading facilities...</p>
          </div>
        </div>
      )}

      {/* Facilities Grid */}
      {!isLoading && (
        <div className="space-y-8">
          {Object.keys(groupedFacilities).length > 0 ? (
            Object.entries(groupedFacilities).map(([type, typeFacilities]) => (
              <div key={type} className="space-y-4">
                <h2 className="text-xl font-semibold capitalize flex items-center gap-2">
                  <FacilityIcon iconType={type} className="w-5 h-5" />
                  {type === 'general' ? 'General Facilities' : type.replace(/-/g, ' ')}
                  <Badge variant="secondary">{typeFacilities.length}</Badge>
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {typeFacilities.map((facility) => (
                    <Card key={facility.id} className="hover:shadow-lg transition-all duration-200">
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                              <FacilityIcon iconType={facility.icon_type} className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-lg truncate">{facility.name}</CardTitle>
                              {facility.location && (
                                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                                  <MapPin className="w-3 h-3 flex-shrink-0" />
                                  <span className="truncate">{facility.location}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        {/* Facility Image */}
                        {facility.image_url && (
                          <div className="w-full h-32 rounded-lg overflow-hidden bg-muted">
                            <img
                              src={facility.image_url}
                              alt={facility.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          </div>
                        )}

                        {/* Description */}
                        {facility.description && (
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {facility.description}
                          </p>
                        )}

                        {/* Rules */}
                        {facility.rules && (
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium">Rules & Guidelines:</h4>
                            <p className="text-xs text-muted-foreground leading-relaxed bg-muted/50 p-2 rounded">
                              {facility.rules}
                            </p>
                          </div>
                        )}

                        {/* Contact Information */}
                        {facility.contact_type && facility.contact_type !== 'none' && facility.contact_info && (
                          <div className="pt-2 border-t">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Contact:</span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleContact(facility)}
                                className="h-8"
                              >
                                {facility.contact_type === 'phone' ? (
                                  <>
                                    <Phone className="w-3 h-3 mr-1" />
                                    Call
                                  </>
                                ) : (
                                  <>
                                    <MessageCircle className="w-3 h-3 mr-1" />
                                    WhatsApp
                                  </>
                                )}
                              </Button>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {facility.contact_info}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <Building className="mx-auto h-12 w-12 text-muted-foreground opacity-30" />
              <h3 className="mt-4 text-lg font-medium">No facilities found</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {searchQuery 
                  ? 'No facilities match your search criteria.' 
                  : 'No facilities have been set up for this event yet.'
                }
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const AttendeeFacilities = () => {
  return (
    <AttendeeRouteGuard>
      <AttendeeFacilitiesContent />
    </AttendeeRouteGuard>
  );
};

export default AttendeeFacilities;