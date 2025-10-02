import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Send,
  UserPlus,
  MessageSquare,
  X,
  Linkedin,
  Github,
  Instagram,
  Globe,
  ExternalLink,
  Users,
  Search,
  Filter,
  Sparkles,
  Network,
  Heart,
  MapPin,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
// Remove this import:
// import AppLayout from "@/components/layouts/AppLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
// imports (top of file)
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAttendeeNetworking } from "@/hooks/useAttendeeNetworking";
import { useNetworkingFilters } from "@/hooks/useNetworkingFilters";
import ChatRoom from "@/components/chat/ChatRoom";
import { ConversationsList } from "@/components/messaging/ConversationsList";
import { DirectMessageThread } from "@/components/messaging/DirectMessageThread";
import { useNetworking } from "@/hooks/useNetworking";
import { useAttendeeEventContext } from "@/contexts/AttendeeEventContext";
import { NetworkingFilter } from "@/components/networking/NetworkingFilter";
import XLogo from "@/components/icons/XLogo";
import PaymentGuard from "@/components/payment/PaymentGuard";
import { usePayment } from "@/hooks/usePayment";
import { useUserPresence } from "@/hooks/useUserPresence";
import { useConnectionRequests } from "@/hooks/useConnectionRequests";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "react-router-dom";
import { useAINetworking } from "@/hooks/useAINetworking";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
// Remove this import because Topics now renders inside ChatRoom
// import TopicsBoard from "@/components/topics/TopicsBoard";

