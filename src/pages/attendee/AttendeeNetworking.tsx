
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Send,
  UserPlus,
  MessageSquare,
  Twitter,
  Linkedin,
  Github,
  Instagram,
  Globe,
  ExternalLink,
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
import { useAttendeeNetworking } from "@/hooks/useAttendeeNetworking";
import ChatRoom from "@/components/chat/ChatRoom";
import { ConversationsList } from "@/components/messaging/ConversationsList";
import { DirectMessageThread } from "@/components/messaging/DirectMessageThread";
import { useNetworking } from "@/hooks/useNetworking";
import { useAttendeeEventContext } from "@/contexts/AttendeeEventContext";

const AttendeeNetworking = () => {
  const navigate = useNavigate();
  const { currentEventId } = useAttendeeEventContext();
  const [activeTab, setActiveTab] = useState("people");
  const [selectedConversation, setSelectedConversation] = useState<{
    userId: string;
    userName: string;
    userPhoto?: string;
  } | null>(null);

  const { attendees: profiles, isLoading: loading } = useAttendeeNetworking();

  const { sendConnectionRequest, getConnectionStatus } = useNetworking();

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
      case "twitter":
        return <Twitter size={16} />;
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

  const getSocialUrl = (platform: string, handle: string) => {
    switch (platform) {
      case "twitter":
        return `https://twitter.com/${handle}`;
      case "linkedin":
        return `https://linkedin.com/in/${handle}`;
      case "github":
        return `https://github.com/${handle}`;
      case "instagram":
        return `https://instagram.com/${handle}`;
      case "website":
        return handle.startsWith("http") ? handle : `https://${handle}`;
      default:
        return "#";
    }
  };

  const getSocialLinks = (profile: any) => {
    const links = [];
    if (profile.twitter_link) {
      links.push({ platform: "twitter", url: profile.twitter_link });
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

  if (loading) {
    return (
      <AppLayout>
        <div className="animate-fade-in max-w-6xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-connect-600 mx-auto"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Loading attendees...
              </p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-4 mb-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <h3 className="font-medium">Debug Info</h3>
        <p>Current Event ID: {currentEventId || "None"}</p>
        <p>Total Attendee Count: {profiles.length}</p>
      </div>

      <div className="animate-fade-in max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Networking
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Connect with other attendees at the event
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="people" className="flex items-center gap-2">
              <UserPlus size={18} />
              <span>Find People</span>
            </TabsTrigger>
            <TabsTrigger value="chats" className="flex items-center gap-2">
              <MessageSquare size={18} />
              <span>Chat Room</span>
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-2">
              <Send size={18} />
              <span>Messages</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="people" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {profiles.map((profile) => {
                const connectionStatus = getConnectionStatus(profile.id);
                const isConnected = connectionStatus?.status === "accepted";
                const isPending = connectionStatus?.status === "pending";
                const socialLinks = getSocialLinks(profile);

                return (
                  <Card
                    key={profile.id}
                    className="hover-lift bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between">
                        <Avatar className="h-12 w-12">
                          {profile.photo_url ? (
                            <AvatarImage
                              src={profile.photo_url}
                              alt={profile.name || ""}
                            />
                          ) : (
                            <AvatarFallback className="bg-connect-100 text-connect-600 dark:bg-connect-900 dark:text-connect-300">
                              {profile.name
                                ?.split(" ")
                                .map((n) => n[0])
                                .join("") || "?"}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div className="flex gap-2">
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
                            className="h-8"
                            disabled={!isConnected}
                          >
                            <MessageSquare size={16} className="mr-1" />
                            Message
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleConnect(profile.id)}
                            className="h-8 bg-connect-600 hover:bg-connect-700"
                            disabled={isConnected || isPending}
                          >
                            <UserPlus size={16} className="mr-1" />
                            {isPending
                              ? "Pending"
                              : isConnected
                              ? "Connected"
                              : "Connect"}
                          </Button>
                        </div>
                      </div>
                      <CardTitle className="mt-3 text-xl text-gray-900 dark:text-white">
                        {profile.name || "Unknown"}
                      </CardTitle>
                      <CardDescription className="text-sm flex flex-col">
                        <span className="text-gray-700 dark:text-gray-300">
                          {profile.role || "No role specified"}
                        </span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {/* Company Section */}
                      {profile.company && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Company
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {profile.company}
                          </p>
                        </div>
                      )}

                      {/* About Section */}
                      {profile.bio && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            About
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {profile.bio}
                          </p>
                        </div>
                      )}

                      {/* Professional Niche Section */}
                      {profile.niche && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Professional Niche
                          </h4>
                          <Badge
                            variant="outline"
                            className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-700"
                          >
                            {profile.niche}
                          </Badge>
                        </div>
                      )}

                      {/* Interests Section */}
                      {profile.tags && profile.tags.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Interests
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {profile.tags.map((tag: string, index: number) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-700 text-xs"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Networking Preferences Section */}
                      {profile.networking_preferences && profile.networking_preferences.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Networking Preferences
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {profile.networking_preferences.map((pref: string, index: number) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-700 text-xs"
                              >
                                {pref}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Social Links Section */}
                      {socialLinks.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Connect
                          </h4>
                          <div className="flex gap-2">
                            {socialLinks.map((link, index) => (
                              <button
                                key={index}
                                onClick={() => window.open(link.url, '_blank')}
                                className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
                                title={`Follow on ${link.platform}`}
                              >
                                {getSocialIcon(link.platform)}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="chats">
            <ChatRoom />
          </TabsContent>

          <TabsContent value="messages">
            {selectedConversation ? (
              <DirectMessageThread
                conversation={selectedConversation}
                onBack={handleBackToConversations}
              />
            ) : (
              <ConversationsList onSelect={handleSelectConversation} />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default AttendeeNetworking;
