import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Ticket, Calendar, MapPin, Clock, LogIn, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PaystackTicketPayment } from '@/components/payment/PaystackTicketPayment';
import { CustomFormRenderer } from '@/components/forms/CustomFormRenderer';
import { useTicketFormFields, FormField } from '@/hooks/useTicketFormFields';

interface TicketType {
  id: string;
  name: string;
  description?: string;
  price: number;
  available_quantity: number;
  is_active: boolean;
  formFields?: FormField[];
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
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [selectedTickets, setSelectedTickets] = useState<Record<string, number>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [showUserInfoForm, setShowUserInfoForm] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [userInfo, setUserInfo] = useState({
    fullName: '',
    email: currentUser?.email || '',
    phone: ''
  });
  const [formResponses, setFormResponses] = useState<Record<string, Record<string, any>>>({});

  // Handle redirect after login and eventKey validation
  useEffect(() => {
    // Clear the redirect flag if this component is loading after a redirect
    const redirectAfterLogin = localStorage.getItem('redirectAfterLogin');
    if (redirectAfterLogin && window.location.pathname === redirectAfterLogin) {
      localStorage.removeItem('redirectAfterLogin');
    }

    if (!eventKey) {
      // Redirect to a page where user can select an event or show error
      toast({
        title: "Event Required",
        description: "Please access this page through a valid event link.",
        variant: "destructive",
      });
      navigate('/', { replace: true });
      return;
    }
  }, [eventKey, navigate, toast]);

  // Fetch event and ticket data
  const { data: eventData, isLoading, error } = useQuery({
    queryKey: ['event-tickets', eventKey],
    queryFn: async () => {
      if (!eventKey) {
        throw new Error('Event key is required');
      }
      
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

      // Fetch form fields for each ticket type
      const ticketTypesWithFields = await Promise.all(
        ticketTypes.map(async (ticketType) => {
          const { data: formFields, error: fieldsError } = await supabase
            .from('ticket_form_fields')
            .select('*')
            .eq('ticket_type_id', ticketType.id)
            .order('field_order', { ascending: true });

          if (fieldsError) {
            console.error('Form fields fetch error:', fieldsError);
            return { ...ticketType, formFields: [] };
          }

          return { ...ticketType, formFields: formFields as FormField[] || [] };
        })
      );

      return { event, ticketTypes: ticketTypesWithFields };
    },
    enabled: !!eventKey,
    retry: (failureCount, error) => {
      // Don't retry if it's a 404 (event not found)
      if (error?.message?.includes('not found')) {
        return false;
      }
      return failureCount < 3;
    },
  });

  // Handle error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Event Not Found</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              The event you're looking for doesn't exist or may have been removed.
            </p>
            <Button onClick={() => navigate('/')} className="w-full">
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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

  // In the handleLoginRedirect function (around line 130):
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

    // Check if user info is required and not provided
    if (!userInfo.fullName.trim() || !userInfo.email.trim() || !userInfo.phone.trim()) {
      setShowUserInfoForm(true);
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

    const totalPrice = getTotalPrice();

    // If total price is 0, proceed with free ticket creation
    if (totalPrice === 0) {
      await createTickets();
    } else {
      // Show payment interface for paid tickets
      setShowPayment(true);
    }
  };

  const handlePaymentSuccess = async (reference: string) => {
    console.log('Payment successful, creating tickets with reference:', reference);
    await createTickets(reference);
    setShowPayment(false);
  };

  const handlePaymentClose = () => {
    setShowPayment(false);
    toast({
      title: "Payment Cancelled",
      description: "Your payment was cancelled. You can try again.",
      variant: "destructive",
    });
  };

