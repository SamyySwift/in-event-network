import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";


import { ProfilePictureUpload } from "@/components/profile/ProfilePictureUpload";
import { DeleteAccountDialog } from "@/components/profile/DeleteAccountDialog";
import {
  Github,
  Instagram,
  Linkedin,
  Facebook,
  Globe,
  User,
  Building2,
  Briefcase,
  Users,
  Eye,
  Tag,
  Link,
  Shield,
  ChevronRight,
  Sparkles,
  Loader2,
  MessageCircle,
  Phone,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// Twitter/X icon component
const XIcon = ({
  size = 16,
  className = "",
}: {
  size?: number;
  className?: string;
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
  </svg>
);

// iOS-style setting item component
const SettingItem = ({
  icon,
  iconColor,
  iconBg,
  title,
  subtitle,
  children,
  isEditing = false,
  showChevron = false,
}: {
  icon: React.ReactNode;
  iconColor: string;
  iconBg: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  isEditing?: boolean;
  showChevron?: boolean;
}) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
    <div className="flex items-start gap-3">
      <div
        className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0`}
      >
        <div className={iconColor}>{icon}</div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">
              {title}
            </h3>
            {subtitle && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {subtitle}
              </p>
            )}
          </div>
          {showChevron && !isEditing && (
            <ChevronRight className="w-5 h-5 text-gray-400" />
          )}
        </div>
        <div className="mt-3">{children}</div>
      </div>
    </div>
  </div>
);

// Mock data for niche options
const nicheOptions = [
  "Software Development",
  "Product Management",
  "Design",
  "Marketing",
  "Data Science",
  "Finance",
  "Education",
  "Healthcare",
  "Entrepreneurship",
  "Crypto",
  "AI/ML",
];

const networkingOptions = [
  "Investors",
  "Co-founders",
  "Frontend Developers",
  "Backend Developers",
  "Product Managers",
  "UX/UI Designers",
  "Marketing Experts",
  "Data Scientists",
  "Sales Representatives",
  "HR Professionals",
  "Students",
];

const AttendeeProfile = () => {
  const { currentUser, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState({
    name: "",
    photoUrl: "",
    bio: "",
    niche: "",
    company: "",
    customTags: [] as string[],
    networkingPreferences: [] as string[],
    networkingVisible: true,
    messagingPreference: "whatsapp" as "whatsapp" | "k-message",
    whatsappNumber: "",
    links: {
      twitter: "",
      linkedin: "",
      github: "",
      website: "",
      facebook: "",
      instagram: "",
    },
  });

  const [newTag, setNewTag] = useState("");
  const [selectedNiche, setSelectedNiche] = useState("");
  const [selectedNetworking, setSelectedNetworking] = useState<string[]>([]);
  const [customNetworkingPref, setCustomNetworkingPref] = useState("");
  const [isGeneratingBio, setIsGeneratingBio] = useState(false);

  // Reference to track if we have unsaved changes
  const hasUnsavedChanges = React.useRef(false);
  const lastSavedData = React.useRef<string>("");

  // Auto-save to database function
  const autoSaveToDatabase = async () => {
    if (!currentUser?.id || !hasUnsavedChanges.current) return;
    
    try {
      await supabase
        .from("profiles")
        .update({
          name: profileData.name,
          photo_url: profileData.photoUrl,
          bio: profileData.bio,
          niche: selectedNiche,
          company: profileData.company,
          tags: profileData.customTags,
          networking_preferences: selectedNetworking,
          networking_visible: profileData.networkingVisible,
          messaging_preference: profileData.messagingPreference,
          whatsapp_number: profileData.whatsappNumber,
          twitter_link: profileData.links.twitter,
          linkedin_link: profileData.links.linkedin,
          github_link: profileData.links.github,
          website_link: profileData.links.website,
          facebook_link: profileData.links.facebook,
          instagram_link: profileData.links.instagram,
        })
        .eq("id", currentUser.id);
      
      hasUnsavedChanges.current = false;
      lastSavedData.current = JSON.stringify({ profileData, selectedNiche, selectedNetworking });
    } catch (error) {
      console.error("Auto-save failed:", error);
    }
  };

  // Track changes
  useEffect(() => {
    if (isLoading) return;
    const currentData = JSON.stringify({ profileData, selectedNiche, selectedNetworking });
    if (lastSavedData.current && currentData !== lastSavedData.current) {
      hasUnsavedChanges.current = true;
    }
  }, [profileData, selectedNiche, selectedNetworking, isLoading]);

  // Debounced auto-save while editing (save every 3 seconds if there are changes)
  useEffect(() => {
    if (isLoading) return;
    
    const autoSaveInterval = setInterval(() => {
      if (hasUnsavedChanges.current) {
        autoSaveToDatabase();
      }
    }, 3000);

    return () => clearInterval(autoSaveInterval);
  }, [currentUser?.id, profileData, selectedNiche, selectedNetworking, isLoading]);

  // Save when leaving the page (beforeunload)
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (hasUnsavedChanges.current && currentUser?.id) {
        // Use sendBeacon for reliable save on page close
        const data = {
          name: profileData.name,
          photo_url: profileData.photoUrl,
          bio: profileData.bio,
          niche: selectedNiche,
          company: profileData.company,
          tags: profileData.customTags,
          networking_preferences: selectedNetworking,
          networking_visible: profileData.networkingVisible,
          messaging_preference: profileData.messagingPreference,
          whatsapp_number: profileData.whatsappNumber,
          twitter_link: profileData.links.twitter,
          linkedin_link: profileData.links.linkedin,
          github_link: profileData.links.github,
          website_link: profileData.links.website,
          facebook_link: profileData.links.facebook,
          instagram_link: profileData.links.instagram,
        };
        // Store in localStorage as backup for next load
        localStorage.setItem(`attendee-profile-pending-${currentUser.id}`, JSON.stringify(data));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [currentUser?.id, profileData, selectedNiche, selectedNetworking]);

  // Save when component unmounts (navigating away)
  useEffect(() => {
    return () => {
      if (hasUnsavedChanges.current && currentUser?.id) {
        autoSaveToDatabase();
      }
    };
  }, []);

  // Check for pending saves from previous session
  useEffect(() => {
    if (!currentUser?.id || isLoading) return;
    
    const pendingData = localStorage.getItem(`attendee-profile-pending-${currentUser.id}`);
    if (pendingData) {
      try {
        const data = JSON.parse(pendingData);
        // Apply pending save to database
        supabase
          .from("profiles")
          .update(data)
          .eq("id", currentUser.id)
          .then(() => {
            localStorage.removeItem(`attendee-profile-pending-${currentUser.id}`);
          });
      } catch (error) {
        console.error("Error applying pending save:", error);
        localStorage.removeItem(`attendee-profile-pending-${currentUser.id}`);
      }
    }
  }, [currentUser?.id, isLoading]);

  // Initialize lastSavedData after loading
  useEffect(() => {
    if (!isLoading) {
      lastSavedData.current = JSON.stringify({ profileData, selectedNiche, selectedNetworking });
    }
  }, [isLoading]);

  // ... existing code ...
  useEffect(() => {
    const loadProfileData = async () => {
      if (!currentUser?.id) return;

      try {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", currentUser.id)
          .single();

        if (error && error.code !== "PGRST116") {
          throw error;
        }

        if (profile) {
          const loadedData = {
            name: profile.name || "",
            photoUrl: profile.photo_url || "",
            bio: profile.bio || "",
            niche: profile.niche || "",
            company: profile.company || "",
            customTags: profile.tags || [],
            networkingPreferences: profile.networking_preferences || [],
            networkingVisible: profile.networking_visible ?? true,
            messagingPreference: (profile.messaging_preference as "whatsapp" | "k-message") || "whatsapp",
            whatsappNumber: profile.whatsapp_number || "",
            links: {
              twitter: profile.twitter_link || "",
              linkedin: profile.linkedin_link || "",
              github: profile.github_link || "",
              website: profile.website_link || "",
              facebook: profile.facebook_link || "",
              instagram: profile.instagram_link || "",
            },
          };

          setProfileData(loadedData);
          setSelectedNiche(loadedData.niche);
          setSelectedNetworking(loadedData.networkingPreferences);
        }
      } catch (error) {
        console.error("Error loading profile:", error);
        toast({
          title: "Error loading profile",
          description: "There was a problem loading your profile data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProfileData();
  }, [currentUser?.id, toast]);

  const handleAddTag = () => {
    if (newTag.trim() && !profileData.customTags.includes(newTag.trim())) {
      setProfileData({
        ...profileData,
        customTags: [...profileData.customTags, newTag.trim()],
      });
      setNewTag("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setProfileData({
      ...profileData,
      customTags: profileData.customTags.filter((t) => t !== tag),
    });
  };

  const toggleNetworkingPreference = (pref: string) => {
    if (selectedNetworking.includes(pref)) {
      setSelectedNetworking(selectedNetworking.filter((p) => p !== pref));
    } else {
      setSelectedNetworking([...selectedNetworking, pref]);
    }
  };

  const handleAddCustomNetworkingPref = () => {
    if (
      customNetworkingPref.trim() &&
      !selectedNetworking.includes(customNetworkingPref.trim())
    ) {
      setSelectedNetworking([
        ...selectedNetworking,
        customNetworkingPref.trim(),
      ]);
      setCustomNetworkingPref("");
    }
  };

  const handleRemoveNetworkingPref = (pref: string) => {
    setSelectedNetworking(selectedNetworking.filter((p) => p !== pref));
  };

  const handleProfilePictureUpdate = (imageUrl: string) => {
    setProfileData((prev) => ({ ...prev, photoUrl: imageUrl }));
  };

  const handleGenerateBio = async () => {
    setIsGeneratingBio(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-profile-bio', {
        body: {
          name: profileData.name,
          company: profileData.company,
          niche: selectedNiche,
          existingBio: profileData.bio
        }
      });

      if (error) throw error;

      if (data?.bio) {
        setProfileData({ ...profileData, bio: data.bio });
        toast({
          title: "Bio Generated",
          description: "Your professional bio has been created successfully",
        });
      }
    } catch (error) {
      console.error('Error generating bio:', error);
      toast({
        title: "Failed to generate bio",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingBio(false);
    }
  };

  const handleSave = async () => {
    setIsSubmitting(true);

    try {
      // Update the profile in Supabase directly
      const { error } = await supabase
        .from("profiles")
        .update({
          name: profileData.name,
          photo_url: profileData.photoUrl,
          bio: profileData.bio,
          niche: selectedNiche,
          company: profileData.company,
          tags: profileData.customTags,
          networking_preferences: selectedNetworking,
          networking_visible: profileData.networkingVisible,
          messaging_preference: profileData.messagingPreference,
          whatsapp_number: profileData.whatsappNumber,
          twitter_link: profileData.links.twitter,
          linkedin_link: profileData.links.linkedin,
          github_link: profileData.links.github,
          website_link: profileData.links.website,
          facebook_link: profileData.links.facebook,
          instagram_link: profileData.links.instagram,
        })
        .eq("id", currentUser?.id);

      if (error) {
        throw error;
      }

      // Also update the auth context
      await updateUser({
        name: profileData.name,
        photoUrl: profileData.photoUrl,
        bio: profileData.bio,
        niche: selectedNiche,
        customTags: profileData.customTags,
        networkingPreferences: selectedNetworking,
        links: profileData.links,
      });

      setIsEditing(false);
      // Mark as saved
      hasUnsavedChanges.current = false;
      lastSavedData.current = JSON.stringify({ profileData, selectedNiche, selectedNetworking });
      localStorage.removeItem(`attendee-profile-pending-${currentUser?.id}`);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update failed",
        description: "There was a problem updating your profile",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="p-8 text-center">
          <h1 className="text-2xl font-bold">
            Please log in to view your profile
          </h1>
          <Button className="mt-4" onClick={() => navigate("/login")}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Settings
          </h1>
          {isEditing ? (
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
                disabled={isSubmitting}
                size="sm"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSubmitting}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? "Saving..." : "Done"}
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => setIsEditing(true)}
              variant="ghost"
              size="sm"
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
            >
              Edit
            </Button>
          )}
        </div>

        {/* Profile Header Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
          <div className="flex items-center gap-4">
            <ProfilePictureUpload
              currentImageUrl={profileData.photoUrl}
              userId={currentUser.id}
              userName={profileData.name || "User"}
              onImageUpdate={handleProfilePictureUpdate}
              isEditing={isEditing}
            />
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-2">
                  <Input
                    value={profileData.name}
                    onChange={(e) =>
                      setProfileData({ ...profileData, name: e.target.value })
                    }
                    placeholder="Your name"
                    className="text-lg font-semibold"
                  />
                </div>
              ) : (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {profileData.name || "Add your name"}
                  </h2>
                  {profileData.niche && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {profileData.niche}
                    </p>
                  )}
                  {profileData.company && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {profileData.company}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Settings Sections */}
        <div className="space-y-4">
          {/* Personal Information */}
          <SettingItem
            icon={<User className="w-5 h-5" />}
            iconColor="text-blue-600"
            iconBg="bg-blue-100 dark:bg-blue-900/30"
            title="About"
            subtitle="Tell others about yourself"
            isEditing={isEditing}
          >
            {isEditing ? (
              <div className="space-y-3">
                <Textarea
                  placeholder="Tell others about yourself..."
                  value={profileData.bio}
                  onChange={(e) =>
                    setProfileData({ ...profileData, bio: e.target.value })
                  }
                  className="min-h-[100px] resize-none"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateBio}
                  disabled={isGeneratingBio || (!profileData.name && !profileData.company && !selectedNiche)}
                  className="w-full text-purple-600 border-purple-200 hover:text-purple-700 hover:bg-purple-50 dark:border-purple-800 dark:hover:bg-purple-900/30"
                >
                  {isGeneratingBio ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  Generate Bio with AI
                </Button>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  AI will use your name, company, and niche to generate a professional bio
                </p>
              </div>
            ) : (
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                {profileData.bio || "No bio added yet."}
              </p>
            )}
          </SettingItem>

          {/* Company */}
          <SettingItem
            icon={<Building2 className="w-5 h-5" />}
            iconColor="text-gray-600"
            iconBg="bg-gray-100 dark:bg-gray-700"
            title="Company"
            subtitle="Your organization or workplace"
            isEditing={isEditing}
          >
            {isEditing ? (
              <Input
                placeholder="Your company or organization"
                value={profileData.company}
                onChange={(e) =>
                  setProfileData({ ...profileData, company: e.target.value })
                }
              />
            ) : (
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                {profileData.company || "No company added yet."}
              </p>
            )}
          </SettingItem>

          {/* Professional Niche */}
          <SettingItem
            icon={<Briefcase className="w-5 h-5" />}
            iconColor="text-purple-600"
            iconBg="bg-purple-100 dark:bg-purple-900/30"
            title="Professional Niche"
            subtitle="Your area of expertise"
            isEditing={isEditing}
          >
            {isEditing ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-2">
                  {nicheOptions.map((niche) => (
                    <label
                      key={niche}
                      className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedNiche === niche
                          ? "bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-400"
                          : "bg-white hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600"
                      }`}
                    >
                      <input
                        type="radio"
                        name="niche"
                        className="sr-only"
                        checked={selectedNiche === niche}
                        onChange={() => setSelectedNiche(niche)}
                      />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {niche}
                      </span>
                    </label>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={
                      selectedNiche !== "" &&
                      !nicheOptions.includes(selectedNiche)
                        ? selectedNiche
                        : ""
                    }
                    placeholder="Enter custom niche"
                    onChange={(e) => setSelectedNiche(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSelectedNiche("")}
                    size="sm"
                  >
                    Clear
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                {selectedNiche ? (
                  <Badge
                    variant="secondary"
                    className="bg-purple-50 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300"
                  >
                    {selectedNiche}
                  </Badge>
                ) : (
                  <p className="text-gray-500 text-sm italic dark:text-gray-400">
                    No niche selected
                  </p>
                )}
              </div>
            )}
          </SettingItem>

          {/* Networking Visibility */}
          <SettingItem
            icon={<Eye className="w-5 h-5" />}
            iconColor="text-green-600"
            iconBg="bg-green-100 dark:bg-green-900/30"
            title="Networking Visibility"
            subtitle={
              profileData.networkingVisible
                ? "Visible to other attendees"
                : "Hidden from networking"
            }
            isEditing={isEditing}
          >
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {profileData.networkingVisible
                  ? "Other attendees can see your profile and connect with you"
                  : "You will remain anonymous and won't appear in the networking tab"}
              </div>
              <Switch
                checked={profileData.networkingVisible}
                onCheckedChange={(checked) =>
                  setProfileData((prev) => ({
                    ...prev,
                    networkingVisible: checked,
                  }))
                }
                disabled={!isEditing}
              />
            </div>
          </SettingItem>

          {/* Messaging Preference */}
          <SettingItem
            icon={<MessageCircle className="w-5 h-5" />}
            iconColor="text-teal-600"
            iconBg="bg-teal-100 dark:bg-teal-900/30"
            title="Messaging Preference"
            subtitle={
              profileData.messagingPreference === "whatsapp"
                ? "Receive messages via WhatsApp — Others will be able to send you direct WhatsApp messages, helping you connect faster"
                : "Receive messages via K-Message (in-app)"
            }
            isEditing={isEditing}
          >
            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`flex items-center justify-center p-3 rounded-lg border cursor-pointer transition-colors ${
                      profileData.messagingPreference === "whatsapp"
                        ? "bg-teal-50 border-teal-200 dark:bg-teal-900/30 dark:border-teal-400"
                        : "bg-white hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600"
                    }`}
                  >
                    <input
                      type="radio"
                      name="messagingPreference"
                      className="sr-only"
                      checked={profileData.messagingPreference === "whatsapp"}
                      onChange={() =>
                        setProfileData((prev) => ({
                          ...prev,
                          messagingPreference: "whatsapp",
                        }))
                      }
                    />
                    <div className="flex items-center gap-2">
                      <svg viewBox="0 0 24 24" className="w-5 h-5 text-green-500" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">WhatsApp</span>
                    </div>
                  </label>
                  <label
                    className={`flex items-center justify-center p-3 rounded-lg border cursor-pointer transition-colors ${
                      profileData.messagingPreference === "k-message"
                        ? "bg-teal-50 border-teal-200 dark:bg-teal-900/30 dark:border-teal-400"
                        : "bg-white hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600"
                    }`}
                  >
                    <input
                      type="radio"
                      name="messagingPreference"
                      className="sr-only"
                      checked={profileData.messagingPreference === "k-message"}
                      onChange={() =>
                        setProfileData((prev) => ({
                          ...prev,
                          messagingPreference: "k-message",
                        }))
                      }
                    />
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-5 h-5 text-connect-500" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">K-Message</span>
                    </div>
                  </label>
                </div>
                {profileData.messagingPreference === "whatsapp" && (
                  <div className="space-y-2">
                    <Label htmlFor="whatsappNumber" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      WhatsApp Number (with country code)
                    </Label>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <Input
                        id="whatsappNumber"
                        type="tel"
                        placeholder="+234 801 234 5678"
                        value={profileData.whatsappNumber}
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            whatsappNumber: e.target.value,
                          }))
                        }
                        className="flex-1"
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Include your country code (e.g., +234 for Nigeria, +1 for USA)
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {profileData.messagingPreference === "whatsapp" ? (
                  <>
                    <svg viewBox="0 0 24 24" className="w-5 h-5 text-green-500" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      WhatsApp{profileData.whatsappNumber ? `: ${profileData.whatsappNumber}` : " (no number set)"}
                    </span>
                  </>
                ) : (
                  <>
                    <MessageCircle className="w-5 h-5 text-connect-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">K-Message (in-app)</span>
                  </>
                )}
              </div>
            )}
          </SettingItem>

          {/* Networking Preferences */}
          <SettingItem
            icon={<Users className="w-5 h-5" />}
            iconColor="text-orange-600"
            iconBg="bg-orange-100 dark:bg-orange-900/30"
            title="Networking Preferences"
            subtitle="Who you're interested in meeting"
            isEditing={isEditing}
          >
            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-2">
                  {networkingOptions.map((pref) => (
                    <label
                      key={pref}
                      className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedNetworking.includes(pref)
                          ? "bg-orange-50 border-orange-200 dark:bg-orange-900/30 dark:border-orange-400"
                          : "bg-white hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={selectedNetworking.includes(pref)}
                        onChange={() => toggleNetworkingPreference(pref)}
                      />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {pref}
                      </span>
                    </label>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={customNetworkingPref}
                    placeholder="Add custom preference"
                    onChange={(e) => setCustomNetworkingPref(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCustomNetworkingPref();
                      }
                    }}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={handleAddCustomNetworkingPref}
                    size="sm"
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    Add
                  </Button>
                </div>
                {selectedNetworking.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedNetworking.map((pref) => (
                      <Badge
                        key={pref}
                        variant="secondary"
                        className="flex items-center gap-1 bg-orange-50 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300"
                      >
                        <span>{pref}</span>
                        <button
                          className="ml-1 h-4 w-4 rounded-full inline-flex items-center justify-center hover:bg-orange-200 dark:hover:bg-orange-700"
                          onClick={() => handleRemoveNetworkingPref(pref)}
                        >
                          <span className="sr-only">Remove preference</span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {selectedNetworking.length > 0 ? (
                  selectedNetworking.map((pref) => (
                    <Badge
                      key={pref}
                      variant="outline"
                      className="bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/50 dark:text-orange-300 dark:border-orange-400"
                    >
                      {pref}
                    </Badge>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm italic dark:text-gray-400">
                    No preferences selected
                  </p>
                )}
              </div>
            )}
          </SettingItem>

          {/* Custom Tags */}
          <SettingItem
            icon={<Tag className="w-5 h-5" />}
            iconColor="text-pink-600"
            iconBg="bg-pink-100 dark:bg-pink-900/30"
            title="Custom Tags"
            subtitle="Tags that represent your interests"
            isEditing={isEditing}
          >
            {isEditing ? (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={handleAddTag}
                    size="sm"
                    className="bg-pink-600 hover:bg-pink-700"
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profileData.customTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="flex items-center gap-1 bg-pink-50 text-pink-700 dark:bg-pink-900/50 dark:text-pink-300"
                    >
                      <span>{tag}</span>
                      <button
                        className="ml-1 h-4 w-4 rounded-full inline-flex items-center justify-center hover:bg-pink-200 dark:hover:bg-pink-700"
                        onClick={() => handleRemoveTag(tag)}
                      >
                        <span className="sr-only">Remove tag</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {profileData.customTags.length > 0 ? (
                  profileData.customTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="bg-pink-50 text-pink-700 dark:bg-pink-900/50 dark:text-pink-300"
                    >
                      {tag}
                    </Badge>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm italic dark:text-gray-400">
                    No tags added
                  </p>
                )}
              </div>
            )}
          </SettingItem>

          {/* Social Media Links */}
          <SettingItem
            icon={<Link className="w-5 h-5" />}
            iconColor="text-cyan-600"
            iconBg="bg-cyan-100 dark:bg-cyan-900/30"
            title="Connect With Me"
            subtitle="Your social media profiles"
            isEditing={isEditing}
          >
            {isEditing ? (
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                      <XIcon size={16} className="text-white" />
                    </div>
                    <Input
                      value={profileData.links.twitter}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          links: {
                            ...profileData.links,
                            twitter: e.target.value,
                          },
                        })
                      }
                      placeholder="https://x.com/username"
                      className="flex-1"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#0A66C2] rounded-lg flex items-center justify-center">
                      <Linkedin size={16} className="text-white" />
                    </div>
                    <Input
                      value={profileData.links.linkedin}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          links: {
                            ...profileData.links,
                            linkedin: e.target.value,
                          },
                        })
                      }
                      placeholder="https://linkedin.com/in/username"
                      className="flex-1"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#333] dark:bg-white rounded-lg flex items-center justify-center">
                      <Github
                        size={16}
                        className="text-white dark:text-black"
                      />
                    </div>
                    <Input
                      value={profileData.links.github}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          links: {
                            ...profileData.links,
                            github: e.target.value,
                          },
                        })
                      }
                      placeholder="https://github.com/username"
                      className="flex-1"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center">
                      <Globe size={16} className="text-white" />
                    </div>
                    <Input
                      value={profileData.links.website}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          links: {
                            ...profileData.links,
                            website: e.target.value,
                          },
                        })
                      }
                      placeholder="https://yourwebsite.com"
                      className="flex-1"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#1877F2] rounded-lg flex items-center justify-center">
                      <Facebook size={16} className="text-white" />
                    </div>
                    <Input
                      value={profileData.links.facebook}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          links: {
                            ...profileData.links,
                            facebook: e.target.value,
                          },
                        })
                      }
                      placeholder="https://facebook.com/username"
                      className="flex-1"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737] rounded-lg flex items-center justify-center">
                      <Instagram size={16} className="text-white" />
                    </div>
                    <Input
                      value={profileData.links.instagram}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          links: {
                            ...profileData.links,
                            instagram: e.target.value,
                          },
                        })
                      }
                      placeholder="https://instagram.com/username"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {profileData.links.twitter && (
                  <a
                    href={profileData.links.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                  >
                    <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center mb-2">
                      <XIcon size={16} className="text-white" />
                    </div>
                    <span className="text-xs text-gray-900 dark:text-white font-medium">
                      X
                    </span>
                  </a>
                )}
                {profileData.links.linkedin && (
                  <a
                    href={profileData.links.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                  >
                    <div className="w-8 h-8 bg-[#0A66C2] rounded-lg flex items-center justify-center mb-2">
                      <Linkedin size={16} className="text-white" />
                    </div>
                    <span className="text-xs text-gray-900 dark:text-white font-medium">
                      LinkedIn
                    </span>
                  </a>
                )}
                {profileData.links.github && (
                  <a
                    href={profileData.links.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                  >
                    <div className="w-8 h-8 bg-[#333] dark:bg-white rounded-lg flex items-center justify-center mb-2">
                      <Github
                        size={16}
                        className="text-white dark:text-black"
                      />
                    </div>
                    <span className="text-xs text-gray-900 dark:text-white font-medium">
                      GitHub
                    </span>
                  </a>
                )}
                {profileData.links.website && (
                  <a
                    href={profileData.links.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                  >
                    <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center mb-2">
                      <Globe size={16} className="text-white" />
                    </div>
                    <span className="text-xs text-gray-900 dark:text-white font-medium">
                      Website
                    </span>
                  </a>
                )}
                {profileData.links.facebook && (
                  <a
                    href={profileData.links.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                  >
                    <div className="w-8 h-8 bg-[#1877F2] rounded-lg flex items-center justify-center mb-2">
                      <Facebook size={16} className="text-white" />
                    </div>
                    <span className="text-xs text-gray-900 dark:text-white font-medium">
                      Facebook
                    </span>
                  </a>
                )}
                {profileData.links.instagram && (
                  <a
                    href={profileData.links.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737] rounded-lg flex items-center justify-center mb-2">
                      <Instagram size={16} className="text-white" />
                    </div>
                    <span className="text-xs text-gray-900 dark:text-white font-medium">
                      Instagram
                    </span>
                  </a>
                )}
                {!Object.values(profileData.links).some((link) => link) && (
                  <p className="text-gray-500 text-sm italic col-span-full dark:text-gray-400">
                    No social media links added
                  </p>
                )}
              </div>
            )}
          </SettingItem>

          {/* Account Management */}
          <SettingItem
            icon={<Shield className="w-5 h-5" />}
            iconColor="text-red-600"
            iconBg="bg-red-100 dark:bg-red-900/30"
            title="Account Management"
            subtitle="Manage your account settings and data"
            isEditing={false}
          >
            <div className="p-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/20 dark:border-red-800">
              <h4 className="font-semibold text-red-800 dark:text-red-300 mb-2">
                Delete Account
              </h4>
              <p className="text-sm text-red-700 dark:text-red-400 mb-4">
                Permanently delete your account and all associated data. This
                action cannot be undone.
              </p>
              <DeleteAccountDialog userName={profileData.name || "User"} />
            </div>
          </SettingItem>
        </div>
      </div>
    </div>
  );
};

export default AttendeeProfile;
