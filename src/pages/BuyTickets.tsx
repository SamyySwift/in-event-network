import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
import { EnhancedTicketPurchaseForm } from '@/components/forms/EnhancedTicketPurchaseForm';
import { useFormPersistence } from '@/hooks/useFormPersistence';
import { useForm } from 'react-hook-form';
import { FormField } from '@/hooks/useTicketFormFields';
import { GuestTicketDisplay } from '@/components/GuestTicketDisplay';

interface TicketType {
  id: string;
  name: string;
  description?: string;
  price: number;
  available_quantity: number;
  max_tickets_per_user: number;
  is_active: boolean;
  requires_login?: boolean;
  formFields?: FormField[];
}

interface TicketPurchaseInfo {
  ticketTypeId: string;
  quantity: number;
  attendees: Array<{
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    formResponses?: Record<string, any>;
  }>;
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
  const queryClient = useQueryClient();
  const [selectedTickets, setSelectedTickets] = useState<Record<string, number>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [purchasedTicketCount, setPurchasedTicketCount] = useState(0);
  const [purchaseData, setPurchaseData] = useState<TicketPurchaseInfo[]>([]);
  const [showGuestTickets, setShowGuestTickets] = useState(false);
  const [guestTickets, setGuestTickets] = useState<any[]>([]);
  const [guestPurchaseEmail, setGuestPurchaseEmail] = useState('');

  // Form persistence for preventing data loss on login redirects
  const form = useForm({
    defaultValues: {
      selectedTickets: {},
      purchaseData: []
    }
  });

  const { saveFormData, clearSavedData, hasSavedData } = useFormPersistence(
    `ticket-purchase-${eventKey}`,
    form,
    true
  );

