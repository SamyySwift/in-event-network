import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useEventJoinFlow } from '@/hooks/useEventJoinFlow';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const JoinEvent = () => {
  const { code, eventKey } = useParams<{ code: string; eventKey: string }>();
  const [searchParams] = useSearchParams();
  const codeFromParam = searchParams.get('code');
  const navigate = useNavigate();
  const { currentUser, isLoading: authLoading } = useAuth();
  const { handleEventJoin, isJoining } = useEventJoinFlow();
  const { toast } = useToast();
  const [joinStatus, setJoinStatus] = useState<'loading' | 'success' | 'error' | 'unauthorized'>('loading');
  const [eventName, setEventName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const accessCode = code || eventKey || codeFromParam;

  useEffect(() => {
    console.log('JoinEvent: Component mounted with accessCode:', accessCode, 'authLoading:', authLoading, 'currentUser:', currentUser?.email);
    
    // Add timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (joinStatus === 'loading') {
        console.error('JoinEvent: Timeout reached, setting error state');
        setJoinStatus('error');
        setErrorMessage('Request timed out. Please try again.');
      }
    }, 10000); // 10 second timeout
    
    if (authLoading) {
      console.log('JoinEvent: Still loading auth state');
      return () => clearTimeout(timeout);
    }

    if (!accessCode) {
      console.error('JoinEvent: No access code provided');
      setJoinStatus('error');
      setErrorMessage('No access code provided');
      clearTimeout(timeout);
      return;
    }

    if (!currentUser) {
      console.log('JoinEvent: User not authenticated, storing event code and redirecting to register');
      sessionStorage.setItem('pendingEventCode', accessCode);
      navigate(`/register?eventCode=${accessCode}&role=attendee`, { replace: true });
      clearTimeout(timeout);
      return;
    }

    // User is authenticated, try to join the event
    if (/^\d{6}$/.test(accessCode)) {
      console.log('JoinEvent: Valid access code, attempting to join event');
      handleEventJoin(accessCode, {
        onSuccess: (data: any) => {
          console.log('JoinEvent: Join event success:', data);
          clearTimeout(timeout);
          setJoinStatus('success');
          setEventName(data?.event_name || 'Event');
          
          // Navigate to attendee dashboard after a short delay
          setTimeout(() => {
            console.log('JoinEvent: Navigating to /attendee after successful join');
            navigate('/attendee', { replace: true });
          }, 2000);
        },
        onError: (error: any) => {
          console.error('JoinEvent: Join event error:', error);
          clearTimeout(timeout);
          setJoinStatus('error');
          setErrorMessage(error?.message || "Failed to join the event. Please try again.");
        },
        showToasts: false, // We handle success message manually
      });
    } else {
      console.error('JoinEvent: Invalid access code format:', accessCode);
      clearTimeout(timeout);
      setJoinStatus('error');
      setErrorMessage('Invalid access code format');
    }

    return () => clearTimeout(timeout);
  }, [currentUser, authLoading, accessCode, handleEventJoin, navigate, joinStatus]);

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
            {/* Show success toast here since we disabled it in the hook */}
            {toast({
              title: "Successfully Joined!",
              description: `You've joined ${eventName}`,
            }) && null}
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