import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Ticket, Calendar, MapPin, Clock, LogIn } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

export default function BuyTickets() {
  const { eventKey } = useParams<{ eventKey: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedTickets, setSelectedTickets] = useState<Record<string, number>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch event and ticket types
  const { data: eventData, isLoading: eventLoading } = useQuery({
    queryKey: ['public-event', eventKey],
    queryFn: async () => {
      if (!eventKey) throw new Error('Event key is required');

      console.log('Fetching event with key:', eventKey);

      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('event_key', eventKey)
        .single();

      if (eventError) {
        console.error('Event fetch error:', eventError);
        throw eventError;
      }

      console.log('Event found:', event);

      const { data: ticketTypes, error: ticketError } = await supabase
        .from('ticket_types')
        .select('*')
        .eq('event_id', event.id)
        .eq('is_active', true)
        .gt('available_quantity', 0);

      if (ticketError) {
        console.error('Ticket types fetch error:', ticketError);
        throw ticketError;
      }

      console.log('Ticket types found:', ticketTypes);

      return { event, ticketTypes };
    },
    enabled: !!eventKey,
  });

  const handleQuantityChange = (ticketTypeId: string, quantity: number) => {
    const maxQuantity = eventData?.ticketTypes.find(t => t.id === ticketTypeId)?.available_quantity || 0;
    const newQuantity = Math.max(0, Math.min(quantity, maxQuantity));
    
    setSelectedTickets(prev => ({
      ...prev,
      [ticketTypeId]: newQuantity
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

  const handleLoginRedirect = () => {
    localStorage.setItem('redirectAfterLogin', window.location.pathname);
    navigate('/login');
  };

  const handlePurchase = async () => {
    console.log('Purchase button clicked');
    console.log('Current user:', currentUser);
    console.log('Selected tickets:', selectedTickets);
    console.log('Total tickets:', getTotalTickets());

    if (!currentUser) {
      toast({
        title: "Login Required",
        description: "Please log in to purchase tickets",
        variant: "destructive",
      });
      handleLoginRedirect();
      return;
    }

    if (getTotalTickets() === 0) {
      toast({
        title: "No Tickets Selected",
        description: "Please select at least one ticket",
        variant: "destructive",
      });
      return;
    }

    if (!eventData) {
      toast({
        title: "Error",
        description: "Event data not available",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    console.log('Starting ticket purchase process...');

    try {
      // Create ticket purchases for each selected ticket type
      const ticketPurchases = [];
      
      for (const [ticketTypeId, quantity] of Object.entries(selectedTickets)) {
        if (quantity > 0) {
          const ticketType = eventData.ticketTypes.find(t => t.id === ticketTypeId);
          if (!ticketType) {
            console.error('Ticket type not found:', ticketTypeId);
            continue;
          }

          console.log(`Creating ${quantity} tickets for type:`, ticketType.name);

          for (let i = 0; i < quantity; i++) {
            ticketPurchases.push({
              event_id: eventData.event.id,
              ticket_type_id: ticketTypeId,
              user_id: currentUser.id,
              price: ticketType.price,
              payment_status: 'completed', // Set to completed for all tickets (free and paid)
              qr_code_data: `${window.location.origin}/ticket-verify?ticket_number=`,
            });
          }
        }
      }

      console.log('Inserting tickets:', ticketPurchases);

      // Insert tickets
      const { data: tickets, error } = await supabase
        .from('event_tickets')
        .insert(ticketPurchases)
        .select();

      if (error) {
        console.error('Ticket insert error:', error);
        throw error;
      }

      console.log('Tickets created successfully:', tickets);

      // Update available quantities
      for (const [ticketTypeId, quantity] of Object.entries(selectedTickets)) {
        if (quantity > 0) {
          console.log(`Updating quantity for ticket type ${ticketTypeId}, reducing by ${quantity}`);
          
          // Get current quantity first
          const { data: currentTicketType, error: fetchError } = await supabase
            .from('ticket_types')
            .select('available_quantity')
            .eq('id', ticketTypeId)
            .single();

          if (fetchError) {
            console.error('Error fetching current ticket type:', fetchError);
            continue;
          }

          if (currentTicketType) {
            const newQuantity = currentTicketType.available_quantity - quantity;
            console.log(`Updating available quantity from ${currentTicketType.available_quantity} to ${newQuantity}`);
            
            const { error: updateError } = await supabase
              .from('ticket_types')
              .update({
                available_quantity: Math.max(0, newQuantity)
              })
              .eq('id', ticketTypeId);

            if (updateError) {
              console.error('Error updating ticket quantity:', updateError);
            }
          }
        }
      }

      console.log('Purchase completed successfully');

      // Show success message
      toast({
        title: "Tickets Purchased Successfully!",
        description: `${getTotalTickets()} ticket(s) purchased successfully.`,
      });

      // Reset form and redirect to attendee dashboard
      setSelectedTickets({});
      navigate('/attendee/my-tickets');

    } catch (error: any) {
      console.error('Purchase failed:', error);
      toast({
        title: "Purchase Failed",
        description: error.message || "Failed to purchase tickets. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (eventLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!eventData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Event Not Found</h1>
          <p className="text-muted-foreground">The event you're looking for doesn't exist or tickets are not available.</p>
        </div>
      </div>
    );
  }

  const { event, ticketTypes } = eventData;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Event Header */}
        <div className="mb-8">
          {event.banner_url && (
            <div className="w-full h-64 rounded-lg overflow-hidden mb-6">
              <img 
                src={event.banner_url} 
                alt={event.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <h1 className="text-3xl font-bold mb-4">{event.name}</h1>
          
          {event.description && (
            <p className="text-muted-foreground mb-4">{event.description}</p>
          )}
          
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{new Date(event.start_time).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>
                {new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                {new Date(event.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            {event.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{event.location}</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Ticket Selection */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-semibold mb-6">Select Tickets</h2>
            
            {ticketTypes.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <Ticket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No tickets available at this time.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {ticketTypes.map((ticket) => (
                  <Card key={ticket.id} className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold">{ticket.name}</h3>
                        {ticket.description && (
                          <p className="text-muted-foreground mt-1">{ticket.description}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">₦{ticket.price.toLocaleString()}</div>
                        <Badge variant="outline">
                          {ticket.available_quantity} available
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <Label htmlFor={`quantity-${ticket.id}`}>Quantity:</Label>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityChange(ticket.id, (selectedTickets[ticket.id] || 0) - 1)}
                          disabled={!selectedTickets[ticket.id]}
                        >
                          -
                        </Button>
                        <Input
                          id={`quantity-${ticket.id}`}
                          type="number"
                          min="0"
                          max={ticket.available_quantity}
                          value={selectedTickets[ticket.id] || 0}
                          onChange={(e) => handleQuantityChange(ticket.id, parseInt(e.target.value) || 0)}
                          className="w-20 text-center"
                        />
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
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Purchase Summary */}
          <div>
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Purchase Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!currentUser && (
                  <Card className="border-amber-200 bg-amber-50">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 text-amber-700 mb-2">
                        <LogIn className="h-4 w-4" />
                        <span className="font-medium">Login Required</span>
                      </div>
                      <p className="text-sm text-amber-600 mb-3">
                        You need to log in to purchase tickets
                      </p>
                      <Button 
                        onClick={handleLoginRedirect}
                        className="w-full" 
                        variant="outline"
                      >
                        <LogIn className="h-4 w-4 mr-2" />
                        Login to Continue
                      </Button>
                    </CardContent>
                  </Card>
                )}

                <div className="border-t pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total Tickets:</span>
                      <span>{getTotalTickets()}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total:</span>
                      <span>₦{getTotalPrice().toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handlePurchase}
                  disabled={isProcessing || getTotalTickets() === 0 || !currentUser}
                  className="w-full"
                  size="lg"
                >
                  {isProcessing ? 'Processing...' : `Purchase ${getTotalTickets()} Ticket${getTotalTickets() !== 1 ? 's' : ''}`}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
