import React, { useState } from 'react';
import { MapPin, Search, Info, Phone, Compass, Coffee, Home, Utensils, HeartPulse, Bath, Car, CircleHelp, Clock } from 'lucide-react';
import AppLayout from '@/components/layouts/AppLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

// Mock data for facilities
const facilities = [
  {
    id: '1',
    name: 'Main Restrooms',
    type: 'restroom',
    location: 'West Wing, First Floor',
    description: 'Main restrooms with accessibility features',
    icon: <Bath size={20} />
  },
  {
    id: '2',
    name: 'Coffee Shop',
    type: 'food',
    location: 'North Wing, Ground Floor',
    description: 'Coffee, tea, and light refreshments',
    contactInfo: '+1 (555) 123-4567',
    icon: <Coffee size={20} />
  },
  {
    id: '3',
    name: 'Main Entrance',
    type: 'entry',
    location: 'South Side of the Building',
    description: 'Badge check required for re-entry',
    icon: <Home size={20} />
  },
  {
    id: '4',
    name: 'Event Cafeteria',
    type: 'food',
    location: 'East Wing, First Floor',
    description: 'Full meals and refreshments available',
    hours: '7:00 AM - 8:00 PM',
    contactInfo: '+1 (555) 987-6543',
    icon: <Utensils size={20} />
  },
  {
    id: '5',
    name: 'First Aid Station',
    type: 'emergency',
    location: 'Central Hall, First Floor',
    description: 'Staffed during all event hours',
    contactInfo: '+1 (555) 911-0000',
    icon: <HeartPulse size={20} />
  },
  {
    id: '6',
    name: 'Parking Garage',
    type: 'parking',
    location: 'Adjacent to Main Building',
    description: 'Validated parking available at information desk',
    icon: <Car size={20} />
  },
  {
    id: '7',
    name: 'Information Desk',
    type: 'assistance',
    location: 'Main Lobby',
    description: 'General assistance and lost & found',
    contactInfo: '+1 (555) 333-4444',
    icon: <Info size={20} />
  },
  {
    id: '8',
    name: 'Executive Restrooms',
    type: 'restroom',
    location: 'VIP Area, Second Floor',
    description: 'For VIP badge holders only',
    icon: <Bath size={20} />
  }
];

// Facility type colors for badges
const facilityTypeColors: Record<string, string> = {
  restroom: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  food: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  entry: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  exit: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  emergency: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  parking: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  assistance: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
  other: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
};

// Facility type labels
const facilityTypeLabels: Record<string, string> = {
  restroom: 'Restroom',
  food: 'Food & Drinks',
  entry: 'Entrance',
  exit: 'Exit',
  emergency: 'Emergency',
  parking: 'Parking',
  assistance: 'Assistance',
  other: 'Other'
};

const AttendeeMap = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedFacility, setSelectedFacility] = useState<typeof facilities[0] | null>(null);
  
  // Filter facilities based on search and type filter
  const filteredFacilities = facilities.filter(facility => {
    const matchesSearch = 
      facility.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      facility.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      facility.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = !selectedType || facility.type === selectedType;
    
    return matchesSearch && matchesType;
  });
  
  // Get unique facility types
  const facilityTypes = Array.from(new Set(facilities.map(f => f.type)));

  return (
    <AppLayout>
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
                        className={`cursor-pointer ${selectedType === type ? facilityTypeColors[type] : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'}`}
                        onClick={() => setSelectedType(type)}
                      >
                        {facilityTypeLabels[type]}
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
                          <div className={`p-2 rounded-full ${facilityTypeColors[facility.type].split(' ')[0]} ${facilityTypeColors[facility.type].split(' ')[1]}`}>
                            {facility.icon}
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">{facility.name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{facility.location}</p>
                            <Badge
                              className={`mt-1 text-xs ${facilityTypeColors[facility.type]}`}
                            >
                              {facilityTypeLabels[facility.type]}
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
                        <div>
                          <CardTitle className="text-xl">{selectedFacility.name}</CardTitle>
                          <CardDescription>
                            <Badge
                              className={`mt-1 ${facilityTypeColors[selectedFacility.type]}`}
                            >
                              {facilityTypeLabels[selectedFacility.type]}
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
                    <CardContent className="space-y-2">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                        <p>{selectedFacility.location}</p>
                      </div>
                      {selectedFacility.description && (
                        <div className="flex items-start gap-2">
                          <Info className="h-4 w-4 text-gray-500 mt-1" />
                          <p>{selectedFacility.description}</p>
                        </div>
                      )}
                      {selectedFacility.contactInfo && (
                        <div className="flex items-start gap-2">
                          <Phone className="h-4 w-4 text-gray-500 mt-1" />
                          <p>{selectedFacility.contactInfo}</p>
                        </div>
                      )}
                      {selectedFacility.hours && (
                        <div className="flex items-start gap-2">
                          <Clock className="h-4 w-4 text-gray-500 mt-1" />
                          <p>{selectedFacility.hours}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              <TabsContent value="list">
                <Card>
                  <CardHeader>
                    <CardTitle>All Facilities</CardTitle>
                    <CardDescription>Comprehensive list of all venue facilities</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.keys(facilityTypeLabels).map(type => {
                        const typeFacilities = facilities.filter(f => f.type === type);
                        if (typeFacilities.length === 0) return null;
                        
                        return (
                          <div key={type} className="mb-6">
                            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                              {facilityTypeLabels[type]}
                              <Badge className={facilityTypeColors[type]}>
                                {typeFacilities.length}
                              </Badge>
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {typeFacilities.map(facility => (
                                <div 
                                  key={facility.id}
                                  className="border rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-800"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-full ${facilityTypeColors[facility.type].split(' ')[0]} ${facilityTypeColors[facility.type].split(' ')[1]}`}>
                                      {facility.icon}
                                    </div>
                                    <div>
                                      <h4 className="font-medium">{facility.name}</h4>
                                      <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {facility.location}
                                      </p>
                                    </div>
                                  </div>
                                  {(facility.contactInfo || facility.hours) && (
                                    <>
                                      <Separator className="my-2" />
                                      <div className="text-sm">
                                        {facility.contactInfo && (
                                          <p className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
                                            <Phone className="h-3 w-3" />
                                            {facility.contactInfo}
                                          </p>
                                        )}
                                        {facility.hours && (
                                          <p className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
                                            <Clock className="h-3 w-3" />
                                            {facility.hours}
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
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default AttendeeMap;
