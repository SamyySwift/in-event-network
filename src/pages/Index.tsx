
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useJoinEvent } from "@/hooks/useJoinEvent";
import { useToast } from "@/hooks/use-toast";
import { Loader, QrCode } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { eventKey } = useParams();
  const { joinEvent, isJoining } = useJoinEvent();
  const { toast } = useToast();

  useEffect(() => {
    if (eventKey) {
      // If we have an event key from the URL, try to join the event
      console.log('Attempting to join event with key:', eventKey);
      
      joinEvent(eventKey, {
        onSuccess: (data: any) => {
          console.log('Index: Successfully joined event:', data);
          // Navigate to attendee dashboard
          navigate('/attendee', { replace: true });
        },
        onError: (error: any) => {
          console.error('Failed to join event:', error);
          toast({
            title: "Failed to Join Event",
            description: error?.message || "Could not join the event. Please try scanning the QR code again.",
            variant: "destructive"
          });
          // Redirect to scan page to try again
          navigate('/scan', { replace: true });
        }
      });
    } else {
      // No event key, redirect to landing page
      navigate("/", { replace: true });
    }
  }, [eventKey, joinEvent, navigate, toast]);

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
