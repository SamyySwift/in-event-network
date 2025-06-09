
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QRCodeScanner from '@/components/QRCodeScanner';
import { useToast } from '@/hooks/use-toast';
import { useJoinEvent } from '@/hooks/useJoinEvent';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, QrCode, CheckCircle } from 'lucide-react';
import AppLayout from '@/components/layouts/AppLayout';

const ScanQR = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { joinEvent, isJoining } = useJoinEvent();
  const [scanSuccess, setScanSuccess] = useState(false);
  const [eventName, setEventName] = useState('');

  const handleScanSuccess = (decodedText: string) => {
    console.log('QR Code decoded:', decodedText);

    try {
      // Handle different QR code formats
      let accessCode = '';
      let eventId = '';

      // Check if it's a URL with access code parameter
      if (decodedText.includes('code=')) {
        const url = new URL(decodedText);
        accessCode = url.searchParams.get('code') || '';
      }
      // Check if it's just a 6-digit access code
      else if (/^\d{6}$/.test(decodedText.trim())) {
        accessCode = decodedText.trim();
      }
      // Handle connect:// protocol URLs
      else if (decodedText.startsWith('connect://')) {
        const url = new URL(decodedText);
        const pathParts = url.pathname.split('/');
        if (pathParts.length >= 2 && pathParts[1] === 'event') {
          eventId = pathParts[2];
          if (eventId) {
            // Navigate to the join route with the event ID
            navigate(`/join/${eventId}`, { replace: true });
            return;
          }
        }
      }

      if (accessCode && /^\d{6}$/.test(accessCode)) {
        console.log('Extracted access code:', accessCode);
        
        joinEvent(accessCode, {
          onSuccess: (data: any) => {
            console.log('Join event success:', data);
            setScanSuccess(true);
            setEventName(data?.event_name || 'Event');
            
            // Navigate to dashboard after a short delay
            setTimeout(() => {
              navigate('/attendee/dashboard', { replace: true });
            }, 2000);
          },
          onError: (error: any) => {
            console.error('Join event error:', error);
            toast({
              title: "Failed to Join Event",
              description: error?.message || "Could not join the event. Please try again.",
              variant: "destructive"
            });
          }
        });
      } else {
        toast({
          title: "Invalid QR Code",
          description: "This doesn't appear to be a valid Connect event code.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('QR Code parsing error:', error);
      toast({
        title: "Invalid QR Code",
        description: "This doesn't appear to be a valid Connect event code.",
        variant: "destructive"
      });
    }
  };

  const handleScanError = (error: string) => {
    console.error("QR Scanner error:", error);
    if (error.includes('NotAllowedError') || error.includes('Permission denied')) {
      toast({
        title: "Camera Permission Required",
        description: "Please allow camera access to scan QR codes. Check your browser settings and try again.",
        variant: "destructive"
      });
    }
  };

  // Show success state
  if (scanSuccess) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto py-8">
          <Card>
            <CardContent className="py-16 text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-green-700 mb-2">Successfully Joined!</h2>
              <p className="text-muted-foreground mb-4">
                You've joined <span className="font-semibold">{eventName}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Redirecting to your dashboard...
              </p>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto py-8">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(-1)}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Scan QR Code</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Event QR Scanner
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground text-sm">
                Position the QR code within the camera frame to join an event.
              </p>
              
              <QRCodeScanner 
                onScanSuccess={handleScanSuccess} 
                onScanError={handleScanError}
                width="100%"
                height="400px"
              />
              
              {isJoining && (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Joining event...</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Make sure to allow camera permissions when prompted by your browser.
          </p>
        </div>
      </div>
    </AppLayout>
  );
};

export default ScanQR;
