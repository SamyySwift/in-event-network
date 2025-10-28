import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useJoinEvent } from '@/hooks/useJoinEvent';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import EventInfoCard from '@/components/attendee/EventInfoCard';
import { useEventByAccessCode } from '@/hooks/useEventByAccessCode';

const JoinEvent = () => {
  const { code } = useParams<{ code: string }>();
  const [searchParams] = useSearchParams();
  const codeFromParam = searchParams.get('code');
  const navigate = useNavigate();
  const { currentUser, isLoading: authLoading } = useAuth();
  const { joinEvent, isJoining } = useJoinEvent();
  const { toast } = useToast();
  const [joinStatus, setJoinStatus] = useState<'loading' | 'preview' | 'joining' | 'success' | 'error'>('loading');
  const [eventName, setEventName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const accessCode = code || codeFromParam;
  
  // Fetch event details
  const { data: eventData, isLoading: isLoadingEvent } = useEventByAccessCode(accessCode);

  useEffect(() => {
    if (authLoading) return;

    if (!currentUser) {
      // User not authenticated, redirect to register with the code or event id
      if (accessCode) {
        const trimmedCode = accessCode.trim();
        const isSixDigit = /^\d{6}$/.test(trimmedCode);
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(trimmedCode);
        
        if (isSixDigit) {
          // 6-digit event key
          sessionStorage.setItem('pendingEventCode', trimmedCode);
          navigate(`/register?eventCode=${trimmedCode}&role=attendee`, { replace: true });
        } else if (isUuid) {
          // UUID event ID
          sessionStorage.setItem('pendingEventId', trimmedCode);
          navigate(`/register?eventId=${trimmedCode}&role=attendee`, { replace: true });
        } else {
          // Host access key
          sessionStorage.setItem('pendingEventCode', trimmedCode);
          navigate(`/register?eventCode=${trimmedCode}&role=attendee`, { replace: true });
        }
      } else {
        setJoinStatus('error');
        setErrorMessage('No access code provided');
      }
      return;
    }

    // User is authenticated and event data is loaded, show preview
    if (currentUser && eventData && joinStatus === 'loading') {
      setJoinStatus('preview');
    }
  }, [currentUser, authLoading, accessCode, eventData, joinStatus, navigate]);
  
  const handleConfirmJoin = () => {
    if (!accessCode || !/^\d{6}$/.test(accessCode)) {
      setJoinStatus('error');
      setErrorMessage('Invalid access code format');
      return;
    }
    
    setJoinStatus('joining');
    
    joinEvent(accessCode, {
      onSuccess: (data: any) => {
        console.log('Join event success:', data);
        setJoinStatus('success');
        setEventName(data?.event_name || 'Event');

        // Navigate to attendee dashboard after a short delay
        setTimeout(() => {
          navigate('/attendee', { replace: true });
        }, 2000);
      },
      onError: (error: any) => {
        console.error('Join event error:', error);
        setJoinStatus('error');
        setErrorMessage(error?.message || "Failed to join the event. Please try again.");
        
        toast({
          title: "Failed to Join Event",
          description: error?.message || "Could not join the event. Please try again.",
          variant: "destructive"
        });
      }
    });
  };

  if (authLoading || isLoadingEvent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="py-16 text-center">
            <Loader className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              {authLoading ? 'Checking authentication...' : 'Loading event details...'}
            </h2>
            <p className="text-muted-foreground">
              Please wait while we process your request.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Show event preview before joining
  if (joinStatus === 'preview' && eventData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Join Event</h2>
            <p className="text-muted-foreground">Review the event details below</p>
          </div>
          
          <EventInfoCard
            eventName={eventData.name}
            startTime={eventData.start_time}
            endTime={eventData.end_time}
            location={eventData.location}
            hostName={eventData.host_name}
            description={eventData.description}
          />
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => navigate('/scan')}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmJoin}
              className="flex-1"
              disabled={isJoining}
            >
              {isJoining ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Joining...
                </>
              ) : (
                'Join Event'
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  // Joining state
  if (joinStatus === 'joining' || isJoining) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="py-16 text-center">
            <Loader className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Joining Event...</h2>
            <p className="text-muted-foreground">
              Please wait while we process your request.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (joinStatus === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="py-16 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-700 mb-2">Welcome!</h2>
            <p className="text-muted-foreground mb-4">
              You've successfully joined <span className="font-semibold">{eventName}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Redirecting to your dashboard...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (joinStatus === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="py-16 text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-700 mb-2">Unable to Join Event</h2>
            <p className="text-muted-foreground mb-6">
              {errorMessage}
            </p>
            <div className="space-y-2">
              <Button 
                onClick={() => navigate('/attendee')} 
                className="w-full"
              >
                Go to Dashboard
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/scan')} 
                className="w-full"
              >
                Scan Another QR Code
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};

export default JoinEvent;