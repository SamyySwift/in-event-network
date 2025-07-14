
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, MapPin, Users, Clock, ExternalLink, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { EventDetailModal } from "@/components/events/EventDetailModal";

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

const Discovery = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>("Abuja");
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [attendeeCounts, setAttendeeCounts] = useState<Record<string, number>>({});
  const [countLoading, setCountLoading] = useState<Record<string, boolean>>({});
  
  // Nigerian states
  const nigerianStates = [
    "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", 
    "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "Gombe", "Imo", "Jigawa", 
    "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", 
    "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
    "Abuja" // FCT
  ];
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    filterEventsByLocation();
  }, [events, selectedLocation]);

  useEffect(() => {
    if (events.length > 0) {
      fetchAttendeeCounts();
    }
  }, [events]);

  // Refresh attendee counts when modal closes
  useEffect(() => {
    if (!modalOpen && selectedEvent) {
      refreshAttendeeCount(selectedEvent.id);
    }
  }, [modalOpen, selectedEvent]);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .gt("end_time", new Date().toISOString())
        .order("start_time", { ascending: true });

      if (error) {
        console.error("Error fetching events:", error);
        toast({
          title: "Error",
          description: "Failed to load events. Please try again.",
          variant: "destructive",
        });
      } else {
        setEvents(data || []);
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterEventsByLocation = () => {
    // Only show events that have at least one image (banner_url or logo_url)
    const eventsWithImages = events.filter(event => 
      event.banner_url || event.logo_url
    );
    
    if (selectedLocation === "All States") {
      setFilteredEvents(eventsWithImages);
    } else {
      setFilteredEvents(eventsWithImages.filter(event => 
        event.location?.toLowerCase().includes(selectedLocation.toLowerCase())
      ));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const fetchAttendeeCounts = async () => {
    const counts: Record<string, number> = {};
    const loadingStates: Record<string, boolean> = {};
    
    for (const event of events) {
      loadingStates[event.id] = true;
    }
    setCountLoading(loadingStates);
    
    for (const event of events) {
      try {
        const { count, error } = await supabase
          .from("event_tickets")
          .select("*", { count: "exact", head: true })
          .eq("event_id", event.id)
          .eq("payment_status", "completed");

        if (!error) {
          counts[event.id] = count || 0;
        }
        loadingStates[event.id] = false;
      } catch (error) {
        console.error("Error fetching attendee count for event:", event.id, error);
        loadingStates[event.id] = false;
      }
    }
    
    setAttendeeCounts(counts);
    setCountLoading(loadingStates);
  };

  const refreshAttendeeCount = async (eventId: string) => {
    setCountLoading(prev => ({ ...prev, [eventId]: true }));
    
    try {
      const { count, error } = await supabase
        .from("event_tickets")
        .select("*", { count: "exact", head: true })
        .eq("event_id", eventId)
        .eq("payment_status", "completed");

      if (!error) {
        setAttendeeCounts(prev => ({ ...prev, [eventId]: count || 0 }));
      }
    } catch (error) {
      console.error("Error refreshing attendee count for event:", eventId, error);
    } finally {
      setCountLoading(prev => ({ ...prev, [eventId]: false }));
    }
  };

  const handleAttendeeCountUpdate = (eventId: string, count: number) => {
    setAttendeeCounts(prev => ({ ...prev, [eventId]: count }));
  };

  const handleBuyTickets = (eventKey: string | null) => {
    if (eventKey) {
      navigate(`/buy-tickets/${eventKey}`);
    } else {
      toast({
        title: "Tickets Not Available",
        description: "Tickets are not available for this event.",
        variant: "destructive",
      });
    }
  };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setModalOpen(true);
  };

  const handleModalClose = (open: boolean) => {
    setModalOpen(open);
    if (!open && selectedEvent) {
      // Refresh the attendee count when the modal closes
      refreshAttendeeCount(selectedEvent.id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-blue-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-white/60">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-blue-950 text-white">
      {/* Header */}
      <header className="relative z-50 bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img src="/logo.png" alt="Kconect Logo" className="h-8 w-auto" />
            <span className="ml-2 font-semibold text-2xl bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              Kconect
            </span>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="ghost"
              className="text-white/80 hover:text-white border border-white/20 hover:bg-white/10"
              onClick={() => navigate("/")}
            >
              Back to Home
            </Button>
            <Button
              variant="ghost"
              className="text-white/80 hover:text-white border border-white/20 hover:bg-white/10"
              onClick={() => navigate("/login")}
            >
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              Discover Events
            </span>
          </h1>
          <p className="text-xl text-white/60 max-w-3xl mx-auto mb-8">
            Find and join amazing events happening around you. Connect with like-minded people and expand your network.
          </p>
          
          {/* Filter Section */}
          <div className="flex justify-center items-center gap-4 max-w-md mx-auto">
            <Filter className="h-5 w-5 text-cyan-400" />
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger className="bg-black/40 border-white/20 text-white">
                <SelectValue placeholder="Filter by state" />
              </SelectTrigger>
              <SelectContent className="bg-black/90 border-white/20">
                <SelectItem value="All States" className="text-white">All States</SelectItem>
                {nigerianStates.map((state) => (
                  <SelectItem key={state} value={state} className="text-white">
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-white/30 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-white/80 mb-2">
              {events.length === 0 ? "No Events Available" : "No Events Found"}
            </h3>
            <p className="text-white/60">
              {events.length === 0 ? "Check back later for upcoming events." : `Try selecting a different state or "All States".`}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <Card 
                key={event.id} 
                className="bg-black/40 backdrop-blur-xl border border-white/20 hover:border-white/40 transition-all duration-300 transform hover:scale-105 cursor-pointer"
                onClick={() => handleEventClick(event)}
              >
                {event.banner_url && (
                  <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                    <img
                      src={event.banner_url}
                      alt={event.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-white text-lg mb-2 line-clamp-2">
                        {event.name}
                      </CardTitle>
                      {event.description && (
                        <CardDescription className="text-white/60 line-clamp-3">
                          {event.description}
                        </CardDescription>
                      )}
                    </div>
                    {event.logo_url && (
                      <img
                        src={event.logo_url}
                        alt={`${event.name} logo`}
                        className="w-12 h-12 rounded-lg object-cover ml-3 flex-shrink-0"
                      />
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-white/80">
                      <Calendar className="h-4 w-4 mr-2 text-cyan-400" />
                      <span>{formatDate(event.start_time)}</span>
                    </div>
                    <div className="flex items-center text-sm text-white/80">
                      <Clock className="h-4 w-4 mr-2 text-purple-400" />
                      <span>
                        {formatTime(event.start_time)} - {formatTime(event.end_time)}
                      </span>
                    </div>
                    {event.location && (
                      <div className="flex items-center text-sm text-white/80">
                        <MapPin className="h-4 w-4 mr-2 text-green-400" />
                        <span className="line-clamp-1">{event.location}</span>
                      </div>
                    )}
                    {/* Attendee Count with improved accuracy */}
                    <div className="flex items-center text-sm text-white/80">
                      <Users className="h-4 w-4 mr-2 text-yellow-400" />
                      <span>
                        {countLoading[event.id] ? "Loading..." : `${attendeeCounts[event.id] || 0} attending`}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 pt-4">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBuyTickets(event.event_key);
                      }}
                      className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/50 hover:border-white/70 backdrop-blur-sm"
                    >
                      Buy Tickets
                    </Button>
                    {event.website && (
                      <Button
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(event.website!, "_blank");
                        }}
                        className="w-full text-white/80 hover:text-white hover:bg-white/10"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Learn More
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Event Detail Modal with improved attendance updates */}
        <EventDetailModal
          event={selectedEvent}
          open={modalOpen}
          onOpenChange={handleModalClose}
          onAttendeeCountUpdate={handleAttendeeCountUpdate}
        />
      </main>
    </div>
  );
};

export default Discovery;
