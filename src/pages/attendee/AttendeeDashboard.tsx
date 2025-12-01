import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Users,
  MapPin,
  MessageSquare,
  Clock,
  Star,
  BookOpen,
  Wifi,
  WifiOff,
  ChevronRight,
  Zap,
  TrendingUp,
  Eye,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useDashboard } from "@/hooks/useDashboard";
import { useAttendeeEvents } from "@/hooks/useAttendeeEvents";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AttendeeEventProvider,
  useAttendeeEventContext,
} from "@/contexts/AttendeeEventContext";
import AttendeeRouteGuard from "@/components/attendee/AttendeeRouteGuard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNetworking } from "@/hooks/useNetworking";
import { UserPlus } from "lucide-react";
import { EventCard } from "@/components/attendee/EventCard";
import { ConnectionNotificationDropdown } from "@/components/attendee/ConnectionNotificationDropdown";
import { useAttendeeFacilities } from "@/hooks/useAttendeeFacilities";
import { HighlightsSection } from "@/components/attendee/HighlightsSection";
import * as LucideIcons from "lucide-react";
import FacilityIcon from "@/pages/admin/components/FacilityIcon";

import { ProfileCompletionPopup } from "@/components/attendee/ProfileCompletionPopup";
import { AnnouncementPopup } from "@/components/attendee/AnnouncementPopup";
import { useAttendeePolls, Poll as AttendeePoll } from "@/hooks/useAttendeePolls";
import { PollPopup } from "@/components/attendee/PollPopup";
import { useAdvertisements } from "@/hooks/useAdvertisements";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { FloatingAIAssistant } from "@/components/attendee/FloatingAIAssistant";

