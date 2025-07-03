
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Save, Upload, User, Mail, Building, Globe, Key, Shield, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { DeleteAccountDialog } from "@/components/profile/DeleteAccountDialog";
import { supabase } from "@/integrations/supabase/client";

const AdminProfile = () => {
  const { currentUser, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    name: currentUser?.name || "",
    email: currentUser?.email || "",
    bio: currentUser?.bio || "",
    niche: currentUser?.niche || "",
    links: {
      website: currentUser?.links?.website || "",
      linkedin: currentUser?.links?.linkedin || "",
      twitter: currentUser?.links?.twitter || "",
    },
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith("links.")) {
      const linkField = field.split(".")[1];
      setFormData({
        ...formData,
        links: {
          ...formData.links,
          [linkField]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [field]: value,
      });
    }
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData({
      ...passwordData,
      [field]: value,
    });
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateUser(formData);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile");
      console.error("Error updating profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) {
        throw error;
      }

      toast.success("Password updated successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to update password");
      console.error("Error updating password:", error);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header Section - Mobile Optimized */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold">Admin Profile</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage your admin account settings and information
          </p>
        </div>
        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 w-fit">
          <Key className="h-3 w-3 mr-1" />
          Administrator
        </Badge>
      </div>

      {/* Main Content Grid - Responsive */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Profile Overview Card */}
        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <User className="h-5 w-5 mr-2" />
              Profile Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center">
              <Avatar className="h-20 w-20 sm:h-24 sm:w-24 mb-4">
                {currentUser.photoUrl ? (
                  <AvatarImage src={currentUser.photoUrl} alt={currentUser.name} />
                ) : (
                  <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                    {currentUser.name?.charAt(0).toUpperCase() || 'A'}
                  </AvatarFallback>
                )}
              </Avatar>
              <Button variant="outline" size="sm" className="mb-4 w-full sm:w-auto">
                <Upload className="h-4 w-4 mr-2" />
                Change Photo
              </Button>
            </div>

            <Separator />

            <div className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">NAME</Label>
                <p className="font-medium break-words">{currentUser.name}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">EMAIL</Label>
                <p className="font-medium break-all text-sm">{currentUser.email}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">ROLE</Label>
                <p className="font-medium capitalize">{currentUser.role}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Details Card */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Building className="h-5 w-5 mr-2" />
              Profile Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full"
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Enter your email"
                  className="w-full"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="niche">Expertise/Niche</Label>
              <Input
                id="niche"
                value={formData.niche}
                onChange={(e) => handleInputChange("niche", e.target.value)}
                placeholder="e.g., Event Management, Technology, Marketing"
                className="w-full"
              />
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                placeholder="Tell us about yourself..."
                rows={4}
                className="w-full resize-none"
              />
            </div>

            <Separator />

            <div>
              <Label className="text-base font-medium flex items-center mb-4">
                <Globe className="h-4 w-4 mr-2" />
                Social Links
              </Label>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={formData.links.website}
                    onChange={(e) => handleInputChange("links.website", e.target.value)}
                    placeholder="https://yourwebsite.com"
                    className="w-full"
                  />
                </div>
                <div>
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    value={formData.links.linkedin}
                    onChange={(e) => handleInputChange("links.linkedin", e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full"
                  />
                </div>
                <div className="lg:col-span-2">
                  <Label htmlFor="twitter">Twitter</Label>
                  <Input
                    id="twitter"
                    value={formData.links.twitter}
                    onChange={(e) => handleInputChange("links.twitter", e.target.value)}
                    placeholder="https://twitter.com/username"
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={handleSave} disabled={isLoading} className="w-full sm:w-auto">
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Settings Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Password Management Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Shield className="h-5 w-5 mr-2" />
              Password & Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={(e) => handlePasswordChange("currentPassword", e.target.value)}
                  placeholder="Enter current password"
                  className="w-full pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
                  placeholder="Enter new password"
                  className="w-full pr-10"
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

            <div>
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Button 
              onClick={handlePasswordUpdate} 
              disabled={isUpdatingPassword || !passwordData.newPassword || !passwordData.confirmPassword}
              className="w-full"
            >
              <Key className="h-4 w-4 mr-2" />
              {isUpdatingPassword ? "Updating..." : "Update Password"}
            </Button>
          </CardContent>
        </Card>

        {/* Account Management Card */}
        <Card className="border-destructive/20">
          <CardHeader>
            <CardTitle className="flex items-center text-lg text-destructive">
              <Shield className="h-5 w-5 mr-2" />
              Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium">Delete Account</h3>
              <p className="text-sm text-muted-foreground">
                Permanently delete your admin account and all associated data. This action cannot be undone.
              </p>
            </div>
            
            <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
              <h4 className="font-medium text-destructive mb-2">What will be deleted:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Your admin profile and personal information</li>
                <li>• All events you've created</li>
                <li>• Admin wallets and financial data</li>
                <li>• Messages and communications</li>
                <li>• All other account-related data</li>
              </ul>
            </div>

            <DeleteAccountDialog userName={currentUser.name || 'Admin'} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminProfile;
