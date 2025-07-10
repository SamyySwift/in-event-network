import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  ChevronRight,
  Search,
  Users,
  ExternalLink,
  Linkedin,
  Globe,
  Filter,
  Star,
  Bookmark,
  Play,
  Tag,
} from "lucide-react";
import AttendeeRouteGuard from "@/components/attendee/AttendeeRouteGuard";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ScheduleItemModal from "@/components/schedule/ScheduleItemModal";
import { useAttendeeSpeakers } from "@/hooks/useAttendeeSpeakers";
import { useAttendeeContext } from "@/hooks/useAttendeeContext";
import { format, isToday, isTomorrow, isYesterday, parseISO } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import XLogo from "@/components/icons/XLogo";
import {
  formatDisplayTime,
  formatDisplayDate,
  formatDuration,
  parseTimeAllocation,
} from "@/utils/timezone";

interface ScheduleItem {
  id: string;
  title: string;
  description: string | null;
  start_date?: string | null;
  end_date?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  start_time_full?: string;
  end_time_full?: string;
  start_time_only?: string | null;
  end_time_only?: string | null;
  location: string | null;
  type: string;
  priority: string;
  event_id: string;
  image_url?: string;
  time_allocation?: string | null;
}

interface CombinedScheduleItem {
  id: string;
  title: string;
  description?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  start_time_full?: string;
  end_time_full?: string;
  start_time_only?: string | null;
  end_time_only?: string | null;
  location?: string | null;
  type: "speaker" | "schedule";
  speaker_name?: string;
  speaker_photo?: string;
  speaker_company?: string;
  speaker_bio?: string;
  speaker_twitter?: string;
  speaker_linkedin?: string;
  speaker_website?: string;
  speaker_topic?: string; // Add topic field
  priority?: string;
  image_url?: string;
  time_allocation?: string | null;
}