// Advertisement Carousel Component
const AdvertisementCarousel = ({ advertisements }: { advertisements: any[] }) => {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const autoplayPlugin = React.useRef(
    Autoplay({ 
      delay: 5000, 
      stopOnInteraction: true,
      stopOnMouseEnter: true,
    })
  );

  React.useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });

    // Resume autoplay after 3 seconds of no interaction
    api.on("pointerUp", () => {
      setTimeout(() => {
        autoplayPlugin.current.play();
      }, 3000);
    });
  }, [api]);

  const scrollTo = React.useCallback(
    (index: number) => {
      api?.scrollTo(index);
    },
    [api]
  );

  return (
    <div className="relative">
      <Carousel
        setApi={setApi}
        opts={{
          align: "start",
          loop: true,
        }}
        plugins={[autoplayPlugin.current]}
        className="w-full"
      >
        <CarouselContent>
          {advertisements.map((ad, index) => (
            <CarouselItem key={index}>
              <Card 
                className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden relative z-10 group cursor-pointer h-[400px]"
                onClick={() => ad.link_url && window.open(ad.link_url, '_blank')}
              >
                {ad.image_url && (
                  <div className="relative h-full overflow-hidden">
                    {/* Image */}
                    <img
                      src={ad.image_url}
                      alt={ad.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    
                    {/* Dark Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20"></div>
                    
                    {/* Content Overlay */}
                    <div className="absolute inset-0 flex flex-col justify-end p-6">
                      {/* Bottom Content */}
                      <div className="space-y-3">
                        <div>
                          <h3 className="text-2xl sm:text-3xl font-bold text-white leading-tight mb-2">
                            {ad.title}
                          </h3>
                          {ad.description && (
                            <p className="text-white/90 text-sm line-clamp-2">
                              {ad.description}
                            </p>
                          )}
                        </div>
                        {ad.sponsor_name && (
                          <p className="text-white/80 text-sm font-medium">
                            By {ad.sponsor_name}
                          </p>
                        )}
                        {ad.link_url && (
                          <Button
                            variant="secondary"
                            size="sm"
                            className="bg-white/90 text-gray-900 hover:bg-white font-semibold"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(ad.link_url, '_blank');
                            }}
                          >
                            Learn More
                            <ChevronRight className="ml-1 h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Carousel Indicators */}
      {advertisements.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {advertisements.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === current
                  ? 'w-8 bg-purple-600'
                  : 'w-2 bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

function AttendeeDashboardContent() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { hasJoinedEvent, isLoading: contextLoading, currentEventId } =
    useAttendeeEventContext();
  const { dashboardData, isLoading, error } = useDashboard();
  const { events: allEvents } = useAttendeeEvents();
  const { facilities } = useAttendeeFacilities();
  const { advertisements } = useAdvertisements(currentEventId || undefined);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [expandedAnnouncements, setExpandedAnnouncements] = useState<
    Set<string>
  >(new Set());
  const [popupAnnouncement, setPopupAnnouncement] = useState<any | null>(null);

  // Polls: fetch data and build queue
  const { polls: attendeePolls, userVotes, submitVote } = useAttendeePolls();

  const [pollQueue, setPollQueue] = React.useState<AttendeePoll[]>([]);
  const [currentPollIndex, setCurrentPollIndex] = React.useState(0);
  const currentPoll = pollQueue[currentPollIndex] || null;

  const hasUserVotedForPoll = React.useCallback(
    (pollId: string) => userVotes.some((v) => v.poll_id === pollId),
    [userVotes]
  );

  const isPollDismissed = React.useCallback(
    (pollId: string) => localStorage.getItem(`poll_dismissed_${pollId}`) === "true",
    []
  );

  const dismissPoll = React.useCallback((pollId: string) => {
    localStorage.setItem(`poll_dismissed_${pollId}`, "true");
  }, []);

  const advancePollQueue = React.useCallback(() => {
    setCurrentPollIndex((prev) => {
      const next = prev + 1;
      if (next >= pollQueue.length) {
        setPollQueue([]);
        return 0;
      }
      return next;
    });
  }, [pollQueue.length]);

  // Rebuild queue when polls or votes change
  React.useEffect(() => {
    if (!attendeePolls || attendeePolls.length === 0) {
      setPollQueue([]);
      setCurrentPollIndex(0);
      return;
    }

    const active = attendeePolls.filter((p) => p.is_active);

    const notDone = active.filter((p) => {
      const voted = hasUserVotedForPoll(p.id);
      const dismissed = isPollDismissed(p.id);
      if (p.require_submission) {
        return !voted; // required polls must be answered
      }
      return !voted && !dismissed; // optional: allow dismissed to hide
    });

    notDone.sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    setPollQueue(notDone);
    setCurrentPollIndex(0);
  }, [attendeePolls, hasUserVotedForPoll, isPollDismissed]);

  // Memoize profile completion check to avoid unnecessary recalculation
  const shouldShowProfilePopup = useMemo(() => {
    if (!currentUser || !hasJoinedEvent) return false;

    const neverShow = localStorage.getItem("profileReminderNeverShow");
    if (neverShow === "true") return false;

    return (
      !currentUser.photoUrl ||
      !currentUser.bio ||
      !currentUser.niche ||
      !currentUser.links?.linkedin ||
      !currentUser.links?.twitter
    );
  }, [currentUser, hasJoinedEvent]);

  // Reduced delay for profile popup to improve perceived performance
  useEffect(() => {
    if (shouldShowProfilePopup) {
      const timer = setTimeout(() => setShowProfilePopup(true), 500);
      return () => clearTimeout(timer);
    }
  }, [shouldShowProfilePopup]);

  // Helper: check if compulsory announcement is resolved
  // isAnnouncementResolved helper
  const isAnnouncementResolved = useMemo(() => {
    return (a: any): boolean => {
      if (!a?.require_submission) return false;
  
      const hasVendorForm = !!a.vendor_form_id;
      const hasAnySocialLink = !!(
        (a.twitter_link && a.twitter_link.trim()) ||
        (a.instagram_link && a.instagram_link.trim()) ||
        (a.facebook_link && a.facebook_link.trim()) ||
        (a.tiktok_link && a.tiktok_link.trim()) ||
        (a.website_link && a.website_link.trim()) ||
        (a.whatsapp_link && a.whatsapp_link.trim())
      );
  
      if (hasVendorForm) {
        return localStorage.getItem(`vendor_form_submitted_${a.vendor_form_id}`) === 'true';
      }
  
      if (hasAnySocialLink) {
        return localStorage.getItem(`announcementLinkClicked_${a.id}`) === 'true';
      }
  
      // Fallback: acknowledgement
      return localStorage.getItem(`announcementAcknowledged_${a.id}`) === 'true';
    };
  }, []);

  // Show announcement popup for newest undismissed/unresolved announcement
  useEffect(() => {
    if (!dashboardData?.recentAnnouncements) return;

    const candidates = dashboardData.recentAnnouncements.filter((a: any) => {
      if (a.require_submission) {
        // Compulsory: show until resolved
        return !isAnnouncementResolved(a);
      }
      // Optional: respect "do not show again"
      return !localStorage.getItem(`announcementDismissed_${a.id}`);
    });

    if (candidates.length > 0) {
      candidates.sort(
        (a: any, b: any) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setPopupAnnouncement(candidates[0]);
    } else {
      setPopupAnnouncement(null);
    }
  }, [dashboardData?.recentAnnouncements, isAnnouncementResolved]);

  // Non-compulsory: "Do not show again"
  const handleDismissAnnouncement = (announcementId?: string) => {
    if (!announcementId) return;
    localStorage.setItem(`announcementDismissed_${announcementId}`, 'true');
    setPopupAnnouncement(null);
  };

  // Compulsory acknowledgement
  const handleAcknowledgeAnnouncement = (announcementId?: string) => {
    if (!announcementId) return;
    localStorage.setItem(`announcementAcknowledged_${announcementId}`, 'true');
    setPopupAnnouncement(null);
  };

  // Memoize date formatting functions to avoid recreation on every render
  const formatDate = useMemo(
    () => (dateString: string) => {
      return new Date(dateString).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    },
    []
  );

  const formatTime = useMemo(
    () => (dateString: string) => {
      return new Date(dateString).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      });
    },
    []
  );

  const toggleAnnouncementExpanded = (announcementId: string) => {
    setExpandedAnnouncements((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(announcementId)) {
        newSet.delete(announcementId);
      } else {
        newSet.add(announcementId);
      }
      return newSet;
    });
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    return content.length > maxLength
      ? content.substring(0, maxLength) + "..."
      : content;
  };

  // Show loading state while checking event context
  if (contextLoading || isLoading) {
    return (
      <div className="animate-fade-in max-w-7xl mx-auto p-6 pt-20 md:pt-6 pb-20 overflow-y-auto scroll-smooth">
        <div className="mb-8">
          <Skeleton className="h-12 w-80 mb-4" />
          <Skeleton className="h-6 w-64" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Skeleton className="h-64 w-full" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="animate-fade-in max-w-7xl mx-auto p-6 pt-20 md:pt-6 pb-20 overflow-y-auto scroll-smooth">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <WifiOff className="h-16 w-16 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-semibold mb-3 text-gray-900">
              Connection Error
            </h3>
            <p className="text-gray-500 mb-4">Unable to load dashboard data</p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              Retry Connection
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show message if user hasn't joined any event
  if (!hasJoinedEvent || !dashboardData) {
    return (
      <div className="animate-fade-in max-w-7xl mx-auto p-6 pt-20 md:pt-6 pb-20 overflow-y-auto scroll-smooth">
        {/* Hero Section */}
        <div className="mb-8 relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-8 sm:p-12 text-white">
          <div className="absolute inset-0 bg-black/20 z-0"></div>
          <div className="relative z-10 text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="h-10 w-10" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              Welcome to Kconect
            </h1>
            <p className="text-lg sm:text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Join amazing events, connect with people, and create memorable
              experiences
            </p>
            <Button
              onClick={() => navigate("/scan")}
              size="lg"
              className="bg-white/20 hover:bg-white/30 border-2 border-white/30 backdrop-blur-sm text-white font-semibold px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-lg w-full sm:w-auto"
            >
              <Zap className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              <span className="truncate">Scan QR Code to Join Event</span>
            </Button>
          </div>
          <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full z-0"></div>
          <div className="absolute -top-16 -left-16 w-40 h-40 bg-white/5 rounded-full z-0"></div>
        </div>
      </div>
    );
  }

  const {
    currentEvent,
    upcomingEvents,
    nextSession,
    upcomingSessions,
    recentAnnouncements,
    suggestedConnections,
  } = dashboardData;

  return (
    <>
      <div className="animate-fade-in max-w-7xl mx-auto p-6 pt-4 md:pt-6 pb-20 overflow-y-auto scroll-smooth">
        {/* Hero Header */}
        <div className="mb-8 relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-4 sm:p-6 text-white z-10">
          <div className="absolute inset-0 bg-black/20 z-0"></div>
          <div className="relative z-20">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium uppercase tracking-wider opacity-90">
                    Live Dashboard
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-1">
                  Welcome back, {currentUser?.name?.split(" ")[0]}!
                </h1>
                <p className="text-sm sm:text-base opacity-90">
                  Your event experience, updated in real-time
                </p>
              </div>
              <div className="flex gap-3">
                <ConnectionNotificationDropdown />
                <Button
                  onClick={() => navigate("/scan")}
                  className="bg-white/20 hover:bg-white/30 border border-white/30 backdrop-blur-sm w-full sm:w-auto z-10"
                >
                  <Zap className="mr-2 h-4 w-4" />
                  <span className="truncate">Scan New Event</span>
                </Button>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-white/10 rounded-full z-0"></div>
          <div className="absolute -top-8 -left-8 w-24 h-24 bg-white/5 rounded-full z-0"></div>
        </div>

        {/* Advertisements Section with Auto-Swipe Carousel */}
        {advertisements && advertisements.length > 0 && (
          <div className="mb-8 relative z-10">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center p-1.5">
                    <img src="/logo.png" alt="Kconect Logo" className="w-full h-full object-contain" />
                  </div>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Advertisements
                  </h2>
                  <p className="text-gray-500 text-xs">
                    To advertise your brand click
                  </p>
                </div>
              </div>
              <button
                onClick={() => window.open('https://wa.me/2349068982251', '_blank')}
                className="flex-shrink-0 w-8 h-8 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center transition-colors duration-200 shadow-lg hover:shadow-xl"
                aria-label="Contact us on WhatsApp"
              >
                <MessageCircle className="w-4 h-4 text-white" />
              </button>
            </div>
            {/* Carousel Container */}
            <div className="relative">
              <AdvertisementCarousel advertisements={advertisements} />
            </div>
          </div>
        )}

        {/* Event Highlights */}
        <div className="mb-8">
          <HighlightsSection />
        </div>

        {/* Event Card - Enhanced single event display */}
        {(() => {
          // Find the user's current event from all events
          const userCurrentEvent = allEvents?.find(event => event.id === currentEventId);
          
          // Show the user's current event if it exists, otherwise fall back to current/upcoming events
          const eventToShow = userCurrentEvent || currentEvent || upcomingEvents?.[0];
          
          if (!eventToShow) return null;
          
          // Determine if the event is currently live
          const now = new Date();
          const eventStart = new Date(eventToShow.start_time);
          const eventEnd = new Date(eventToShow.end_time);
          const isEventLive = now >= eventStart && now <= eventEnd;
          
          return (
            <div className="mb-8">
              <EventCard
                event={eventToShow}
                isLive={isEventLive}
              />
            </div>
          );
        })()}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Featured Session Card */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-xl bg-white backdrop-blur-sm overflow-hidden group hover:shadow-2xl transition-all duration-300 relative z-10">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-50/90 to-yellow-50/90 z-0"></div>
              <CardHeader className="relative z-20 pb-4 bg-white/50 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-xl flex items-center justify-center">
                    <Star className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Featured Session</CardTitle>
                    <CardDescription className="text-base">
                      What's happening next at the event
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="relative z-20 pb-6 bg-white/80 backdrop-blur-sm">
                {nextSession || upcomingSessions?.[0] ? (
                  <>
                    <h3 className="text-lg font-bold mb-3 text-gray-900">
                      {nextSession?.session_title ||
                        upcomingSessions?.[0]?.title ||
                        "Session"}
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-gray-700">
                        <Clock className="h-4 w-4 text-orange-500" />
                        <span className="text-sm font-medium">
                          {formatDate(
                            nextSession?.session_time ||
                              upcomingSessions?.[0]?.start_time
                          )}
                        </span>
                      </div>
                      {nextSession && (
                        <div className="flex items-center gap-3 text-gray-700">
                          <Users className="h-4 w-4 text-orange-500" />
                          <span className="text-sm font-medium">
                            by {nextSession.name}
                          </span>
                        </div>
                      )}
                      {upcomingSessions?.[0]?.location && (
                        <div className="flex items-center gap-3 text-gray-700">
                          <MapPin className="h-4 w-4 text-orange-500" />
                          <span className="text-sm font-medium">
                            {upcomingSessions[0].location}
                          </span>
                        </div>
                      )}
                      {(nextSession?.title ||
                        upcomingSessions?.[0]?.description) && (
                        <p className="text-xs text-gray-600 mt-2">
                          {nextSession?.title ||
                            upcomingSessions?.[0]?.description}
                        </p>
                      )}
                    </div>

                    {/* Show additional upcoming sessions */}
                    {upcomingSessions.length > 1 && (
                      <div className="mt-4 pt-3 border-t border-gray-200">
                        <h4 className="text-xs font-semibold text-gray-900 mb-2">
                          More Sessions
                        </h4>
                        <div className="space-y-1">
                          {upcomingSessions.slice(1, 3).map((session) => (
                            <div
                              key={session.id}
                              className="flex items-center justify-between text-xs"
                            >
                              <span className="text-gray-700 truncate">
                                {session.title}
                              </span>
                              <span className="text-gray-500 ml-2">
                                {formatTime(session.start_time)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-4">
                    <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">
                      No sessions scheduled
                    </p>
                  </div>
                )}
              </CardContent>

              <CardFooter className="relative z-20 bg-white/90 backdrop-blur-sm">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate("/attendee/questions")}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Ask a Question
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>

        {/* Event Facilities Card */}
        <div className="mb-8 relative z-10">
          <Card className="border-0 shadow-xl bg-white backdrop-blur-sm overflow-hidden group hover:shadow-2xl transition-all duration-300 relative z-10">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/90 to-green-50/90 z-0"></div>
            <CardHeader className="relative z-20 pb-4 bg-white/50 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
                  <MapPin className="h-7 w-7 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Event Facilities</CardTitle>
                  <CardDescription className="text-base">
                    Explore venue amenities and services
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="relative z-20 pb-6 bg-white/80 backdrop-blur-sm">
              {facilities && facilities.length > 0 ? (
                <>
                  <p className="text-gray-600 mb-4">
                    Discover {facilities.length} facilities available at the
                    venue, including dining, restrooms, meeting spaces, and
                    other essential services.
                  </p>

                  {/* Show first 3 facilities */}
                  <div className="space-y-3">
                    {facilities.slice(0, 3).map((facility) => (
                      <div key={facility.id} className="flex items-center gap-3 p-3 bg-white/60 rounded-lg border">
                        <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                          <FacilityIcon iconType={facility.icon_type} className="h-4 w-4 text-emerald-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{facility.name}</p>
                          {facility.location && (
                            <div className="flex items-center gap-1 text-xs text-gray-500 truncate">
                              <MapPin
                                className="h-3 w-3 text-emerald-600 cursor-pointer hover:text-emerald-700"
                                onClick={() => {
                                  const encoded = encodeURIComponent(facility.location);
                                  window.open(`https://www.google.com/maps/search/?api=1&query=${encoded}`, "_blank");
                                }}
                                aria-label="Open in Google Maps"
                              />
                              <span
                                className="cursor-pointer hover:text-emerald-700"
                                onClick={() => {
                                  const encoded = encodeURIComponent(facility.location);
                                  window.open(`https://www.google.com/maps/search/?api=1&query=${encoded}`, "_blank");
                                }}
                              >
                                {facility.location}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {facilities.length > 3 && (
                    <p className="text-xs text-gray-500 mt-3 text-center">
                      +{facilities.length - 3} more facilities available
                    </p>
                  )}
                </>
              ) : (
                <div className="text-center py-4">
                  <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">
                    No facilities information available
                  </p>
                </div>
              )}
            </CardContent>

            <CardFooter className="relative z-20 bg-white/90 backdrop-blur-sm">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate("/attendee/map")}
              >
                <MapPin className="mr-2 h-4 w-4" />
                Explore All Facilities
              </Button>
            </CardFooter>
          </Card>
        </div>


        {/* Recent Announcements - Improved Mobile Layout */}
        {recentAnnouncements && recentAnnouncements.length > 0 && (
          <div className="mb-8 relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Latest Updates
                </h2>
                <p className="text-gray-500">
                  Stay informed with recent announcements
                </p>
              </div>
            </div>
            <div className="grid gap-4">
              {recentAnnouncements.map((announcement) => (
                <Card
                  key={announcement.id}
                  className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-500 bg-white backdrop-blur-sm relative z-10"
                >
                  <CardContent className="p-4 sm:p-6 bg-white/95 backdrop-blur-sm">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-6">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg text-gray-900 mb-2 break-words">
                          {announcement.title}
                        </h3>
                        <div className="text-gray-600 leading-relaxed break-words">
                          {expandedAnnouncements.has(announcement.id) ? (
                            announcement.content
                              .split("\n")
                              .map((paragraph, index) => (
                                <p key={index} className="mb-2 last:mb-0">
                                  {paragraph}
                                </p>
                              ))
                          ) : (
                            <p>{truncateContent(announcement.content)}</p>
                          )}

                          {announcement.content.length > 150 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                toggleAnnouncementExpanded(announcement.id)
                              }
                              className="mt-2 h-auto p-1 text-blue-600 hover:text-blue-800 font-medium"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              {expandedAnnouncements.has(announcement.id)
                                ? "See less"
                                : "See more"}
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 flex-shrink-0">
                        <Badge
                          variant={
                            announcement.priority === "high"
                              ? "destructive"
                              : "outline"
                          }
                          className="font-medium self-start"
                        >
                          {announcement.priority}
                        </Badge>
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {formatDate(announcement.created_at)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions Grid */}
        <div className="mb-8 relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Quick Actions
              </h2>
              <p className="text-gray-500">
                Everything you need at your fingertips
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              {
                name: "Event Rules",
                href: "/attendee/rules",
                icon: BookOpen,
                gradient: "from-emerald-500 to-teal-600",
              },
              {
                name: "Network",
                href: "/attendee/networking",
                icon: Users,
                gradient: "from-blue-500 to-indigo-600",
              },
              {
                name: "Q&A",
                href: "/attendee/questions",
                icon: MessageSquare,
                gradient: "from-purple-500 to-violet-600",
              },
              {
                name: "Event Facilities",
                href: "/attendee/map",
                icon: MapPin,
                gradient: "from-red-500 to-pink-600",
              },
            ].map((action) => {
              // Get dynamic icon for facilities
              let IconComponent = action.icon;
              if (action.name === "Event Facilities" && facilities.length > 0) {
                const firstFacility = facilities[0];
                if (
                  firstFacility.icon_type &&
                  (LucideIcons as any)[firstFacility.icon_type]
                ) {
                  IconComponent = (LucideIcons as any)[firstFacility.icon_type];
                }
              }

              return (
                <Card
                  key={action.name}
                  className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-0 shadow-lg overflow-hidden bg-white backdrop-blur-sm hover:-translate-y-1 relative z-10"
                  onClick={() => navigate(action.href)}
                >
                  <CardContent className="p-6 text-center relative bg-white/95 backdrop-blur-sm">
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-gray-100/50 group-hover:from-gray-100/50 group-hover:to-gray-200/50 transition-all duration-300 z-0"></div>
                    <div className="relative z-10">
                      <div
                        className={`w-12 h-12 bg-gradient-to-br ${action.gradient} rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300`}
                      >
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                      <p className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {action.name}
                      </p>
                      <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-indigo-500 mx-auto mt-2 transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Suggested Connections */}
        {suggestedConnections && suggestedConnections.length > 0 && (
          <div className="mb-8 relative z-10">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    People to Meet
                  </h2>
                  <p className="text-gray-500">
                    Expand your network with these connections
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate("/attendee/networking")}
                className="hover:bg-gray-50"
              >
                View All
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <SuggestedConnectionsCards
              suggestedConnections={suggestedConnections}
            />
          </div>
        )}

        {/* Event Feedback */}
        {currentEvent && (
          <Card className="border-0 shadow-xl bg-white backdrop-blur-sm overflow-hidden relative z-10">
            <CardContent className="p-8 bg-gradient-to-r from-gray-50/95 to-gray-100/95 backdrop-blur-sm">
              <div className="flex flex-col sm:flex-row items-center justify-between">
                <div className="text-center sm:text-left mb-6 sm:mb-0">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    How's your experience?
                  </h3>
                  <p className="text-gray-600 text-lg">
                    Your feedback helps us create even better events
                  </p>
                </div>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-semibold px-8 py-4"
                  onClick={() => navigate("/attendee/suggestions")}
                >
                  <Star className="mr-2 h-5 w-5" />
                  Rate This Event
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <AnnouncementPopup
        isOpen={!!popupAnnouncement}
        announcement={popupAnnouncement}
        onClose={() => setPopupAnnouncement(null)}
        onNeverShowAgain={() => handleDismissAnnouncement(popupAnnouncement?.id)}
        onAcknowledge={() => handleAcknowledgeAnnouncement(popupAnnouncement?.id)}
        allowDismiss={
          !popupAnnouncement?.require_submission ||
          isAnnouncementResolved(popupAnnouncement)
        }
      />

      <ProfileCompletionPopup
        isOpen={showProfilePopup && !popupAnnouncement}
        onClose={() => setShowProfilePopup(false)}
      />

      {/* Poll Popup */}
      <PollPopup
        isOpen={!!currentPoll}
        poll={currentPoll}
        onClose={() => {
          if (!currentPoll?.require_submission) {
            advancePollQueue();
          }
        }}
        onSkip={() => {
          if (currentPoll && !currentPoll.require_submission) {
            dismissPoll(currentPoll.id);
            advancePollQueue();
          }
        }}
        onSubmitVote={(pollId, optionId) =>
          submitVote(
            { pollId, optionId },
            { onSuccess: () => advancePollQueue() }
          )
        }
        allowDismiss={!currentPoll?.require_submission}
        userVoteOptionId={
          currentPoll
            ? userVotes.find((v) => v.poll_id === currentPoll.id)?.option_id ?? null
            : null
        }
      />

      {/* AI Assistant */}
      {currentEventId && <FloatingAIAssistant eventId={currentEventId} />}
    </>
  );
};

const SuggestedConnectionsCards = ({
  suggestedConnections,
}: {
  suggestedConnections: any[];
}) => {
  const { sendConnectionRequest, getConnectionStatus } = useNetworking();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {suggestedConnections.map((connection) => {
        const status = getConnectionStatus(connection.id);
        const isConnected = status?.status === "accepted";
        const isPending = status?.status === "pending";

        return (
          <Card
            key={connection.id}
            className="group overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white backdrop-blur-sm hover:-translate-y-1 relative z-10"
          >
            <CardContent className="p-6 bg-white/95 backdrop-blur-sm">
              <div className="flex items-center space-x-4 mb-4">
                <Avatar className="h-14 w-14 border-2 border-white shadow-md">
                  {connection.photo_url ? (
                    <AvatarImage
                      src={connection.photo_url}
                      alt={connection.name}
                    />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-lg font-semibold">
                      {connection.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("") || "?"}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {connection.name || "Unknown"}
                  </h3>
                  <p className="text-sm text-gray-500 truncate">
                    {connection.niche || connection.company || "Professional"}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 flex items-center justify-center"
                onClick={() => sendConnectionRequest(connection.id)}
                disabled={isConnected || isPending}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                {isPending ? "Pending" : isConnected ? "Connected" : "Connect"}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

const AttendeeDashboard = () => {
  return (
    <AttendeeEventProvider>
      <AttendeeRouteGuard requireEvent={false}>
        <AttendeeDashboardContent />
      </AttendeeRouteGuard>
    </AttendeeEventProvider>
  );
};

export default AttendeeDashboard;


