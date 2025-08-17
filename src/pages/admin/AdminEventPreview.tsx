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
  Eye,
  AlertCircle,
} from "lucide-react";
import { FaInstagram, FaTiktok } from 'react-icons/fa';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ScheduleItemModal from "@/components/schedule/ScheduleItemModal";
import { useAdminEventContext } from "@/hooks/useAdminEventContext";
import { useAdminSpeakers } from "@/hooks/useAdminSpeakers";
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
  speaker_instagram?: string;
  speaker_tiktok?: string;
  speaker_topic?: string;
  speaker_title?: string;
  priority?: string;
  image_url?: string;
  time_allocation?: string | null;
}

const AdminEventPreviewContent = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [combinedItems, setCombinedItems] = useState<CombinedScheduleItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<CombinedScheduleItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const { selectedEventId, selectedEvent, isLoading: eventLoading } = useAdminEventContext();
  const { speakers, isLoading: speakersLoading, error: speakersError } = useAdminSpeakers();

  // Fetch schedule items from database
  useEffect(() => {
    const fetchScheduleItems = async () => {
      if (!selectedEventId) {
        setScheduleItems([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("schedule_items")
          .select("*")
          .eq("event_id", selectedEventId)
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

    if (selectedEventId) {
      fetchScheduleItems();
    } else {
      setLoading(false);
    }

    // Set up real-time subscription
    if (selectedEventId) {
      const channel = supabase
        .channel("admin-preview-schedule-changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "schedule_items",
            filter: `event_id=eq.${selectedEventId}`,
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
  }, [selectedEventId]);

  // Combine speakers and schedule items
  useEffect(() => {
    const combined: CombinedScheduleItem[] = [];

    // Add speakers with topic support
    if (speakers && speakers.length > 0) {
      speakers.forEach((speaker) => {
        combined.push({
          id: `speaker-${speaker.id}`,
          title: speaker.session_title || "Session Topic TBA",
          description: null,
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
          speaker_instagram: undefined,
          speaker_tiktok: undefined,
          speaker_topic: speaker.topic,
          speaker_title: speaker.title,
          time_allocation: speaker.time_allocation,
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
        if (item.start_time_full) return new Date(item.start_time_full).getTime();
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
      case "instagram":
        return <FaInstagram className="w-3 h-3" />;
      case "tiktok":
        return <FaTiktok className="w-3 h-3" />;
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
    if (item.speaker_instagram)
      socialLinks.push({ platform: "instagram", url: item.speaker_instagram });
    if (item.speaker_tiktok)
      socialLinks.push({ platform: "tiktok", url: item.speaker_tiktok });

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
  if (speakersLoading || eventLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 font-medium">
              Loading event preview...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (speakersError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2 text-gray-900">
              Unable to Load Preview
            </h3>
            <p className="text-gray-600">
              {speakersError?.message || "Please try again later"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // No event state
  if (!selectedEventId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2 text-gray-900">
              No Event Selected
            </h3>
            <p className="text-gray-600">
              Select an event to preview how attendees see the schedule.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Admin Preview Banner */}
      <Alert className="mx-6 mt-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <Eye className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <span className="font-semibold">Admin Preview Mode:</span> This is how attendees see the schedule for "{selectedEvent?.name}"
        </AlertDescription>
      </Alert>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-900 via-purple-800 to-blue-900 text-white py-16 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center mb-4">
            <Calendar className="h-12 w-12 mr-4 text-blue-200" />
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              Event Schedule
            </h1>
          </div>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Discover speakers, sessions, and exciting activities planned for{" "}
            <span className="font-semibold text-white">{selectedEvent?.name}</span>
          </p>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white/70 backdrop-blur-md border-b border-white/20 sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Search sessions, speakers, or topics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/80 border-gray-200 focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div className="flex gap-4 w-full lg:w-auto">
              <Tabs
                value={selectedDate}
                onValueChange={setSelectedDate}
                className="w-full lg:w-auto"
              >
                <TabsList className="grid w-full grid-cols-4 lg:w-auto bg-white/80">
                  <TabsTrigger value="all" className="text-xs">
                    All
                  </TabsTrigger>
                  <TabsTrigger value="today" className="text-xs">
                    Today
                  </TabsTrigger>
                  <TabsTrigger value="tomorrow" className="text-xs">
                    Tomorrow
                  </TabsTrigger>
                  <TabsTrigger value="tba" className="text-xs">
                    TBA
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <Tabs
                value={selectedType}
                onValueChange={setSelectedType}
                className="w-full lg:w-auto"
              >
                <TabsList className="grid w-full grid-cols-3 lg:w-auto bg-white/80">
                  <TabsTrigger value="all" className="text-xs">
                    All
                  </TabsTrigger>
                  <TabsTrigger value="speaker" className="text-xs">
                    <User className="w-3 h-3 mr-1" />
                    Speakers
                  </TabsTrigger>
                  <TabsTrigger value="schedule" className="text-xs">
                    <Calendar className="w-3 h-3 mr-1" />
                    Events
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {Object.keys(groupedByDate).length === 0 ? (
          <div className="text-center py-16">
            <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2 text-gray-900">
              No Schedule Items Found
            </h3>
            <p className="text-gray-600">
              {searchTerm || selectedType !== "all" || selectedDate !== "all"
                ? "Try adjusting your search or filters"
                : "Schedule items will appear here once added"}
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedByDate).map(([dateKey, items]) => (
              <div key={dateKey} className="space-y-4">
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {formatDateHeader(dateKey)}
                  </h2>
                  <Badge
                    variant="outline"
                    className="bg-indigo-50 text-indigo-700 border-indigo-200"
                  >
                    {items.length} {items.length === 1 ? "item" : "items"}
                  </Badge>
                </div>

                <div className="grid gap-4 md:gap-6">
                  {items.map((item) => (
                    <Card
                      key={item.id}
                      className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm hover:bg-white cursor-pointer overflow-hidden"
                      onClick={() => handleViewDetails(item)}
                    >
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row gap-6">
                          {/* Time and Type Section */}
                          <div className="flex-shrink-0 lg:w-48">
                            <div className="flex items-center gap-2 mb-3">
                              <Clock className="h-4 w-4 text-indigo-600" />
                              <span className="text-sm font-medium text-indigo-600">
                                {formatTimeDisplay(item)}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-3">
                              {getTypeBadge(item.type)}
                              {getPriorityBadge(item.priority)}
                            </div>
                            {item.location && (
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <MapPin className="h-4 w-4" />
                                <span>{item.location}</span>
                              </div>
                            )}
                          </div>

                          {/* Content Section */}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col lg:flex-row gap-4">
                              {/* Main Content */}
                              <div className="flex-1">
                                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
                                  {item.title}
                                </h3>

                                {item.type === "speaker" && item.speaker_name && (
                                  <div className="flex items-center gap-3 mb-3">
                                    <div className="flex items-center gap-2">
                                      <User className="h-4 w-4 text-gray-500" />
                                      <span className="font-medium text-gray-900">
                                        {item.speaker_name}
                                      </span>
                                    </div>
                                    {item.speaker_company && (
                                      <span className="text-sm text-gray-600">
                                        @ {item.speaker_company}
                                      </span>
                                    )}
                                  </div>
                                )}

                                {item.description && (
                                  <p className="text-gray-600 mb-3 line-clamp-2">
                                    {item.description}
                                  </p>
                                )}

                                {item.speaker_bio && item.type === "speaker" && (
                                  <p className="text-gray-600 mb-3 line-clamp-2">
                                    {item.speaker_bio}
                                  </p>
                                )}

                                {item.speaker_topic && (
                                  <div className="flex items-center gap-2 mb-3">
                                    <Tag className="h-4 w-4 text-gray-500" />
                                    <span className="text-sm text-gray-600">
                                      Topic: {item.speaker_topic}
                                    </span>
                                  </div>
                                )}

                                {renderSocialLinks(item)}
                              </div>

                              {/* Speaker Photo or Event Image */}
                              {(item.speaker_photo || item.image_url) && (
                                <div className="flex-shrink-0">
                                  <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-xl overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                                    {item.speaker_photo || item.image_url ? (
                                      <img
                                        src={item.speaker_photo || item.image_url}
                                        alt={item.speaker_name || item.title}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <User className="h-8 w-8 text-indigo-400" />
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* View Details CTA */}
                            <div className="flex justify-end mt-4">
                              <Button
                                variant="ghost"
                                className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 group/btn"
                              >
                                View Details
                                <ChevronRight className="ml-1 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Schedule Item Modal */}
      {selectedItem && (
        <ScheduleItemModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          item={selectedItem}
        />
      )}
    </div>
  );
};

const AdminEventPreview = AdminEventPreviewContent;

export default AdminEventPreview;