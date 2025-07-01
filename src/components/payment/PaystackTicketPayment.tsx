
import React from 'react';
import { PaystackButton } from 'react-paystack';
import { usePaystackConfig } from '@/hooks/usePaystackConfig';
import { useAuth } from '@/contexts/AuthContext';

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
  };
  onSuccess: (reference: string) => void;
  onClose: () => void;
  disabled?: boolean;
}

export function PaystackTicketPayment({
  eventId,
  eventName,
  tickets,
  totalAmount,
  userInfo,
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
    amount: totalAmount * 100, // Convert to kobo
    publicKey,
    text: `Pay ₦${totalAmount.toLocaleString()}`,
    onSuccess: (reference: any) => {
      console.log('Payment successful:', reference);
      onSuccess(reference.reference);
    },
    onClose: () => {
      console.log('Payment cancelled');
      onClose();
    },
    metadata: {
      event_id: eventId,
      event_name: eventName,
      user_id: currentUser?.id,
      user_name: userInfo.fullName,
      phone: userInfo.phone,
      tickets: tickets.map(t => ({
        ticket_type_id: t.ticketTypeId,
        quantity: t.quantity,
        price: t.price,
        name: t.name
      }))
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
