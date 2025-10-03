import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export const AdminProfilePicture = () => {
  const { currentUser } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(currentUser?.photoUrl || '');

  const handlePhotoUpload = async (file: File) => {
    if (!currentUser) return;
    
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${currentUser.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(filePath);

      // Update profile with new photo URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ photo_url: data.publicUrl })
        .eq('id', currentUser.id);

      if (updateError) throw updateError;

      setPhotoUrl(data.publicUrl);
      toast.success('Profile picture updated successfully');
      
      // Refresh page to update avatar everywhere
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      toast.error('Failed to upload profile picture');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Profile Picture
        </CardTitle>
        <CardDescription>
          Upload a profile picture for your admin account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          <Avatar className="h-24 w-24 ring-2 ring-primary/20">
            {photoUrl ? (
              <AvatarImage src={photoUrl} alt={currentUser?.name} />
            ) : (
              <AvatarFallback className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white text-2xl">
                {currentUser?.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>
          
          <div className="flex-1">
            <Label htmlFor="photo-upload">Upload Profile Picture</Label>
            <Input
              id="photo-upload"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handlePhotoUpload(file);
              }}
              disabled={uploading}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Recommended: Square image, at least 200x200px
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
