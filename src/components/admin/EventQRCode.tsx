
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { QrCode, Download, CreditCard } from 'lucide-react';
import QRCodeGenerator from '@/components/admin/QRCodeGenerator';
import PaymentModal from '@/components/payment/PaymentModal';
import { usePayment } from '@/hooks/usePayment';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface EventQRCodeProps {
  eventId: string;
  eventName: string;
}

const EventQRCode: React.FC<EventQRCodeProps> = ({ eventId, eventName }) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const { isEventPaid, isLoadingPayments } = usePayment();
  const { currentUser } = useAuth();

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

  const isPaid = isEventPaid(eventId);

  if (isLoadingPayments) {
    return (
      <div className="flex items-center justify-center h-20">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-2 mt-3">
        {isPaid ? (
          <Button
            onClick={() => setShowQRModal(true)}
            size="sm"
            className="bg-gradient-to-r from-green-500 to-emerald-400 hover:from-green-600 hover:to-emerald-500 text-white"
          >
            <QrCode className="h-4 w-4 mr-2" />
            Generate QR Code
          </Button>
        ) : (
          <Button
            onClick={() => setShowPaymentModal(true)}
            size="sm"
            className="bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Pay Now (₦30,000)
          </Button>
        )}
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        eventId={eventId}
        eventName={eventName}
        onPaymentSuccess={() => {
          setShowPaymentModal(false);
          // Optionally refresh the page or trigger a re-render
          window.location.reload();
        }}
      />

      {/* QR Code Modal */}
      <Dialog open={showQRModal} onOpenChange={setShowQRModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-primary" />
              Event Registration QR Code
            </DialogTitle>
            <DialogDescription>
              Share this QR code for easy event registration.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center space-y-4">
            {userProfile?.access_key ? (
              <div id="qr-canvas">
                <QRCodeGenerator
                  eventName={eventName}
                  eventUrl={`${window.location.origin}/register?code=${userProfile.access_key}`}
                />
              </div>
            ) : (
              <div className="text-muted-foreground text-center p-4">
                Access key not available. Please contact support.
              </div>
            )}

            <div className="flex gap-3 w-full">
              <Button onClick={handleDownloadQR} className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Download QR Code
              </Button>
              <Button variant="outline" onClick={() => setShowQRModal(false)} className="flex-1">
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
