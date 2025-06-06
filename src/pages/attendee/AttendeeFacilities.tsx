
import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  MapPin, 
  Phone, 
  MessageCircle, 
  Building, 
  Wifi, 
  Coffee, 
  Car, 
  Utensils, 
  Shield, 
  Heart, 
  Zap, 
  Home, 
  Users,
  Search,
  Info
} from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Facility {
  id: string;
  name: string;
  description?: string;
  location?: string;
  rules?: string;
  contact_type?: string;
  contact_info?: string;
  icon_type?: string;
  created_at: string;
}

const facilityIcons = {
  'building': Building,
  'wifi': Wifi,
  'coffee': Coffee,
  'car': Car,
  'utensils': Utensils,
  'shield': Shield,
  'heart': Heart,
  'zap': Zap,
  'home': Home,
  'users': Users,
};

const AttendeeFacilities = () => {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [filteredFacilities, setFilteredFacilities] = useState<Facility[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchFacilities();
    
    // Set up real-time subscription for facilities
    const channel = supabase
      .channel('facilities-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'facilities'
        },
        (payload) => {
          console.log('Real-time facility update:', payload);
          fetchFacilities();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    // Filter facilities based on search term
    if (searchTerm.trim() === '') {
      setFilteredFacilities(facilities);
    } else {
      const filtered = facilities.filter(facility =>
        facility.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        facility.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        facility.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredFacilities(filtered);
    }
  }, [facilities, searchTerm]);

  const fetchFacilities = async () => {
    try {
      const { data, error } = await supabase
        .from('facilities')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFacilities(data || []);
    } catch (error) {
      console.error('Error fetching facilities:', error);
      toast({
        title: "Error",
        description: "Failed to fetch facilities",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getFacilityIcon = (iconType?: string) => {
    const IconComponent = facilityIcons[iconType as keyof typeof facilityIcons] || Building;
    return <IconComponent className="h-6 w-6 text-primary" />;
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

  const handleContactClick = (facility: Facility) => {
    if (facility.contact_type === 'phone' && facility.contact_info) {
      window.location.href = `tel:${facility.contact_info}`;
    } else if (facility.contact_type === 'whatsapp' && facility.contact_info) {
      window.open(`https://wa.me/${facility.contact_info.replace(/\D/g, '')}`, '_blank');
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading facilities...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Facilities</h1>
          <p className="text-muted-foreground mt-2">
            Discover available facilities and services at the event venue.
          </p>
        </div>

        {/* Search Bar */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search facilities by name, description, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Facilities Grid */}
        {filteredFacilities.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{searchTerm ? 'No facilities found matching your search.' : 'No facilities available at the moment.'}</p>
              {searchTerm && (
                <Button 
                  variant="link" 
                  onClick={() => setSearchTerm('')}
                  className="mt-2"
                >
                  Clear search
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFacilities.map(facility => (
              <Card key={facility.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getFacilityIcon(facility.icon_type)}
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-lg truncate">{facility.name}</CardTitle>
                        {facility.location && (
                          <div className="flex items-center gap-1 mt-1">
                            <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                            <CardDescription className="truncate text-xs">
                              {facility.location}
                            </CardDescription>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {facility.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {facility.description}
                    </p>
                  )}

                  {facility.rules && (
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Info className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Rules & Guidelines</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {facility.rules}
                      </p>
                    </div>
                  )}

                  {facility.contact_type !== 'none' && facility.contact_info && (
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-2 text-sm">
                        {getContactIcon(facility.contact_type)}
                        <span className="text-muted-foreground capitalize">
                          {facility.contact_type}:
                        </span>
                        <span className="font-medium">{facility.contact_info}</span>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleContactClick(facility)}
                        className="ml-2"
                      >
                        Contact
                      </Button>
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground pt-2 border-t">
                    Added {format(new Date(facility.created_at), 'MMM d, yyyy')}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default AttendeeFacilities;
