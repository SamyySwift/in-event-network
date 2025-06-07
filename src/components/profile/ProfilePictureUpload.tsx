
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Camera, Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ProfilePictureUploadProps {
  currentImageUrl?: string;
  userId: string;
  userName: string;
  onImageUpdate: (imageUrl: string) => void;
  isEditing: boolean;
}

export const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({
  currentImageUrl,
  userId,
  userName,
  onImageUpdate,
  isEditing
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/avatar.${fileExt}`;

      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, file, {
          upsert: true
        });

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);

      onImageUpdate(publicUrl);

      toast({
        title: "Profile picture updated",
        description: "Your profile picture has been updated successfully"
      });
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      toast({
        title: "Upload failed",
        description: "There was a problem uploading your profile picture",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!currentImageUrl) return;

    try {
      // Extract filename from URL
      const fileName = `${userId}/avatar.${currentImageUrl.split('.').pop()}`;
      
      await supabase.storage
        .from('profile-pictures')
        .remove([fileName]);

      onImageUpdate('');

      toast({
        title: "Profile picture removed",
        description: "Your profile picture has been removed"
      });
    } catch (error) {
      console.error('Error removing profile picture:', error);
      toast({
        title: "Remove failed",
        description: "There was a problem removing your profile picture",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="relative">
      <Avatar className="h-24 w-24 border-4 border-white shadow-md">
        {currentImageUrl ? (
          <AvatarImage src={currentImageUrl} alt={userName} />
        ) : (
          <AvatarFallback className="text-2xl bg-connect-100 text-connect-600 dark:bg-connect-900 dark:text-connect-300">
            {userName.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        )}
      </Avatar>
      
      {isEditing && (
        <div className="absolute bottom-0 right-0 flex gap-1">
          <input
            type="file"
            id="profile-picture-input"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            disabled={isUploading}
          />
          <Button
            size="sm"
            variant="secondary"
            className="h-8 w-8 rounded-full p-0"
            onClick={() => document.getElementById('profile-picture-input')?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            ) : (
              <Camera className="h-4 w-4" />
            )}
          </Button>
          {currentImageUrl && (
            <Button
              size="sm"
              variant="destructive"
              className="h-8 w-8 rounded-full p-0"
              onClick={handleRemove}
              disabled={isUploading}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
