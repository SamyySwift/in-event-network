import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Palette, Save, Upload } from "lucide-react";
import { useAdminEventContext } from "@/hooks/useAdminEventContext";
import { useAdminEvents } from "@/hooks/useAdminEvents";
import { toast } from "sonner";

export function BrandingSettings() {
  const { selectedEvent } = useAdminEventContext();
  const { updateEvent, uploadImage, isUpdating } = useAdminEvents();
  
  const [customTitle, setCustomTitle] = useState(selectedEvent?.custom_title || "");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState(selectedEvent?.logo_url || "");

  const handleLogoChange = (file: File | null) => {
    setLogoFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveBranding = async () => {
    if (!selectedEvent?.id) {
      toast.error("No event selected");
      return;
    }

    try {
      let logoUrl = selectedEvent.logo_url;
      
      // Upload logo if changed
      if (logoFile) {
        logoUrl = await uploadImage(logoFile);
      }

      // Update event with new branding
      updateEvent({
        id: selectedEvent.id,
        custom_title: customTitle || null,
        logo_url: logoUrl || null,
      });
    } catch (error) {
      console.error("Error saving branding:", error);
      toast.error("Failed to save branding");
    }
  };

  if (!selectedEvent) {
    return (
      <Card>
        <CardContent className="py-10">
          <p className="text-center text-muted-foreground">
            Please select an event to customize branding
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Palette className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">Event Branding</CardTitle>
            <CardDescription>
              Customize the logo and title displayed to attendees for {selectedEvent.name}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Logo Upload */}
        <div className="space-y-3">
          <Label htmlFor="logo">Event Logo</Label>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="Logo preview"
                  className="h-20 w-20 rounded-lg object-cover border-2 border-border"
                />
              ) : (
                <div className="h-20 w-20 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-muted">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleLogoChange(file);
                }}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Recommended: Square image, min 200x200px. This logo will appear in the attendee dashboard header.
              </p>
            </div>
          </div>
        </div>

        {/* Custom Title */}
        <div className="space-y-3">
          <Label htmlFor="custom-title">Custom Title</Label>
          <Input
            id="custom-title"
            placeholder="Enter custom title (optional)"
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
            className="max-w-md"
          />
          <p className="text-xs text-muted-foreground">
            Override the default "Kconect" branding with your custom title
          </p>
        </div>

        {/* Preview */}
        <div className="space-y-3 p-4 bg-muted/30 rounded-lg border border-border">
          <Label>Preview</Label>
          <div className="flex items-center gap-3 p-3 bg-background rounded-md border">
            {logoPreview ? (
              <img src={logoPreview} alt="Logo" className="h-6 w-6 rounded" />
            ) : (
              <div className="h-6 w-6 rounded bg-primary/20" />
            )}
            <span className="font-bold text-sm">
              {customTitle || "Kconect"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            This is how your branding will appear to attendees
          </p>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <Button
            onClick={handleSaveBranding}
            disabled={isUpdating}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {isUpdating ? "Saving..." : "Save Branding"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
