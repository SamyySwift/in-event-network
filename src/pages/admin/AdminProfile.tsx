
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
import { Save, Upload, User, Mail, Building, Globe, Key } from "lucide-react";
import { toast } from "sonner";

const defaultLinks = {
  website: "",
  linkedin: "",
  twitter: "",
};

const AdminProfile = () => {
  const { currentUser, isLoading: authIsLoading, updateUser } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
    niche: "",
    links: defaultLinks,
  });

  // Debug logs
  useEffect(() => {
    console.log("[AdminProfile] currentUser:", currentUser);
    console.log("[AdminProfile] authIsLoading:", authIsLoading);
  }, [currentUser, authIsLoading]);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || "",
        email: currentUser.email || "",
        bio: currentUser.bio || "",
        niche: currentUser.niche || "",
        links: {
          website: currentUser.links?.website || "",
          linkedin: currentUser.links?.linkedin || "",
          twitter: currentUser.links?.twitter || "",
        },
      });
    }
  }, [currentUser]);

  useEffect(() => {
    console.log("[AdminProfile] formData:", formData);
  }, [formData]);

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith("links.")) {
      const linkField = field.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        links: {
          ...prev.links,
          [linkField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateUser({
        name: formData.name,
        email: formData.email,
        bio: formData.bio,
        niche: formData.niche,
        links: {
          website: formData.links.website,
          linkedin: formData.links.linkedin,
          twitter: formData.links.twitter,
        },
      });
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile");
      console.error("Error updating profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // More robust loading / missing state
  if (authIsLoading) {
    console.log("[AdminProfile] Showing: Loading (authIsLoading)");
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  if (!currentUser) {
    console.log("[AdminProfile] Showing: Error (no currentUser)");
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-destructive font-semibold mb-2">
            Could not load profile. No user found.
          </p>
          <p className="text-muted-foreground">
            Try logging out and back in. If you believe this is a bug, contact support.
          </p>
        </div>
      </div>
    );
  }

  // If profile loaded, but formData is still empty
  if (!formData.email && !formData.name) {
    console.log("[AdminProfile] Showing: Loading (waiting for formData)");
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Still loading profile details...</p>
      </div>
    );
  }

  // Normal form render
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Profile</h1>
          <p className="text-muted-foreground">
            Manage your admin account settings and information
          </p>
        </div>
        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
          <Key className="h-3 w-3 mr-1" />
          Administrator
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Overview Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Profile Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center">
              <Avatar className="h-24 w-24 mb-4">
                {currentUser.photoUrl ? (
                  <AvatarImage src={currentUser.photoUrl} alt={currentUser.name ?? "Admin"} />
                ) : (
                  <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                    {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : "A"}
                  </AvatarFallback>
                )}
              </Avatar>
              <Button variant="outline" size="sm" className="mb-4" disabled>
                <Upload className="h-4 w-4 mr-2" />
                Change Photo
              </Button>
            </div>
            <Separator />
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">NAME</Label>
                <p className="font-medium">{currentUser.name || <span className="text-muted-foreground">N/A</span>}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">EMAIL</Label>
                <p className="font-medium">{currentUser.email || <span className="text-muted-foreground">N/A</span>}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">ROLE</Label>
                <p className="font-medium capitalize">{currentUser.role || "admin"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Details Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="h-5 w-5 mr-2" />
              Profile Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter your full name"
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
              />
            </div>
            <Separator />
            <div>
              <Label className="text-base font-medium flex items-center mb-4">
                <Globe className="h-4 w-4 mr-2" />
                Social Links
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={formData.links.website}
                    onChange={(e) => handleInputChange("links.website", e.target.value)}
                    placeholder="https://yourwebsite.com"
                  />
                </div>
                <div>
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    value={formData.links.linkedin}
                    onChange={(e) => handleInputChange("links.linkedin", e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
                <div>
                  <Label htmlFor="twitter">Twitter</Label>
                  <Input
                    id="twitter"
                    value={formData.links.twitter}
                    onChange={(e) => handleInputChange("links.twitter", e.target.value)}
                    placeholder="https://twitter.com/username"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminProfile;
