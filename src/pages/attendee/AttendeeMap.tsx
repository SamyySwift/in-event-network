
import React from 'react';
import { MapPin, Phone, Clock, Info, Navigation } from 'lucide-react';
import AppLayout from '@/components/layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useFacilities } from '@/hooks/useFacilities';
import EventAccessGuard from '@/components/EventAccessGuard';
import { useEventParticipation } from '@/hooks/useEventParticipation';

const AttendeeMap = () => {
  const { facilities, isLoading } = useFacilities();
  const { getJoinedEvents, loading: participationLoading } = useEventParticipation();

  const getIconForType = (iconType: string) => {
    switch (iconType) {
      case 'restroom':
        return '🚻';
      case 'food':
        return '🍽️';
      case 'parking':
        return '🅿️';
      case 'emergency':
        return '🚨';
      case 'info':
        return 'ℹ️';
      case 'wifi':
        return '📶';
      default:
        return '🏢';
    }
  };

  const getContactIcon = (contactType: string) => {
    switch (contactType) {
      case 'phone':
        return <Phone className="h-4 w-4" />;
      case 'email':
        return <Info className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const hasEventAccess = getJoinedEvents().length > 0;

  if (isLoading || participationLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <EventAccessGuard hasAccess={hasEventAccess} loading={participationLoading}>
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
              <MapPin className="h-8 w-8 mr-3" />
              Event Map
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Explore the event venue and find key locations.
            </p>
          </div>

          {facilities.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No Facilities Listed
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  We don't have any facilities listed for this event yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {facilities.map((facility) => (
                <Card key={facility.id} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl text-gray-900 dark:text-white flex items-center gap-2">
                          {getIconForType(facility.icon_type || 'building')}
                          {facility.name}
                        </CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-400">
                          {facility.description}
                        </CardDescription>
                      </div>
                      <Badge className="uppercase">{facility.icon_type || 'facility'}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="text-gray-700 dark:text-gray-300">
                    <div className="flex items-center mb-2">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{facility.location}</span>
                    </div>
                    {facility.contact_info && facility.contact_type === 'phone' && (
                      <div className="flex items-center mb-2">
                        {getContactIcon('phone')}
                        <span className="ml-1">{facility.contact_info}</span>
                      </div>
                    )}
                    {facility.contact_info && facility.contact_type === 'email' && (
                      <div className="flex items-center mb-2">
                        {getContactIcon('email')}
                        <span className="ml-1">{facility.contact_info}</span>
                      </div>
                    )}
                    {facility.rules && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rules & Information</h4>
                        <p className="text-sm">{facility.rules}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </EventAccessGuard>
    </AppLayout>
  );
};

export default AttendeeMap;
