import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAdminEventContext } from "@/hooks/useAdminEventContext";
import { useAttendeeNetworking } from "@/hooks/useAttendeeNetworking";
import { useNetworkingFilters } from "@/hooks/useNetworkingFilters";
import ChatRoom from "@/components/chat/ChatRoom";
import { AttendeeEventProvider, useAttendeeEventContext } from "@/contexts/AttendeeEventContext";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import EventSelector from "@/components/admin/EventSelector";
import PaymentGuard from '@/components/payment/PaymentGuard';
import {
  Users,
  MessageSquare,
  UserPlus,
  Network,
  Search,
  Filter,
  Share2,
  Copy,
  ExternalLink,
  Linkedin,
  Github,
  Instagram,
  Globe,
  Plus,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Send,
  Heart,
  MapPin,
  Sparkles,
} from "lucide-react";
import XLogo from "@/components/icons/XLogo";
import { DirectMessageThread } from "@/components/messaging/DirectMessageThread";
import { ConversationsList } from "@/components/messaging/ConversationsList";
import { useUnreadMessageCounts } from "@/hooks/useUnreadMessageCounts";

const AdminNetworking = () => {
  const { toast } = useToast();
  const { selectedEventId, selectedEvent } = useAdminEventContext();
  const [activeTab, setActiveTab] = useState("attendees");
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [expandedBios, setExpandedBios] = useState<Set<string>>(new Set());
  const [expandedPreferences, setExpandedPreferences] = useState<Set<string>>(new Set());
  const [shareChatOpen, setShareChatOpen] = useState(false);
  
  // Moved to parent to persist across tab changes
  const [selectedConversation, setSelectedConversation] = useState<{
    userId: string;
    userName: string;
    userPhoto?: string;
  } | null>(null);

  // Create a wrapper component for attendee networking context
  const AttendeeNetworkingContent = () => {
    const {
      attendees: profiles,
      isLoading: loading,
      error,
    } = useAttendeeNetworking();

    const {
      searchTerm,
      setSearchTerm,
      selectedNiches,
      setSelectedNiches,
      selectedNetworkingPrefs,
      setSelectedNetworkingPrefs,
      selectedTags,
      setSelectedTags,
      showSuggestedOnly,
      setShowSuggestedOnly,
      availableNiches,
      availableNetworkingPrefs,
      availableTags,
      filteredProfiles,
      clearAllFilters,
      calculateProfileCompletion,
    } = useNetworkingFilters(profiles);

    return { profiles, loading, error, filteredProfiles, searchTerm, setSearchTerm, clearAllFilters, calculateProfileCompletion };
  };

  // Create a special chat component that works with admin context
  const AdminChatRoom = ({ eventId }: { eventId: string }) => {
    return <ChatRoom eventId={eventId} />;
  };

  // Generate shareable link
  const generateShareableLink = () => {
    if (!selectedEventId) return '';
    const baseUrl = window.location.origin;
    return `${baseUrl}/attendee/networking?event=${selectedEventId}`;
  };

  const copyShareableLink = () => {
    const link = generateShareableLink();
    navigator.clipboard.writeText(link);
    toast({
      title: "Link copied!",
      description: "Shareable networking link has been copied to clipboard",
    });
  };

  const openInNewTab = () => {
    const link = generateShareableLink();
    window.open(link, '_blank');
  };

  // Live Chat share link helpers (public)
  const generateLiveChatLink = () => {
    if (!selectedEventId) return '';
    const baseUrl = window.location.origin;
    return `${baseUrl}/live-chat/${selectedEventId}`;
  };

  const copyLiveChatLink = () => {
    const link = generateLiveChatLink();
    navigator.clipboard.writeText(link);
    toast({
      title: "Link copied!",
      description: "Live Chat link has been copied to clipboard",
    });
  };

  const openLiveChat = () => {
    const link = generateLiveChatLink();
    window.open(link, '_blank');
  };

  // Create a hook that forces the attendee networking to use the selected event
  const useAdminAttendeeNetworking = (eventId: string) => {
    const { currentUser } = useAuth();
    
    const {
      data: attendees = [],
      isLoading,
      error,
    } = useQuery({
      queryKey: ["admin-attendee-networking", currentUser?.id, eventId],
      enabled: !!currentUser?.id && !!eventId,
      staleTime: 1000 * 60 * 5, // 5 minutes
      queryFn: async (): Promise<any[]> => {
        if (!currentUser?.id || !eventId) {
          return [];
        }

        try {
          // Use the RPC function to get attendees with profile data
          const { data, error } = await supabase.rpc('get_event_attendees_with_profiles', {
            p_event_id: eventId
          });

          if (error) {
            console.error('Admin networking - RPC error:', error);
            throw error;
          }

          const attendeeProfiles = (data || [])
            .map((row: any) => ({
              id: row.user_id,
              name: row.name || "Unknown",
              role: row.role,
              company: row.company,
              bio: row.bio,
              niche: row.niche,
              photo_url: row.photo_url,
              networking_preferences: row.networking_preferences,
              tags: row.tags,
              twitter_link: row.twitter_link,
              linkedin_link: row.linkedin_link,
              github_link: row.github_link,
              instagram_link: row.instagram_link,
              website_link: row.website_link,
              created_at: row.created_at,
            }));

          return attendeeProfiles;
        } catch (error) {
          console.error('Admin networking - Query error:', error);
          throw error;
        }
      },
    });

    return { attendees, isLoading, error };
  };

  function AdminNetworkingContent({ 
    eventId,
    selectedConversation,
    setSelectedConversation 
  }: { 
    eventId: string;
    selectedConversation: { userId: string; userName: string; userPhoto?: string } | null;
    setSelectedConversation: React.Dispatch<React.SetStateAction<{ userId: string; userName: string; userPhoto?: string } | null>>;
  }) {
    const {
      attendees: profiles,
      isLoading: loading,
      error,
    } = useAdminAttendeeNetworking(eventId);

    const {
      searchTerm,
      setSearchTerm,
      selectedNiches,
      setSelectedNiches,
      selectedNetworkingPrefs,
      setSelectedNetworkingPrefs,
      selectedTags,
      setSelectedTags,
      showSuggestedOnly,
      setShowSuggestedOnly,
      availableNiches,
      availableNetworkingPrefs,
      availableTags,
      filteredProfiles,
      clearAllFilters,
      calculateProfileCompletion,
    } = useNetworkingFilters(profiles);

    // Unread message counts with real-time updates
    const { unreadMessages, unreadChats, markChatAsSeen } = useUnreadMessageCounts(eventId);
    
    // Mark chat as seen when switching to chat tab
    useEffect(() => {
      if (activeTab === 'chat') {
        markChatAsSeen();
      }
    }, [activeTab, markChatAsSeen]);

    // Pagination calculations
    const totalPages = Math.ceil(filteredProfiles.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedProfiles = filteredProfiles.slice(startIndex, endIndex);

    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading networking data...</p>
          </div>
        </div>
      );
    }

    return (
      <>
        {/* Modern Header with Purple Gradient - Matching Attendee Style */}
        <div className="mb-8 relative overflow-hidden">
          <div className="relative bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-transparent"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>

            {/* Content */}
            <div className="relative z-10">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Icon */}
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-white" />
                  </div>

                  {/* Title and Description */}
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
                    Attendee Connections
                  </h1>
                  <p className="text-purple-100 text-sm sm:text-base lg:text-lg font-medium mb-4">
                    Manage and monitor attendee networking for <span className="font-semibold">{selectedEvent?.name}</span>
                  </p>

                  {/* Stats */}
                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1.5">
                      <span className="text-white text-xs sm:text-sm font-medium">
                        {profiles.length} Attendees
                      </span>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1.5">
                      <span className="text-white text-xs sm:text-sm font-medium">
                        {profiles.filter(p => p.networking_visible !== false).length} Connections Enabled
                      </span>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1.5">
                      <span className="text-white text-xs sm:text-sm font-medium">
                        {profiles.filter(p => calculateProfileCompletion(p) >= 70).length} Complete Profiles
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right side decorative element */}
                <div className="hidden sm:block">
                  <div className="w-16 h-16 lg:w-20 lg:h-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <Network className="h-8 w-8 lg:h-10 lg:w-10 text-white/80" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs for different views */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <TabsList className="grid w-full grid-cols-3 gap-0.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/70 p-0.5 shadow-sm h-auto sm:h-10 overflow-visible">
              {/* People */}
              <TabsTrigger
                value="attendees"
                className="px-1.5 sm:px-2.5 py-1.5 sm:py-1 h-auto sm:h-9 rounded-lg text-[10px] sm:text-sm font-medium transition-colors
                  data-[state=active]:text-white
                  data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:via-purple-500 data-[state=active]:to-indigo-500"
              >
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="truncate">People</span>
                </div>
              </TabsTrigger>

              {/* Chat Room */}
              <TabsTrigger
                value="chat"
                className="relative px-1.5 sm:px-2.5 py-1.5 sm:py-1 h-auto sm:h-9 rounded-lg text-[10px] sm:text-sm font-medium transition-colors
                  data-[state=active]:text-white
                  data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:via-purple-500 data-[state=active]:to-indigo-500"
              >
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="truncate">Chat Room</span>
                  {unreadChats > 0 && (
                    <Badge className="h-4 min-w-[16px] rounded-full bg-destructive text-destructive-foreground text-[9px] px-1 font-bold flex-shrink-0">
                      {unreadChats > 99 ? '99+' : unreadChats}
                    </Badge>
                  )}
                </div>
              </TabsTrigger>

              {/* Messages */}
              <TabsTrigger
                value="messages"
                className="relative px-1.5 sm:px-2.5 py-1.5 sm:py-1 h-auto sm:h-9 rounded-lg text-[10px] sm:text-sm font-medium transition-colors
                  data-[state=active]:text-white
                  data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:via-purple-500 data-[state=active]:to-indigo-500"
              >
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="truncate">Messages</span>
                  {unreadMessages > 0 && (
                    <Badge className="h-4 min-w-[16px] rounded-full bg-destructive text-destructive-foreground text-[9px] px-1 font-bold flex-shrink-0">
                      {unreadMessages > 99 ? '99+' : unreadMessages}
                    </Badge>
                  )}
                </div>
              </TabsTrigger>
            </TabsList>

            {/* Share Button */}
            <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 hover-scale">
                  <Share2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Share Networking</span>
                  <span className="sm:hidden">Share</span>
                </Button>
              </DialogTrigger>
                <DialogContent className="sm:max-w-lg max-w-[95vw] w-full mx-4 rounded-xl border-0 bg-gradient-to-br from-background via-background to-primary/5 shadow-2xl">
                  <DialogHeader className="space-y-3 pb-4">
                    <DialogTitle className="flex items-center gap-3 text-xl font-semibold">
                      <div className="p-2 rounded-full bg-primary/10">
                        <Share2 className="h-5 w-5 text-primary" />
                      </div>
                      Share Connections Page
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Share this link to allow attendees to access the connections page directly.
                    </p>
                  </DialogHeader>
                  
                  <div className="space-y-6">
                    {/* URL Display with Copy Button */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Shareable Link</label>
                      <div className="relative">
                        <div className="flex items-center rounded-lg border border-border bg-muted/50 p-3 pr-12 min-h-[44px] overflow-hidden">
                          <span className="text-sm text-foreground break-all font-mono leading-relaxed max-w-full">
                            {generateShareableLink()}
                          </span>
                        </div>
                        <Button 
                          size="sm" 
                          onClick={copyShareableLink} 
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 px-3 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                        >
                          <Copy className="h-3.5 w-3.5" />
                          <span className="sr-only">Copy link</span>
                        </Button>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <Button 
                        onClick={openInNewTab} 
                        variant="outline" 
                        className="flex-1 gap-2 h-11 border-primary/20 hover:border-primary/40 hover:bg-primary/5"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Preview Connections
                      </Button>
                      <Button 
                        onClick={() => setShareDialogOpen(false)} 
                        className="flex-1 h-11 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                      >
                        Done
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
          </div>

          <TabsContent value="attendees" className="space-y-6">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search attendees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                onClick={clearAllFilters}
                className="gap-2"
              >
                <Filter className="h-4 w-4" />
                Clear Filters
              </Button>
            </div>

            {/* Attendees Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedProfiles.map((profile) => {
                const isBioExpanded = expandedBios.has(profile.id);
                const shouldShowReadMore = typeof profile.bio === "string" && profile.bio.length > 160;
                
                return (
                  <Card
                    key={profile.id}
                    className="group relative overflow-hidden bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50 border-0 shadow-lg hover:shadow-2xl transition-all duration-500 rounded-2xl h-full flex flex-col"
                  >
                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-100/20 to-transparent rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-100/20 to-transparent rounded-full translate-y-12 -translate-x-12 group-hover:scale-125 transition-transform duration-700" />

                    <CardHeader className="relative z-10 pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <Avatar className="h-16 w-16 ring-4 ring-white dark:ring-gray-700 shadow-lg">
                              {profile.photo_url ? (
                                <AvatarImage
                                  src={profile.photo_url}
                                  alt={profile.name || ""}
                                  className="object-cover"
                                />
                              ) : (
                                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-purple-600 text-white text-lg font-bold">
                                  {profile.name
                                    ?.split(" ")
                                    .map((n: string) => n[0])
                                    .join("") || "?"}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <div
                              className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-white dark:border-gray-800"
                              title="Online"
                            />
                          </div>

                          <div className="flex-1">
                            <CardTitle className="text-xl text-gray-900 dark:text-white font-bold mb-1">
                              {profile.name || "Unknown"}
                            </CardTitle>
                            <CardDescription className="text-sm flex flex-col space-y-1">
                              <span className="text-gray-600 dark:text-gray-400 font-medium">
                                {profile.role || "No role specified"}
                              </span>
                              {profile.company && (
                                <span className="text-gray-500 dark:text-gray-500 text-xs flex items-center">
                                  <MapPin size={12} className="mr-1" />
                                  {profile.company}
                                </span>
                              )}
                            </CardDescription>
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    {/* Body: scrollable content + sticky bottom actions */}
                    <CardContent className="relative z-10 flex-1 flex flex-col overflow-hidden p-5 gap-4">
                      {/* Scrollable content area with consistent vertical spacing */}
                      <div className="flex-1 min-h-0 overflow-y-auto space-y-4 pr-1">
                        {/* About Section */}
                        {profile.bio && (
                          <>
                            <div
                              className={`relative bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 backdrop-blur-sm ${
                                isBioExpanded ? "max-h-48 overflow-y-auto pr-1" : ""
                              }`}
                            >
                              <p
                                className={`text-sm text-gray-700 dark:text-gray-300 leading-relaxed ${
                                  isBioExpanded ? "" : "line-clamp-3"
                                }`}
                              >
                                {profile.bio}
                              </p>
                              {!isBioExpanded && shouldShowReadMore && (
                                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-white dark:from-gray-800 to-transparent" />
                              )}
                            </div>

                            {shouldShowReadMore && (
                              <button
                                type="button"
                                aria-expanded={isBioExpanded}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const next = new Set(expandedBios);
                                  if (isBioExpanded) next.delete(profile.id);
                                  else next.add(profile.id);
                                  setExpandedBios(next);
                                }}
                                className="text-xs font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 hover:underline"
                              >
                                {isBioExpanded ? "Show less" : "Read more"}
                              </button>
                            )}
                          </>
                        )}

                        {/* Professional Niche */}
                        {profile.niche && (
                          <div className="flex items-center gap-2">
                            <Sparkles size={16} className="text-purple-500" />
                            <Badge
                              variant="outline"
                              className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700 font-medium"
                            >
                              {profile.niche}
                            </Badge>
                          </div>
                        )}

                        {/* Interests Tags */}
                        {profile.tags && profile.tags.length > 0 && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Heart size={14} className="text-red-400" />
                              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                Interests
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {profile.tags
                                .slice(0, 3)
                                .map((tag: string, index: number) => (
                                  <Badge
                                    key={index}
                                    variant="outline"
                                    className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700 text-xs"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                              {profile.tags.length > 3 && (
                                <Badge
                                  variant="outline"
                                  className="bg-gray-50 dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-600 text-xs"
                                >
                                  +{profile.tags.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Networking Preferences */}
                        {profile.networking_preferences &&
                          profile.networking_preferences.length > 0 && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Network size={14} className="text-blue-400" />
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                  Looking to connect with
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {(expandedPreferences.has(profile.id)
                                  ? profile.networking_preferences
                                  : profile.networking_preferences.slice(0, 2)
                                ).map((pref: string, index: number) => (
                                  <Badge
                                    key={index}
                                    variant="outline"
                                    className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700 text-xs"
                                  >
                                    {pref}
                                  </Badge>
                                ))}
                                {profile.networking_preferences.length > 2 && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const newExpanded = new Set(expandedPreferences);
                                      if (expandedPreferences.has(profile.id)) {
                                        newExpanded.delete(profile.id);
                                      } else {
                                        newExpanded.add(profile.id);
                                      }
                                      setExpandedPreferences(newExpanded);
                                    }}
                                    className="h-auto px-2 py-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                                  >
                                    {expandedPreferences.has(profile.id) ? (
                                      <>
                                        <ChevronUp size={12} className="mr-1" />
                                        Show less
                                      </>
                                    ) : (
                                      <>
                                        <ChevronDown size={12} className="mr-1" />+
                                        {profile.networking_preferences.length - 2} more
                                      </>
                                    )}
                                  </Button>
                                )}
                              </div>
                            </div>
                          )}

                        {/* Social Links */}
                        <div className="flex gap-2">
                          {profile.twitter_link && (
                            <button
                              onClick={() => window.open(profile.twitter_link, "_blank")}
                              className="p-2 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 hover:from-purple-100 hover:to-purple-200 text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                              title="Follow on X"
                            >
                              <XLogo size={16} />
                            </button>
                          )}
                          {profile.linkedin_link && (
                            <button
                              onClick={() => window.open(profile.linkedin_link, "_blank")}
                              className="p-2 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 hover:from-purple-100 hover:to-purple-200 text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                              title="Follow on LinkedIn"
                            >
                              <Linkedin size={16} />
                            </button>
                          )}
                          {profile.github_link && (
                            <button
                              onClick={() => window.open(profile.github_link, "_blank")}
                              className="p-2 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 hover:from-purple-100 hover:to-purple-200 text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                              title="Follow on GitHub"
                            >
                              <Github size={16} />
                            </button>
                          )}
                          {profile.instagram_link && (
                            <button
                              onClick={() => window.open(profile.instagram_link, "_blank")}
                              className="p-2 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 hover:from-purple-100 hover:to-purple-200 text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                              title="Follow on Instagram"
                            >
                              <Instagram size={16} />
                            </button>
                          )}
                          {profile.website_link && (
                            <button
                              onClick={() => window.open(profile.website_link, "_blank")}
                              className="p-2 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 hover:from-purple-100 hover:to-purple-200 text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                              title="Visit website"
                            >
                              <Globe size={16} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Sticky bottom action bar */}
                      <div className="-mx-5 px-5 pt-3 pb-4 sticky bottom-0 bg-white/85 dark:bg-gray-900/85 backdrop-blur border-t border-gray-200 dark:border-gray-700">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedConversation({
                              userId: profile.id,
                              userName: profile.name,
                              userPhoto: profile.photo_url,
                            });
                            setActiveTab("messages");
                          }}
                          className="w-full h-10 border-gray-200 dark:border-gray-600 bg-white/90 hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-800"
                        >
                          <MessageSquare size={16} className="mr-2" />
                          Message
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 pt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            {filteredProfiles.length === 0 && (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-muted-foreground opacity-30" />
                <h3 className="mt-4 text-lg font-medium">No attendees found</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  No attendees match your current filters.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="chat" className="m-0">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
              <AdminChatRoom eventId={eventId} />
            </div>
          </TabsContent>

          <TabsContent value="messages" className="mt-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 h-[600px] flex flex-col overflow-hidden">
              {selectedConversation ? (
                <DirectMessageThread
                  recipientId={selectedConversation.userId}
                  recipientName={selectedConversation.userName}
                  recipientPhoto={selectedConversation.userPhoto}
                  onBack={() => setSelectedConversation(null)}
                />
              ) : (
                <ConversationsList 
                  onSelect={(userId, userName, userPhoto) => 
                    setSelectedConversation({ userId, userName, userPhoto })
                  } 
                />
              )}
            </div>
          </TabsContent>
        </Tabs>

        {error && (
          <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm">
            Error loading networking data: {error.message}
          </div>
        )}
      </>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Event Selector */}
      <div className="flex justify-between items-center">
        <EventSelector />
      </div>

      {/* Show message when no event is selected */}
      {!selectedEventId && (
        <div className="text-center py-12">
          <div className="p-4 rounded-full bg-primary/10 inline-block mb-4">
            <Network className="h-8 w-8 text-primary" />
          </div>
          <p className="text-muted-foreground text-lg mb-2">No event selected</p>
          <p className="text-sm text-muted-foreground">Please select an event above to manage attendee networking</p>
        </div>
      )}

      {/* Only show content when an event is selected */}
      {selectedEventId && (
        <PaymentGuard 
          eventId={selectedEventId} 
          eventName={selectedEvent?.name || 'this event'}
          feature="Attendee Networking Management"
        >
          <AdminNetworkingContent 
            eventId={selectedEventId} 
            selectedConversation={selectedConversation}
            setSelectedConversation={setSelectedConversation}
          />
        </PaymentGuard>
      )}
    </div>
  );
};

export default AdminNetworking;