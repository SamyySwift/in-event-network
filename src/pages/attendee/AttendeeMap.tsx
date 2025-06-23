
import React, { useState } from 'react';
import { MapPin, Search, Info, Phone, Compass, Coffee, Home, Utensils, HeartPulse, Bath, Car, CircleHelp, Clock, Building, Wifi, Users, Camera, Music, Tv, Gamepad2, Heart, ShoppingBag, Bed, MessageCircle } from 'lucide-react';
import AppLayout from '@/components/layouts/AppLayout';
import AttendeeRouteGuard from '@/components/attendee/AttendeeRouteGuard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useAttendeeFacilities } from '@/hooks/useAttendeeFacilities';

// Icon mapping for facility types
const facilityIcons = {
  'building': Building,
  'wifi': Wifi,
  'parking': Car,
  'coffee': Coffee,
  'restaurant': Utensils,
  'conference': Users,
  'photography': Camera,
  'music': Music,
  'entertainment': Tv,
  'gaming': Gamepad2,
  'health': HeartPulse,
  'shopping': ShoppingBag,
  'restroom': Bath,
  'accommodation': Bed,
};

// Facility type colors for badges
const facilityTypeColors: Record<string, string> = {
  restroom: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  coffee: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  restaurant: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  building: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  parking: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  wifi: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  conference: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
  photography: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  music: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  entertainment: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  gaming: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  health: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  shopping: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  accommodation: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  other: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
};

// Facility type labels
const facilityTypeLabels: Record<string, string> = {
  restroom: 'Restroom',
  coffee: 'Coffee',
  restaurant: 'Restaurant',
  building: 'Building',
  parking: 'Parking',
  wifi: 'WiFi',
  conference: 'Conference',
  photography: 'Photography',
  music: 'Music',
  entertainment: 'Entertainment',
  gaming: 'Gaming',
  health: 'Health',
  shopping: 'Shopping',
  accommodation: 'Accommodation',
  other: 'Other'
};

