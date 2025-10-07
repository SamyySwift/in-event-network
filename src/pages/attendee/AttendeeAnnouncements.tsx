import React, { useState } from "react";
import AppLayout from "@/components/layouts/AppLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Megaphone,
  Clock,
  Loader,
  AlertCircle,
  Search,
  Filter,
  Bell,
  BellRing,
  Calendar,
  User,
  Eye,
  ChevronRight,
  Sparkles,
  TrendingUp,
  ExternalLink,
  Globe,
  Play,
} from "lucide-react";
import { FaInstagram, FaTiktok, FaFacebook } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { useAttendeeAnnouncements } from "@/hooks/useAttendeeAnnouncements";
import { AttendeeEventProvider } from "@/contexts/AttendeeEventContext";
import AttendeeRouteGuard from "@/components/attendee/AttendeeRouteGuard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AttendeeAnnouncementsContent = () => {
  const { announcements, isLoading, error } = useAttendeeAnnouncements();
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [expandedAnnouncement, setExpandedAnnouncement] = useState<
    string | null
  >(null);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600";
      case "normal":
        return "bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600";
      case "low":
        return "bg-gradient-to-r from-gray-500 to-slate-500 text-white hover:from-gray-600 hover:to-slate-600";
      default:
        return "bg-gradient-to-r from-gray-500 to-slate-500 text-white hover:from-gray-600 hover:to-slate-600";
    }
  };

  const getPriorityGradient = (priority: string) => {
    switch (priority) {
      case "high":
        return "from-red-50 to-pink-50 border-red-200";
      case "normal":
        return "from-blue-50 to-indigo-50 border-blue-200";
      case "low":
        return "from-gray-50 to-slate-50 border-gray-200";
      default:
        return "from-gray-50 to-slate-50 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours =
      Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  const filteredAnnouncements = announcements.filter((announcement) => {
    const matchesSearch =
      announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority =
      priorityFilter === "all" || announcement.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  const toggleExpanded = (id: string) => {
    setExpandedAnnouncement(expandedAnnouncement === id ? null : id);
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="overflow-y-auto scroll-smooth pt-20 md:pt-6 pb-20 flex items-center justify-center h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Megaphone className="h-10 w-10 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-pink-500 to-red-500 rounded-full animate-bounce">
              <Sparkles className="h-4 w-4 text-white p-1" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-32 mx-auto animate-pulse"></div>
            <div className="h-3 bg-gray-100 rounded w-24 mx-auto animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="overflow-y-auto scroll-smooth pt-20 md:pt-6 pb-20 min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-6">
        <Alert className="max-w-md border-red-200 bg-white shadow-xl">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <AlertDescription className="text-red-700 font-medium">
            Error loading announcements: {error.message}
          </AlertDescription>
          <Button
            variant="outline"
            className="mt-4 w-full border-red-200 text-red-600 hover:bg-red-50"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </Alert>
      </div>
    );
  }

  // Main Content
  return (
    <div className="overflow-y-auto scroll-smooth pt-20 md:pt-6 pb-20 min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 opacity-30">
          <div
            className="w-full h-full bg-repeat"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 sm:py-16">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-sm border border-white/30">
                  <Megaphone className="h-10 w-10" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-bounce">
                  <BellRing className="h-4 w-4 text-white" />
                </div>
              </div>
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold mb-4 tracking-tight">
              Event Announcements
            </h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto mb-8">
              Stay connected with the latest updates, important news, and
              exciting developments from your event
            </p>

            <div className="flex items-center justify-center gap-6 text-sm opacity-80">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <span>Live Updates</span>
              </div>
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <span>{announcements.length} Total</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Real-time</span>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white/10 to-transparent"></div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Search announcements..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12 border-0 bg-white/80 backdrop-blur-sm shadow-sm"
                  />
                </div>
                <div className="flex gap-3">
                  <Select
                    value={priorityFilter}
                    onValueChange={setPriorityFilter}
                  >
                    <SelectTrigger className="w-40 h-12 border-0 bg-white/80 backdrop-blur-sm shadow-sm">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter by priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="high">High Priority</SelectItem>
                      <SelectItem value="normal">Normal Priority</SelectItem>
                      <SelectItem value="low">Low Priority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Announcements List */}
        {filteredAnnouncements.length === 0 ? (
          <div className="text-center py-16">
            <Card className="max-w-md mx-auto border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardContent className="p-12">
                <div className="w-20 h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Megaphone className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {searchTerm || priorityFilter !== "all"
                    ? "No Results Found"
                    : "No Announcements Yet"}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {searchTerm || priorityFilter !== "all"
                    ? "Try adjusting your search terms or filters to find what you're looking for."
                    : "Check back later for important updates and announcements from the event organizers."}
                </p>
                {(searchTerm || priorityFilter !== "all") && (
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => {
                      setSearchTerm("");
                      setPriorityFilter("all");
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredAnnouncements.map((announcement, index) => (
              <Card
                key={announcement.id}
                className={`group border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden bg-gradient-to-r ${getPriorityGradient(
                  announcement.priority
                )} backdrop-blur-sm hover:-translate-y-1 animate-fade-in`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Organized Card Header */}
                <CardHeader className="bg-white/90 backdrop-blur-lg pb-2">
                  <div className="flex justify-between items-start gap-4">
                    {/* Left: Title + Priority */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-xs font-bold px-2 py-1 rounded-lg uppercase tracking-wide shadow-sm ${getPriorityColor(
                            announcement.priority
                          )}`}
                        >
                          {announcement.priority}
                        </span>
                        {announcement.send_immediately && (
                          <span className="inline-flex items-center bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-semibold rounded-lg px-2 py-1 ml-1 shadow-sm animate-pulse">
                            <BellRing className="h-3 w-3 mr-1" /> Urgent
                          </span>
                        )}
                      </div>
                      <h2 className="text-xl font-bold text-gray-900 group-hover:text-indigo-700 truncate transition-colors mb-0">
                        {announcement.title}
                      </h2>
                    </div>
                    {/* Right: Link Icon + More/Less Button */}
                    <div className="flex items-center gap-2">
                      {hasAnyLink(announcement) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openAnnouncementLink(announcement)}
                          className="shrink-0 h-8 w-8 p-0 rounded-full hover:bg-indigo-50"
                          title="Open attached link"
                        >
                          <ExternalLink className="h-4 w-4 text-indigo-600" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpanded(announcement.id)}
                        className="ml-2 shrink-0 h-8 w-18 px-2 text-indigo-600/80 font-medium hover:text-indigo-800"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        {expandedAnnouncement === announcement.id
                          ? "Less"
                          : "More"}
                        <ChevronRight
                          className={`h-4 w-4 ml-1 transition-transform ${
                            expandedAnnouncement === announcement.id
                              ? "rotate-90"
                              : ""
                          }`}
                        />
                      </Button>
                    </div>
                    {/* Meta info row */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-2">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-indigo-400" />
                        <span>{formatDate(announcement.created_at)}</span>
                      </div>
                      <span className="hidden sm:inline-block">•</span>
                      <div className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5 text-indigo-400" />
                        <span>Event Organizer</span>
                      </div>
                    </div>
                  </div>
                  {/* Meta info row */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-2">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-indigo-400" />
                      <span>{formatDate(announcement.created_at)}</span>
                    </div>
                    <span className="hidden sm:inline-block">•</span>
                    <div className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5 text-indigo-400" />
                      <span>Event Organizer</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="bg-white/95 backdrop-blur-md">
                  <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed mt-0">
                    {expandedAnnouncement === announcement.id ? (
                      announcement.content
                        .split("\n")
                        .map((paragraph, index) => (
                          <p key={index} className="mb-3 last:mb-0">
                            {paragraph}
                          </p>
                        ))
                    ) : (
                      <p className="line-clamp-2 mb-0">
                        {announcement.content.length > 150
                          ? `${announcement.content.substring(0, 150)}...`
                          : announcement.content}
                      </p>
                    )}
                  </div>

                  {/* Announcement image shows only when expanded */}
                  {announcement.image_url &&
                    expandedAnnouncement === announcement.id && (
                      <div className="mt-6">
                        <img
                          src={announcement.image_url}
                          alt="Announcement"
                          className="w-full h-auto rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
                        />
                      </div>
                    )}

                   {/* Social Media Links - Show when expanded */}
                   {expandedAnnouncement === announcement.id && (
                     <>
                       {(announcement.twitter_link || announcement.instagram_link || announcement.facebook_link || announcement.tiktok_link || announcement.website_link || announcement.whatsapp_link) && (
                         <div className="mt-4 pt-4 border-t border-gray-200">
                           <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                             <ExternalLink className="h-4 w-4" />
                             <span>Connect & Follow:</span>
                           </div>
                           <div className="flex flex-wrap gap-2">
                              {announcement.twitter_link && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    localStorage.setItem(`announcementLinkClicked_${announcement.id}`, 'true');
                                    window.open(announcement.twitter_link!, "_blank", "noopener,noreferrer");
                                  }}
                                >
                                  <FaXTwitter className="mr-2" /> Twitter/X
                                </Button>
                              )}
                              {announcement.instagram_link && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    localStorage.setItem(`announcementLinkClicked_${announcement.id}`, 'true');
                                    window.open(announcement.instagram_link!, "_blank", "noopener,noreferrer");
                                  }}
                                >
                                  <FaInstagram className="mr-2" /> Instagram
                                </Button>
                              )}
                              {announcement.facebook_link && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    localStorage.setItem(`announcementLinkClicked_${announcement.id}`, 'true');
                                    window.open(announcement.facebook_link!, "_blank", "noopener,noreferrer");
                                  }}
                                >
                                  <FaFacebook className="mr-2" /> Facebook
                                </Button>
                              )}
                              {announcement.tiktok_link && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    localStorage.setItem(`announcementLinkClicked_${announcement.id}`, 'true');
                                    window.open(announcement.tiktok_link!, "_blank", "noopener,noreferrer");
                                  }}
                                >
                                  <Play className="mr-2 h-4 w-4" /> TikTok
                                </Button>
                              )}
                             {announcement.website_link && (
                               <Button
                                 variant="outline"
                                 size="sm"
                                 onClick={() => {
                                   localStorage.setItem(`announcementLinkClicked_${announcement.id}`, 'true');
                                   window.open(announcement.website_link!, "_blank", "noopener,noreferrer");
                                 }}
                               >
                                 <Globe className="mr-2 h-4 w-4" /> Website
                               </Button>
                             )}
                           </div>
                         </div>
                       )}
                     </>
                   )}

                   {/* "Read more" button if not expanded */}
                  {announcement.content.length > 150 &&
                    expandedAnnouncement !== announcement.id && (
                      <Button
                        variant="link"
                        onClick={() => toggleExpanded(announcement.id)}
                        className="mt-2 p-0 h-auto text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        Read more <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const AttendeeAnnouncements = () => {
  return (
    // Remove the AppLayout wrapper
    <AttendeeEventProvider>
      <AttendeeRouteGuard>
        <AttendeeAnnouncementsContent />
      </AttendeeRouteGuard>
    </AttendeeEventProvider>
  );
};

const extractFirstUrlFromText = (text: string) => {
  const match = text?.match(/https?:\/\/[^\s)]+/i);
  return match ? match[0] : null;
};

const getAnnouncementPrimaryLink = (a: any) => {
  return (
    a.website_link ||
    a.twitter_link ||
    a.instagram_link ||
    a.facebook_link ||
    a.tiktok_link ||
    a.whatsapp_link ||
    extractFirstUrlFromText(a.content)
  );
};

const hasAnyLink = (a: any) => !!getAnnouncementPrimaryLink(a);

const openAnnouncementLink = (a: any) => {
  const url = getAnnouncementPrimaryLink(a);
  if (url) window.open(url, "_blank", "noopener,noreferrer");
};

export default AttendeeAnnouncements;
