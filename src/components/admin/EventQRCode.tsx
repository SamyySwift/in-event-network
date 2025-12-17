import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { QrCode, Download, Key, HelpCircle } from 'lucide-react';
import QRCodeGenerator from '@/components/admin/QRCodeGenerator';
import AccessCodeRequestDialog from '@/components/admin/AccessCodeRequestDialog';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EventQRCodeProps {
  eventId: string;
  eventName: string;
}

const EventQRCode: React.FC<EventQRCodeProps> = ({
  eventId,
  eventName
}) => {
  const [showQRModal, setShowQRModal] = useState(false);
  const [showAccessCodeRequest, setShowAccessCodeRequest] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [hasValidAccessCode, setHasValidAccessCode] = useState(false);
  const [isValidatingCode, setIsValidatingCode] = useState(false);
  const { currentUser } = useAuth();
  const { toast } = useToast();

  // Persist QR access in localStorage per user and event
  const storageKey = currentUser?.id ? `qr_access:${currentUser.id}:${eventId}` : null;

  // Load persisted access on mount or when user/event changes
  React.useEffect(() => {
    if (!storageKey) return;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved === 'true') {
        setHasValidAccessCode(true);
      }
    } catch (e) {
      console.warn('Unable to read QR access from storage', e);
    }
  }, [storageKey]);

  // Get the event's event_key for QR code generation
  const { data: eventData } = useQuery({
    queryKey: ['event-key', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('event_key')
        .eq('id', eventId)
        .single();
      if (error) {
        console.error('Error fetching event key:', error);
        return null;
      }
      return data;
    },
    enabled: !!eventId
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

  const handleApplyAccessCode = async () => {
    setIsValidatingCode(true);

    // Check if the access code matches the specific code
    if (accessCode.trim() === '#Kconect09099') {
      setHasValidAccessCode(true);
      // Persist access so it remains unlocked after refresh
      try {
        if (storageKey) {
          localStorage.setItem(storageKey, 'true');
        }
      } catch (e) {
        console.warn('Unable to persist QR access for access code', e);
      }
      toast({
        title: 'Access Code Applied',
        description: 'You now have access to generate QR codes for this event!'
      });
    } else {
      toast({
        title: 'Invalid Access Code',
        description: 'The access code you entered is not valid.',
        variant: 'destructive'
      });
    }
    setIsValidatingCode(false);
  };

  return (
    <>
      <div className="flex flex-col gap-2 mt-3 w-full">
        {hasValidAccessCode ? (
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
            {/* Access Code Section */}
            <div className="space-y-3 p-3 rounded-lg bg-muted/30 border border-dashed border-muted-foreground/30">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Key className="h-3 w-3" />
                <span>Enter your access code to generate QR codes</span>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter access code"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  className="text-xs h-8 bg-background/50"
                />
                <Button
                  onClick={handleApplyAccessCode}
                  disabled={!accessCode.trim() || isValidatingCode}
                  size="sm"
                  className="h-8 px-3 text-xs bg-gradient-to-r from-primary to-primary/80"
                >
                  {isValidatingCode ? 'Validating...' : 'Apply'}
                </Button>
              </div>
              
              {/* Get Access Code Button */}
              <Button
                onClick={() => setShowAccessCodeRequest(true)}
                variant="outline"
                size="sm"
                className="w-full h-8 text-xs border-dashed"
              >
                <HelpCircle className="h-3 w-3 mr-2" />
                Get Access Code
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Access Code Request Dialog */}
      <AccessCodeRequestDialog
        isOpen={showAccessCodeRequest}
        onClose={() => setShowAccessCodeRequest(false)}
        eventName={eventName}
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
            {eventData?.event_key ? (
              <div id="qr-canvas" className="w-full flex justify-center">
                <QRCodeGenerator
                  eventName={eventName}
                  eventUrl={`${window.location.origin}/join/${eventData.event_key}`}
                />
              </div>
            ) : (
              <div className="text-muted-foreground text-center p-4">
                Event key not available. Please contact support.
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