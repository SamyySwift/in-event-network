
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Ticket, Calendar, MapPin, Clock, QrCode, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MyTicket {
  id: string;
  ticket_number: string;
  price: number;
  check_in_status: boolean;
  checked_in_at?: string;
  purchase_date: string;
  qr_code_data: string;
  ticket_types: {
    name: string;
    description?: string;
  };
  events: {
    name: string;
    description?: string;
    start_time: string;
    end_time: string;
    location?: string;
    banner_url?: string;
  };
}

export default function AttendeeMyTickets() {
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['my-tickets', currentUser?.id],
    queryFn: async (): Promise<MyTicket[]> => {
      if (!currentUser?.id) return [];

      const { data, error } = await supabase
        .from('event_tickets')
        .select(`
          *,
          ticket_types (
            name,
            description
          ),
          events (
            name,
            description,
            start_time,
            end_time,
            location,
            banner_url
          )
        `)
        .eq('user_id', currentUser.id)
        .order('purchase_date', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!currentUser?.id,
  });

  const showQRCode = (qrData: string) => {
    // Simple QR code display - you could integrate with a QR library here
    toast({
      title: "QR Code",
      description: "QR Code functionality would be implemented here",
    });
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold">My Tickets</h1>
          <p className="text-muted-foreground mt-2">
            View and manage your purchased event tickets
          </p>
        </div>

        {/* Tickets Grid */}
        {tickets.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Ticket className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Tickets Yet</h3>
              <p className="text-muted-foreground mb-6">
                You haven't purchased any tickets yet. Browse events to get started!
              </p>
              <Button onClick={() => window.location.href = '/'}>
                Browse Events
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tickets.map((ticket) => (
              <Card key={ticket.id} className="overflow-hidden">
                {ticket.events.banner_url && (
                  <div className="h-32 overflow-hidden">
                    <img 
                      src={ticket.events.banner_url} 
                      alt={ticket.events.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{ticket.events.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {ticket.ticket_types.name}
                      </p>
                    </div>
                    <Badge variant={ticket.check_in_status ? "default" : "secondary"}>
                      {ticket.check_in_status ? "Checked In" : "Not Checked In"}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Event Details */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(ticket.events.start_time).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>
                        {new Date(ticket.events.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                        {new Date(ticket.events.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {ticket.events.location && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{ticket.events.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Ticket Info */}
                  <div className="border-t pt-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Ticket #:</span>
                      <span className="font-mono">{ticket.ticket_number}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Price:</span>
                      <span className="font-semibold">₦{ticket.price.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Purchased:</span>
                      <span>{new Date(ticket.purchase_date).toLocaleDateString()}</span>
                    </div>
                    {ticket.check_in_status && ticket.checked_in_at && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Checked in:</span>
                        <span className="text-green-600 flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          {new Date(ticket.checked_in_at).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="border-t pt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => showQRCode(ticket.qr_code_data)}
                      className="w-full"
                    >
                      <QrCode className="h-4 w-4 mr-2" />
                      Show QR Code
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
