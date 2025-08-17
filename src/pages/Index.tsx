
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useJoinEvent } from "@/hooks/useJoinEvent";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Loader, QrCode } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { eventKey } = useParams();
  const { joinEvent, isJoining } = useJoinEvent();
  const { toast } = useToast();
  const { currentUser, isLoading } = useAuth();
  const [hasAttempted, setHasAttempted] = useState(false);

  useEffect(() => {
    if (hasAttempted || isLoading) return; // Wait for auth to load and prevent multiple attempts

    console.log('Index.tsx: Starting with eventKey:', eventKey);
    console.log('Index.tsx: Auth loading:', isLoading);
    console.log('Index.tsx: Checking localStorage for pendingEventCode...');
    
    // Check for event key from URL params or localStorage
    const accessCode = eventKey || localStorage.getItem('pendingEventCode');
    const recentEventJoin = localStorage.getItem('recentEventJoin');
    
    console.log('Index.tsx: Found accessCode:', accessCode);
    console.log('Index.tsx: Found recentEventJoin:', recentEventJoin);
    console.log('Index.tsx: Current user:', currentUser);
    
    // If user recently joined (within last 10 seconds), just redirect to dashboard
    if (recentEventJoin && currentUser?.role === 'attendee') {
      const joinTime = parseInt(recentEventJoin);
      const timeDiff = Date.now() - joinTime;
      if (timeDiff < 10000) { // 10 seconds
        console.log('Index.tsx: Recent event join detected, redirecting to dashboard');
        navigate('/attendee/dashboard', { replace: true });
        return;
      }
    }
    
    if (accessCode && currentUser) {
      setHasAttempted(true);
      console.log('Index.tsx: Attempting to join event with code:', accessCode);
      
      // Clear stored code to prevent repeat attempts
      if (!eventKey && localStorage.getItem('pendingEventCode')) {
        localStorage.removeItem('pendingEventCode');
      }
      
      joinEvent(accessCode, {
        onSuccess: (data: any) => {
          console.log('Index.tsx: Successfully joined event:', data);
          // Add a small delay to prevent toast conflicts
          setTimeout(() => {
            toast({
              title: "Welcome!",
              description: `Successfully joined ${data?.event_name || 'the event'}!`,
            });
          }, 500);
          // Navigate to attendee dashboard
          navigate('/attendee/dashboard', { replace: true });
        },
        onError: (error: any) => {
          console.error('Index.tsx: Failed to join event:', error);
          setHasAttempted(false); // Allow retry
          setTimeout(() => {
            toast({
              title: "Failed to Join Event",
              description: error?.message || "Could not join the event. Please try scanning the QR code again.",
              variant: "destructive"
            });
          }, 500);
          // Redirect to scan page to try again
          navigate('/scan', { replace: true });
        }
      });
    } else if (currentUser) {
      console.log('Index.tsx: No event code found, redirecting to dashboard');
      // User is authenticated but no event code, redirect based on role
      if (currentUser.role === 'attendee') {
        navigate('/attendee/dashboard', { replace: true });
      } else if (currentUser.role === 'host') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } else {
      console.log('Index.tsx: No user found, redirecting to landing');
      // No user, redirect to landing page
      navigate("/", { replace: true });
    }
  }, [eventKey, joinEvent, navigate, toast, currentUser, hasAttempted, isLoading]);

  // Fallback timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      console.log('Index.tsx: Timeout reached, redirecting to landing');
      if (currentUser?.role === 'attendee') {
        navigate('/attendee/dashboard', { replace: true });
      } else if (currentUser?.role === 'host') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, [currentUser, navigate]);

  if (isJoining) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin text-connect-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Joining Event...</h1>
          <p className="text-gray-600">Please wait while we connect you to the event.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <QrCode className="h-12 w-12 text-connect-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Processing...</h1>
        <p className="text-gray-600">Please wait while we process your request.</p>
      </div>
    </div>
  );
};

export default Index;
