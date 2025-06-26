import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useTickets } from '@/hooks/useTickets';
import { supabase } from '@/integrations/supabase/client';
import { Ticket, Calendar, MapPin, Clock, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';

const TicketPurchase = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { useTicketTypes, purchaseTicket } = useTickets();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const ticketTypesQuery = useTicketTypes(eventId);
  const ticketTypes = ticketTypesQuery.data || [];
  
  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) return;
      
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();
        
      if (data) setEvent(data);
      setLoading(false);
    };
    
    fetchEvent();
  }, [eventId]);
  
  const handlePurchase = async (ticketType: any) => {
    if (!currentUser) {
      // Redirect to registration with return URL
      navigate(`/register?returnTo=/tickets/${eventId}`);
      return;
    }
    
    try {
      await purchaseTicket.mutateAsync({
        event_id: eventId!,
        ticket_type_id: ticketType.id,
        price: ticketType.price
      });
      
      navigate('/attendee/dashboard');
    } catch (error) {
      console.error('Purchase failed:', error);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    );
  }
  
  if (!event) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen space-y-4">
        <h1 className="text-2xl font-bold text-muted-foreground">Event not found</h1>
        <Button onClick={() => navigate('/')} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Home
        </Button>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Button */}
        <Button 
          onClick={() => navigate('/')} 
          variant="ghost" 
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        {/* Event Header */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {event.banner_url && (
                <img 
                  src={event.banner_url} 
                  alt={event.name}
                  className="w-full md:w-48 h-32 object-cover rounded-lg"
                />
              )}
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">{event.name}</h1>
                <p className="text-muted-foreground mb-4">{event.description}</p>
                
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(event.start_time), 'PPP')}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {format(new Date(event.start_time), 'p')}
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {event.location}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Ticket Types */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Available Tickets</h2>
          
          {ticketTypes.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Ticket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No tickets available for this event.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {ticketTypes.map((ticketType) => (
                <Card key={ticketType.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">{ticketType.name}</h3>
                        <p className="text-muted-foreground mb-4">{ticketType.description}</p>
                        
                        <div className="flex items-center gap-4">
                          <div className="text-2xl font-bold text-primary">
                            ₦{ticketType.price.toLocaleString()}
                          </div>
                          <Badge variant={ticketType.available_quantity > 0 ? "default" : "secondary"}>
                            {ticketType.available_quantity > 0 
                              ? `${ticketType.available_quantity} available`
                              : 'Sold out'
                            }
                          </Badge>
                        </div>
                      </div>
                      
                      <Button 
                        onClick={() => handlePurchase(ticketType)}
                        disabled={ticketType.available_quantity === 0 || purchaseTicket.isPending}
                        className="ml-4"
                        size="lg"
                      >
                        {!currentUser ? 'Sign Up to Purchase' : 'Purchase Ticket'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
        
        {!currentUser && (
          <Card className="mt-8 border-orange-200 bg-orange-50">
            <CardContent className="p-6">
              <h3 className="font-semibold text-orange-800 mb-2">Registration Required</h3>
              <p className="text-orange-700 mb-4">
                You need to create an account to purchase tickets. Registration is quick and free!
              </p>
              <Button onClick={() => navigate('/register')} variant="outline">
                Create Account
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TicketPurchase;