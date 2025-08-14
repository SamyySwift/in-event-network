
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, CreditCard, Sparkles } from 'lucide-react';
import PaymentModal from './PaymentModal';
import { usePayment } from '@/hooks/usePayment';
import { useReferralCode } from '@/hooks/useReferralCode';

interface PaymentGuardProps {
  eventId: string;
  eventName: string;
  children: React.ReactNode;
  feature?: string;
}

const PaymentGuard: React.FC<PaymentGuardProps> = ({
  eventId,
  eventName,
  children,
  feature = "this feature"
}) => {
  const { isLoadingPayments, isEventPaid } = usePayment();
  const { isEventUnlockedByCode, isLoadingUnlocked } = useReferralCode();
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Unified check for event access (payment OR referral code)
  const isEventUnlocked = isEventPaid(eventId) || isEventUnlockedByCode(eventId);
  const isLoading = isLoadingPayments || isLoadingUnlocked;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isEventUnlocked) {
    return <>{children}</>;
  }

  return (
    <>
      <Card className="border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-purple/5">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-primary/10 border border-primary/20">
              <Lock className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="flex items-center justify-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Premium Feature Locked
          </CardTitle>
          <CardDescription>
            Complete payment to unlock {feature} for "{eventName}"
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Access all premium features including speakers management, Q&A, facilities, announcements, polls, highlights, sponsors, vendors hub, rules, bulk check-in, networking and more for just ₦100,000
          </p>
          
          <Button 
            onClick={() => setShowPaymentModal(true)}
            className="bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Unlock Event Features
          </Button>
        </CardContent>
      </Card>

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        eventId={eventId}
        eventName={eventName}
        onPaymentSuccess={() => {
          // Refresh the page or trigger a re-render
          window.location.reload();
        }}
      />
    </>
  );
};

export default PaymentGuard;
