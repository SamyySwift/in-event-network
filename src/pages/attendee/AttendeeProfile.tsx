import React, { useState } from 'react';
import { Edit, Save, X, Link, MapPin, Calendar, Mail } from 'lucide-react';
import AppLayout from '@/components/layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ProfilePictureUpload } from '@/components/profile/ProfilePictureUpload';
import EventAccessGuard from '@/components/EventAccessGuard';
import { useEventParticipation } from '@/hooks/useEventParticipation';

const AttendeeProfile = () => {
  const { currentUser, updateUser } = useAuth();
  const { toast } = useToast();
  const { getJoinedEvents, loading: participationLoading } = useEventParticipation();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    bio: currentUser?.bio || '',
    role: currentUser?.role || '',
    company: currentUser?.company || '',
    niche: currentUser?.niche || '',
    twitter_link: currentUser?.twitter_link || '',
    linkedin_link: currentUser?.linkedin_link || '',
    github_link: currentUser?.github_link || '',
    website_link: currentUser?.website_link || '',
    instagram_link: currentUser?.instagram_link || '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateUser(formData);
      setIsEditing(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: currentUser?.name || '',
      bio: currentUser?.bio || '',
      role: currentUser?.role || '',
      company: currentUser?.company || '',
      niche: currentUser?.niche || '',
      twitter_link: currentUser?.twitter_link || '',
      linkedin_link: currentUser?.linkedin_link || '',
      github_link: currentUser?.github_link || '',
      website_link: currentUser?.website_link || '',
      instagram_link: currentUser?.instagram_link || '',
    });
    setIsEditing(false);
  };

  const hasEventAccess = getJoinedEvents().length > 0;

  return (
    <AppLayout>
      <EventAccessGuard hasAccess={hasEventAccess} loading={participationLoading}>
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Your Profile</h1>
            {isEditing ? (
              <div className="flex gap-2">
                <Button variant="ghost" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isSaving} className="bg-connect-600 hover:bg-connect-700">
                  {isSaving ? (
                    <>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>

          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardHeader className="flex flex-col items-center pb-2">
              <ProfilePictureUpload />
              <CardTitle className="mt-4 text-xl text-gray-900 dark:text-white">{currentUser?.name}</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                {currentUser?.role} at {currentUser?.company}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Separator className="my-4" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Personal Information */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Personal Information</h2>
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Name</div>
                      {isEditing ? (
                        <Input
                          type="text"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                        />
                      ) : (
                        <div className="text-gray-500 dark:text-gray-400">{formData.name || 'Not specified'}</div>
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</div>
                      <div className="text-gray-500 dark:text-gray-400">{currentUser?.email}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Location</div>
                      <div className="text-gray-500 dark:text-gray-400">
                        <MapPin className="inline-block h-4 w-4 mr-1" />
                        {currentUser?.location || 'Not specified'}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Timezone</div>
                      <div className="text-gray-500 dark:text-gray-400">
                        <Calendar className="inline-block h-4 w-4 mr-1" />
                        {currentUser?.timezone || 'Not specified'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Professional Information */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Professional Information</h2>
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Role</div>
                      {isEditing ? (
                        <Input
                          type="text"
                          value={formData.role}
                          onChange={(e) => handleInputChange('role', e.target.value)}
                        />
                      ) : (
                        <div className="text-gray-500 dark:text-gray-400">{formData.role || 'Not specified'}</div>
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Company</div>
                      {isEditing ? (
                        <Input
                          type="text"
                          value={formData.company}
                          onChange={(e) => handleInputChange('company', e.target.value)}
                        />
                      ) : (
                        <div className="text-gray-500 dark:text-gray-400">{formData.company || 'Not specified'}</div>
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Professional Niche</div>
                      {isEditing ? (
                        <Input
                          type="text"
                          value={formData.niche}
                          onChange={(e) => handleInputChange('niche', e.target.value)}
                        />
                      ) : (
                        <div className="text-gray-500 dark:text-gray-400">{formData.niche || 'Not specified'}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div className="mt-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Bio</h2>
                {isEditing ? (
                  <Textarea
                    placeholder="Write a short bio about yourself"
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                  />
                ) : (
                  <div className="text-gray-500 dark:text-gray-400">{formData.bio || 'No bio provided'}</div>
                )}
              </div>

              {/* Social Links */}
              <div className="mt-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Social Links</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Twitter</div>
                    {isEditing ? (
                      <Input
                        type="text"
                        placeholder="https://twitter.com/yourprofile"
                        value={formData.twitter_link}
                        onChange={(e) => handleInputChange('twitter_link', e.target.value)}
                      />
                    ) : (
                      <div className="text-gray-500 dark:text-gray-400">
                        {formData.twitter_link ? (
                          <a href={formData.twitter_link} target="_blank" rel="noopener noreferrer" className="text-connect-600 hover:underline">
                            <Link className="inline-block h-4 w-4 mr-1" />
                            Twitter Profile
                          </a>
                        ) : (
                          'Not specified'
                        )}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">LinkedIn</div>
                    {isEditing ? (
                      <Input
                        type="text"
                        placeholder="https://linkedin.com/in/yourprofile"
                        value={formData.linkedin_link}
                        onChange={(e) => handleInputChange('linkedin_link', e.target.value)}
                      />
                    ) : (
                      <div className="text-gray-500 dark:text-gray-400">
                        {formData.linkedin_link ? (
                          <a href={formData.linkedin_link} target="_blank" rel="noopener noreferrer" className="text-connect-600 hover:underline">
                            <Link className="inline-block h-4 w-4 mr-1" />
                            LinkedIn Profile
                          </a>
                        ) : (
                          'Not specified'
                        )}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">GitHub</div>
                    {isEditing ? (
                      <Input
                        type="text"
                        placeholder="https://github.com/yourprofile"
                        value={formData.github_link}
                        onChange={(e) => handleInputChange('github_link', e.target.value)}
                      />
                    ) : (
                      <div className="text-gray-500 dark:text-gray-400">
                        {formData.github_link ? (
                          <a href={formData.github_link} target="_blank" rel="noopener noreferrer" className="text-connect-600 hover:underline">
                            <Link className="inline-block h-4 w-4 mr-1" />
                            GitHub Profile
                          </a>
                        ) : (
                          'Not specified'
                        )}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Website</div>
                    {isEditing ? (
                      <Input
                        type="text"
                        placeholder="https://yourwebsite.com"
                        value={formData.website_link}
                        onChange={(e) => handleInputChange('website_link', e.target.value)}
                      />
                    ) : (
                      <div className="text-gray-500 dark:text-gray-400">
                        {formData.website_link ? (
                          <a href={formData.website_link} target="_blank" rel="noopener noreferrer" className="text-connect-600 hover:underline">
                            <Link className="inline-block h-4 w-4 mr-1" />
                            Website
                          </a>
                        ) : (
                          'Not specified'
                        )}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Instagram</div>
                    {isEditing ? (
                      <Input
                        type="text"
                        placeholder="https://instagram.com/yourprofile"
                        value={formData.instagram_link}
                        onChange={(e) => handleInputChange('instagram_link', e.target.value)}
                      />
                    ) : (
                      <div className="text-gray-500 dark:text-gray-400">
                        {formData.instagram_link ? (
                          <a href={formData.instagram_link} target="_blank" rel="noopener noreferrer" className="text-connect-600 hover:underline">
                            <Link className="inline-block h-4 w-4 mr-1" />
                            Instagram Profile
                          </a>
                        ) : (
                          'Not specified'
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </EventAccessGuard>
    </AppLayout>
  );
};

export default AttendeeProfile;
