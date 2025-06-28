import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  const [ticketUrl, setTicketUrl] = useState('');
  const [selectedTickets, setSelectedTickets] = useState<Record<string, number>>({});
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [userInfo, setUserInfo] = useState({
    fullName: '',
    email: currentUser?.email || '',
    phone: ''
  });
  const [showUserInfoForm, setShowUserInfoForm] = useState(false);

  // Check for pending ticketing URL on component mount
  useEffect(() => {
    const pendingUrl = localStorage.getItem('pendingTicketingUrl');
    if (pendingUrl) {
      setTicketUrl(pendingUrl);
      localStorage.removeItem('pendingTicketingUrl');
      
      // Automatically show the purchase form
      const key = extractEventKey(pendingUrl);
      if (key) {
        setShowPurchaseForm(true);
      }
    }
  }, []);

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
  const purchaseTickets = useMutation({
    mutationFn: async () => {
      if (!currentUser?.id || !eventData) {
        throw new Error('User or event data not available');
      }

      // Validate user information
      if (!userInfo.fullName.trim() || !userInfo.email.trim() || !userInfo.phone.trim()) {
        throw new Error('Please provide your full name, email, and phone number before purchasing.');
      }

      const ticketPurchases = [];
      
      for (const [ticketTypeId, quantity] of Object.entries(selectedTickets)) {
        if (quantity > 0) {
          const ticketType = eventData.ticketTypes.find(t => t.id === ticketTypeId);
          if (!ticketType) continue;

          for (let i = 0; i < quantity; i++) {
            const ticketNumber = `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            ticketPurchases.push({
              ticket_number: ticketNumber,
              user_id: currentUser.id,
              ticket_type_id: ticketTypeId,
              event_id: eventData.event.id,
              price: ticketType.price,
              guest_name: userInfo.fullName,
              guest_email: userInfo.email,
              guest_phone: userInfo.phone,
              qr_code_data: JSON.stringify({
                ticketNumber,
                eventId: eventData.event.id,
                userId: currentUser.id,
                ticketTypeId
              })
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
      setShowUserInfoForm(false);
      queryClient.invalidateQueries({ queryKey: ['my-tickets'] });
    },
    onError: (error: any) => {
      if (error.message.includes('full name, email, and phone')) {
        setShowUserInfoForm(true);
      }
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

  const handlePurchase = () => {
    // Check if user info is complete
    if (!userInfo.fullName.trim() || !userInfo.email.trim() || !userInfo.phone.trim()) {
      setShowUserInfoForm(true);
      return;
    }
    
    purchaseTickets.mutate();
  };

  const showQRCode = (qrData: string) => {
    toast({
      title: "QR Code",
      description: "QR Code functionality would be implemented here",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">My Tickets</h1>
          
          {/* User Information Form Modal */}
          {showUserInfoForm && (
            <Card className="mb-6 border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="text-orange-800">Complete Your Information</CardTitle>
                <CardDescription className="text-orange-600">
                  Please provide your information before purchasing tickets.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={userInfo.fullName}
                    onChange={(e) => setUserInfo(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={userInfo.email}
                    onChange={(e) => setUserInfo(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={userInfo.phone}
                    onChange={(e) => setUserInfo(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter your phone number"
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => {
                      if (userInfo.fullName.trim() && userInfo.email.trim() && userInfo.phone.trim()) {
                        setShowUserInfoForm(false);
                        purchaseTickets.mutate();
                      } else {
                        toast({
                          title: "Information Required",
                          description: "Please fill in all required fields.",
                          variant: "destructive"
                        });
                      }
                    }}
                    disabled={purchaseTickets.isPending}
                  >
                    Continue with Purchase
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowUserInfoForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Ticket URL Input Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Purchase New Tickets
              </CardTitle>
              <CardDescription>
                Enter a ticket purchase URL to buy tickets for an event
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Paste ticket purchase URL here..."
                  value={ticketUrl}
                  onChange={(e) => setTicketUrl(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleUrlSubmit} disabled={!ticketUrl.trim()}>
                  Load Tickets
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Purchase Form */}
          {showPurchaseForm && eventData && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>{eventData.event.name}</CardTitle>
                <CardDescription>
                  {eventData.event.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Event Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">
                      {formatDate(eventData.event.start_time)}
                    </span>
                  </div>
                  {eventData.event.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{eventData.event.location}</span>
                    </div>
                  )}
                </div>

                {/* Ticket Types */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Available Tickets</h3>
                  {eventData.ticketTypes.map((ticket) => (
                    <div key={ticket.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">{ticket.name}</h4>
                          {ticket.description && (
                            <p className="text-sm text-gray-600">{ticket.description}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">₦{ticket.price.toLocaleString()}</div>
                          <div className="text-sm text-gray-500">
                            {ticket.available_quantity} available
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`quantity-${ticket.id}`}>Quantity:</Label>
                        <Input
                          id={`quantity-${ticket.id}`}
                          type="number"
                          min="0"
                          max={ticket.available_quantity}
                          value={selectedTickets[ticket.id] || 0}
                          onChange={(e) => handleQuantityChange(ticket.id, parseInt(e.target.value) || 0)}
                          className="w-20"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Purchase Summary */}
                {getTotalTickets() > 0 && (
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-semibold">Total: {getTotalTickets()} ticket(s)</span>
                      <span className="font-bold text-lg">₦{getTotalPrice().toLocaleString()}</span>
                    </div>
                    <Button 
                      onClick={handlePurchase}
                      disabled={purchaseTickets.isPending}
                      className="w-full"
                    >
                      {purchaseTickets.isPending ? 'Processing...' : 'Purchase Tickets'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* My Existing Tickets */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ticket className="h-5 w-5" />
                My Tickets ({tickets.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {ticketsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading tickets...</p>
                </div>
              ) : tickets.length === 0 ? (
                <div className="text-center py-8">
                  <Ticket className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No tickets found</p>
                  <p className="text-sm text-gray-500">Purchase tickets using the form above</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {tickets.map((ticket) => (
                    <div key={ticket.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold">{ticket.events.name}</h3>
                          <p className="text-sm text-gray-600">{ticket.ticket_types.name}</p>
                          <p className="text-xs text-gray-500">#{ticket.ticket_number}</p>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">₦{ticket.price.toLocaleString()}</div>
                          <Badge variant={ticket.check_in_status ? "default" : "secondary"}>
                            {ticket.check_in_status ? "Checked In" : "Not Checked In"}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(ticket.events.start_time)}
                        </div>
                        {ticket.events.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {ticket.events.location}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Purchased: {formatDate(ticket.purchase_date)}
                        </div>
                        {ticket.checked_in_at && (
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Checked in: {formatDate(ticket.checked_in_at)}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => showQRCode(ticket.qr_code_data)}
                        >
                          <QrCode className="h-4 w-4 mr-1" />
                          Show QR Code
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