const AttendeeNetworking = () => {
  const navigate = useNavigate();
  const { currentEventId } = useAttendeeEventContext();
  const { isEventPaid } = usePayment();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("people");
  const [selectedConversation, setSelectedConversation] = useState<{
    userId: string;
    userName: string;
    userPhoto?: string;
  } | null>(null);
  const [expandedPreferences, setExpandedPreferences] = useState<Set<string>>(
    new Set()
  );

  // Track which bios are expanded to support Read more/Show less without page refresh
  const [expandedBios, setExpandedBios] = useState<Set<string>>(new Set());

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // AI Features
  const { generateConversationStarters, matchProfiles, loading: aiLoading } = useAINetworking();
  const [showAIMatches, setShowAIMatches] = useState(false);
  const [aiMatches, setAIMatches] = useState<any[]>([]);
  const [bestMatchId, setBestMatchId] = useState<string | null>(null);
  const [conversationStarters, setConversationStarters] = useState<{[key: string]: string[]}>({});
  const [showStarters, setShowStarters] = useState<{[key: string]: boolean}>({});

  const {
    attendees: profiles,
    isLoading: loading,
    error,
  } = useAttendeeNetworking();

  // Use the new filtering hook
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

  // Sort by profile completion: 30–100% first (descending), then <30%
  const sortedProfiles = React.useMemo(() => {
    const withScores = filteredProfiles.map((p) => ({
      profile: p,
      score: calculateProfileCompletion(p),
    }));
    const top = withScores
      .filter((x) => x.score >= 30)
      .sort((a, b) => b.score - a.score)
      .map((x) => x.profile);
    const rest = withScores.filter((x) => x.score < 30).map((x) => x.profile);
    return [...top, ...rest];
  }, [filteredProfiles, calculateProfileCompletion]);

  // Pagination calculations
  const totalPages = Math.ceil(sortedProfiles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageProfiles = sortedProfiles.slice(startIndex, endIndex);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    selectedNiches,
    selectedNetworkingPrefs,
    selectedTags,
    showSuggestedOnly,
  ]);

  // Handle deep links via query parameters from notifications
  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get("tab");
    const allowedTabs = new Set([
      "people",
      "connections",
      "topics",
      "chats",
      "messages",
    ]);

    if (tabParam && allowedTabs.has(tabParam)) {
      setActiveTab(tabParam);
    }

    const dmUserId = params.get("dmUserId");
    if (dmUserId) {
      // We may not know the name/photo yet; leave it empty so the thread derives it (shows 'Admin' if applicable)
      setSelectedConversation({
        userId: dmUserId,
        userName: "", // leave empty so the thread derives the correct name (Admin if applicable)
      });
      setActiveTab("messages");
    }
  }, [location.search]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of the attendees section
    document
      .getElementById("attendees-section")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const {
    sendConnectionRequest,
    getConnectionStatus,
    connections,
    refetch,
    acceptConnectionRequest,
  } = useNetworking();

  const { getUserStatus, getStatusColor } = useUserPresence();
  const { currentUser } = useAuth();

  // Get connected users
  const connectedUsers = profiles.filter((profile) => {
    const connectionStatus = getConnectionStatus(profile.id);
    return connectionStatus?.status === "accepted";
  });

  const handleConnect = (profileId: string) => {
    sendConnectionRequest(profileId);
  };

  const handleAcceptConnection = async (profileId: string) => {
    const connectionStatus = getConnectionStatus(profileId);
    if (connectionStatus) {
      await acceptConnectionRequest(connectionStatus.id);
    }
  };

  const handleMessage = (
    profileId: string,
    profileName: string,
    profilePhoto?: string
  ) => {
    setSelectedConversation({
      userId: profileId,
      userName: profileName,
      userPhoto: profilePhoto,
    });
    setActiveTab("messages");
  };

  const handleSelectConversation = (
    userId: string,
    userName: string,
    userPhoto?: string
  ) => {
    setSelectedConversation({
      userId,
      userName,
      userPhoto,
    });
  };

  const handleBackToConversations = () => {
    setSelectedConversation(null);
  };

  // AI Handlers
  const handleAIMatch = async () => {
    console.log('AI Match clicked', { currentUser, profilesCount: profiles.length });

    if (!currentUser) {
      console.error('No current user found');
      toast({ title: 'Error', description: 'Please log in to use AI matching', variant: 'destructive' });
      return;
    }

    if (profiles.length === 0) {
      console.error('No profiles available');
      toast({ title: 'No Profiles', description: 'No attendee profiles found to match', variant: 'destructive' });
      return;
    }

    try {
      // Fetch full current user profile (excluded from attendees list)
      const { data: me, error: meErr } = await supabase
        .from('profiles')
        .select('id,name,role,company,bio,niche,photo_url,networking_preferences,tags')
        .eq('id', currentUser.id)
        .single();

      if (meErr || !me) {
        console.error('Failed to fetch current user profile for AI match:', meErr);
        toast({ title: 'Profile Error', description: 'Could not load your profile for matching', variant: 'destructive' });
        return;
      }

      console.log('Calling matchProfiles with', { userProfileId: me.id, profilesCount: profiles.length });
      const matches = await matchProfiles(me, profiles);
      console.log('Matches received:', matches);

      if (matches && matches.length > 0) {
        // Ensure highest score first and pick best match
        const sorted = [...matches].sort((a: any, b: any) => (b.score || 0) - (a.score || 0));
        setAIMatches(sorted);
        setBestMatchId(sorted[0]?.id || null);
        setShowAIMatches(true);

        const best = sorted[0];
        const bestProfile = profiles.find(p => p.id === best?.id);
        toast({
          title: 'Best match found',
          description: bestProfile ? `${bestProfile.name || 'Attendee'} • ${best?.score || 0}% match` : `Found ${sorted.length} matches`,
        });

        // Smooth scroll to AI matches section
        setTimeout(() => {
          document.getElementById('ai-matches')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 50);
      } else {
        toast({ title: 'No Matches', description: "Couldn't find strong matches. Try updating your profile with more details." });
      }
    } catch (e) {
      console.error('AI match error:', e);
      toast({ title: 'Error', description: 'Failed to run AI matching', variant: 'destructive' });
    }
  };

  const handleGetConversationStarters = async (targetProfile: any) => {
    if (!currentUser) return;

    // If already generated, just toggle visibility
    if (conversationStarters[targetProfile.id]) {
      setShowStarters(prev => ({ ...prev, [targetProfile.id]: !prev[targetProfile.id] }));
      return;
    }

    // Fetch full current user profile (excluded from attendees list)
    const { data: me, error: meErr } = await supabase
      .from('profiles')
      .select('id,name,role,company,bio,niche,photo_url,networking_preferences,tags')
      .eq('id', currentUser.id)
      .single();

    if (meErr || !me) {
      console.error('Failed to fetch current user profile for starters:', meErr);
      toast({ title: 'Profile Error', description: 'Could not load your profile for starters', variant: 'destructive' });
      return;
    }

    const starters = await generateConversationStarters(me, targetProfile);
    setConversationStarters(prev => ({ ...prev, [targetProfile.id]: starters }));
    setShowStarters(prev => ({ ...prev, [targetProfile.id]: true }));
  };

  const handleSendConversationStarter = async (targetProfileId: string, targetProfileName: string, starterMessage: string) => {
    console.log('Sending conversation starter', { targetProfileId, targetProfileName, starterMessage });
    
    if (!currentUser?.id) {
      toast({
        title: "Error",
        description: "Please log in to send messages",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('direct_messages')
        .insert({
          sender_id: currentUser.id,
          recipient_id: targetProfileId,
          content: starterMessage
        });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Message sent successfully');
      
      // Navigate to messages tab and open conversation
      handleMessage(targetProfileId, targetProfileName);
      
      // Show success toast
      toast({
        title: "Message Sent",
        description: `Your conversation starter was sent to ${targetProfileName}`,
      });
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to send message. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case "x":
        return <XLogo size={16} />;
      case "linkedin":
        return <Linkedin size={16} />;
      case "github":
        return <Github size={16} />;
      case "instagram":
        return <Instagram size={16} />;
      case "website":
        return <Globe size={16} />;
      default:
        return <Globe size={16} />;
    }
  };

  const getSocialLinks = (profile: any) => {
    const links = [];
    if (profile.twitter_link) {
      links.push({ platform: "x", url: profile.twitter_link });
    }
    if (profile.linkedin_link) {
      links.push({ platform: "linkedin", url: profile.linkedin_link });
    }
    if (profile.github_link) {
      links.push({ platform: "github", url: profile.github_link });
    }
    if (profile.instagram_link) {
      links.push({ platform: "instagram", url: profile.instagram_link });
    }
    if (profile.website_link) {
      links.push({ platform: "website", url: profile.website_link });
    }
    return links;
  };

  const renderUserCard = (profile: any, showConnectButton = true) => {
    const connectionStatus = getConnectionStatus(profile.id);
    const isConnected = connectionStatus?.status === "accepted";
    const isPending = connectionStatus?.status === "pending";
    const isReceivedRequest =
      isPending && connectionStatus?.recipient_id === currentUser?.id;
    const isSentRequest =
      isPending && connectionStatus?.requester_id === currentUser?.id;
    const socialLinks = getSocialLinks(profile);
    const userStatus = getUserStatus(profile.id);
    // Always show green in networking tab as requested
    const statusColor = "bg-green-400";

    // Bio truncation / expansion
    const isBioExpanded = expandedBios.has(profile.id);
    const shouldShowReadMore =
      typeof profile.bio === "string" && profile.bio.length > 160;

    return (
      <Card
        key={profile.id}
        className="group relative overflow-hidden bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50 border-0 shadow-lg hover:shadow-2xl transition-all duration-500 rounded-2xl h-full flex flex-col"
      >
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-connect-100/20 to-transparent rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700" />
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
                    <AvatarFallback className="bg-gradient-to-br from-connect-500 to-connect-600 text-white text-lg font-bold">
                      {profile.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("") || "?"}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div
                  className={`absolute -bottom-1 -right-1 w-6 h-6 ${statusColor} rounded-full border-2 border-white dark:border-gray-800 ${
                    userStatus === "online" ? "animate-pulse" : ""
                  }`}
                  title={
                    userStatus === "online"
                      ? "Online in dashboard"
                      : userStatus === "away"
                      ? "Online but away from dashboard"
                      : "Offline"
                  }
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
                    className="text-xs font-medium text-connect-600 hover:text-connect-700 dark:text-connect-400 dark:hover:text-connect-300 hover:underline"
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
            {socialLinks.length > 0 && (
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  {socialLinks.slice(0, 4).map((link, index) => (
                    <button
                      key={index}
                      onClick={() => window.open(link.url, "_blank")}
                      className="p-2 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 hover:from-connect-100 hover:to-connect-200 text-gray-600 dark:text-gray-300 hover:text-connect-600 dark:hover:text-connect-400 transition-colors"
                      title={`Follow on ${link.platform}`}
                    >
                      {getSocialIcon(link.platform)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* AI Conversation Starters */}
          {showConnectButton && (
            <div className="space-y-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleGetConversationStarters(profile)}
                disabled={aiLoading}
                className="w-full h-auto py-2 text-xs font-medium text-connect-600 hover:text-connect-700 dark:text-connect-400 dark:hover:text-connect-300 hover:bg-connect-50 dark:hover:bg-connect-900/20"
              >
                <Sparkles size={14} className="mr-2" />
                {conversationStarters[profile.id] ? 
                  (showStarters[profile.id] ? 'Hide' : 'Show') + ' AI Conversation Starters' :
                  'Generate Conversation Starters'
                }
              </Button>
              
              {showStarters[profile.id] && conversationStarters[profile.id] && (
                <div className="space-y-2 animate-fade-in bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-900/10 dark:to-pink-900/10 rounded-lg p-3 border border-purple-200/50 dark:border-purple-700/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={12} className="text-purple-500" />
                    <span className="text-xs font-semibold text-purple-700 dark:text-purple-300">
                      AI-Suggested Conversation Starters
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                      Click to send
                    </span>
                  </div>
                  {conversationStarters[profile.id].map((starter, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="w-full p-3 bg-white/70 dark:bg-gray-800/70 rounded-md hover:bg-connect-50 dark:hover:bg-connect-900/30 transition-all duration-200 text-left group border border-transparent hover:border-connect-300 dark:hover:border-connect-700"
                      onClick={() => handleSendConversationStarter(profile.id, profile.name || "Unknown", starter)}
                    >
                      <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed group-hover:text-connect-700 dark:group-hover:text-connect-300">
                        "{starter}"
                      </p>
                      <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Send size={10} className="text-connect-600" />
                        <span className="text-[10px] text-connect-600 dark:text-connect-400 font-medium">
                          Send as introduction
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Sticky bottom action bar */}
          <div className="-mx-5 px-5 pt-3 pb-4 sticky bottom-0 bg-white/85 dark:bg-gray-900/85 backdrop-blur border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  handleMessage(
                    profile.id,
                    profile.name || "",
                    profile.photo_url || undefined
                  )
                }
                className="flex-1 h-10 bg-white/90 hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-600"
              >
                <MessageSquare size={16} className="mr-2" />
                Message
              </Button>
              {showConnectButton && (
                <Button
                  size="sm"
                  onClick={() =>
                    isReceivedRequest
                      ? handleAcceptConnection(profile.id)
                      : handleConnect(profile.id)
                  }
                  className="flex-1 h-10 bg-gradient-to-r from-connect-500 to-connect-600 hover:from-connect-600 hover:to-connect-700 text-white border-0 shadow-md"
                  disabled={isConnected || isSentRequest}
                >
                  <UserPlus size={16} className="mr-2" />
                  {isReceivedRequest
                    ? "Accept"
                    : isSentRequest
                    ? "Pending"
                    : isConnected
                    ? "Connected"
                    : "Connect"}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="animate-fade-in max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-connect-600 border-t-transparent mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">
              Loading amazing people...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="animate-fade-in max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Error Loading Attendees
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {error?.message || "Failed to load attendee data"}
            </p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-connect-600 hover:bg-connect-700 text-white"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentEventId) {
    return (
      <div className="animate-fade-in max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Event Selected
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Please join an event to start networking with other attendees
            </p>
            <Button
              onClick={() => navigate("/scan")}
              className="bg-connect-600 hover:bg-connect-700 text-white"
            >
              Join Event
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* First Tabs header section */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-8">
          {/* Modern Header with Purple Gradient */}
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
                      Connect & Collaborate
                    </h1>
                    <p className="text-purple-100 text-sm sm:text-base lg:text-lg font-medium mb-4">
                      Discover amazing people, build meaningful connections, and
                      expand your professional network
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
                          {connectedUsers.length} Connections
                        </span>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1.5">
                        <span className="text-white text-xs sm:text-sm font-medium">
                          Event Networking Hub
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
        </div>
      </Tabs>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <TabsList className="grid w-full grid-cols-4 gap-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/70 p-1 shadow-sm h-9 sm:h-10 overflow-visible">
            {/* People */}
            <TabsTrigger
              value="people"
              className="px-2.5 py-1.5 h-9 rounded-lg text-xs sm:text-sm font-medium truncate transition-colors
                data-[state=active]:text-white
                data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:via-purple-500 data-[state=active]:to-indigo-500"
            >
              <div className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="truncate">People</span>
              </div>
            </TabsTrigger>

            {/* Connections */}
            <TabsTrigger
              value="connections"
              className="px-2.5 py-1.5 h-9 rounded-lg text-xs sm:text-sm font-medium truncate transition-colors
                data-[state=active]:text-white
                data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:via-purple-500 data-[state=active]:to-indigo-500"
            >
              <div className="flex items-center gap-1.5">
                <Heart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="truncate">Connections</span>
              </div>
            </TabsTrigger>

            {/* Chat Room */}
            <TabsTrigger
              value="chats"
              className="px-2.5 py-1.5 h-9 rounded-lg text-xs sm:text-sm font-medium truncate transition-colors
                data-[state=active]:text-white
                data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:via-purple-500 data-[state=active]:to-indigo-500"
            >
              <div className="flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="truncate">Chat Room</span>
              </div>
            </TabsTrigger>

            {/* Messages */}
            <TabsTrigger
              value="messages"
              className="px-2.5 py-1.5 h-9 rounded-lg text-xs sm:text-sm font-medium truncate transition-colors
                data-[state=active]:text-white
                data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:via-purple-500 data-[state=active]:to-indigo-500"
            >
              <div className="flex items-center gap-1.5">
                <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="truncate">Messages</span>
              </div>
            </TabsTrigger>
          </TabsList>
        </div>
        {/* People */}
        <TabsContent value="people" className="space-y-6">
          {/* AI Matches Toggle */}
          <div className="flex flex-wrap gap-3 items-center justify-between bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-700">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-semibold text-purple-900 dark:text-purple-100">
                AI-Powered Networking
              </span>
            </div>
            <Button
              onClick={handleAIMatch}
              disabled={aiLoading}
              variant={showAIMatches ? "default" : "outline"}
              className={showAIMatches 
                ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                : "border-purple-300 dark:border-purple-700 hover:bg-purple-100 dark:hover:bg-purple-900/30"
              }
            >
              {aiLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Analyzing Profiles...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  {showAIMatches ? 'Show All' : 'Find My Best Matches'}
                </>
              )}
            </Button>
          </div>

          {/* AI Matches Display */}
          {showAIMatches && aiMatches.length > 0 && (
            <div id="ai-matches" className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Your AI-Matched Connections
                  </h3>
                </div>
                <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
                  {aiMatches.length} matches
                </Badge>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                {aiMatches.map((match) => {
                  const profile = profiles.find(p => p.id === match.id);
                  if (!profile) return null;
                  return (
                    <div key={profile.id} className="relative">
                      {profile.id === bestMatchId && (
                        <div className="absolute -top-2 left-2 z-10">
                          <div className="bg-connect-600 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow">
                            Best Match
                          </div>
                        </div>
                      )}
                      {/* Match Score Badge */}
                      <div className="absolute -top-2 -right-2 z-10">
                        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                          <Sparkles className="h-3 w-3" />
                          {match.score}% Match
                        </div>
                      </div>
                      {/* Match Reason */}
                      {match.reason && (
                        <div className="absolute -top-2 left-4 right-16 z-10">
                          <div className="bg-white dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-300 px-2 py-1 rounded-lg shadow-md border border-purple-200 dark:border-purple-700 line-clamp-1">
                            {match.reason}
                          </div>
                        </div>
                      )}
                      <div className="mt-8">
                        {renderUserCard(profile, true)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Regular People List - Hide when showing AI matches */}
          {!showAIMatches && (
            <>
              {/* Search and Filter Bar */}
              <NetworkingFilter
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                selectedNiches={selectedNiches}
                onNicheChange={setSelectedNiches}
                selectedNetworkingPrefs={selectedNetworkingPrefs}
                onNetworkingPrefChange={setSelectedNetworkingPrefs}
                selectedTags={selectedTags}
                onTagChange={setSelectedTags}
                showSuggestedOnly={showSuggestedOnly}
                onSuggestedToggle={setShowSuggestedOnly}
                availableNiches={availableNiches}
                availableNetworkingPrefs={availableNetworkingPrefs}
                availableTags={availableTags}
                onClearFilters={clearAllFilters}
              />

              {/* Results summary */}
              {sortedProfiles.length > 0 && (
                <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
                  <span>
                    Showing {startIndex + 1}-
                    {Math.min(endIndex, sortedProfiles.length)} of{" "}
                    {sortedProfiles.length} attendees
                  </span>
                  <span>
                    Page {currentPage} of {totalPages}
                  </span>
                </div>
              )}

              <div
                id="attendees-section"
                className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8"
              >
                {currentPageProfiles.map((profile) =>
                  renderUserCard(profile, true)
                )}
              </div>
            </>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center space-x-1"
              >
                <ChevronLeft size={16} />
                <span>Previous</span>
              </Button>

              <div className="flex space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => {
                    // Show first page, last page, current page, and pages around current page
                    const showPage =
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1);

                    if (!showPage) {
                      // Show ellipsis for gaps
                      if (
                        page === currentPage - 2 ||
                        page === currentPage + 2
                      ) {
                        return (
                          <span key={page} className="px-2 py-1 text-gray-400">
                            ...
                          </span>
                        );
                      }
                      return null;
                    }

                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        className={
                          currentPage === page
                            ? "bg-connect-600 hover:bg-connect-700"
                            : ""
                        }
                      >
                        {page}
                      </Button>
                    );
                  }
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center space-x-1"
              >
                <span>Next</span>
                <ChevronRight size={16} />
              </Button>
            </div>
          )}

          {filteredProfiles.length === 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center">
                <Search size={32} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No results found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try adjusting your search terms or filters
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={clearAllFilters}
              >
                Clear All Filters
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="connections" className="space-y-8">
          {connectedUsers.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {connectedUsers.map((profile) => renderUserCard(profile, false))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-connect-100 to-purple-100 dark:from-connect-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center">
                <Users
                  size={32}
                  className="text-connect-600 dark:text-connect-400"
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No connections yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Start connecting with other attendees to build your network
              </p>
              <Button
                onClick={() => setActiveTab("people")}
                className="bg-gradient-to-r from-connect-500 to-connect-600 hover:from-connect-600 hover:to-connect-700 text-white"
              >
                <UserPlus size={16} className="mr-2" />
                Discover People
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="chats">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
            <ChatRoom />
          </div>
        </TabsContent>

        {/* Messages */}
        <TabsContent value="messages" className="mt-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 h-[600px] flex flex-col">
            {selectedConversation ? (
              <DirectMessageThread
                conversation={selectedConversation}
                onBack={handleBackToConversations}
              />
            ) : (
              <ConversationsList onSelect={handleSelectConversation} />
            )}
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
};
export default AttendeeNetworking;
