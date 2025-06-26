
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useJoinEvent } from '@/hooks/useJoinEvent';
import { useAuth } from '@/contexts/AuthContext';
import { Scan, Users, UserCheck, Loader } from 'lucide-react';
import CheckInScanner from '@/components/admin/CheckInScanner';
import { Scanner, IDetectedBarcode } from '@yudiel/react-qr-scanner';

interface QRCodeScannerProps {
  onScanSuccess?: (decodedText: string) => void;
  onScanError?: (error: string) => void;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ onScanSuccess, onScanError }) => {
  const [accessCode, setAccessCode] = useState('');
  const [activeTab, setActiveTab] = useState('join');
  const [isScanning, setIsScanning] = useState(false);
  const { currentUser } = useAuth();
  const { joinEvent, isJoining } = useJoinEvent();

  // Determine if user can perform check-ins (admin/host role)
  const canCheckIn = currentUser?.role === 'host';

  useEffect(() => {
    // Default to join tab for attendees, check-in tab for admins
    if (canCheckIn) {
      setActiveTab('checkin');
    }
  }, [canCheckIn]);

  const handleJoinEvent = () => {
    if (accessCode.trim()) {
      joinEvent(accessCode.trim());
      setAccessCode('');
    }
  };

  const handleScanResult = (result: string) => {
    console.log('QR Scan result:', result);
    if (onScanSuccess) {
      onScanSuccess(result);
    }
    // Handle different QR code types here
    if (result.startsWith('ticket:')) {
      // This is a ticket QR code - handled by CheckInScanner
      return;
    } else if (result.length === 6 && /^\d+$/.test(result)) {
      // This looks like an access code
      setAccessCode(result);
      setActiveTab('join');
    } else {
      // This is an access code
      setAccessCode(result);
      handleJoinEvent();
    }
  };

  const handleScanErrorInternal = (error: unknown) => {
    console.error('QR Scan error:', error);
    if (onScanError) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      onScanError(errorMessage);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scan className="h-6 w-6" />
            QR Code Scanner
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="join" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Join Event
              </TabsTrigger>
              <TabsTrigger 
                value="checkin" 
                className="flex items-center gap-2"
                disabled={!canCheckIn}
              >
                <UserCheck className="h-4 w-4" />
                Check-ins
                {!canCheckIn && <Badge variant="secondary" className="ml-2">Admin Only</Badge>}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="join" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Join an Event</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-6">
                    {isScanning ? (
                      <div className="w-full max-w-md mx-auto">
                        <Scanner
                          onScan={(detectedCodes) => {
                            setIsScanning(false);
                            if (detectedCodes.length > 0) {
                              handleScanResult(detectedCodes[0].rawValue);
                            }
                          }}
                          onError={(error) => handleScanErrorInternal(error)}
                          styles={{ container: { width: '100%' } }}
                        />
                        <Button
                          onClick={() => setIsScanning(false)}
                          variant="outline"
                          className="mt-4"
                        >
                          Stop Scanning
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <div className="w-64 h-64 mx-auto border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-between mb-4">
                          <div className="text-center">
                            <Scan className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">
                              Click to scan QR code
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Or enter access code manually below
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={() => setIsScanning(true)}
                          className="mb-4"
                        >
                          <Scan className="h-4 w-4 mr-2" />
                          Start QR Scanner
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Input
                      value={accessCode}
                      onChange={(e) => setAccessCode(e.target.value)}
                      placeholder="Enter 6-digit access code"
                      maxLength={6}
                      className="text-center text-lg font-mono"
                    />
                    <Button 
                      onClick={handleJoinEvent}
                      disabled={isJoining || accessCode.length !== 6}
                      className="w-full"
                    >
                      {isJoining && <Loader className="h-4 w-4 mr-2 animate-spin" />}
                      Join Event
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="checkin" className="space-y-4">
              {canCheckIn ? (
                <CheckInScanner onScanResult={handleScanResult} />
              ) : (
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center py-8">
                      <UserCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        Check-in functionality is only available for event administrators.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default QRCodeScanner;