const AttendeeSchedule = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [combinedItems, setCombinedItems] = useState<CombinedScheduleItem[]>(
    []
  );
  const [selectedItem, setSelectedItem] = useState<CombinedScheduleItem | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const {
    speakers,
    isLoading: speakersLoading,
    error: speakersError,
  } = useAttendeeSpeakers();

  const {
    context,
    isLoading: contextLoading,
    error: contextError,
  } = useAttendeeContext();

  // Fetch schedule items from database
  useEffect(() => {
    const fetchScheduleItems = async () => {
      if (!context?.currentEventId) {
        setScheduleItems([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("schedule_items")
          .select("*")
          .eq("event_id", context.currentEventId)
          .order("start_time", { ascending: true });

        if (error) {
          console.error("Error fetching schedule items:", error);
          setScheduleItems([]);
        } else {
          setScheduleItems(data || []);
        }
      } catch (error) {
        console.error("Error fetching schedule items:", error);
        setScheduleItems([]);
      } finally {
        setLoading(false);
      }
    };

    if (context?.currentEventId) {
      fetchScheduleItems();
    } else {
      setLoading(false);
    }

    // Set up real-time subscription
    if (context?.currentEventId) {
      const channel = supabase
        .channel("attendee-schedule-changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "schedule_items",
            filter: `event_id=eq.${context.currentEventId}`,
          },
          () => {
            fetchScheduleItems();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [context?.currentEventId]);

  // Combine speakers and schedule items
  useEffect(() => {
    const combined: CombinedScheduleItem[] = [];

    // Add speakers with topic support - FIX: Don't duplicate bio in description
    if (speakers && speakers.length > 0) {
      speakers.forEach((speaker) => {
        combined.push({
          id: `speaker-${speaker.id}`,
          title: speaker.session_title || "Session Topic TBA",
          description: null, // Don't use bio as description to avoid duplication
          start_time: speaker.session_time || undefined,
          start_time_full: speaker.session_time || undefined,
          location: undefined,
          type: "speaker",
          speaker_name: speaker.name,
          speaker_photo: speaker.photo_url,
          speaker_company: speaker.company,
          speaker_bio: speaker.bio,
          speaker_twitter: speaker.twitter_link,
          speaker_linkedin: speaker.linkedin_link,
          speaker_website: speaker.website_link,
          speaker_topic: speaker.topic,
        });
      });
    }

    // Add schedule items
    if (scheduleItems && scheduleItems.length > 0) {
      scheduleItems.forEach((item) => {
        combined.push({
          id: `schedule-${item.id}`,
          title: item.title,
          description: item.description,
          start_date: item.start_date,
          end_date: item.end_date,
          start_time: item.start_time,
          end_time: item.end_time,
          start_time_full: item.start_time_full,
          end_time_full: item.end_time_full,
          start_time_only: item.start_time_only,
          end_time_only: item.end_time_only,
          location: item.location,
          type: "schedule",
          priority: item.priority,
          image_url: item.image_url,
          time_allocation: item.time_allocation,
        });
      });
    }

    // Sort by start time
    combined.sort((a, b) => {
      const getStartTime = (item: CombinedScheduleItem) => {
        if (item.start_time) return new Date(item.start_time).getTime();
        if (item.start_time_full)
          return new Date(item.start_time_full).getTime();
        return 0;
      };
      return getStartTime(a) - getStartTime(b);
    });

    setCombinedItems(combined);
  }, [speakers, scheduleItems]);

  // Enhanced filtering
  const filteredItems = combinedItems.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.speaker_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.speaker_topic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.speaker_company?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = selectedType === "all" || item.type === selectedType;

    const matchesDate = (() => {
      if (selectedDate === "all") return true;

      const itemDate = item.start_time || item.start_time_full;
      if (!itemDate) return selectedDate === "tba";

      const date = new Date(itemDate);
      if (selectedDate === "today") return isToday(date);
      if (selectedDate === "tomorrow") return isTomorrow(date);
      if (selectedDate === "tba") return false;

      return true;
    })();

    return matchesSearch && matchesType && matchesDate;
  });

  // Group items by date
  const groupedByDate = filteredItems.reduce((groups, item) => {
    const itemDate = item.start_time || item.start_time_full;
    const dateKey = itemDate ? format(new Date(itemDate), "yyyy-MM-dd") : "tba";

    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(item);
    return groups;
  }, {} as Record<string, CombinedScheduleItem[]>);

  // Helper functions
  const formatTimeDisplay = (item: CombinedScheduleItem) => {
    if (!item.start_time && !item.start_time_full) return "Time TBA";

    const startTime = item.start_time || item.start_time_full;
    if (!startTime) return "Time TBA";

    try {
      const start = formatDisplayTime(startTime);
      if (item.end_time || item.end_time_full) {
        const end = formatDisplayTime(item.end_time || item.end_time_full!);
        return `${start} - ${end}`;
      }
      return start;
    } catch {
      return "Time TBA";
    }
  };

  const formatDateDisplay = (item: CombinedScheduleItem) => {
    const itemDate = item.start_time || item.start_time_full;
    if (!itemDate) return null;

    try {
      return formatDisplayDate(itemDate);
    } catch {
      return null;
    }
  };

  const formatDateHeader = (dateKey: string) => {
    if (dateKey === "tba") return "Time To Be Announced";

    try {
      const date = parseISO(dateKey);
      if (isToday(date)) return "Today";
      if (isTomorrow(date)) return "Tomorrow";
      if (isYesterday(date)) return "Yesterday";
      return format(date, "EEEE, MMMM d");
    } catch {
      return "Unknown Date";
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "speaker":
        return (
          <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0">
            <User className="w-3 h-3 mr-1" />
            Speaker Session
          </Badge>
        );
      case "schedule":
        return (
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
            <Calendar className="w-3 h-3 mr-1" />
            Event
          </Badge>
        );
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getPriorityBadge = (priority?: string) => {
    if (!priority) return null;
    switch (priority) {
      case "high":
        return (
          <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white border-0">
            <Star className="w-3 h-3 mr-1" />
            High Priority
          </Badge>
        );
      case "medium":
        return (
          <Badge className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white border-0">
            Medium Priority
          </Badge>
        );
      case "low":
        return (
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
            Low Priority
          </Badge>
        );
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case "x":
        return <XLogo size={12} />;
      case "linkedin":
        return <Linkedin className="w-3 h-3" />;
      case "website":
        return <Globe className="w-3 h-3" />;
      default:
        return <ExternalLink className="w-3 h-3" />;
    }
  };

  const renderSocialLinks = (item: CombinedScheduleItem) => {
    if (item.type !== "speaker") return null;

    const socialLinks = [];
    if (item.speaker_twitter)
      socialLinks.push({ platform: "x", url: item.speaker_twitter });
    if (item.speaker_linkedin)
      socialLinks.push({ platform: "linkedin", url: item.speaker_linkedin });
    if (item.speaker_website)
      socialLinks.push({ platform: "website", url: item.speaker_website });

    if (socialLinks.length === 0) return null;

    return (
      <div className="flex items-center gap-2 mt-3">
        <span className="text-xs text-gray-500">Connect:</span>
        <div className="flex gap-1">
          {socialLinks.map((link, index) => (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 hover:bg-gray-100 rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                window.open(link.url, "_blank");
              }}
            >
              {getSocialIcon(link.platform)}
            </Button>
          ))}
        </div>
      </div>
    );
  };

  const handleViewDetails = (item: CombinedScheduleItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  // Loading state
  if (speakersLoading || contextLoading || loading) {
    return (
      <AttendeeRouteGuard>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 font-medium">
                Loading your schedule...
              </p>
            </div>
          </div>
        </div>
      </AttendeeRouteGuard>
    );
  }

  // Error state
  if (speakersError || contextError) {
    return (
      <AttendeeRouteGuard>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2 text-gray-900">
                Unable to Load Schedule
              </h3>
              <p className="text-gray-600">
                {speakersError?.message ||
                  contextError?.message ||
                  "Please try again later"}
              </p>
            </div>
          </div>
        </div>
      </AttendeeRouteGuard>
    );
  }

  // No event state
  if (!context?.currentEventId) {
    return (
      <AttendeeRouteGuard>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2 text-gray-900">
                No Event Selected
              </h3>
              <p className="text-gray-600">
                Join an event to view its schedule and sessions.
              </p>
            </div>
          </div>
        </div>
      </AttendeeRouteGuard>
    );
  }

  return (
    <AttendeeRouteGuard requireEvent={true}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Modern Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500">
          <div className="absolute inset-0 bg-black/10"></div>
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
            <div className="text-center text-white">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
                Up Next
              </h1>
              <p className="text-xl sm:text-2xl opacity-90 mb-8 max-w-3xl mx-auto">
                Discover amazing sessions, connect with speakers, and never miss
                a moment
              </p>

              <div className="flex flex-wrap justify-center gap-6 text-sm sm:text-base">
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                  <Calendar className="w-5 h-5" />
                  <span className="font-medium">
                    {filteredItems.length} Sessions
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                  <Users className="w-5 h-5" />
                  <span className="font-medium">
                    {speakers?.length || 0} Speakers
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                  <Clock className="w-5 h-5" />
                  <span className="font-medium">
                    {Object.keys(groupedByDate).length} Days
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Search and Filter Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
          <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Search sessions, speakers, topics, or companies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-12 border-0 bg-gray-50 focus:bg-white transition-all duration-200 text-base"
                  />
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Tabs
                    value={selectedType}
                    onValueChange={setSelectedType}
                    className="w-auto"
                  >
                    <TabsList className="bg-gray-100 p-1">
                      <TabsTrigger value="all" className="px-4">
                        All
                      </TabsTrigger>
                      <TabsTrigger value="speaker" className="px-4">
                        Speakers
                      </TabsTrigger>
                      <TabsTrigger value="schedule" className="px-4">
                        Events
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>

                  <Tabs
                    value={selectedDate}
                    onValueChange={setSelectedDate}
                    className="w-auto"
                  >
                    <TabsList className="bg-gray-100 p-1">
                      <TabsTrigger value="all" className="px-4">
                        All Days
                      </TabsTrigger>
                      <TabsTrigger value="today" className="px-4">
                        Today
                      </TabsTrigger>
                      <TabsTrigger value="tomorrow" className="px-4">
                        Tomorrow
                      </TabsTrigger>
                      <TabsTrigger value="tba" className="px-4">
                        TBA
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {filteredItems.length === 0 ? (
            <Card className="border-0 shadow-lg">
              <CardContent className="py-16 text-center">
                <Calendar className="h-20 w-20 mx-auto mb-6 text-gray-300" />
                <h3 className="text-2xl font-semibold mb-3 text-gray-900">
                  No sessions found
                </h3>
                <p className="text-gray-500 max-w-md mx-auto text-lg">
                  {combinedItems.length === 0
                    ? "No sessions have been scheduled yet. Check back soon!"
                    : "Try adjusting your search or filter criteria to find what you're looking for."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8">
              {Object.keys(groupedByDate)
                .sort((a, b) => {
                  if (a === "tba") return 1;
                  if (b === "tba") return -1;
                  return a.localeCompare(b);
                })
                .map((date) => (
                  <div key={date} className="space-y-6">
                    {/* Date Header */}
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                          <Calendar className="w-7 h-7 text-white" />
                        </div>
                      </div>
                      <div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                          {formatDateHeader(date)}
                        </h2>
                        <p className="text-gray-500 text-lg">
                          {groupedByDate[date].length} session
                          {groupedByDate[date].length !== 1 ? "s" : ""}{" "}
                          scheduled
                        </p>
                      </div>
                    </div>

                    {/* Sessions Grid */}
                    <div className="grid gap-6">
                      {groupedByDate[date].map((item) => {
                        const timeDisplay = formatTimeDisplay(item);
                        const dateDisplay = formatDateDisplay(item);
                        const durationMinutes = item.time_allocation
                          ? parseTimeAllocation(item.time_allocation)
                          : 0;
                        const durationDisplay = formatDuration(durationMinutes);

                        return (
                          <Card
                            key={item.id}
                            className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-md hover:-translate-y-1 cursor-pointer overflow-hidden bg-white"
                            onClick={() => handleViewDetails(item)}
                          >
                            <CardContent className="p-0">
                              <div className="flex flex-col lg:flex-row">
                                {/* Time Column - Improved Mobile Layout */}
                                <div className="w-full lg:w-32 bg-gradient-to-br from-gray-50 to-gray-100 p-4 lg:p-6 flex flex-row lg:flex-col items-center justify-center border-b lg:border-b-0 lg:border-r">
                                  <div className="text-center">
                                    <div className="text-base lg:text-lg font-bold text-gray-900 mb-1">
                                      {timeDisplay === "Time TBA" ? (
                                        <span className="text-sm text-amber-600 font-medium px-2 py-1 bg-amber-50 rounded-full">
                                          TBA
                                        </span>
                                      ) : (
                                        timeDisplay.split(" - ")[0]
                                      )}
                                    </div>
                                    {timeDisplay.includes(" - ") &&
                                      timeDisplay !== "Time TBA" && (
                                        <div className="text-xs lg:text-sm text-gray-500">
                                          {timeDisplay.split(" - ")[1]}
                                        </div>
                                      )}
                                    {durationDisplay &&
                                      timeDisplay !== "Time TBA" && (
                                        <div className="text-xs text-gray-400 mt-2 flex items-center justify-center">
                                          <Clock className="w-3 h-3 mr-1" />
                                          {durationDisplay}
                                        </div>
                                      )}
                                  </div>
                                </div>

                                {/* Main Content - Improved Layout */}
                                <div className="flex-1 p-4 lg:p-6">
                                  <div className="flex flex-col space-y-4">
                                    {/* Title and Topic */}
                                    <div>
                                      <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
                                        {item.title}
                                      </h3>

                                      {/* Speaker Topic Badge */}
                                      {item.type === "speaker" &&
                                        item.speaker_topic && (
                                          <div className="mb-3">
                                            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 text-xs">
                                              <Tag className="w-3 h-3 mr-1" />
                                              {item.speaker_topic}
                                            </Badge>
                                          </div>
                                        )}
                                    </div>

                                    {/* Description - Only show if not a speaker or if speaker has session description */}
                                    {item.description && item.type !== "speaker" && (
                                      <p className="text-gray-600 text-sm lg:text-base line-clamp-2">
                                        {item.description}
                                      </p>
                                    )}

                                    {/* Speaker Bio Preview - Show brief bio for speakers */}
                                    {item.type === "speaker" && item.speaker_bio && (
                                      <p className="text-gray-600 text-sm lg:text-base line-clamp-2">
                                        {item.speaker_bio}
                                      </p>
                                    )}

                                    {/* Meta Information */}
                                    <div className="flex flex-wrap items-center gap-3 text-xs lg:text-sm text-gray-500">
                                      {dateDisplay && (
                                        <div className="flex items-center gap-1">
                                          <Calendar className="h-3 w-3 lg:h-4 lg:w-4" />
                                          <span>{dateDisplay}</span>
                                        </div>
                                      )}
                                      {item.location && (
                                        <div className="flex items-center gap-1">
                                          <MapPin className="h-3 w-3 lg:h-4 lg:w-4" />
                                          <span className="truncate max-w-[150px]">{item.location}</span>
                                        </div>
                                      )}
                                    </div>

                                    {/* Bottom Section - Speaker Info and Badges */}
                                    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
                                      {/* Speaker Info */}
                                      {item.type === "speaker" && item.speaker_name && (
                                        <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3 flex-1">
                                          <Avatar className="h-12 w-12 ring-2 ring-white shadow-sm">
                                            <AvatarImage
                                              src={item.speaker_photo}
                                              alt={item.speaker_name}
                                            />
                                            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-sm font-semibold">
                                              {item.speaker_name.charAt(0)}
                                            </AvatarFallback>
                                          </Avatar>
                                          <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-gray-900 text-sm lg:text-base truncate">
                                              {item.speaker_name}
                                            </p>
                                            {item.speaker_company && (
                                              <p className="text-xs lg:text-sm text-gray-600 truncate">
                                                {item.speaker_company}
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                      )}

                                      {/* Badges and Social Links */}
                                      <div className="flex flex-col gap-2">
                                        {/* Badges */}
                                        <div className="flex flex-wrap gap-2">
                                          {getTypeBadge(item.type)}
                                          {getPriorityBadge(item.priority)}
                                          {durationDisplay && (
                                            <Badge variant="outline" className="text-xs">
                                              <Clock className="w-3 h-3 mr-1" />
                                              {durationDisplay}
                                            </Badge>
                                          )}
                                        </div>

                                        {/* Social Links */}
                                        {renderSocialLinks(item)}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      <ScheduleItemModal
        item={selectedItem}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </AttendeeRouteGuard>
  );
};

export default AttendeeSchedule;
