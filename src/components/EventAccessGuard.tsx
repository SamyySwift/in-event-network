
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface EventAccessGuardProps {
  children: React.ReactNode;
  hasAccess: boolean;
  loading?: boolean;
}

const EventAccessGuard: React.FC<EventAccessGuardProps> = ({
  children,
  hasAccess,
  loading = false
}) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto mb-4 p-4 bg-orange-100 rounded-full w-fit">
              <Lock className="h-8 w-8 text-orange-600" />
            </div>
            <CardTitle className="text-2xl">Event Access Required</CardTitle>
            <CardDescription className="text-lg">
              You need to scan the event QR code to access this feature
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              To participate in event activities like Q&A, networking, and viewing the schedule, 
              you must first join the event by scanning the QR code provided at the venue.
            </p>
            <Button 
              onClick={() => navigate('/scan')} 
              className="bg-connect-600 hover:bg-connect-700"
              size="lg"
            >
              <QrCode className="h-5 w-5 mr-2" />
              Scan QR Code to Join Event
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

export default EventAccessGuard;
