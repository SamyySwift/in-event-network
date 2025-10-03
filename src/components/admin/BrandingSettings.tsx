import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ImageUpload } from '@/components/ui/image-upload';
import { Palette, Upload, Save } from 'lucide-react';
import { useAdminEventContext } from '@/hooks/useAdminEventContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const BrandingSettings = () => {
  const { selectedEvent } = useAdminEventContext();
  const [customTitle, setCustomTitle] = useState(selectedEvent?.custom_title || '');
  const [logoUrl, setLogoUrl] = useState(selectedEvent?.logo_url || '');
  const [primaryColor, setPrimaryColor] = useState(selectedEvent?.primary_color || '#0EA5E9');
  const [secondaryColor, setSecondaryColor] = useState(selectedEvent?.secondary_color || '#8B5CF6');
  const [accentColor, setAccentColor] = useState(selectedEvent?.accent_color || '#10B981');
  const [backgroundColor, setBackgroundColor] = useState(selectedEvent?.background_color || '#FFFFFF');
  const [textColor, setTextColor] = useState(selectedEvent?.text_color || '#1F2937');
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
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Theme Colors
          </CardTitle>
          <CardDescription>
            Customize the color scheme for your event dashboard and attendee views
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
