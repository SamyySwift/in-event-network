

import React, { useState } from 'react';
import { PaystackButton } from 'react-paystack';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader, CreditCard, Shield, CheckCircle } from 'lucide-react';
import { usePayment } from '@/hooks/usePayment';
import { usePaystackConfig } from '@/hooks/usePaystackConfig';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  eventName: string;
  onPaymentSuccess?: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  eventId,
  eventName,
  onPaymentSuccess,
}) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const { recordPayment, updatePaymentStatus, getPaymentAmount, isRecordingPayment } = usePayment();
  const { publicKey, isLoading: isLoadingConfig } = usePaystackConfig();
  const [isProcessing, setIsProcessing] = useState(false);

  const amount = getPaymentAmount(); // 30,000 NGN in kobo

  const paystackProps = {
    email: currentUser?.email || '',
    amount,
    currency: 'NGN',
    publicKey,
    text: 'Pay ₦30,000',
    onSuccess: (reference: any) => {
      console.log('Payment successful:', reference);
      setIsProcessing(true);
      
      // Record successful payment
      recordPayment({
        eventId,
        amount: amount / 100, // Convert back from kobo to naira for storage
        currency: 'NGN',
        reference: reference.reference,
        status: 'success',
      });

      updatePaymentStatus({
        reference: reference.reference,
        status: 'success',
      });

      setIsProcessing(false);
      onPaymentSuccess?.();
      onClose();

      toast({
        title: 'Payment Successful!',
        description: `Payment for ${eventName} has been completed successfully.`,
      });
    },
    onClose: () => {
      console.log('Payment closed');
    },
  };

  if (isLoadingConfig) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <div className="flex items-center justify-center py-8">
            <Loader className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!publicKey) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Payment Configuration Error</DialogTitle>
            <DialogDescription>
              Payment system is not properly configured. Please contact support.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={onClose}>Close</Button>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] z-[9999]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Event Payment Required
          </DialogTitle>
          <DialogDescription>
            Complete payment to unlock full access to your event features.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Event Details */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border">
            <h3 className="font-semibold text-gray-900 mb-2">{eventName}</h3>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Event Access Fee</span>
              <span className="text-xl font-bold text-primary">₦30,000</span>
            </div>
          </div>

          {/* Features Included */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">What's included:</h4>
            <div className="space-y-2">
              {[
                'Unlimited attendees',
                'AI-powered smart matching',
                'Real-time analytics dashboard',
                'Interactive Q&A sessions',
                'Real-time attendee messaging',
                '24/7 premium support'
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-gray-600">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Security Info */}
          <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
            <Shield className="h-4 w-4" />
            <span>Secure payment powered by Paystack</span>
          </div>

          {/* Payment Button */}
          <div className="space-y-3">
            <PaystackButton
              {...paystackProps}
              className="w-full bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white py-3 px-6 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 cursor-pointer"
              disabled={isProcessing || isRecordingPayment}
            >
              {isProcessing || isRecordingPayment ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader className="h-4 w-4 animate-spin" />
                  Processing...
                </div>
              ) : (
                'Pay ₦30,000'
              )}
            </PaystackButton>

            <Button
              variant="outline"
              onClick={onClose}
              className="w-full"
              disabled={isProcessing || isRecordingPayment}
            >
              Cancel
            </Button>
          </div>

          <p className="text-xs text-gray-400 text-center">
            30-day money-back guarantee
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;

