
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { QrCode, Download, CreditCard, Key, Check, X } from 'lucide-react';
import QRCodeGenerator from '@/components/admin/QRCodeGenerator';
import PaymentModal from '@/components/payment/PaymentModal';
import { usePayment } from '@/hooks/usePayment';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EventQRCodeProps {
  eventId: string;
  eventName: string;
}

const EventQRCode: React.FC<EventQRCodeProps> = ({ eventId, eventName }) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [hasValidReferralCode, setHasValidReferralCode] = useState(false);
  const [isValidatingCode, setIsValidatingCode] = useState(false);
  const { isEventPaid, isLoadingPayments } = usePayment();
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Persist QR access in localStorage per user and event
  const storageKey = currentUser?.id ? `qr_access:${currentUser.id}:${eventId}` : null;

  // Load persisted access on mount or when user/event changes
  React.useEffect(() => {
    if (!storageKey) return;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved === 'true') {
        setHasValidReferralCode(true);
      }
    } catch (e) {
      console.warn('Unable to read QR access from storage', e);
    }
  }, [storageKey]);

  // Get the current user's profile data including access_key
  const { data: userProfile } = useQuery({
    queryKey: ['user-profile', currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('access_key')
        .eq('id', currentUser.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return data;
    },
    enabled: !!currentUser?.id,
  });

  const handleDownloadQR = () => {
    const canvas = document.querySelector('#qr-canvas canvas') as HTMLCanvasElement;
    if (canvas) {
      const link = document.createElement('a');
      link.download = `${eventName}-qr-code.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  const handlePaymentSuccess = async () => {
    setShowPaymentModal(false);
    // Force refetch of payment data to ensure immediate UI update
    await queryClient.invalidateQueries({ queryKey: ['event-payments'] });
    await queryClient.refetchQueries({ queryKey: ['event-payments', currentUser?.id] });
    // Persist access so it remains unlocked after refresh
    try {
      if (storageKey) {
        localStorage.setItem(storageKey, 'true');
      }
      setHasValidReferralCode(true);
    } catch (e) {
      console.warn('Unable to persist QR access after payment', e);
    }
  };

  const handleApplyReferralCode = async () => {
    setIsValidatingCode(true);
    
    // Check if the referral code matches the specific code
    if (referralCode.trim() === '#Kconect09099') {
      setHasValidReferralCode(true);
      // Persist access so it remains unlocked after refresh
      try {
        if (storageKey) {
          localStorage.setItem(storageKey, 'true');
        }
      } catch (e) {
        console.warn('Unable to persist QR access for referral code', e);
      }
      toast({
        title: 'Referral Code Applied',
        description: 'You now have access to generate QR codes for this event!',
      });
    } else {
      toast({
        title: 'Invalid Referral Code',
        description: 'The referral code you entered is not valid.',
        variant: 'destructive',
      });
    }
    
    setIsValidatingCode(false);
  };

  const isPaid = isEventPaid(eventId);
  const hasAccess = isPaid || hasValidReferralCode;

  console.log('EventQRCode - isPaid:', isPaid, 'hasValidReferralCode:', hasValidReferralCode, 'eventId:', eventId);
  console.log('EventQRCode - isLoadingPayments:', isLoadingPayments);

  if (isLoadingPayments) {
    return (
      <div className="flex items-center justify-center h-16 mt-3">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-2 mt-3 w-full">
        {hasAccess ? (
          <Button
            onClick={() => setShowQRModal(true)}
            size="sm"
            className="w-full min-h-[40px] bg-gradient-to-r from-green-500 to-emerald-400 hover:from-green-600 hover:to-emerald-500 text-white text-xs sm:text-sm px-3 py-2"
          >
            <QrCode className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="truncate">Generate QR Code</span>
          </Button>
        ) : (
          <>
            <Button
              onClick={() => setShowPaymentModal(true)}
              size="sm"
              className="w-full min-h-[40px] bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700 text-xs sm:text-sm px-3 py-2"
            >
              <CreditCard className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">Pay Now (₦30,000)</span>
            </Button>
            
            {/* Referral Code Section */}
            <div className="space-y-2 p-3 rounded-lg bg-muted/30 border border-dashed border-muted-foreground/30">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Key className="h-3 w-3" />
                <span>Have a referral code?</span>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter referral code"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  className="text-xs h-8 bg-background/50"
                />
                <Button
                  onClick={handleApplyReferralCode}
                  disabled={!referralCode.trim() || isValidatingCode}
                  size="sm"
                  variant="outline"
                  className="h-8 px-3 text-xs"
                >
                  {isValidatingCode ? (
                    <div className="animate-spin rounded-full h-3 w-3 border-b border-current"></div>
                  ) : (
                    'Apply'
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        eventId={eventId}
        eventName={eventName}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* QR Code Modal */}
      <Dialog open={showQRModal} onOpenChange={setShowQRModal}>
        <DialogContent className="w-[95vw] max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <QrCode className="h-5 w-5 text-primary" />
              Event Registration QR Code
            </DialogTitle>
            <DialogDescription className="text-sm">
              Share this QR code for easy event registration.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center space-y-4">
            {userProfile?.access_key ? (
              <div id="qr-canvas" className="w-full flex justify-center">
                <QRCodeGenerator
                  eventName={eventName}
                  eventUrl={`${window.location.origin}/join/${userProfile.access_key}`}
                />
              </div>
            ) : (
              <div className="text-muted-foreground text-center p-4">
                Access key not available. Please contact support.
              </div>
            )}

            <div className="flex flex-col gap-3 w-full">
              <Button onClick={handleDownloadQR} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Download QR Code
              </Button>
              <Button variant="outline" onClick={() => setShowQRModal(false)} className="w-full">
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EventQRCode;
