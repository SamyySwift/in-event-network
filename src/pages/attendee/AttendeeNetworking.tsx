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
} from "lucide-react";
import AppLayout from "@/components/layouts/AppLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAttendeeNetworking } from "@/hooks/useAttendeeNetworking";
import ChatRoom from "@/components/chat/ChatRoom";
import { ConversationsList } from "@/components/messaging/ConversationsList";
import { DirectMessageThread } from "@/components/messaging/DirectMessageThread";
import { useNetworking } from "@/hooks/useNetworking";
import { useAttendeeEventContext } from "@/contexts/AttendeeEventContext";
import XLogo from "@/components/icons/XLogo";

const AttendeeNetworking = () => {
  const navigate = useNavigate();
  const { currentEventId } = useAttendeeEventContext();
  const [activeTab, setActiveTab] = useState("people");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedConversation, setSelectedConversation] = useState<{
    userId: string;
    userName: string;
    userPhoto?: string;
  } | null>(null);

  const {
    attendees: profiles,
    isLoading: loading,
    error,
  } = useAttendeeNetworking();
  const { sendConnectionRequest, getConnectionStatus, connections } =
    useNetworking();

  console.log("AttendeeNetworking - currentEventId:", currentEventId);
  console.log("AttendeeNetworking - profiles:", profiles);
  console.log("AttendeeNetworking - loading:", loading);
  console.log("AttendeeNetworking - error:", error);

  // Filter profiles based on search term
  const filteredProfiles = profiles.filter(
    (profile) =>
      profile.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.niche?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get connected users
  const connectedUsers = profiles.filter((profile) => {
    const connectionStatus = getConnectionStatus(profile.id);
    return connectionStatus?.status === "accepted";
  });

  const handleConnect = (profileId: string) => {
    sendConnectionRequest(profileId);
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
    const socialLinks = getSocialLinks(profile);

    return (
      <Card
        key={profile.id}
        className="group relative overflow-hidden bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50 border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.02] rounded-2xl"
      >
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-connect-100/20 to-transparent rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-100/20 to-transparent rounded-full translate-y-12 -translate-x-12 group-hover:scale-125 transition-transform duration-700" />

        <CardHeader className="relative z-10 pb-4">
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
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-white dark:border-gray-800 animate-pulse" />
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

        <CardContent className="relative z-10 space-y-6">
          {/* About Section */}
          {profile.bio && (
            <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 backdrop-blur-sm">
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {profile.bio}
              </p>
            </div>
          )}

          {/* Professional Niche */}
          {profile.niche && (
            <div className="flex items-center space-x-2">
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
              <div className="flex items-center space-x-2">
                <Heart size={14} className="text-red-400" />
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Interests
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.tags.slice(0, 3).map((tag: string, index: number) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700 text-xs hover:scale-105 transition-transform duration-200"
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
                <div className="flex items-center space-x-2">
                  <Network size={14} className="text-blue-400" />
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    Looking to connect with
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.networking_preferences
                    .slice(0, 2)
                    .map((pref: string, index: number) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700 text-xs"
                      >
                        {pref}
                      </Badge>
                    ))}
                  {profile.networking_preferences.length > 2 && (
                    <Badge
                      variant="outline"
                      className="bg-gray-50 dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-600 text-xs"
                    >
                      +{profile.networking_preferences.length - 2} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

          {/* Social Links */}
          {socialLinks.length > 0 && (
            <div className="flex justify-between items-center">
              <div className="flex space-x-2">
                {socialLinks.slice(0, 4).map((link, index) => (
                  <button
                    key={index}
                    onClick={() => window.open(link.url, "_blank")}
                    className="p-2 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 hover:from-connect-100 hover:to-connect-200 transition-all duration-300 text-gray-600 dark:text-gray-300 hover:text-connect-600 dark:hover:text-connect-400 transform hover:scale-110"
                    title={`Follow on ${link.platform}`}
                  >
                    {getSocialIcon(link.platform)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
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
              className="flex-1 h-10 bg-white/80 hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-600 hover:border-connect-300 transition-all duration-300"
              disabled={!isConnected}
            >
              <MessageSquare size={16} className="mr-2" />
              Message
            </Button>
            {showConnectButton && (
              <Button
                size="sm"
                onClick={() => handleConnect(profile.id)}
                className="flex-1 h-10 bg-gradient-to-r from-connect-500 to-connect-600 hover:from-connect-600 hover:to-connect-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                disabled={isConnected || isPending}
              >
                <UserPlus size={16} className="mr-2" />
                {isPending ? "Pending" : isConnected ? "Connected" : "Connect"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <AppLayout>
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
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
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
      </AppLayout>
    );
  }

  if (!currentEventId) {
    return (
      <AppLayout>
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
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-connect-100 to-purple-100 dark:from-connect-900/30 dark:to-purple-900/30 px-4 py-2 rounded-full mb-4">
            <Sparkles
              size={20}
              className="text-connect-600 dark:text-connect-400"
            />
            <span className="text-connect-700 dark:text-connect-300 font-medium text-sm">
              Event Networking Hub
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-gray-900 via-connect-600 to-purple-600 dark:from-white dark:via-connect-400 dark:to-purple-400 bg-clip-text text-transparent mb-4">
            Connect & Collaborate
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Discover amazing people, build meaningful connections, and expand
            your professional network
          </p>
          <div className="mt-6 flex items-center justify-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-2">
              <Users size={16} />
              <span>{profiles.length} Attendees</span>
            </div>
            <div className="flex items-center space-x-2">
              <Network size={16} />
              <span>{connectedUsers.length} Connections</span>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <TabsList className="grid grid-cols-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-2xl p-1 shadow-lg">
              <TabsTrigger
                value="people"
                className="flex items-center space-x-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-connect-500 data-[state=active]:to-connect-600 data-[state=active]:text-white transition-all duration-300"
              >
                <UserPlus size={18} />
                <span className="hidden sm:inline">Discover</span>
              </TabsTrigger>
              <TabsTrigger
                value="connections"
                className="flex items-center space-x-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-connect-500 data-[state=active]:to-connect-600 data-[state=active]:text-white transition-all duration-300"
              >
                <Users size={18} />
                <span className="hidden sm:inline">Network</span>
              </TabsTrigger>
              <TabsTrigger
                value="chats"
                className="flex items-center space-x-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-connect-500 data-[state=active]:to-connect-600 data-[state=active]:text-white transition-all duration-300"
              >
                <MessageSquare size={18} />
                <span className="hidden sm:inline">Chat Room</span>
              </TabsTrigger>
              <TabsTrigger
                value="messages"
                className="flex items-center space-x-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-connect-500 data-[state=active]:to-connect-600 data-[state=active]:text-white transition-all duration-300"
              >
                <Send size={18} />
                <span className="hidden sm:inline">Messages</span>
              </TabsTrigger>
            </TabsList>

            {activeTab === "people" && (
              <div className="relative mt-4 lg:mt-0 lg:w-80">
                <Search
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <Input
                  placeholder="Search attendees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 h-12 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg focus:ring-2 focus:ring-connect-500 focus:border-transparent transition-all duration-300"
                />
              </div>
            )}
          </div>

          <TabsContent value="people" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredProfiles.map((profile) => renderUserCard(profile, true))}
            </div>
            {filteredProfiles.length === 0 && searchTerm && (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center">
                  <Search size={32} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No results found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Try adjusting your search terms or browse all attendees
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setSearchTerm("")}
                >
                  Clear Search
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="connections" className="space-y-8">
            {connectedUsers.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                {connectedUsers.map((profile) =>
                  renderUserCard(profile, false)
                )}
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

          <TabsContent value="messages">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
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
      </div>
    </AppLayout>
  );
};

export default AttendeeNetworking;
