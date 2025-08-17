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

  const { selectedEventId, selectedEvent } = useAdminEventContext();
  const { speakers, isLoading: speakersLoading, error: speakersError } = useAdminSpeakers();

  useEffect(() => {
    const fetchScheduleItems = async () => {
      if (selectedEventId) {
        try {
          const { data: scheduleData, error: scheduleError } = await supabase
            .from("schedule_items")
            .select("*")
            .eq("event_id", selectedEventId)
            .order("start_time", { ascending: true });

          if (scheduleError) {
            console.error("Error fetching schedule items:", scheduleError);
          } else {
            setScheduleItems(scheduleData || []);
          }
        } catch (error) {
          console.error("Error fetching schedule items:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchScheduleItems();
  }, [selectedEventId]);

  useEffect(() => {
    if (scheduleItems && speakers) {
      const scheduleItemsWithCorrectTypes = scheduleItems.map((item) => ({
        ...item,
        type: "schedule",
      }));

      const combined = [...(speakers || []).map((speaker) => ({
        id: speaker.id,
        title: speaker.topic || "No Topic",
        type: "speaker" as "speaker",
        speaker_name: speaker.name,
        speaker_photo: speaker.photo_url,
        speaker_company: speaker.company,
        speaker_bio: speaker.bio,
        speaker_twitter: speaker.twitter,
        speaker_linkedin: speaker.linkedin,
        speaker_website: speaker.website,
        speaker_instagram: speaker.instagram,
        speaker_tiktok: speaker.tiktok,
        speaker_topic: speaker.topic,
        speaker_title: speaker.title,
      })),
      ...(scheduleItemsWithCorrectTypes || []).map((item) => ({
        id: item.id,
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
        type: "schedule" as "schedule",
        priority: item.priority,
        image_url: item.image_url,
        time_allocation: item.time_allocation,
      }))
      ];
      setCombinedItems(combined);
    }
  }, [scheduleItems, speakers]);

  const handleItemClick = (item: CombinedScheduleItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

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

  // Group items by date - same as attendee schedule
  const groupedByDate = filteredItems.reduce((groups, item) => {
    const itemDate = item.start_time || item.start_time_full;
    const dateKey = itemDate ? format(new Date(itemDate), "yyyy-MM-dd") : "tba";
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(item);
    return groups;
  }, {} as Record<string, CombinedScheduleItem[]>);

  const renderSpeakerInfo = (item: CombinedScheduleItem) => (
    <div className="flex items-center gap-4">
      <Avatar>
        {item.speaker_photo ? (
          <AvatarImage src={item.speaker_photo} alt={item.speaker_name} />
        ) : (
          <AvatarFallback>{item.speaker_name?.charAt(0)}</AvatarFallback>
        )}
      </Avatar>
      <div>
        <p className="font-semibold">{item.speaker_name}</p>
        <p className="text-sm text-gray-500">{item.speaker_title}, {item.speaker_company}</p>
      </div>
    </div>
  );

  const renderScheduleInfo = (item: CombinedScheduleItem) => (
    <>
      <p className="text-gray-700">{item.description}</p>
      {item.location && (
        <div className="flex items-center gap-2 text-gray-600">
          <MapPin className="w-4 h-4" />
          {item.location}
        </div>
      )}
      {item.start_time_full && item.end_time_full && (
        <div className="flex items-center gap-2 text-gray-600">
          <Clock className="w-4 h-4" />
          {formatDisplayTime(item.start_time_full)} - {formatDisplayTime(item.end_time_full)} ({formatDuration(item.start_time_full, item.end_time_full)})
        </div>
      )}
    </>
  );

  // Loading state
  if (speakersLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 font-medium">Loading event preview...</p>
          </div>
        </div>
      </div>
    );
  }

  // No event state
  if (!selectedEventId || !selectedEvent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2 text-gray-900">No Event Selected</h3>
            <p className="text-gray-600">Select an event to preview its schedule and sessions.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Modern Hero Section - Exactly like AttendeeSchedule */}
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
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">Event Preview</h1>
            <p className="text-xl sm:text-2xl opacity-90 mb-8 max-w-3xl mx-auto">
              See how your event schedule will appear to attendees
            </p>

            <div className="flex flex-wrap justify-center gap-6 text-sm sm:text-base">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                <Calendar className="w-5 h-5" />
                <span className="font-medium">{filteredItems.length} Sessions</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                <Users className="w-5 h-5" />
                <span className="font-medium">{speakers?.length || 0} Speakers</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                <Clock className="w-5 h-5" />
                <span className="font-medium">{Object.keys(groupedByDate).length} Days</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Search and Filter Section - Exactly like AttendeeSchedule */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search sessions, speakers, topics, or companies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 border-0 bg-gray-50 focus:bg-white transition-all duration-200 text-base"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Tabs value={selectedType} onValueChange={setSelectedType} className="w-auto">
                  <TabsList className="bg-gray-100 p-1">
                    <TabsTrigger value="all" className="px-4">All</TabsTrigger>
                    <TabsTrigger value="speaker" className="px-4">Speakers</TabsTrigger>
                    <TabsTrigger value="schedule" className="px-4">Events</TabsTrigger>
                  </TabsList>
                </Tabs>
                <Tabs value={selectedDate} onValueChange={setSelectedDate} className="w-auto">
                  <TabsList className="bg-gray-100 p-1">
                    <TabsTrigger value="all" className="px-4">All Days</TabsTrigger>
                    <TabsTrigger value="today" className="px-4">Today</TabsTrigger>
                    <TabsTrigger value="tomorrow" className="px-4">Tomorrow</TabsTrigger>
                    <TabsTrigger value="tba" className="px-4">TBA</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content - Show message if no sessions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredItems.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="py-16 text-center">
              <Calendar className="h-20 w-20 mx-auto mb-6 text-gray-300" />
              <h3 className="text-2xl font-semibold mb-3 text-gray-900">No sessions found</h3>
              <p className="text-gray-500 max-w-md mx-auto text-lg">
                {combinedItems.length === 0
                  ? "No sessions have been scheduled yet. Add some schedule items or speakers to see the preview."
                  : "Try adjusting your search or filter criteria."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Same session rendering as AttendeeSchedule but simpler for preview */}
            {Object.keys(groupedByDate).map((date) => (
              <div key={date} className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <Calendar className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                      {date === "tba" ? "Time To Be Announced" : format(parseISO(date), "EEEE, MMMM d")}
                    </h2>
                    <p className="text-gray-500 text-lg">
                      {groupedByDate[date].length} session{groupedByDate[date].length !== 1 ? "s" : ""} scheduled
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const AdminEventPreview = AdminEventPreviewContent;

export default AdminEventPreview;
