import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ImageUpload } from '@/components/ui/image-upload';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Palette, Upload, Save, RotateCcw, User } from 'lucide-react';
import { useAdminEventContext } from '@/hooks/useAdminEventContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const DEFAULT_THEME = {
  primary_color: '#0EA5E9',
  secondary_color: '#8B5CF6',
  accent_color: '#10B981',
  background_color: '#FFFFFF',
  text_color: '#1F2937',
  font_family: 'Geist',
};

export const BrandingSettings = () => {
  const { selectedEvent } = useAdminEventContext();
  const { currentUser } = useAuth();
  const [customTitle, setCustomTitle] = useState(selectedEvent?.custom_title || '');
  const [logoUrl, setLogoUrl] = useState(selectedEvent?.logo_url || '');
  const [primaryColor, setPrimaryColor] = useState(selectedEvent?.primary_color || DEFAULT_THEME.primary_color);
  const [secondaryColor, setSecondaryColor] = useState(selectedEvent?.secondary_color || DEFAULT_THEME.secondary_color);
  const [accentColor, setAccentColor] = useState(selectedEvent?.accent_color || DEFAULT_THEME.accent_color);
  const [backgroundColor, setBackgroundColor] = useState(selectedEvent?.background_color || DEFAULT_THEME.background_color);
  const [textColor, setTextColor] = useState(selectedEvent?.text_color || DEFAULT_THEME.text_color);
  const [fontFamily, setFontFamily] = useState(selectedEvent?.font_family || DEFAULT_THEME.font_family);
  const [profilePicture, setProfilePicture] = useState(currentUser?.photoUrl || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleLogoUpload = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${selectedEvent?.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('event-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('event-images')
        .getPublicUrl(filePath);

      setLogoUrl(data.publicUrl);
      toast.success('Logo uploaded successfully');
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error('Failed to upload logo');
    }
  };

  const handleProfilePictureUpload = async (file: File) => {
    if (!currentUser?.id) return;
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${currentUser.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ photo_url: data.publicUrl })
        .eq('id', currentUser.id);

      if (updateError) throw updateError;

      setProfilePicture(data.publicUrl);
      toast.success('Profile picture updated successfully');
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      toast.error('Failed to upload profile picture');
    }
  };

  const handleResetToDefault = () => {
    setPrimaryColor(DEFAULT_THEME.primary_color);
    setSecondaryColor(DEFAULT_THEME.secondary_color);
    setAccentColor(DEFAULT_THEME.accent_color);
    setBackgroundColor(DEFAULT_THEME.background_color);
    setTextColor(DEFAULT_THEME.text_color);
    setFontFamily(DEFAULT_THEME.font_family);
    toast.info('Theme reset to default values');
  };

  const handleSave = async () => {
    if (!selectedEvent?.id) {
      toast.error('No event selected');
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('events')
        .update({
          custom_title: customTitle,
          logo_url: logoUrl,
          primary_color: primaryColor,
          secondary_color: secondaryColor,
          accent_color: accentColor,
          background_color: backgroundColor,
          text_color: textColor,
          font_family: fontFamily,
        })
        .eq('id', selectedEvent.id);

      if (error) throw error;

      toast.success('Branding settings saved successfully!');
      
      // Refresh the page to apply new theme
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      console.error('Error saving branding:', error);
      toast.error('Failed to save branding settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Admin Profile Picture
          </CardTitle>
          <CardDescription>
            Upload your profile picture that appears in the admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            {profilePicture && (
              <img
                src={profilePicture}
                alt="Profile"
                className="h-24 w-24 object-cover rounded-full border"
              />
            )}
            <div className="flex-1">
              <Label htmlFor="profile-upload">Upload Profile Picture</Label>
              <Input
                id="profile-upload"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleProfilePictureUpload(file);
                }}
                className="mt-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Event Logo
          </CardTitle>
          <CardDescription>
            Upload a logo that will be displayed to attendees and on your admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            {logoUrl && (
              <img
                src={logoUrl}
                alt="Event logo"
                className="h-24 w-24 object-contain rounded-lg border"
              />
            )}
            <div className="flex-1">
              <Label htmlFor="logo-upload">Upload Logo</Label>
              <Input
                id="logo-upload"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleLogoUpload(file);
                }}
                className="mt-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Custom Title
          </CardTitle>
          <CardDescription>
            Set a custom title/brand name that attendees will see
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Label htmlFor="custom-title">Event Title</Label>
          <Input
            id="custom-title"
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
            placeholder={selectedEvent?.name || 'Enter custom title'}
            className="mt-2"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Theme Colors & Font
              </CardTitle>
              <CardDescription>
                Customize the color scheme and typography for your event
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleResetToDefault}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset to Default
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="font-family">Font Family</Label>
            <Select value={fontFamily} onValueChange={setFontFamily}>
              <SelectTrigger id="font-family" className="mt-2">
                <SelectValue placeholder="Select a font" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Geist">Geist (Default)</SelectItem>
                <SelectItem value="Inter">Inter</SelectItem>
                <SelectItem value="Roboto">Roboto</SelectItem>
                <SelectItem value="Open Sans">Open Sans</SelectItem>
                <SelectItem value="Lato">Lato</SelectItem>
                <SelectItem value="Montserrat">Montserrat</SelectItem>
                <SelectItem value="Poppins">Poppins</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="primary-color">Primary Color</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="primary-color"
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-20 h-10 cursor-pointer"
                />
                <Input
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="secondary-color">Secondary Color</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="secondary-color"
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-20 h-10 cursor-pointer"
                />
                <Input
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="accent-color">Accent Color</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="accent-color"
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-20 h-10 cursor-pointer"
                />
                <Input
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="background-color">Background Color</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="background-color"
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-20 h-10 cursor-pointer"
                />
                <Input
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="text-color">Text Color</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="text-color"
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-20 h-10 cursor-pointer"
                />
                <Input
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} size="lg">
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save Branding Settings'}
        </Button>
      </div>
    </div>
  );
};
