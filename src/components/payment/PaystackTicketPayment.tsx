
import React from 'react';
import { PaystackButton } from 'react-paystack';
import { usePaystackConfig } from '@/hooks/usePaystackConfig';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface TicketPaymentData {
  ticketTypeId: string;
  quantity: number;
  price: number;
  name: string;
}

interface PaystackTicketPaymentProps {
  eventId: string;
  eventName: string;
  tickets: TicketPaymentData[];
  totalAmount: number;
  userInfo: {
    fullName: string;
    email: string;
    phone: string;
    userId?: string;
  };
  purchaseData?: any[]; // Form data for each ticket purchase
  onSuccess: (reference: string, tickets?: any[]) => void;
  onClose: () => void;
  disabled?: boolean;
}

export function PaystackTicketPayment({
  eventId,
  eventName,
  tickets,
  totalAmount,
  userInfo,
  purchaseData = [],
  onSuccess,
  onClose,
  disabled = false
}: PaystackTicketPaymentProps) {
  const { publicKey, isLoading } = usePaystackConfig();
  const { currentUser } = useAuth();

  if (isLoading || !publicKey) {
    return (
      <div className="w-full py-2 px-4 bg-gray-100 text-gray-500 rounded text-center">
        Loading payment...
      </div>
    );
  }

  const paymentProps = {
    email: userInfo.email,
    amount: totalAmount, // Already in kobo
    publicKey,
    text: `Pay ₦${(totalAmount / 100).toLocaleString()}`,
    onSuccess: async (reference: any) => {
      console.log('Payment successful:', reference);
      
      try {
        // Prepare form responses data
        const formResponsesData = purchaseData && purchaseData.length > 0 
          ? purchaseData.map(purchase => ({
              ticketTypeId: purchase.ticketTypeId,
              attendees: purchase.attendees.map((attendee, index) => ({
                attendeeIndex: index,
                responses: attendee.formResponses || {}
              }))
            })).flatMap(purchase => 
              purchase.attendees.map(attendee => ({
                ticketTypeId: purchase.ticketTypeId,
                attendeeIndex: attendee.attendeeIndex,
                responses: attendee.responses
              }))
            )
          : [];

        const { data, error } = await supabase.functions.invoke('process-ticket-purchase', {
          body: {
            eventId,
            tickets,
            userInfo: {
              ...userInfo,
              userId: currentUser?.id
            },
            paystackReference: reference.reference,
            totalAmount: totalAmount, // Already in kobo
            formResponses: formResponsesData
          }
        });

        if (error) {
          console.error('Ticket processing error:', error);
          throw error;
        }

        console.log('Tickets created successfully:', data);
        onSuccess(reference.reference, data?.tickets);
      } catch (error) {
        console.error('Failed to process ticket purchase:', error);
        // Still call onSuccess to allow UI to handle the situation
        onSuccess(reference.reference);
      }
    },
    onClose: () => {
      console.log('Payment cancelled');
      onClose();
    },
    metadata: {
      custom_fields: [
        {
          display_name: "Event ID",
          variable_name: "event_id",
          value: eventId
        },
        {
          display_name: "Event Name",
          variable_name: "event_name",
          value: eventName
        },
        {
          display_name: "User ID",
          variable_name: "user_id",
          value: currentUser?.id || ''
        },
        {
          display_name: "User Name",
          variable_name: "user_name",
          value: userInfo.fullName
        },
        {
          display_name: "Phone",
          variable_name: "phone",
          value: userInfo.phone
        },
        {
          display_name: "Tickets",
          variable_name: "tickets",
          value: JSON.stringify(tickets.map(t => ({
            ticket_type_id: t.ticketTypeId,
            quantity: t.quantity,
            price: t.price,
            name: t.name
          })))
        }
      ]
    }
  };

  return (
    <PaystackButton
      {...paymentProps}
      className={`w-full py-3 px-4 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      disabled={disabled}
    />
  );
}
