
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCheckIns } from '@/hooks/useCheckIns';
import { useAuth } from '@/contexts/AuthContext';
import { Scan, UserCheck, Loader, Camera, CameraOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Scanner, IDetectedBarcode } from '@yudiel/react-qr-scanner';

type CheckInScannerProps = {
  onScanResult?: (result: string) => void;
};

const CheckInScanner: React.FC<CheckInScannerProps> = ({ onScanResult }) => {
  const [ticketNumber, setTicketNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const { currentUser } = useAuth();
  const { checkInTicket, manualCheckIn } = useCheckIns();
  const { toast } = useToast();

  const handleQRScan = (detectedCodes: IDetectedBarcode[]) => {
    if (!currentUser?.id) {
      toast({
        title: "Authentication Required",
        description: "Please log in to perform check-ins.",
        variant: "destructive",
      });
      return;
    }

    if (detectedCodes.length > 0) {
      const result = detectedCodes[0].rawValue;
      setIsScanning(false);
      
      checkInTicket.mutate({
        qrCodeData: result,
        adminId: currentUser.id,
        method: 'qr_scan',
        notes,
      });

      if (onScanResult) {
        onScanResult(result);
      }
    }
  };

  const handleManualCheckIn = () => {
    if (!currentUser?.id) {
      toast({
        title: "Authentication Required",
        description: "Please log in to perform check-ins.",
        variant: "destructive",
      });
      return;
    }

    if (!ticketNumber.trim()) {
      toast({
        title: "Ticket Number Required",
        description: "Please enter a ticket number.",
        variant: "destructive",
      });
      return;
    }

    manualCheckIn.mutate({
      ticketNumber: ticketNumber.trim(),
      adminId: currentUser.id,
      notes,
    });

    setTicketNumber('');
    setNotes('');
  };

  const handleScanError = (error: Error) => {
    console.error('QR Scan error:', error);
    toast({
      title: "Scan Error",
      description: "Failed to scan QR code. Please try again.",
      variant: "destructive",
    });
  };

  return (
    <div className="space-y-6">
      {/* QR Scanner Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scan className="h-5 w-5" />
            QR Code Scanner
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            {isScanning ? (
              <div className="w-full max-w-md mx-auto">
                <Scanner
                  onScan={handleQRScan}
                  onError={handleScanError}
                  styles={{ container: { width: '100%' } }}
                />
                <Button
                  onClick={() => setIsScanning(false)}
                  variant="outline"
                  className="mt-4"
                >
                  <CameraOff className="h-4 w-4 mr-2" />
                  Stop Scanning
                </Button>
              </div>
            ) : (
              <div>
                <div className="w-64 h-64 mx-auto border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mb-4">
                  <div className="text-center">
                    <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Click to start QR scanner
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Ask attendees to show their ticket QR code
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => setIsScanning(true)}
                  disabled={checkInTicket.isPending}
                  className="mt-2"
                >
                  {checkInTicket.isPending && <Loader className="h-4 w-4 mr-2 animate-spin" />}
                  <Camera className="h-4 w-4 mr-2" />
                  Start QR Scanner
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Manual Check-in Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Manual Check-in
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="ticket-number">Ticket Number</Label>
            <Input
              id="ticket-number"
              value={ticketNumber}
              onChange={(e) => setTicketNumber(e.target.value)}
              placeholder="Enter ticket number (e.g., TKT-20241225-1234)"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any check-in notes..."
              rows={3}
              className="mt-1"
            />
          </div>
          <Button
            onClick={handleManualCheckIn}
            disabled={manualCheckIn.isPending}
            className="w-full"
          >
            {manualCheckIn.isPending && <Loader className="h-4 w-4 mr-2 animate-spin" />}
            Check In Manually
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default CheckInScanner;
