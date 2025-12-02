import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useJoinEvent } from '@/hooks/useJoinEvent';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const JoinEvent = () => {
  const { code } = useParams<{ code: string }>();
  const [searchParams] = useSearchParams();
  const codeFromParam = searchParams.get('code');
  const navigate = useNavigate();
  const { currentUser, isLoading: authLoading } = useAuth();
  const { joinEvent, isJoining } = useJoinEvent();
  const { toast } = useToast();
  const [joinStatus, setJoinStatus] = useState<'loading' | 'success' | 'error' | 'unauthorized'>('loading');
  const [eventName, setEventName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const hasAttemptedJoin = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const accessCode = code || codeFromParam;

  // Timeout fallback - if joining takes too long, show error
  useEffect(() => {
    if (isJoining && !timeoutRef.current) {
      timeoutRef.current = setTimeout(() => {
        setJoinStatus('error');
        setErrorMessage('Request timed out. Please try again.');
        toast({
          title: "Request Timed Out",
          description: "The server took too long to respond. Please try again.",
          variant: "destructive"
        });
      }, 15000); // 15 second timeout
    }
    
    if (!isJoining && timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isJoining, toast]);

  useEffect(() => {
    if (authLoading) return;
    if (hasAttemptedJoin.current) return;

    if (!currentUser) {
      // User not authenticated, redirect to register with the code or event id
      if (accessCode) {
        const trimmedCode = accessCode.trim();
        const isSixDigit = /^\d{6}$/.test(trimmedCode);
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(trimmedCode);
        
        if (isSixDigit) {
          sessionStorage.setItem('pendingEventCode', trimmedCode);
          navigate(`/register?eventCode=${trimmedCode}&role=attendee`, { replace: true });
        } else if (isUuid) {
          sessionStorage.setItem('pendingEventId', trimmedCode);
          navigate(`/register?eventId=${trimmedCode}&role=attendee`, { replace: true });
        } else {
          sessionStorage.setItem('pendingEventCode', trimmedCode);
          navigate(`/register?eventCode=${trimmedCode}&role=attendee`, { replace: true });
        }
      } else {
        setJoinStatus('error');
        setErrorMessage('No access code provided');
      }
      return;
    }

    // User is authenticated, try to join the event
    if (accessCode && /^\d{6}$/.test(accessCode)) {
      hasAttemptedJoin.current = true;
      joinEvent(accessCode, {
        onSuccess: (data: any) => {
          console.log('Join event success:', data);
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
          // Navigate immediately
          navigate('/attendee', { replace: true });
        },
        onError: (error: any) => {
          console.error('Join event error:', error);
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
          setJoinStatus('error');
          setErrorMessage(error?.message || "Failed to join the event. Please try again.");
          
          toast({
            title: "Failed to Join Event",
            description: error?.message || "Could not join the event. Please try again.",
            variant: "destructive"
          });
        }
      });
    } else {
      setJoinStatus('error');
      setErrorMessage('Invalid access code format');
    }
  }, [currentUser, authLoading, accessCode, joinEvent, navigate, toast]);

  if (authLoading || joinStatus === 'loading' || isJoining) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="py-16 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold mb-2">
              {isJoining ? 'Joining Event...' : 'Loading...'}
            </h2>
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