  const createTickets = async (paymentReference?: string) => {
    if (!eventData) return;

    setIsProcessing(true);
    console.log('Starting ticket creation process...');

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
            // Generate payment reference for free tickets
            const finalPaymentReference = paymentReference || 
              (ticketType.price === 0 ? `FREE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` : null);
            
            ticketPurchases.push({
              event_id: eventData.event.id,
              ticket_type_id: ticketTypeId,
              user_id: currentUser.id,
              guest_name: userInfo.fullName.substring(0, 100),
              guest_email: userInfo.email.substring(0, 255),
              guest_phone: userInfo.phone.substring(0, 20),
              price: ticketType.price,
              payment_status: 'completed',
              payment_reference: finalPaymentReference,
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

      // Insert form responses if any
      if (tickets && tickets.length > 0) {
        const formResponseInserts = [];
        
        for (const [ticketTypeId, quantity] of Object.entries(selectedTickets)) {
          if (quantity > 0) {
            const ticketType = eventData.ticketTypes.find(t => t.id === ticketTypeId);
            const ticketResponses = formResponses[ticketTypeId];
            
            if (ticketType?.formFields && ticketResponses) {
              // Find tickets for this ticket type
              const ticketsForType = tickets.filter(t => t.ticket_type_id === ticketTypeId);
              
              for (const ticket of ticketsForType) {
                for (const field of ticketType.formFields) {
                  const responseValue = ticketResponses[field.id];
                  if (responseValue !== undefined && responseValue !== null && responseValue !== '') {
                    formResponseInserts.push({
                      ticket_id: ticket.id,
                      form_field_id: field.id,
                      response_value: responseValue
                    });
                  }
                }
              }
            }
          }
        }

        if (formResponseInserts.length > 0) {
          const { error: responseError } = await supabase
            .from('ticket_form_responses')
            .insert(formResponseInserts);

          if (responseError) {
            console.error('Form responses insert error:', responseError);
            // Don't throw here as tickets are already created
          } else {
            console.log('Form responses saved successfully');
          }
        }
      }

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
      setFormResponses({});
      setUserInfo({ fullName: '', email: currentUser?.email || '', phone: '' });
      setShowUserInfoForm(false);
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

  const validateFormResponses = () => {
    if (!eventData?.ticketTypes) return { isValid: true, errors: {} };
    
    const errors: Record<string, string> = {};
    
    for (const ticketType of eventData.ticketTypes) {
      const quantity = selectedTickets[ticketType.id] || 0;
      if (quantity > 0 && ticketType.formFields) {
        for (const field of ticketType.formFields) {
          if (field.is_required) {
            const response = formResponses[ticketType.id]?.[field.id];
            if (!response || (Array.isArray(response) && response.length === 0) || response === '') {
              errors[`${ticketType.id}-${field.id}`] = `${field.label} is required`;
            }
          }
        }
      }
    }
    
    return { isValid: Object.keys(errors).length === 0, errors };
  };

  const handleUserInfoSubmit = () => {
    if (!userInfo.fullName.trim() || !userInfo.email.trim() || !userInfo.phone.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const { isValid, errors } = validateFormResponses();
    if (!isValid) {
      toast({
        title: "Missing Form Information",
        description: "Please complete all required form fields",
        variant: "destructive",
      });
      return;
    }

    setShowUserInfoForm(false);
    handlePurchase();
  };

  if (isLoading) {
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

                    {/* Custom Form Fields for this ticket type */}
                    {(selectedTickets[ticket.id] || 0) > 0 && ticket.formFields && ticket.formFields.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <h4 className="font-medium mb-3">Additional Information Required</h4>
                        <CustomFormRenderer
                          formFields={ticket.formFields}
                          values={formResponses[ticket.id] || {}}
                          onChange={(fieldId, value) => {
                            setFormResponses(prev => ({
                              ...prev,
                              [ticket.id]: {
                                ...prev[ticket.id],
                                [fieldId]: value
                              }
                            }));
                          }}
                          errors={validateFormResponses().errors}
                        />
                      </div>
                    )}
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

                {/* Step-by-step Purchase Flow */}
                {currentUser && getTotalTickets() > 0 && !showPayment && (
                  <div className="space-y-4">
                    {/* Remove the entire showUserInfoForm conditional block here */}
                    {!showUserInfoForm && (
                      <Card className="border-green-200 bg-green-50">
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between text-green-700 mb-2">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              <span className="font-medium">Ready to Purchase</span>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setShowUserInfoForm(true)}
                            >
                              Edit Info
                            </Button>
                          </div>
                          <p className="text-sm text-green-600">
                            All information provided. Click purchase to continue.
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}

                {/* Payment Interface */}
                {showPayment && currentUser && eventData && (
                  <Card className="border-green-200 bg-green-50">
                    <CardContent className="pt-4">
                      <div className="space-y-4">
                        <h3 className="font-medium text-green-700">Complete Payment</h3>
                        <PaystackTicketPayment
                          eventId={eventData.event.id}
                          eventName={eventData.event.name}
                          tickets={eventData.ticketTypes
                            .filter(t => selectedTickets[t.id] > 0)
                            .map(t => ({
                              ticketTypeId: t.id,
                              quantity: selectedTickets[t.id],
                              price: t.price,
                              name: t.name
                            }))}
                          totalAmount={getTotalPrice()}
                          userInfo={userInfo}
                          onSuccess={handlePaymentSuccess}
                          onClose={handlePaymentClose}
                          disabled={isProcessing}
                        />
                        <Button 
                          variant="outline" 
                          onClick={() => setShowPayment(false)}
                          className="w-full"
                        >
                          Cancel Payment
                        </Button>
                      </div>
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

                {!showPayment && (
                  <Button
                    onClick={handlePurchase}
                    disabled={isProcessing || getTotalTickets() === 0 || !currentUser}
                    className="w-full"
                    size="lg"
                  >
                    {isProcessing ? 'Processing...' : getTotalPrice() === 0 ? `Get ${getTotalTickets()} Free Ticket${getTotalTickets() !== 1 ? 's' : ''}` : `Purchase ${getTotalTickets()} Ticket${getTotalTickets() !== 1 ? 's' : ''}`}
                  </Button>
                )}

                {/* User Information Form - Now positioned below Purchase button */}
                {currentUser && getTotalTickets() > 0 && showUserInfoForm && !showPayment && (
                  <Card className="border-purple-200 bg-purple-50 mt-4">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 text-purple-700 mb-3">
                        <User className="h-4 w-4" />
                        <span className="font-medium">Your Information</span>
                      </div>
                      <div className="space-y-3">
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
                          <Button onClick={handleUserInfoSubmit} className="flex-1">
                            Continue to Payment
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => setShowUserInfoForm(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
