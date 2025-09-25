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
} from "lucide-react";
import XLogo from "@/components/icons/XLogo";
import { DirectMessageThread } from "@/components/messaging/DirectMessageThread";

const AdminNetworking = () => {
  const { toast } = useToast();
  const { selectedEventId, selectedEvent } = useAdminEventContext();
  const [activeTab, setActiveTab] = useState("attendees");
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const [shareChatOpen, setShareChatOpen] = useState(false);

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

  const AdminNetworkingContent = ({ eventId }: { eventId: string }) => {
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

    // Add DM dialog state
    const [dmOpen, setDmOpen] = useState(false);
    const [dmRecipient, setDmRecipient] = useState<{ id: string; name: string; photo_url?: string } | null>(null);

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
        {/* Modern Hero Section with Glassmorphism */}
        <div className="relative p-8 rounded-3xl bg-gradient-to-br from-violet-500/10 via-blue-500/10 to-cyan-500/10 border border-white/20 backdrop-blur-xl shadow-2xl mb-8 overflow-hidden animate-fade-in">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-cyan-500/5"></div>
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-violet-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-gradient-to-tr from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 backdrop-blur-sm border border-white/20">
                <Network className="h-8 w-8 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  Networking Hub
                </h1>
                <p className="text-lg text-muted-foreground mt-1">
                  Connect, engage, and grow your event community
                </p>
              </div>
            </div>
            
            <p className="text-xl text-foreground/80 max-w-3xl mb-8 leading-relaxed">
              Manage attendee connections for <span className="font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">{selectedEvent?.name}</span>
            </p>
            
            {/* Dynamic Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="group relative p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover-scale">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500/20 to-violet-500/10 border border-violet-500/20">
                    <Users className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground/70 uppercase tracking-wide">Total Attendees</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{profiles.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="group relative p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover-scale">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/10 border border-blue-500/20">
                    <Network className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground/70 uppercase tracking-wide">Active Networkers</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{profiles.filter(p => p.networking_visible !== false).length}</p>
                  </div>
                </div>
              </div>
              
              <div className="group relative p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover-scale">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-500/10 border border-cyan-500/20">
                    <UserPlus className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground/70 uppercase tracking-wide">Complete Profiles</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{profiles.filter(p => calculateProfileCompletion(p) >= 70).length}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Tabs and Controls */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Management Center
            </h2>
            <p className="text-muted-foreground text-lg">
              Monitor connections and engage with your community
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Modern Tab Selector */}
            <div className="relative p-1 rounded-2xl bg-muted/50 backdrop-blur-sm border border-muted-foreground/20">
              <div className="flex">
                <button
                  onClick={() => setActiveTab("attendees")}
                  className={`relative px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                    activeTab === "attendees"
                      ? "bg-gradient-to-r from-violet-500 to-blue-500 text-white shadow-lg shadow-violet-500/25 scale-105"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
                  }`}
                >
                  <Users size={16} className="inline mr-2" />
                  Attendees
                  {activeTab === "attendees" && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 rounded-full bg-white/80 animate-pulse"></div>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("chat")}
                  className={`relative px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                    activeTab === "chat"
                      ? "bg-gradient-to-r from-violet-500 to-blue-500 text-white shadow-lg shadow-violet-500/25 scale-105"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
                  }`}
                >
                  <MessageSquare size={16} className="inline mr-2" />
                  Chat Room
                  {activeTab === "chat" && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 rounded-full bg-white/80 animate-pulse"></div>
                  )}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {/* Share Networking Button */}
              <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="group gap-2 px-6 py-3 rounded-xl border-2 border-violet-500/30 hover:border-violet-500/50 hover:bg-violet-500/10 hover:scale-105 transition-all duration-300 hover-scale">
                    <Share2 className="h-4 w-4 text-violet-600 group-hover:rotate-12 transition-transform duration-300" />
                    <span className="font-medium">Share Network</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg max-w-[95vw] w-full mx-4 rounded-2xl border-0 bg-gradient-to-br from-background via-background to-violet-500/5 shadow-2xl backdrop-blur-xl animate-scale-in">
                  <DialogHeader className="space-y-4 pb-6">
                    <DialogTitle className="flex items-center gap-3 text-2xl font-bold">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 border border-violet-500/20">
                        <Share2 className="h-6 w-6 text-violet-600" />
                      </div>
                      Share Networking Hub
                    </DialogTitle>
                    <p className="text-muted-foreground leading-relaxed">
                      Give attendees direct access to connect and network with each other.
                    </p>
                  </DialogHeader>
                  
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-foreground uppercase tracking-wide">Shareable Link</label>
                      <div className="relative group">
                        <div className="flex items-center rounded-xl border border-border bg-muted/30 p-4 min-h-[52px] overflow-hidden backdrop-blur-sm">
                          <span className="text-sm text-foreground break-all font-mono leading-relaxed max-w-full">
                            {generateShareableLink()}
                          </span>
                        </div>
                        <Button 
                          size="sm" 
                          onClick={copyShareableLink} 
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-9 px-4 bg-gradient-to-r from-violet-500 to-blue-500 hover:from-violet-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg hover:scale-105"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <Button 
                        onClick={openInNewTab} 
                        variant="outline" 
                        className="flex-1 gap-2 h-12 border-violet-500/30 hover:border-violet-500/50 hover:bg-violet-500/10 transition-all duration-300 rounded-xl hover:scale-105"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Preview Experience
                      </Button>
                      <Button 
                        onClick={() => setShareDialogOpen(false)} 
                        className="flex-1 h-12 bg-gradient-to-r from-violet-500 to-blue-500 hover:from-violet-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl hover:scale-105"
                      >
                        Done
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              
              {/* Live Chat Share Button */}
              <Dialog open={shareChatOpen} onOpenChange={setShareChatOpen}>
                <DialogTrigger asChild>
                  <Button className="group gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover-scale">
                    <MessageSquare className="h-4 w-4 group-hover:rotate-12 transition-transform duration-300" />
                    <span className="font-medium">Share Chat</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg max-w-[95vw] w-full mx-4 rounded-2xl border-0 bg-gradient-to-br from-background via-background to-blue-500/5 shadow-2xl backdrop-blur-xl animate-scale-in">
                  <DialogHeader className="space-y-4 pb-6">
                    <DialogTitle className="flex items-center gap-3 text-2xl font-bold">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/20">
                        <MessageSquare className="h-6 w-6 text-blue-600" />
                      </div>
                      Live Chat Access
                    </DialogTitle>
                    <p className="text-muted-foreground leading-relaxed">
                      Share this public chat room link with your attendees for real-time discussions.
                    </p>
                  </DialogHeader>
                  
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-foreground uppercase tracking-wide">Public Chat Link</label>
                      <div className="relative group">
                        <div className="flex items-center rounded-xl border border-border bg-muted/30 p-4 min-h-[52px] overflow-hidden backdrop-blur-sm">
                          <span className="text-sm text-foreground break-all font-mono leading-relaxed max-w-full">
                            {generateLiveChatLink()}
                          </span>
                        </div>
                        <Button 
                          size="sm" 
                          onClick={copyLiveChatLink} 
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-9 px-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg hover:scale-105"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <Button 
                        onClick={openLiveChat} 
                        variant="outline" 
                        className="flex-1 gap-2 h-12 border-blue-500/30 hover:border-blue-500/50 hover:bg-blue-500/10 transition-all duration-300 rounded-xl hover:scale-105"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Open Chat Room
                      </Button>
                      <Button 
                        onClick={() => setShareChatOpen(false)} 
                        className="flex-1 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl hover:scale-105"
                      >
                        Done
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsContent value="attendees" className="space-y-6">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search attendees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 rounded-xl border-2 border-muted-foreground/20 focus:border-violet-500/50 transition-colors duration-300"
                />
              </div>
              <Button
                variant="outline"
                onClick={clearAllFilters}
                className="gap-2 px-6 py-2 rounded-xl hover:scale-105 transition-all duration-300"
              >
                <Filter className="h-4 w-4" />
                Clear Filters
              </Button>
            </div>

            {/* Modern Attendees Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
              {paginatedProfiles.map((profile, index) => (
                <Card 
                  key={profile.id} 
                  className="group relative overflow-hidden rounded-2xl border-0 bg-gradient-to-br from-white/80 via-white/60 to-white/40 dark:from-gray-900/80 dark:via-gray-900/60 dark:to-gray-900/40 backdrop-blur-xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                  
                  {/* Profile Completion Ring */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500">
                    <div className="relative w-12 h-12">
                      <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-gray-200"
                          strokeWidth="3"
                          stroke="currentColor"
                          fill="transparent"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className="text-violet-500"
                          strokeWidth="3"
                          strokeDasharray={`${calculateProfileCompletion(profile)}, 100`}
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="transparent"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-bold text-violet-600">{calculateProfileCompletion(profile)}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <CardHeader className="pb-4 relative z-10">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <Avatar className="h-16 w-16 ring-4 ring-white/50 shadow-xl border-2 border-white/20">
                          <AvatarImage src={profile.photo_url} alt={profile.name} className="object-cover" />
                          <AvatarFallback className="bg-gradient-to-br from-violet-500 to-blue-500 text-white font-bold text-lg">
                            {profile.name?.charAt(0) || "A"}
                          </AvatarFallback>
                        </Avatar>
                        {/* Online Status Indicator */}
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg text-foreground truncate group-hover:text-violet-600 transition-colors duration-300">
                          {profile.name || "Anonymous"}
                        </h3>
                        {profile.role && (
                          <p className="text-sm text-muted-foreground truncate font-medium">
                            {profile.role}
                          </p>
                        )}
                        {profile.niche && (
                          <p className="text-xs text-muted-foreground/70 truncate">
                            {profile.niche}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0 space-y-4 relative z-10">
                    {profile.company && (
                      <div className="flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-blue-50/50 to-cyan-50/50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200/30 dark:border-blue-700/30">
                        <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"></div>
                        <span className="text-sm font-medium text-foreground truncate">{profile.company}</span>
                      </div>
                    )}
                    
                    {profile.bio && (
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {profile.bio}
                      </p>
                    )}
                    
                    {/* Tags */}
                    {profile.tags && profile.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {profile.tags.slice(0, 3).map((tag, tagIndex) => (
                          <Badge 
                            key={tagIndex} 
                            className="text-xs px-3 py-1 bg-gradient-to-r from-violet-100 to-blue-100 dark:from-violet-900/30 dark:to-blue-900/30 text-violet-700 dark:text-violet-300 border border-violet-200/50 dark:border-violet-700/50 hover:scale-105 transition-transform duration-200"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {profile.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs px-2 py-1 border-dashed hover:scale-105 transition-transform duration-200">
                            +{profile.tags.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    {/* Social Links */}
                    <div className="flex justify-between items-center pt-3 border-t border-muted/20">
                      <div className="flex space-x-2">
                        {profile.linkedin_link && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 w-9 p-0 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 hover:scale-110 transition-all duration-300 group/btn"
                            onClick={() => window.open(profile.linkedin_link, '_blank')}
                          >
                            <Linkedin className="h-4 w-4 group-hover/btn:scale-125 transition-transform duration-200" />
                          </Button>
                        )}
                        {profile.twitter_link && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 w-9 p-0 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900/30 hover:text-slate-600 hover:scale-110 transition-all duration-300 group/btn"
                            onClick={() => window.open(profile.twitter_link, '_blank')}
                          >
                            <XLogo className="h-4 w-4 group-hover/btn:scale-125 transition-transform duration-200" />
                          </Button>
                        )}
                        {profile.github_link && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 w-9 p-0 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-900/30 hover:text-gray-600 hover:scale-110 transition-all duration-300 group/btn"
                            onClick={() => window.open(profile.github_link, '_blank')}
                          >
                            <Github className="h-4 w-4 group-hover/btn:scale-125 transition-transform duration-200" />
                          </Button>
                        )}
                        {profile.website_link && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 w-9 p-0 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 hover:text-green-600 hover:scale-110 transition-all duration-300 group/btn"
                            onClick={() => window.open(profile.website_link, '_blank')}
                          >
                            <Globe className="h-4 w-4 group-hover/btn:scale-125 transition-transform duration-200" />
                          </Button>
                        )}
                      </div>
                      
                      {/* Message Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="px-4 py-2 rounded-xl border-violet-200 dark:border-violet-700 hover:bg-gradient-to-r hover:from-violet-50 hover:to-blue-50 dark:hover:from-violet-900/20 dark:hover:to-blue-900/20 hover:border-violet-300 dark:hover:border-violet-600 hover:scale-105 transition-all duration-300 group/msg"
                        onClick={() => {
                          setDmRecipient({ 
                            id: profile.id, 
                            name: profile.name || 'Anonymous', 
                            photo_url: profile.photo_url 
                          });
                          setDmOpen(true);
                        }}
                      >
                        <MessageSquare className="h-3 w-3 mr-1 group-hover/msg:scale-110 transition-transform duration-200" />
                        <span className="text-xs font-medium">Message</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 pt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="rounded-xl hover:scale-105 transition-all duration-300"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground font-medium px-4">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="rounded-xl hover:scale-105 transition-all duration-300"
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

          <TabsContent value="chat" className="space-y-6">
            <Card className="rounded-2xl border-0 bg-gradient-to-br from-white/80 to-white/60 dark:from-gray-900/80 dark:to-gray-900/60 backdrop-blur-xl shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                  </div>
                  Event Chat Room
                </CardTitle>
                <CardDescription className="text-base">
                  Participate in the live event chat as an admin moderator.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[600px] rounded-xl overflow-hidden">
                  <AdminChatRoom eventId={eventId} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* DM Dialog */}
        <Dialog open={dmOpen} onOpenChange={setDmOpen}>
          <DialogContent className="max-w-3xl w-[95vw] rounded-2xl">
            <DialogHeader>
              <DialogTitle>Direct Message</DialogTitle>
            </DialogHeader>
            {dmRecipient && (
              <DirectMessageThread
                recipientId={dmRecipient.id}
                recipientName={dmRecipient.name}
                recipientPhoto={dmRecipient.photo_url}
                onBack={() => setDmOpen(false)}
              />
            )}
          </DialogContent>
        </Dialog>

        {error && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-xl text-sm border border-destructive/20">
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
          <AdminNetworkingContent eventId={selectedEventId} />
        </PaymentGuard>
      )}
    </div>
  );
};

export default AdminNetworking;