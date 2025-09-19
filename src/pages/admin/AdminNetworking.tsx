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
        {/* Gradient Hero Section */}
        <div className="p-8 rounded-2xl bg-gradient-to-br from-primary-100 via-blue-100 to-indigo-50 text-primary-900 dark:text-white shadow-2xl shadow-primary/10 mb-2 relative overflow-hidden">
          <div className="absolute -top-12 -right-10 w-56 h-56 bg-white/10 rounded-full opacity-40 blur-2xl pointer-events-none"></div>
          <div className="absolute -bottom-14 -left-14 w-36 h-36 bg-white/20 rounded-full opacity-30 pointer-events-none"></div>
          <div className="relative z-10">
            <h1 className="text-4xl font-bold tracking-tight">Attendee Networking</h1>
            <p className="mt-2 max-w-2xl text-primary-700 dark:text-primary-100">
              Manage and monitor attendee networking for <span className="font-semibold">{selectedEvent?.name}</span>.
            </p>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-white/50 border-white/20">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Total Attendees</p>
                      <p className="text-2xl font-bold">{profiles.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white/50 border-white/20">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Network className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Networking Enabled</p>
                      <p className="text-2xl font-bold">{profiles.filter(p => p.networking_visible !== false).length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white/50 border-white/20">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <UserPlus className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Complete Profiles</p>
                      <p className="text-2xl font-bold">{profiles.filter(p => calculateProfileCompletion(p) >= 70).length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Tabs for different views */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold">Networking Management</h2>
              <p className="text-muted-foreground mt-1">
                View attendee profiles and participate in event chat.
              </p>
            </div>
            <div className="flex gap-2">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="attendees" className="flex items-center gap-2">
                  <Users size={16} />
                  <span className="text-xs sm:text-sm">Attendees</span>
                </TabsTrigger>
                <TabsTrigger value="chat" className="flex items-center gap-2">
                  <MessageSquare size={16} />
                  <span className="text-xs sm:text-sm">Chat Room</span>
                </TabsTrigger>
              </TabsList>
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
                      Share Networking Page
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Share this link to allow attendees to access the networking page directly.
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
                        Preview Networking
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedProfiles.map((profile) => (
                <Card key={profile.id} className="group hover:shadow-lg transition-all duration-300 border-muted/40 hover:border-primary/20">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12 ring-2 ring-background shadow-md">
                        <AvatarImage src={profile.photo_url} alt={profile.name} />
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
                          {profile.name?.charAt(0) || "A"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">
                          {profile.name || "Anonymous"}
                        </h3>
                        {profile.role && (
                          <p className="text-sm text-muted-foreground truncate">
                            {profile.role}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0 space-y-4">
                    {profile.company && (
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <div className="w-2 h-2 bg-primary/40 rounded-full"></div>
                        <span className="truncate">{profile.company}</span>
                      </div>
                    )}
                    
                    {profile.bio && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {profile.bio}
                      </p>
                    )}
                    
                    {profile.tags && profile.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {profile.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {profile.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{profile.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    {/* Social Links */}
                    <div className="flex space-x-2 pt-2">
                      {profile.linkedin_link && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                          onClick={() => window.open(profile.linkedin_link, '_blank')}
                        >
                          <Linkedin className="h-4 w-4" />
                        </Button>
                      )}
                      {profile.twitter_link && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-slate-50 hover:text-slate-600"
                          onClick={() => window.open(profile.twitter_link, '_blank')}
                        >
                          <XLogo className="h-4 w-4" />
                        </Button>
                      )}
                      {profile.github_link && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-gray-50 hover:text-gray-600"
                          onClick={() => window.open(profile.github_link, '_blank')}
                        >
                          <Github className="h-4 w-4" />
                        </Button>
                      )}
                      {profile.website_link && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600"
                          onClick={() => window.open(profile.website_link, '_blank')}
                        >
                          <Globe className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    {/* Admin -> Attendee DM */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-2"
                      onClick={() => {
                        setDmRecipient({ id: profile.id, name: profile.name, photo_url: profile.photo_url });
                        setDmOpen(true);
                      }}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Message
                    </Button>
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

          <TabsContent value="chat" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Event Chat Room
                </CardTitle>
                <CardDescription>
                  Participate in the live event chat as an admin moderator.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[600px]">
                  <AdminChatRoom eventId={eventId} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* DM Dialog */}
        <Dialog open={dmOpen} onOpenChange={setDmOpen}>
          <DialogContent className="max-w-3xl w-[95vw]">
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
          <AdminNetworkingContent eventId={selectedEventId} />
        </PaymentGuard>
      )}
    </div>
  );
};

export default AdminNetworking;