const AttendeeMap = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedFacility, setSelectedFacility] = useState<any>(null);
  
  const { facilities, isLoading, error } = useAttendeeFacilities();
  
  // Filter facilities based on search and type filter
  const filteredFacilities = facilities.filter(facility => {
    const matchesSearch = 
      facility.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      facility.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      facility.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = !selectedType || facility.icon_type === selectedType;
    
    return matchesSearch && matchesType;
  });
  
  // Get unique facility types from actual data
  const facilityTypes = Array.from(new Set(facilities.map(f => f.icon_type).filter(Boolean)));

  const getFacilityIcon = (iconType?: string) => {
    const IconComponent = facilityIcons[iconType as keyof typeof facilityIcons] || Building;
    return <IconComponent size={20} />;
  };

  const getContactIcon = (contactType?: string) => {
    switch (contactType) {
      case 'phone':
        return <Phone className="h-4 w-4" />;
      case 'whatsapp':
        return <MessageCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <AttendeeRouteGuard>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading facilities...</p>
            </div>
          </div>
        </AttendeeRouteGuard>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <AttendeeRouteGuard>
          <div className="animate-fade-in max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Find Your Way</h1>
                <p className="text-gray-600 dark:text-gray-400">Locate facilities and services around the venue</p>
              </div>
            </div>
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <CircleHelp className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Unable to load facilities</h3>
                  <p className="text-gray-500">Please try again later or contact support if the problem persists.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </AttendeeRouteGuard>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <AttendeeRouteGuard>
        <div className="animate-fade-in max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Find Your Way</h1>
              <p className="text-gray-600 dark:text-gray-400">Locate facilities and services around the venue</p>
            </div>
            <Button
              variant="outline"
              onClick={() => alert('Downloading venue map...')} 
              className="flex items-center gap-2"
            >
              <Compass className="h-4 w-4" />
              <span className="hidden sm:inline">Download Map</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sidebar with search and filtering */}
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl flex items-center">
                    <Search className="mr-2 h-5 w-5 text-connect-600 dark:text-connect-400" />
                    Find Facilities
                  </CardTitle>
                  <CardDescription>
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
                      className="pl-10"
                    />
                  </div>
                  
                  {/* Facility type filters */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Filter by Type:</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        className={`cursor-pointer ${!selectedType ? 'bg-connect-100 text-connect-800 dark:bg-connect-900 dark:text-connect-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'}`}
                        onClick={() => setSelectedType(null)}
                      >
                        All
                      </Badge>
                      {facilityTypes.map(type => (
                        <Badge
                          key={type}
                          className={`cursor-pointer ${selectedType === type ? (facilityTypeColors[type] || facilityTypeColors.other) : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'}`}
                          onClick={() => setSelectedType(type)}
                        >
                          {facilityTypeLabels[type] || type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {/* Facilities list */}
                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                    {filteredFacilities.length > 0 ? (
                      filteredFacilities.map((facility) => (
                        <div
                          key={facility.id}
                          className={`p-3 rounded-lg cursor-pointer transition-colors ${
                            selectedFacility?.id === facility.id
                              ? 'bg-connect-50 dark:bg-connect-900/30 border-l-4 border-connect-500'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-800 border-l-4 border-transparent'
                          }`}
                          onClick={() => setSelectedFacility(facility)}
                        >
                          <div className="flex items-start gap-3">
                            {facility.image_url ? (
                              <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                                <img 
                                  src={facility.image_url} 
                                  alt={facility.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className={`p-2 rounded-full ${(facilityTypeColors[facility.icon_type] || facilityTypeColors.other).split(' ')[0]} ${(facilityTypeColors[facility.icon_type] || facilityTypeColors.other).split(' ')[1]}`}>
                                {getFacilityIcon(facility.icon_type)}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-gray-900 dark:text-white truncate">{facility.name}</h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{facility.location}</p>
                              <Badge
                                className={`mt-1 text-xs ${facilityTypeColors[facility.icon_type] || facilityTypeColors.other}`}
                              >
                                {facilityTypeLabels[facility.icon_type] || facility.icon_type}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <CircleHelp className="h-10 w-10 mx-auto text-gray-400" />
                        <h3 className="mt-2 font-medium">No facilities found</h3>
                        <p className="text-sm text-gray-500 mt-1">Try another search term or filter</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Map and facility details */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="map" className="space-y-4">
                <TabsList className="grid grid-cols-2">
                  <TabsTrigger value="map">Interactive Map</TabsTrigger>
                  <TabsTrigger value="list">List View</TabsTrigger>
                </TabsList>
                
                <TabsContent value="map" className="space-y-4">
                  <div className="relative aspect-[16/10] rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                    {/* Placeholder for an interactive map - in a real app, a Map component would go here */}
                    <div className="text-center">
                      <MapPin className="h-12 w-12 text-connect-500 mx-auto" />
                      <p className="mt-2">Interactive venue map would be displayed here</p>
                      <p className="text-sm text-gray-500 mt-1">With clickable facility locations</p>
                    </div>
                    
                    {/* Example pins that would be displayed on the map */}
                    <div className="absolute top-1/4 left-1/4 text-connect-600">
                      <MapPin className="h-5 w-5 hover:text-connect-800 cursor-pointer" />
                    </div>
                    <div className="absolute top-1/3 right-1/4 text-green-600">
                      <MapPin className="h-5 w-5 hover:text-green-800 cursor-pointer" />
                    </div>
                    <div className="absolute bottom-1/4 left-1/3 text-blue-600">
                      <MapPin className="h-5 w-5 hover:text-blue-800 cursor-pointer" />
                    </div>
                  </div>
                  
                  {/* Selected facility details */}
                  {selectedFacility && (
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <CardTitle className="text-xl">{selectedFacility.name}</CardTitle>
                            <CardDescription>
                              <Badge
                                className={`mt-1 ${facilityTypeColors[selectedFacility.icon_type] || facilityTypeColors.other}`}
                              >
                                {facilityTypeLabels[selectedFacility.icon_type] || selectedFacility.icon_type}
                              </Badge>
                            </CardDescription>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => alert(`Directions to ${selectedFacility.name}`)}
                            className="flex items-center gap-1"
                          >
                            <Compass className="h-4 w-4" />
                            Directions
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {selectedFacility.image_url && (
                          <div className="w-full h-48 rounded-lg overflow-hidden">
                            <img 
                              src={selectedFacility.image_url} 
                              alt={selectedFacility.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="space-y-2">
                          {selectedFacility.location && (
                            <div className="flex items-start gap-2">
                              <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                              <p>{selectedFacility.location}</p>
                            </div>
                          )}
                          {selectedFacility.description && (
                            <div className="flex items-start gap-2">
                              <Info className="h-4 w-4 text-gray-500 mt-1" />
                              <p>{selectedFacility.description}</p>
                            </div>
                          )}
                          {selectedFacility.contact_info && selectedFacility.contact_type !== 'none' && (
                            <div className="flex items-start gap-2">
                              {getContactIcon(selectedFacility.contact_type)}
                              <p>{selectedFacility.contact_info}</p>
                            </div>
                          )}
                          {selectedFacility.rules && (
                            <div className="flex items-start gap-2">
                              <Info className="h-4 w-4 text-gray-500 mt-1" />
                              <div>
                                <p className="font-medium">Rules:</p>
                                <p className="text-sm mt-1">{selectedFacility.rules}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
                
                <TabsContent value="list">
                  <Card>
                    <CardHeader>
                      <CardTitle>All Facilities ({facilities.length})</CardTitle>
                      <CardDescription>Comprehensive list of all venue facilities</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {facilities.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No facilities available at the moment.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {Object.keys(facilityTypeLabels).map(type => {
                            const typeFacilities = facilities.filter(f => f.icon_type === type);
                            if (typeFacilities.length === 0) return null;
                            
                            return (
                              <div key={type} className="mb-6">
                                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                  {facilityTypeLabels[type]}
                                  <Badge className={facilityTypeColors[type] || facilityTypeColors.other}>
                                    {typeFacilities.length}
                                  </Badge>
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {typeFacilities.map(facility => (
                                    <div 
                                      key={facility.id}
                                      className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                    >
                                      <div className="flex items-start gap-3 mb-3">
                                        {facility.image_url ? (
                                          <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                            <img 
                                              src={facility.image_url} 
                                              alt={facility.name}
                                              className="w-full h-full object-cover"
                                            />
                                          </div>
                                        ) : (
                                          <div className={`p-3 rounded-full ${(facilityTypeColors[facility.icon_type] || facilityTypeColors.other).split(' ')[0]} ${(facilityTypeColors[facility.icon_type] || facilityTypeColors.other).split(' ')[1]}`}>
                                            {getFacilityIcon(facility.icon_type)}
                                          </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                          <h4 className="font-medium text-lg">{facility.name}</h4>
                                          <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {facility.location}
                                          </p>
                                        </div>
                                      </div>
                                      {(facility.contact_info || facility.description) && (
                                        <>
                                          <Separator className="my-3" />
                                          <div className="text-sm space-y-2">
                                            {facility.description && (
                                              <p className="text-gray-600 dark:text-gray-300">
                                                {facility.description}
                                              </p>
                                            )}
                                            {facility.contact_info && facility.contact_type !== 'none' && (
                                              <p className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                                {getContactIcon(facility.contact_type)}
                                                {facility.contact_info}
                                              </p>
                                            )}
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </AttendeeRouteGuard>
    </AppLayout>
  );
};

export default AttendeeMap;
