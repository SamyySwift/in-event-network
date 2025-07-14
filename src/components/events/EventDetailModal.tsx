import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Users, ExternalLink, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface Event {
  id: string;
  name: string;
  description: string | null;
  start_time: string;
  end_time: string;
  location: string | null;
  banner_url: string | null;
  logo_url: string | null;
  website: string | null;
  event_key: string | null;
}

interface EventDetailModalProps {
  event: Event | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  open,
  onOpenChange,
}) => {
  const [attendeeCount, setAttendeeCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (event && open) {
      fetchAttendeeCount();
    }
  }, [event, open]);

  const fetchAttendeeCount = async () => {
    if (!event) return;
    
    setLoading(true);
    try {
      const { count, error } = await supabase
        .from("event_tickets")
        .select("*", { count: "exact", head: true })
        .eq("event_id", event.id)
        .eq("payment_status", "completed");

      if (error) {
        console.error("Error fetching attendee count:", error);
      } else {
        setAttendeeCount(count || 0);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const handleBuyTickets = (eventKey: string | null) => {
    if (eventKey) {
      navigate(`/buy-tickets/${eventKey}`);
      onOpenChange(false);
    } else {
      toast({
        title: "Tickets Not Available",
        description: "Tickets are not available for this event.",
        variant: "destructive",
      });
    }
  };

  if (!event) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-950/95 via-purple-950/95 to-blue-950/95 text-white border border-white/20 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            {event.name}
          </DialogTitle>
        </DialogHeader>

        {/* Event Image */}
        {event.banner_url && (
          <div className="relative aspect-video w-full overflow-hidden rounded-lg -mx-6 -mt-2">
            <img
              src={event.banner_url}
              alt={event.name}
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
        )}

        {/* Event Details */}
        <div className="space-y-6">
          {/* Attendee Count */}
          <div className="flex items-center gap-2 text-white/80">
            <Users className="h-5 w-5 text-cyan-400" />
            <span className="text-lg font-medium">
              {loading ? "Loading..." : `${attendeeCount} attending`}
            </span>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 text-white/80">
              <Calendar className="h-5 w-5 text-cyan-400 flex-shrink-0" />
              <div>
                <p className="font-medium">{formatDate(event.start_time)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-white/80">
              <Clock className="h-5 w-5 text-purple-400 flex-shrink-0" />
              <div>
                <p className="font-medium">
                  {formatTime(event.start_time)} - {formatTime(event.end_time)}
                </p>
              </div>
            </div>
          </div>

          {/* Location */}
          {event.location && (
            <div className="flex items-center gap-3 text-white/80">
              <MapPin className="h-5 w-5 text-green-400 flex-shrink-0" />
              <p className="font-medium">{event.location}</p>
            </div>
          )}

          {/* Description */}
          {event.description && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white">About This Event</h3>
              <p className="text-white/80 leading-relaxed">{event.description}</p>
            </div>
          )}

          {/* Logo */}
          {event.logo_url && (
            <div className="flex justify-center">
              <img
                src={event.logo_url}
                alt={`${event.name} logo`}
                className="w-24 h-24 rounded-lg object-cover"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={() => handleBuyTickets(event.event_key)}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white border-0"
            >
              Buy Tickets
            </Button>
            {event.website && (
              <Button
                variant="outline"
                onClick={() => window.open(event.website!, "_blank")}
                className="flex-1 text-white border-white/40 hover:bg-white/10"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Learn More
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};