  // Restore form data after login redirect
  useEffect(() => {
    if (currentUser && hasSavedData) {
      const savedData = localStorage.getItem(`form-persistence`);
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          const ticketData = parsed[`ticket-purchase-${eventKey}`];
          if (ticketData) {
            if (ticketData.selectedTickets) {
              setSelectedTickets(ticketData.selectedTickets);
            }
            if (ticketData.purchaseData) {
              setPurchaseData(ticketData.purchaseData);
            }
          }
        } catch (error) {
          console.error('Error restoring form data:', error);
        }
      }
    }
  }, [currentUser, eventKey, hasSavedData]);

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

  // Realtime: update ticket availability when new tickets are created
  useEffect(() => {
    if (!eventData?.event?.id) return;

    const channel = supabase
      .channel('tickets-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'event_tickets', filter: `event_id=eq.${eventData.event.id}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ['event-tickets', eventKey] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventData?.event?.id, eventKey, queryClient]);

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
    const newTickets = {
      ...selectedTickets,
      [ticketTypeId]: quantity
    };
    
    setSelectedTickets(newTickets);
    
    // Save to localStorage for persistence
    if (currentUser) {
      form.setValue('selectedTickets', newTickets);
      saveFormData({ selectedTickets: newTickets, purchaseData });
    }
  };

  const handlePurchaseDataChange = (newPurchaseData: TicketPurchaseInfo[]) => {
    setPurchaseData(newPurchaseData);
    
    // Save to localStorage for persistence
    if (currentUser) {
      form.setValue('purchaseData', newPurchaseData);
      saveFormData({ selectedTickets, purchaseData: newPurchaseData });
    }
  };

  const getTotalPrice = () => {
    if (!eventData?.ticketTypes) return 0;
    return purchaseData.reduce((total, purchase) => {
      const ticketType = eventData.ticketTypes.find(t => t.id === purchase.ticketTypeId);
      if (ticketType) {
        const ticketPrice = ticketType.display_price || ticketType.price;
        return total + (ticketPrice * purchase.quantity);
      }
      return total;
    }, 0);
  };

  const getTotalTickets = () => {
    return purchaseData.reduce((total, purchase) => total + purchase.quantity, 0);
  };

  const handleLoginRedirect = () => {
    // Save current form data before redirect
    saveFormData({ selectedTickets, purchaseData });
    localStorage.setItem('redirectAfterLogin', window.location.pathname);
    navigate('/login');
  };

  const handlePurchase = async () => {
    console.log('Purchase button clicked');
    console.log('Current user:', currentUser);
    console.log('Selected tickets:', selectedTickets);
    console.log('Total tickets:', getTotalTickets());

    // Check if any ticket requires login
    const requiresLogin = purchaseData.some(purchase => {
      const ticketType = eventData?.ticketTypes.find(t => t.id === purchase.ticketTypeId);
      return ticketType?.requires_login === true; // Require login only if explicitly true
    });

    if (requiresLogin && !currentUser) {
      toast({
        title: "Login Required",
        description: "Please log in to purchase tickets",
        variant: "destructive",
      });
      handleLoginRedirect();
      return;
    }

    // Check if user is admin/host for this event
    if (eventData?.event) {
      const { data: eventDetails, error: eventError } = await supabase
        .from('events')
        .select('host_id')
        .eq('id', eventData.event.id)
        .single();

      if (!eventError && currentUser && eventDetails?.host_id === currentUser.id) {
        toast({
          title: "Admin Purchase Not Allowed",
          description: "Event admins cannot purchase tickets for their own event",
          variant: "destructive",
        });
        return;
      }
    }

    if (getTotalTickets() === 0) {
      toast({
        title: "No Tickets Selected",
        description: "Please select at least one ticket",
        variant: "destructive",
      });
      return;
    }

    // Validate all attendee information
    const missingInfo = [];
    const emailsUsed = new Set<string>();
    
    for (const purchase of purchaseData) {
      for (let i = 0; i < purchase.attendees.length; i++) {
        const attendee = purchase.attendees[i];
        if (!attendee.firstName.trim()) {
          missingInfo.push(`First name for attendee ${i + 1}`);
        }
        if (!attendee.lastName.trim()) {
          missingInfo.push(`Last name for attendee ${i + 1}`);
        }
        if (!attendee.email.trim()) {
          missingInfo.push(`Email for attendee ${i + 1}`);
        } else {
          // Check for duplicate emails
          const email = attendee.email.trim().toLowerCase();
          if (emailsUsed.has(email)) {
            missingInfo.push(`Duplicate email: ${attendee.email}`);
          } else {
            emailsUsed.add(email);
            // Check if email is already used for this event
            if (!requiresLogin) {
              setGuestPurchaseEmail(email);
              // Check for duplicate emails in existing tickets
              const { data: existingTickets } = await supabase
                .from('event_tickets')
                .select('guest_email')
                .eq('event_id', eventData?.event.id)
                .eq('guest_email', email);
                
              if (existingTickets && existingTickets.length > 0) {
                missingInfo.push(`Email ${email} already used for this event`);
              }
            }
          }
        }
      }
    }

    if (missingInfo.length > 0) {
      toast({
        title: "Missing Information",
        description: `Please fill in: ${missingInfo.join(', ')}`,
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

    const totalPrice = getTotalPrice();

    // If total price is 0, proceed with free ticket creation
    if (totalPrice === 0) {
      await createTickets();
    } else {
      // Show payment interface for paid tickets
      setShowPayment(true);
    }
  };

  const handlePaymentSuccess = async (reference: string, createdTickets?: any[]) => {
    console.log('Payment successful, reference:', reference);
    setShowPayment(false);

    // If backend already created tickets (guest or logged-in), use them directly
    if (createdTickets && createdTickets.length > 0) {
      try {
        // Save any form responses against created tickets
        // Reuse existing logic to map purchaseData to tickets by type and index
        const formResponseInserts: any[] = [];
        for (const purchase of purchaseData) {
          const ticketType = eventData?.ticketTypes.find(t => t.id === purchase.ticketTypeId);
          if (ticketType?.formFields) {
            const ticketsForType = createdTickets.filter((t: any) => t.ticket_type_id === purchase.ticketTypeId);
            for (let i = 0; i < purchase.attendees.length; i++) {
              const attendee = purchase.attendees[i];
              const ticket = ticketsForType[i];
              if (ticket && attendee.formResponses) {
                for (const field of ticketType.formFields) {
                  const responseValue = attendee.formResponses[field.id];
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
          if (responseError) console.error('Form responses insert error:', responseError);
        }
      } catch (e) {
        console.error('Error saving form responses:', e);
      }

      // Show tickets for guests; success modal for logged-in users
      const isGuestPurchase = !currentUser;
      if (isGuestPurchase) {
        setGuestTickets(createdTickets);
        setShowGuestTickets(true);
      } else {
        setPurchasedTicketCount(getTotalTickets());
        setShowSuccessModal(true);
      }

      // Reset and refresh
      setSelectedTickets({});
      setPurchaseData([]);
      clearSavedData();
      
      // Force refresh of both queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['event-tickets', eventKey] }),
        currentUser && queryClient.invalidateQueries({ queryKey: ['my-tickets', currentUser.id] })
      ].filter(Boolean));
      
      // Small delay to ensure queries are refreshed
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ['my-tickets', currentUser?.id] });
      }, 500);
      
      return;
    }

    // Fallback: create tickets client-side if backend did not return them
    await createTickets(reference);
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
      // Create ticket purchases for each purchase
      const ticketPurchases = [];
      
      for (const purchase of purchaseData) {
        const ticketType = eventData.ticketTypes.find(t => t.id === purchase.ticketTypeId);
        if (!ticketType) {
          console.error('Ticket type not found:', purchase.ticketTypeId);
          continue;
        }

        console.log(`Creating ${purchase.quantity} tickets for type:`, ticketType.name);

        for (let i = 0; i < purchase.attendees.length; i++) {
          const attendee = purchase.attendees[i];
          
          // Generate payment reference for free tickets
          const finalPaymentReference = paymentReference || 
            (ticketType.price === 0 ? `FREE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` : null);
          
          // Generate truly unique QR code using crypto.randomUUID()
          const uniqueId = crypto.randomUUID();
          const timestamp = Date.now();
          const uniqueQRCode = `${eventData.event.id}-${purchase.ticketTypeId}-${timestamp}-${uniqueId}-${i}`;

          ticketPurchases.push({
            event_id: eventData.event.id,
            ticket_type_id: purchase.ticketTypeId,
            user_id: currentUser?.id || null, // Allow null for guest purchases
            first_name: attendee.firstName.trim(),
            last_name: attendee.lastName.trim(),
            guest_name: `${attendee.firstName} ${attendee.lastName}`.trim().substring(0, 100),
            guest_email: attendee.email.trim().substring(0, 255),
            guest_phone: (attendee.phone || '').trim().substring(0, 20),
            price: ticketType.price,
            payment_status: 'completed',
            payment_reference: finalPaymentReference,
            qr_code_data: uniqueQRCode,
          });
        }
      }
  
      console.log('Inserting tickets:', ticketPurchases);
  
      // Insert tickets with retry logic for duplicate key errors or via edge function for free flow
      let tickets;
      const isFreeFlow = !paymentReference && getTotalPrice() === 0;

      if (isFreeFlow) {
        const { data, error } = await supabase.functions.invoke('create-free-tickets', {
          body: {
            eventId: eventData.event.id,
            tickets: ticketPurchases
          }
        });
        if (error) throw error;
        tickets = data?.tickets || [];
      }
  
      // Insert form responses if any
      if (tickets && tickets.length > 0) {
        const formResponseInserts = [];
        
        for (const purchase of purchaseData) {
          const ticketType = eventData.ticketTypes.find(t => t.id === purchase.ticketTypeId);
          
          if (ticketType?.formFields) {
            // Find tickets for this ticket type
            const ticketsForType = tickets.filter(t => t.ticket_type_id === purchase.ticketTypeId);
            
            for (let i = 0; i < purchase.attendees.length; i++) {
              const attendee = purchase.attendees[i];
              const ticket = ticketsForType[i];
              
              if (ticket && attendee.formResponses) {
                for (const field of ticketType.formFields) {
                  const responseValue = attendee.formResponses[field.id];
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
      for (const purchase of purchaseData) {
        const quantity = purchase.quantity;
        console.log(`Updating quantity for ticket type ${purchase.ticketTypeId}, reducing by ${quantity}`);
        
        // Get current quantity first
        const { data: currentTicketType, error: fetchError } = await supabase
          .from('ticket_types')
          .select('available_quantity')
          .eq('id', purchase.ticketTypeId)
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
            .eq('id', purchase.ticketTypeId);

          if (updateError) {
            console.error('Error updating ticket quantity:', updateError);
          }
        }
      }

      // Add this state near the top of the component
      // Handle successful ticket creation
      console.log('Purchase completed successfully');
      
      // Check if this is a guest purchase (no user logged in and tickets don't require login)
      const isGuestPurchase = !currentUser && purchaseData.every(purchase => {
        const ticketType = eventData.ticketTypes.find(t => t.id === purchase.ticketTypeId);
        return ticketType?.requires_login === false;
      });

      if (isGuestPurchase && tickets && tickets.length > 0) {
        // Show guest ticket display
        console.log('Setting guest tickets:', tickets);
        setGuestTickets(tickets);
        setShowGuestTickets(true);
      } else {
        // Set success modal data for logged-in users
        setPurchasedTicketCount(getTotalTickets());
        setShowSuccessModal(true);
      }
      
      // Reset form and clear persistence
      setSelectedTickets({});
      setPurchaseData([]);
      clearSavedData();

      // Force refresh of both queries  
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['event-tickets', eventKey] }),
        currentUser && queryClient.invalidateQueries({ queryKey: ['my-tickets', currentUser.id] })
      ].filter(Boolean));
      
      // Additional refetch with delay to ensure data is updated
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ['my-tickets', currentUser?.id] });
      }, 500);

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

  // Check if any selected tickets require login
  const requiresLoginForPurchase = purchaseData.some(purchase => {
    const ticketType = ticketTypes.find(t => t.id === purchase.ticketTypeId);
    return ticketType?.requires_login === true; // Require login only if explicitly true
  });

  // Handle guest ticket download
  const handleGuestTicketDownload = async () => {
    try {
      // For each ticket, generate a QR code and download it
      for (const ticket of guestTickets) {
        const qrData = JSON.stringify({
          ticketNumber: ticket.ticket_number,
          ticketId: ticket.id,
          eventName: event?.name || 'Unknown Event',
          ticketType: ticket.ticket_types?.name || 'Unknown Ticket Type',
          verifyUrl: `${window.location.origin}/admin/verify-ticket/${ticket.ticket_number}`
        });

        // Generate QR code with logo using QR Server API
        const qrSize = 300;
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(qrData)}&logo=https://89ffd642-3173-4004-8c28-eb0eea097a15.lovableproject.com/lovable-uploads/cc286065-ca78-4e02-b135-112dfebbebef.png`;
        
        // Download the QR code image
        const response = await fetch(qrUrl);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `ticket-${ticket.ticket_number}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
      
      toast({
        title: "Download Complete",
        description: `Downloaded ${guestTickets.length} ticket QR code${guestTickets.length > 1 ? 's' : ''}`,
      });
    } catch (error) {
      console.error('Failed to download tickets:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download ticket QR codes. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Show guest ticket display if applicable
  if (showGuestTickets && guestTickets.length > 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <GuestTicketDisplay 
            tickets={guestTickets}
            event={event}
            onDownload={handleGuestTicketDownload}
          />
        </div>
      </div>
    );
  }

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

        {/* Show login requirement as main content if needed */}
        {requiresLoginForPurchase && !currentUser ? (
          <div className="max-w-2xl mx-auto">
            <Card className="border-primary bg-white shadow-lg">
              <CardContent className="py-12 text-center">
                <LogIn className="h-16 w-16 text-primary mx-auto mb-6" />
                <h2 className="text-2xl font-semibold text-foreground mb-4">Login Required</h2>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Please log in to select and purchase tickets for this event
                </p>
                <Button 
                  onClick={handleLoginRedirect} 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90 min-w-48"
                >
                  <LogIn className="h-5 w-5 mr-2" />
                  Login to Continue
                </Button>
              </CardContent>
            </Card>
            
            {/* Show available ticket types preview */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ticket className="w-5 h-5" />
                  Available Tickets
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {ticketTypes.map((ticketType) => (
                  <div key={ticketType.id} className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-muted-foreground">{ticketType.name}</h4>
                        {ticketType.price > 0 ? (
                          <Badge variant="secondary">₦{((ticketType.display_price || ticketType.price) / 100).toLocaleString()}</Badge>
                        ) : (
                          <Badge variant="secondary">Free</Badge>
                        )}
                      </div>
                      {ticketType.description && (
                        <p className="text-sm text-muted-foreground mb-2">{ticketType.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{ticketType.available_quantity} available</span>
                        <span>Max {ticketType.max_tickets_per_user} per user</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Enhanced Ticket Purchase Form */}
            <div className="lg:col-span-2">
              {ticketTypes.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <Ticket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No tickets available at this time.</p>
                  </CardContent>
                </Card>
              ) : (
                <EnhancedTicketPurchaseForm
                  ticketTypes={ticketTypes}
                  selectedTickets={selectedTickets}
                  onTicketQuantityChange={handleQuantityChange}
                  onPurchaseDataChange={handlePurchaseDataChange}
                  currentUserEmail={currentUser?.email}
                />
              )}
            </div>

            {/* Purchase Summary */}
            <div>
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle>Purchase Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {requiresLoginForPurchase && !currentUser && (
                    <Card className="border-primary bg-primary/5">
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2 text-primary mb-2">
                          <LogIn className="h-4 w-4" />
                          <span className="font-medium">Login Required</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          You need to log in to purchase tickets
                        </p>
                        <Button 
                          onClick={handleLoginRedirect}
                          className="w-full bg-primary hover:bg-primary/90" 
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
                      <Card className="border-green-200 bg-green-50">
                        <CardContent className="pt-4">
                          <div className="flex items-center gap-2 text-green-700 mb-2">
                            <User className="h-4 w-4" />
                            <span className="font-medium">Ready to Purchase</span>
                          </div>
                          <p className="text-sm text-green-600">
                            All attendee information completed. Click purchase to continue.
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Payment Interface */}
                  {showPayment && eventData && (
                    <Card className="border-green-200 bg-green-50">
                      <CardContent className="pt-4">
                        <div className="space-y-4">
                          <h3 className="font-medium text-green-700">Complete Payment</h3>
                          <PaystackTicketPayment
                            eventId={eventData.event.id}
                            eventName={eventData.event.name}
                              tickets={purchaseData.map(purchase => {
                                const ticketType = eventData.ticketTypes.find(t => t.id === purchase.ticketTypeId);
                                const priceInKobo = (ticketType?.display_price || ticketType?.price || 0);
                                return {
                                  ticketTypeId: purchase.ticketTypeId,
                                  quantity: purchase.quantity,
                                  price: priceInKobo,
                                  name: ticketType?.name || ''
                                };
                              })}
                             totalAmount={getTotalPrice()}
                            userInfo={{
                              fullName: purchaseData[0]?.attendees[0] 
                                ? `${purchaseData[0].attendees[0].firstName} ${purchaseData[0].attendees[0].lastName}`.trim() 
                                : currentUser?.email || 'User',
                              email: purchaseData[0]?.attendees[0]?.email || currentUser?.email || '',
                              phone: purchaseData[0]?.attendees[0]?.phone || '',
                              userId: currentUser?.id
                            }}
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
                        <span>₦{(getTotalPrice() / 100).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {!showPayment && (
                    <Button
                      onClick={handlePurchase}
                      disabled={isProcessing || getTotalTickets() === 0}
                      className="w-full"
                      size="lg"
                    >
                      {isProcessing ? 'Processing...' : getTotalPrice() === 0 ? `Get ${getTotalTickets()} Free Ticket${getTotalTickets() !== 1 ? 's' : ''}` : `Purchase ${getTotalTickets()} Ticket${getTotalTickets() !== 1 ? 's' : ''}`}
                    </Button>
                  )}

                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Ticket className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-green-600">Purchase Successful!</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600">
                Congratulations! You have successfully purchased {purchasedTicketCount} ticket(s) for {eventData?.event.name}.
              </p>
              <p className="text-sm text-gray-500">
                Your tickets have been added to your account and you can view them in your dashboard.
              </p>
              <div className="flex gap-2">
                <Button 
                  onClick={() => {
                    setShowSuccessModal(false);
                    navigate('/attendee/my-tickets');
                  }}
                  className="flex-1"
                >
                  View My Tickets
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowSuccessModal(false)}
                  className="flex-1"
                >
                  Continue Shopping
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
