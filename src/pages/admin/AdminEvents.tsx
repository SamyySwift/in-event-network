
import React, { useState } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Users, Plus, QrCode, CreditCard } from 'lucide-react';
import { useAdminEvents } from '@/hooks/useAdminEvents';
import { useAuth } from '@/contexts/AuthContext';
import { formatDate } from '@/lib/utils';
import RegistrationQRCodeCard from './components/RegistrationQRCodeCard';
import { usePayment } from '@/hooks/usePayment';

const AdminEvents = () => {
  const { currentUser } = useAuth();
  const { adminEvents, isLoading } = useAdminEvents();
  const [showQRCode, setShowQRCode] = useState<{ [key: string]: boolean }>({});
  const { checkPaymentStatus } = usePayment();

  const toggleQRCode = async (eventId: string) => {
    setShowQRCode(prev => ({
      ...prev,
      [eventId]: !prev[eventId]
    }));
  };

  const getPaymentStatus = async (eventId: string) => {
    if (!currentUser?.id) return null;
    return await checkPaymentStatus(eventId, currentUser.id);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Events</h1>
            <p className="text-muted-foreground">
              Manage and monitor your events
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Button>
        </div>

        {adminEvents.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No events yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Create your first event to get started with managing attendees and content.
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Event
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adminEvents.map((event) => (
              <Card key={event.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{event.name}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {event.description}
                      </CardDescription>
                    </div>
                    <Badge variant={event.status === 'active' ? 'default' : 'secondary'}>
                      {event.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(event.start_date)}</span>
                    </div>
                    {event.end_date && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>Ends {formatDate(event.end_date)}</span>
                      </div>
                    )}
                    {event.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{event.attendee_count || 0} attendees</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleQRCode(event.id)}
                      className="flex-1"
                    >
                      <QrCode className="h-4 w-4 mr-2" />
                      {showQRCode[event.id] ? 'Hide QR' : 'Show QR'}
                    </Button>
                  </div>

                  {showQRCode[event.id] && (
                    <div className="mt-4">
                      <RegistrationQRCodeCard
                        accessKey={event.access_key}
                        isLoading={false}
                        eventId={event.id}
                        eventName={event.name}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminEvents;
