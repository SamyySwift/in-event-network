import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Ticket, Calendar, MapPin, Clock, QrCode, CheckCircle, Plus, ShoppingCart } from 'lucide-react';
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

interface TicketType {
  id: string;
  name: string;
  description?: string;
  price: number;
  available_quantity: number;
  is_active: boolean;
}

interface Event {
  id: string;
  name: string;
  description?: string;
  start_time: string;
  end_time: string;
  location?: string;
  banner_url?: string;
}

export default function AttendeeMyTickets() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [ticketUrl, setTicketUrl] = useState('');
  const [selectedTickets, setSelectedTickets] = useState<Record<string, number>>({});
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);

  // Check for event key from URL params (when redirected from BuyTickets)
  useEffect(() => {
    const eventKeyFromUrl = searchParams.get('eventKey');
    if (eventKeyFromUrl) {
      const generatedUrl = `${window.location.origin}/buy-tickets/${eventKeyFromUrl}`;
      setTicketUrl(generatedUrl);
      setShowPurchaseForm(true);
      // Clear the URL parameter
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  // Extract event key from URL
  const extractEventKey = (url: string) => {
    const match = url.match(/\/buy-tickets\/([^\/\?]+)/);
    return match ? match[1] : null;
  };

  const eventKey = extractEventKey(ticketUrl);

  // Fetch my existing tickets
  const { data: tickets = [], isLoading: ticketsLoading } = useQuery({
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

  // Fetch event and ticket types when URL is provided
  const { data: eventData, isLoading: eventLoading } = useQuery({
    queryKey: ['purchase-event', eventKey],
    queryFn: async () => {
      if (!eventKey) return null;

      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('event_key', eventKey)
        .single();

      if (eventError) throw eventError;

      const { data: ticketTypes, error: ticketError } = await supabase
        .from('ticket_types')
        .select('*')
        .eq('event_id', event.id)
        .eq('is_active', true)
        .gt('available_quantity', 0);

      if (ticketError) throw ticketError;

      return { event, ticketTypes };
    },
    enabled: !!eventKey,
  });

  // Purchase tickets mutation
  const purchaseTicketsMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser || !eventData) throw new Error('Missing required data');

      const ticketPurchases = [];
      
      for (const [ticketTypeId, quantity] of Object.entries(selectedTickets)) {
        if (quantity > 0) {
          const ticketType = eventData.ticketTypes.find(t => t.id === ticketTypeId);
          if (!ticketType) continue;

          for (let i = 0; i < quantity; i++) {
            ticketPurchases.push({
              event_id: eventData.event.id,
              ticket_type_id: ticketTypeId,
              user_id: currentUser.id,
              price: ticketType.price,
              qr_code_data: `${window.location.origin}/ticket-verify?ticket_number=`,
            });
          }
        }
      }

      const { data: tickets, error } = await supabase
        .from('event_tickets')
        .insert(ticketPurchases)
        .select();

      if (error) throw error;

      // Update available quantities
      for (const [ticketTypeId, quantity] of Object.entries(selectedTickets)) {
        if (quantity > 0) {
          const { data: currentTicketType } = await supabase
            .from('ticket_types')
            .select('available_quantity')
            .eq('id', ticketTypeId)
            .single();

          if (currentTicketType) {
            await supabase
              .from('ticket_types')
              .update({
                available_quantity: currentTicketType.available_quantity - quantity
              })
              .eq('id', ticketTypeId);
          }
        }
      }

      return tickets;
    },
    onSuccess: () => {
      toast({
        title: "Tickets Purchased Successfully!",
        description: `${getTotalTickets()} ticket(s) purchased successfully.`,
      });
      setSelectedTickets({});
      setTicketUrl('');
      setShowPurchaseForm(false);
      queryClient.invalidateQueries({ queryKey: ['my-tickets'] });
    },
    onError: (error: any) => {
      toast({
        title: "Purchase Failed",
        description: error.message || "Failed to purchase tickets",
        variant: "destructive",
      });
    },
  });

  const handleQuantityChange = (ticketTypeId: string, quantity: number) => {
    setSelectedTickets(prev => ({
      ...prev,
      [ticketTypeId]: Math.max(0, quantity)
    }));
  };

  const getTotalPrice = () => {
    if (!eventData?.ticketTypes) return 0;
    return eventData.ticketTypes.reduce((total, ticket) => {
      const quantity = selectedTickets[ticket.id] || 0;
      return total + (ticket.price * quantity);
    }, 0);
  };

  const getTotalTickets = () => {
    return Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0);
  };

  const handleUrlSubmit = () => {
    if (!ticketUrl.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a valid ticket purchase URL",
        variant: "destructive",
      });
      return;
    }

    const key = extractEventKey(ticketUrl);
    if (!key) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid ticket purchase URL",
        variant: "destructive",
      });
      return;
    }

    setShowPurchaseForm(true);
  };

  const showQRCode = (qrData: string) => {
    toast({
      title: "QR Code",
      description: "QR Code functionality would be implemented here",
    });
  };

  if (ticketsLoading) {
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

        {/* Purchase New Tickets Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Purchase New Tickets
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ticket-url">Enter Ticket Purchase URL</Label>
              <div className="flex gap-2">
                <Input
                  id="ticket-url"
                  placeholder="https://yourapp.com/buy-tickets/123456"
                  value={ticketUrl}
                  onChange={(e) => setTicketUrl(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleUrlSubmit} disabled={!ticketUrl.trim()}>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Buy Tickets
                </Button>
              </div>
            </div>

            {/* Event Details and Ticket Selection */}
            {showPurchaseForm && eventData && (
              <div className="space-y-4 pt-4 border-t">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">{eventData.event.name}</h3>
                  {eventData.event.description && (
                    <p className="text-muted-foreground">{eventData.event.description}</p>
                  )}
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(eventData.event.start_time).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>
                        {new Date(eventData.event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                        {new Date(eventData.event.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {eventData.event.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{eventData.event.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Ticket Types */}
                <div className="space-y-3">
                  <h4 className="font-medium">Available Tickets</h4>
                  {eventData.ticketTypes.map((ticket) => (
                    <div key={ticket.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h5 className="font-medium">{ticket.name}</h5>
                        {ticket.description && (
                          <p className="text-sm text-muted-foreground">{ticket.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-semibold">₦{ticket.price.toLocaleString()}</span>
                          <Badge variant="outline">{ticket.available_quantity} available</Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityChange(ticket.id, (selectedTickets[ticket.id] || 0) - 1)}
                          disabled={!selectedTickets[ticket.id]}
                        >
                          -
                        </Button>
                        <span className="w-8 text-center">{selectedTickets[ticket.id] || 0}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityChange(ticket.id, (selectedTickets[ticket.id] || 0) + 1)}
                          disabled={(selectedTickets[ticket.id] || 0) >= ticket.available_quantity}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Purchase Summary */}
                {getTotalTickets() > 0 && (
                  <div className="space-y-3 p-4 bg-muted rounded-lg">
                    <div className="flex justify-between items-center">
                      <span>Total Tickets: {getTotalTickets()}</span>
                      <span className="font-semibold">₦{getTotalPrice().toLocaleString()}</span>
                    </div>
                    <Button
                      onClick={() => purchaseTicketsMutation.mutate()}
                      disabled={purchaseTicketsMutation.isPending}
                      className="w-full"
                    >
                      {purchaseTicketsMutation.isPending ? 'Processing...' : `Purchase ${getTotalTickets()} Ticket${getTotalTickets() !== 1 ? 's' : ''}`}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {eventLoading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            )}
          </CardContent>
        </Card>

        <Separator />

        {/* Existing Tickets */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Your Tickets</h2>
          
          {tickets.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Ticket className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Tickets Yet</h3>
                <p className="text-muted-foreground mb-6">
                  You haven't purchased any tickets yet. Use the form above to buy tickets!
                </p>
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
      </div>
    </AppLayout>
  );
}
