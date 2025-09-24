import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { QrCode, Download } from 'lucide-react';
import QRCodeGenerator from '@/components/admin/QRCodeGenerator';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface EventQRCodeProps {
  eventId: string;
  eventName: string;
}

const EventQRCode: React.FC<EventQRCodeProps> = ({
  eventId,
  eventName
}) => {
  const [showQRModal, setShowQRModal] = useState(false);
  const { currentUser } = useAuth();

  // Get the current user's profile data including access_key
  const { data: userProfile, isLoading } = useQuery({
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
    enabled: !!currentUser?.id
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-16 mt-3">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-2 mt-3 w-full">
        <Button 
          onClick={() => setShowQRModal(true)} 
          size="sm" 
          className="w-full min-h-[40px] bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white text-xs sm:text-sm px-3 py-2"
        >
          <QrCode className="h-4 w-4 mr-2 flex-shrink-0" />
          <span className="truncate">Generate Event QR Code</span>
        </Button>
      </div>

      {/* QR Code Modal */}
      <Dialog open={showQRModal} onOpenChange={setShowQRModal}>
        <DialogContent className="w-[95vw] max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <QrCode className="h-5 w-5 text-primary" />
              Event Registration QR Code
            </DialogTitle>
            <DialogDescription className="text-sm">
              Share this QR code for attendees to join your event.
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