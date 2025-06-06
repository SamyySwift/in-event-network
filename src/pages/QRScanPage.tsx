
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layouts/AppLayout';
import QRCodeScanner from '@/components/QRCodeScanner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, ArrowLeft, Loader } from 'lucide-react';
import { useEventParticipation } from '@/hooks/useEventParticipation';
import { useEvents } from '@/hooks/useEvents';

const QRScanPage = () => {
  const navigate = useNavigate();
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [scanning, setScanning] = useState(true);
  const [processing, setProcessing] = useState(false);
  const { joinEvent } = useEventParticipation();
  const { events } = useEvents();

  const handleScanSuccess = async (decodedText: string) => {
    setScanning(false);
    setProcessing(true);
    setScanResult(decodedText);

    try {
      // Parse the QR code to extract event ID
      // Assuming QR code format: "event:{eventId}" or just the event ID
      let eventId = decodedText;
      if (decodedText.startsWith('event:')) {
        eventId = decodedText.replace('event:', '');
      }

      // Verify event exists
      const event = events.find(e => e.id === eventId);
      if (!event) {
        throw new Error('Invalid event QR code');
      }

      // Join the event
      const success = await joinEvent(eventId);
      
      if (success) {
        setTimeout(() => {
          navigate('/attendee');
        }, 2000);
      }
    } catch (error) {
      console.error('Error processing QR code:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleScanError = (error: string) => {
    console.log('QR scan error:', error);
  };

  const resetScanner = () => {
    setScanResult(null);
    setScanning(true);
    setProcessing(false);
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <h1 className="text-3xl font-bold">Join Event</h1>
          <p className="text-muted-foreground mt-2">
            Scan the QR code provided at the event venue to get access to all event features
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Scan Event QR Code</CardTitle>
            <CardDescription>
              Point your camera at the QR code to join the event
            </CardDescription>
          </CardHeader>
          <CardContent>
            {scanning && !scanResult && (
              <QRCodeScanner
                onScanSuccess={handleScanSuccess}
                onScanError={handleScanError}
                height="400px"
              />
            )}

            {processing && (
              <div className="text-center py-8">
                <Loader className="h-12 w-12 animate-spin mx-auto mb-4 text-connect-600" />
                <h3 className="text-lg font-semibold mb-2">Processing...</h3>
                <p className="text-muted-foreground">Joining event, please wait...</p>
              </div>
            )}

            {scanResult && !processing && (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
                <h3 className="text-lg font-semibold mb-2">Successfully Joined!</h3>
                <p className="text-muted-foreground mb-4">
                  You now have access to all event features. Redirecting to dashboard...
                </p>
              </div>
            )}

            {!scanning && !processing && !scanResult && (
              <div className="text-center py-8">
                <XCircle className="h-12 w-12 mx-auto mb-4 text-red-600" />
                <h3 className="text-lg font-semibold mb-2">Scan Failed</h3>
                <p className="text-muted-foreground mb-4">
                  Unable to process the QR code. Please try again.
                </p>
                <Button onClick={resetScanner}>
                  Try Again
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default QRScanPage;
