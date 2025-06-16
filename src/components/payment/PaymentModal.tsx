
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
      // Don't automatically close the main modal here, let user decide
    },
    // This callback is triggered when Paystack modal opens
    callback: (response: any) => {
      console.log('Paystack callback:', response);
      // Close the PaymentModal when Paystack opens to prevent z-index conflicts
      onClose();
    },
  };

  if (isLoadingConfig) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md mx-4 sm:mx-auto">
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
        <DialogContent className="max-w-md mx-4 sm:mx-auto">
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
      <DialogContent className="max-w-md mx-4 sm:mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <CreditCard className="h-5 w-5 text-primary" />
            Event Payment Required
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            Complete payment to unlock full access to your event features.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          {/* Event Details */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 sm:p-4 rounded-lg border">
            <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">{eventName}</h3>
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm text-gray-600">Event Access Fee</span>
              <span className="text-lg sm:text-xl font-bold text-primary">₦30,000</span>
            </div>
          </div>

          {/* Features Included */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 text-sm sm:text-base">What's included:</h4>
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
                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-gray-600">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Security Info */}
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 bg-gray-50 p-2 sm:p-3 rounded-lg">
            <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>Secure payment powered by Paystack</span>
          </div>

          {/* Payment Button */}
          <div className="space-y-3">
            <PaystackButton
              {...paystackProps}
              className="w-full bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white py-2 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 cursor-pointer text-sm sm:text-base"
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
              className="w-full text-sm sm:text-base py-2 sm:py-3"
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
