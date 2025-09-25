
import { useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useJoinEvent } from "@/hooks/useJoinEvent";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Loader, QrCode } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { eventKey } = useParams();
  const [searchParams] = useSearchParams();
  const { joinEvent, isJoining } = useJoinEvent();
  const { toast } = useToast();
  const { currentUser } = useAuth();

  useEffect(() => {
    // Get event key from URL params or search params
    const accessCode = eventKey || searchParams.get('code');
    
    if (accessCode) {
      // If we have an event key, try to join the event
      console.log('Attempting to join event with key:', accessCode);
      
      joinEvent(accessCode, {
        onSuccess: (data: any) => {
          console.log('Successfully joined event:', data);
          
          // Show success message for event switching
          if (currentUser) {
            toast({
              title: "Event Joined Successfully!",
              description: `Welcome to ${data?.event_name || 'the event'}`,
              variant: "default"
            });
          }
          
          // Navigate to attendee dashboard
          navigate('/attendee/dashboard', { replace: true });
        },
        onError: (error: any) => {
          console.error('Failed to join event:', error);
          
          // If user is not authenticated, redirect to register with the code
          if (!currentUser || error?.message?.includes("not authenticated")) {
            sessionStorage.setItem("pendingEventCode", accessCode);
            navigate(`/register?eventCode=${accessCode}&role=attendee`, { replace: true });
            return;
          }
          
          toast({
            title: "Failed to Join Event",
            description: error?.message || "Could not join the event. Please try scanning the QR code again.",
            variant: "destructive"
          });
          
          // If user is authenticated but join failed, redirect to scan page
          navigate('/scan', { replace: true });
        }
      });
    } else {
      // No event key - handle based on authentication status
      if (currentUser) {
        // Authenticated users without event key go to their role-specific dashboard
        if (currentUser.role === 'host') {
          navigate('/admin', { replace: true });
        } else {
          navigate('/attendee', { replace: true });
        }
      } else {
        // Unauthenticated users go to landing page
        navigate("/", { replace: true });
      }
    }
  }, [eventKey, searchParams, joinEvent, navigate, toast, currentUser]);

  if (isJoining) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">
            {currentUser ? 'Switching Event...' : 'Joining Event...'}
          </h1>
          <p className="text-muted-foreground">
            Please wait while we {currentUser ? 'switch you to the new event' : 'connect you to the event'}.
          </p>
        </div>
      </div>
    );
  }

  return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <QrCode className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Processing...</h1>
          <p className="text-muted-foreground">Please wait while we process your request.</p>
        </div>
      </div>
  );
};

export default Index;
