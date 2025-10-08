import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Save,
  Upload,
  User,
  Mail,
  Building,
  Globe,
  Key,
  Shield,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import { DeleteAccountDialog } from "@/components/profile/DeleteAccountDialog";
import { ProfilePictureUpload } from "@/components/profile/ProfilePictureUpload";
import { supabase } from "@/integrations/supabase/client";

console.log("AdminProfile component loading...");

const AdminProfile = () => {
  console.log("AdminProfile component rendering...");

  const { currentUser, updateUser, isLoading: authLoading } = useAuth();

  console.log("AdminProfile - currentUser:", currentUser);
  console.log("AdminProfile - authLoading:", authLoading);
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isEditingPhoto, setIsEditingPhoto] = useState(false);

  // Profile form state
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    bio: "",
    niche: "",
    website: "",
    twitter: "",
    linkedin: "",
    facebook: "",
    instagram: "",
  });

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Initialize form data when currentUser loads
  useEffect(() => {
    if (currentUser) {
      setProfileData({
        name: currentUser.name || "",
        email: currentUser.email || "",
        bio: currentUser.bio || "",
        niche: currentUser.niche || "",
        website: currentUser.links?.website || "",
        twitter: currentUser.links?.twitter || "",
        linkedin: currentUser.links?.linkedin || "",
        facebook: currentUser.links?.facebook || "",
        instagram: currentUser.links?.instagram || "",
      });
    }
  }, [currentUser]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const updatedData = {
        name: profileData.name,
        bio: profileData.bio,
        niche: profileData.niche,
        links: {
          website: profileData.website,
          twitter: profileData.twitter,
          linkedin: profileData.linkedin,
          facebook: profileData.facebook,
          instagram: profileData.instagram,
        },
      };

      await updateUser(updatedData);
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });

      if (error) throw error;

      toast.success("Password updated successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      console.error("Error updating password:", error);
      toast.error(error.message || "Failed to update password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpdate = async (imageUrl: string) => {
    try {
      await updateUser({ photoUrl: imageUrl });
      toast.success("Profile picture updated successfully!");
      setIsEditingPhoto(false);
    } catch (error: any) {
      console.error("Error updating profile picture:", error);
      toast.error(error.message || "Failed to update profile picture");
    }
  };

  // Show loading state while user data is being fetched
  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  console.log("AdminProfile - Rendering main content");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Profile</h1>
          <p className="text-muted-foreground">
            Manage your admin account settings and preferences
          </p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Admin
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) =>
                        setProfileData({ ...profileData, name: e.target.value })
                      }
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="niche">Professional Niche</Label>
                  <Input
                    id="niche"
                    value={profileData.niche}
                    onChange={(e) =>
                      setProfileData({ ...profileData, niche: e.target.value })
                    }
                    placeholder="e.g., Event Management, Technology, Marketing"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) =>
                      setProfileData({ ...profileData, bio: e.target.value })
                    }
                    placeholder="Tell us about yourself..."
                    rows={4}
                  />
                </div>

                <Separator />

                {/* Social Links */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Social Links
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        value={profileData.website}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            website: e.target.value,
                          })
                        }
                        placeholder="https://yourwebsite.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="twitter">Twitter</Label>
                      <Input
                        id="twitter"
                        value={profileData.twitter}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            twitter: e.target.value,
                          })
                        }
                        placeholder="@username"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="linkedin">LinkedIn</Label>
                      <Input
                        id="linkedin"
                        value={profileData.linkedin}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            linkedin: e.target.value,
                          })
                        }
                        placeholder="linkedin.com/in/username"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="facebook">Facebook</Label>
                      <Input
                        id="facebook"
                        value={profileData.facebook}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            facebook: e.target.value,
                          })
                        }
                        placeholder="facebook.com/username"
                      />
                    </div>
                  </div>
                </div>

                <Button type="submit" disabled={isLoading} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? "Saving..." : "Save Profile"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Password Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Change Password
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          currentPassword: e.target.value,
                        })
                      }
                      placeholder="Enter current password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          newPassword: e.target.value,
                        })
                      }
                      placeholder="Enter new password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          confirmPassword: e.target.value,
                        })
                      }
                      placeholder="Confirm new password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button type="submit" disabled={isLoading} className="w-full">
                  <Key className="h-4 w-4 mr-2" />
                  {isLoading ? "Updating..." : "Update Password"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Profile Summary & Actions */}
        <div className="space-y-6">
          {/* Profile Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center space-y-4">
                <ProfilePictureUpload
                  currentImageUrl={currentUser.photoUrl}
                  userId={currentUser.id}
                  userName={currentUser.name}
                  onImageUpdate={handleImageUpdate}
                  isEditing={isEditingPhoto}
                />
                <div className="text-center space-y-1">
                  <h3 className="font-medium">{currentUser.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {currentUser.email}
                  </p>
                  <Badge variant="secondary" className="text-xs">
                    {currentUser.role === "host" ? "Admin" : currentUser.role}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Profile Completion
                  </span>
                  <span className="font-medium">85%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{ width: "85%" }}
                  ></div>
                </div>
              </div>

              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setIsEditingPhoto(!isEditingPhoto)}
              >
                <Upload className="h-4 w-4 mr-2" />
                {isEditingPhoto ? "Cancel" : "Change Photo"}
              </Button>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Once you delete your account, there is no going back. Please be
                certain.
              </p>
              <DeleteAccountDialog userName={currentUser.name} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
