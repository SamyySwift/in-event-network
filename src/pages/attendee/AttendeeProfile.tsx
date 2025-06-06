
import React, { useState } from 'react';
import { User, Mail, MapPin, Clock, Edit3, Save, X } from 'lucide-react';
import AppLayout from '@/components/layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import EventAccessGuard from '@/components/EventAccessGuard';
import { useEventParticipation } from '@/hooks/useEventParticipation';

const AttendeeProfile = () => {
  const { currentUser } = useAuth();
  const { getJoinedEvents, loading: participationLoading } = useEventParticipation();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    bio: currentUser?.bio || '',
    role: currentUser?.role || 'attendee',
    niche: currentUser?.niche || '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    // Here you would typically call an API to update the user profile
    console.log('Saving profile:', formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      name: currentUser?.name || '',
      bio: currentUser?.bio || '',
      role: currentUser?.role || 'attendee',
      niche: currentUser?.niche || '',
    });
    setIsEditing(false);
  };

  const hasEventAccess = getJoinedEvents().length > 0;

  return (
    <AppLayout>
      <EventAccessGuard hasAccess={hasEventAccess} loading={participationLoading}>
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
              <User className="h-8 w-8 mr-3" />
              My Profile
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your personal information and preferences.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Update your profile details</CardDescription>
                  </div>
                  {!isEditing ? (
                    <Button variant="outline" onClick={() => setIsEditing(true)}>
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={handleCancel}>
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                      <Button onClick={handleSave}>
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      {isEditing ? (
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                        />
                      ) : (
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                          {currentUser?.name || 'Not provided'}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                        {currentUser?.email || 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="role">Role</Label>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 capitalize">
                        {currentUser?.role || 'Attendee'}
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="niche">Niche/Interest</Label>
                      {isEditing ? (
                        <Input
                          id="niche"
                          value={formData.niche}
                          onChange={(e) => handleInputChange('niche', e.target.value)}
                          placeholder="e.g., Technology, Marketing"
                        />
                      ) : (
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                          {currentUser?.niche || 'Not specified'}
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    {isEditing ? (
                      <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        placeholder="Tell us about yourself..."
                        rows={3}
                      />
                    ) : (
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                        {currentUser?.bio || 'No bio provided'}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Profile Summary */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Profile Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-3 flex items-center justify-center">
                      <User className="h-10 w-10 text-gray-500" />
                    </div>
                    <h3 className="font-semibold">{currentUser?.name || 'Attendee'}</h3>
                    <p className="text-sm text-gray-600 capitalize">{currentUser?.role || 'attendee'}</p>
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="truncate">{currentUser?.email || 'No email'}</span>
                    </div>
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{currentUser?.niche || 'No specialization'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Quick Stats */}
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-lg">Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Events Joined</span>
                      <span className="font-medium">{getJoinedEvents().length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Profile Complete</span>
                      <span className="font-medium">
                        {currentUser?.name && currentUser?.bio ? '100%' : '50%'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </EventAccessGuard>
    </AppLayout>
  );
};

export default AttendeeProfile;
