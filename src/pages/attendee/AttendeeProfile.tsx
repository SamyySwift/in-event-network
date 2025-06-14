import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/layouts/AppLayout';
import { ProfilePictureUpload } from '@/components/profile/ProfilePictureUpload';
import { Github, Instagram, Linkedin, Facebook, Globe } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// Twitter/X icon component
const XIcon = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>
  </svg>
);

// Mock data for niche options
const nicheOptions = [
  'Software Development',
  'Product Management',
  'Design',
  'Marketing',
  'Data Science',
  'Finance',
  'Education',
  'Healthcare',
  'Entrepreneurship',
  'Crypto',
  'AI/ML',
];

const networkingOptions = [
  'Investors',
  'Co-founders',
  'Frontend Developers',
  'Backend Developers',
  'Product Managers',
  'UX/UI Designers',
  'Marketing Experts',
  'Data Scientists',
  'Sales Representatives',
  'HR Professionals',
  'Students',
];

const AttendeeProfile = () => {
  const { currentUser, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [profileData, setProfileData] = useState({
    name: '',
    photoUrl: '',
    bio: '',
    niche: '',
    company: '',
    customTags: [] as string[],
    networkingPreferences: [] as string[],
    links: {
      twitter: '',
      linkedin: '',
      github: '',
      website: '',
      facebook: '',
      instagram: '',
    }
  });
  
  const [newTag, setNewTag] = useState('');
  const [selectedNiche, setSelectedNiche] = useState('');
  const [selectedNetworking, setSelectedNetworking] = useState<string[]>([]);
  const [customNetworkingPref, setCustomNetworkingPref] = useState('');

  // Load profile data from Supabase on component mount
  useEffect(() => {
    const loadProfileData = async () => {
      if (!currentUser?.id) return;

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (profile) {
          const loadedData = {
            name: profile.name || '',
            photoUrl: profile.photo_url || '',
            bio: profile.bio || '',
            niche: profile.niche || '',
            company: profile.company || '',
            customTags: profile.tags || [],
            networkingPreferences: profile.networking_preferences || [],
            links: {
              twitter: profile.twitter_link || '',
              linkedin: profile.linkedin_link || '',
              github: profile.github_link || '',
              website: profile.website_link || '',
              facebook: profile.facebook_link || '',
              instagram: profile.instagram_link || '',
            }
          };
          
          setProfileData(loadedData);
          setSelectedNiche(loadedData.niche);
          setSelectedNetworking(loadedData.networkingPreferences);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        toast({
          title: "Error loading profile",
          description: "There was a problem loading your profile data",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProfileData();
  }, [currentUser?.id, toast]);
  
  const handleAddTag = () => {
    if (newTag.trim() && !profileData.customTags.includes(newTag.trim())) {
      setProfileData({
        ...profileData,
        customTags: [...profileData.customTags, newTag.trim()]
      });
      setNewTag('');
    }
  };
  
  const handleRemoveTag = (tag: string) => {
    setProfileData({
      ...profileData,
      customTags: profileData.customTags.filter(t => t !== tag)
    });
  };
  
  const toggleNetworkingPreference = (pref: string) => {
    if (selectedNetworking.includes(pref)) {
      setSelectedNetworking(selectedNetworking.filter(p => p !== pref));
    } else {
      setSelectedNetworking([...selectedNetworking, pref]);
    }
  };

  const handleAddCustomNetworkingPref = () => {
    if (customNetworkingPref.trim() && !selectedNetworking.includes(customNetworkingPref.trim())) {
      setSelectedNetworking([...selectedNetworking, customNetworkingPref.trim()]);
      setCustomNetworkingPref('');
    }
  };

  const handleRemoveNetworkingPref = (pref: string) => {
    setSelectedNetworking(selectedNetworking.filter(p => p !== pref));
  };

  const handleProfilePictureUpdate = (imageUrl: string) => {
    setProfileData(prev => ({ ...prev, photoUrl: imageUrl }));
  };
  
  const handleSave = async () => {
    setIsSubmitting(true);
    
    try {
      // Update the profile in Supabase directly
      const { error } = await supabase
        .from('profiles')
        .update({
          name: profileData.name,
          photo_url: profileData.photoUrl,
          bio: profileData.bio,
          niche: selectedNiche,
          company: profileData.company,
          tags: profileData.customTags,
          networking_preferences: selectedNetworking,
          twitter_link: profileData.links.twitter,
          linkedin_link: profileData.links.linkedin,
          github_link: profileData.links.github,
          website_link: profileData.links.website,
          facebook_link: profileData.links.facebook,
          instagram_link: profileData.links.instagram,
        })
        .eq('id', currentUser?.id);

      if (error) {
        throw error;
      }

      // Also update the auth context
      await updateUser({
        name: profileData.name,
        photoUrl: profileData.photoUrl,
        bio: profileData.bio,
        niche: selectedNiche,
        customTags: profileData.customTags,
        networkingPreferences: selectedNetworking,
        links: profileData.links,
      });
      
      setIsEditing(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully"
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update failed",
        description: "There was a problem updating your profile",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!currentUser) {
    return (
      <AppLayout>
        <div className="p-8 text-center">
          <h1 className="text-2xl font-bold">Please log in to view your profile</h1>
          <Button
            className="mt-4"
            onClick={() => navigate('/login')}
          >
            Go to Login
          </Button>
        </div>
      </AppLayout>
    );
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        </div>
      </AppLayout>
    );
  }
  
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">Your Profile</h1>
          
          {isEditing ? (
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                disabled={isSubmitting}
                className="bg-connect-600 hover:bg-connect-700"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          ) : (
            <Button 
              onClick={() => setIsEditing(true)}
              variant="outline"
            >
              Edit Profile
            </Button>
          )}
        </div>
        
        <Card>
          {/* Profile Header */}
          <CardHeader className="bg-connect-50 dark:bg-connect-900/20 border-b dark:border-gray-700">
            <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
              <ProfilePictureUpload
                currentImageUrl={profileData.photoUrl}
                userId={currentUser.id}
                userName={profileData.name || 'User'}
                onImageUpdate={handleProfilePictureUpdate}
                isEditing={isEditing}
              />
              
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-900 dark:text-white">Full Name</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    />
                  </div>
                ) : (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{profileData.name || 'Add your name'}</h2>
                    {profileData.niche && (
                      <Badge variant="secondary" className="mt-1 bg-connect-100 text-connect-800 hover:bg-connect-200 dark:bg-connect-900/50 dark:text-connect-300">
                        {profileData.niche}
                      </Badge>
                    )}
                    {profileData.company && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{profileData.company}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-6 space-y-8">
            {/* Bio Section */}
            <div>
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">About</h3>
              {isEditing ? (
                <Textarea
                  placeholder="Tell others about yourself..."
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  className="min-h-[120px]"
                />
              ) : (
                <p className="text-gray-700 dark:text-gray-300">
                  {profileData.bio || "No bio added yet."}
                </p>
              )}
            </div>
            
            <Separator />

            {/* Company Section */}
            <div>
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Company</h3>
              {isEditing ? (
                <Input
                  placeholder="Your company or organization"
                  value={profileData.company}
                  onChange={(e) => setProfileData({ ...profileData, company: e.target.value })}
                />
              ) : (
                <p className="text-gray-700 dark:text-gray-300">
                  {profileData.company || "No company added yet."}
                </p>
              )}
            </div>
            
            <Separator />
            
            {/* Professional Niche */}
            <div>
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Professional Niche</h3>
              
              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {nicheOptions.map((niche) => (
                      <div key={niche} className="flex items-center">
                        <input
                          type="radio"
                          id={`niche-${niche}`}
                          name="niche"
                          className="peer sr-only"
                          checked={selectedNiche === niche}
                          onChange={() => setSelectedNiche(niche)}
                        />
                        <label
                          htmlFor={`niche-${niche}`}
                          className={`flex w-full cursor-pointer rounded-lg border ${
                            selectedNiche === niche
                              ? 'bg-connect-50 border-connect-500 dark:bg-connect-900/50 dark:border-connect-400'
                              : 'bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-600'
                          } p-2 text-sm font-medium text-gray-900 dark:text-white`}
                        >
                          {niche}
                        </label>
                      </div>
                    ))}
                  </div>
                  
                  <div>
                    <Label htmlFor="custom-niche" className="text-gray-900 dark:text-white">Other (specify)</Label>
                    <div className="mt-1 flex">
                      <Input
                        type="text"
                        id="custom-niche"
                        value={selectedNiche !== '' && !nicheOptions.includes(selectedNiche) ? selectedNiche : ''}
                        placeholder="Enter your niche"
                        onChange={(e) => setSelectedNiche(e.target.value)}
                        className="rounded-r-none"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        className="rounded-l-none"
                        onClick={() => setSelectedNiche('')}
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  {selectedNiche ? (
                    <Badge variant="outline" className="bg-connect-50 border-connect-200 text-connect-800 dark:bg-connect-900/50 dark:border-connect-400 dark:text-connect-300">
                      {selectedNiche}
                    </Badge>
                  ) : (
                    <p className="text-gray-500 text-sm italic dark:text-gray-400">No niche selected</p>
                  )}
                </div>
              )}
            </div>
            
            <Separator />
            
            {/* Networking Preferences */}
            <div>
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Networking Preferences</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Who are you interested in meeting?</p>
              
              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {networkingOptions.map((pref) => (
                      <div key={pref} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`pref-${pref}`}
                          className="peer sr-only"
                          checked={selectedNetworking.includes(pref)}
                          onChange={() => toggleNetworkingPreference(pref)}
                        />
                        <label
                          htmlFor={`pref-${pref}`}
                          className={`flex w-full cursor-pointer rounded-lg border ${
                            selectedNetworking.includes(pref)
                              ? 'bg-connect-50 border-connect-300 dark:bg-connect-900/50 dark:border-connect-400'
                              : 'bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-600'
                          } p-2 text-sm font-medium text-gray-900 dark:text-white`}
                        >
                          {pref}
                        </label>
                      </div>
                    ))}
                  </div>
                  
                  {/* Custom networking preference input */}
                  <div>
                    <Label htmlFor="custom-networking" className="text-gray-900 dark:text-white">Add custom preference</Label>
                    <div className="mt-1 flex">
                      <Input
                        type="text"
                        id="custom-networking"
                        value={customNetworkingPref}
                        placeholder="Enter custom networking preference"
                        onChange={(e) => setCustomNetworkingPref(e.target.value)}
                        className="rounded-r-none"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCustomNetworkingPref();
                          }
                        }}
                      />
                      <Button
                        type="button"
                        onClick={handleAddCustomNetworkingPref}
                        className="rounded-l-none bg-connect-600 hover:bg-connect-700"
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                  
                  {/* Display selected preferences with remove option */}
                  {selectedNetworking.length > 0 && (
                    <div className="mt-3">
                      <Label className="text-gray-900 dark:text-white mb-2 block">Selected preferences:</Label>
                      <div className="flex flex-wrap gap-2">
                        {selectedNetworking.map((pref) => (
                          <Badge 
                            key={pref}
                            variant="secondary"
                            className="flex items-center space-x-1 bg-connect-50 text-connect-700 dark:bg-connect-900/50 dark:text-connect-300"
                          >
                            <span>{pref}</span>
                            <button 
                              className="ml-1 h-4 w-4 rounded-full inline-flex items-center justify-center text-connect-700 hover:text-connect-900 hover:bg-connect-200 dark:text-connect-300 dark:hover:text-connect-100 dark:hover:bg-connect-700"
                              onClick={() => handleRemoveNetworkingPref(pref)}
                            >
                              <span className="sr-only">Remove preference</span>
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                              </svg>
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {selectedNetworking.length > 0 ? (
                    selectedNetworking.map((pref) => (
                      <Badge key={pref} variant="outline" className="bg-gray-50 dark:bg-gray-800 dark:text-gray-300">
                        {pref}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm italic dark:text-gray-400">No preferences selected</p>
                  )}
                </div>
              )}
            </div>
            
            <Separator />
            
            {/* Custom Tags */}
            <div>
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Custom Tags</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Add tags that represent your interests</p>
              
              {isEditing ? (
                <div>
                  <div className="flex mb-3">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add a tag"
                      className="rounded-r-none"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={handleAddTag}
                      className="rounded-l-none bg-connect-600 hover:bg-connect-700"
                    >
                      Add
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-3">
                    {profileData.customTags.map((tag) => (
                      <Badge 
                        key={tag}
                        variant="secondary"
                        className="flex items-center space-x-1 bg-connect-50 text-connect-700 dark:bg-connect-900/50 dark:text-connect-300"
                      >
                        <span>{tag}</span>
                        <button 
                          className="ml-1 h-4 w-4 rounded-full inline-flex items-center justify-center text-connect-700 hover:text-connect-900 hover:bg-connect-200 dark:text-connect-300 dark:hover:text-connect-100 dark:hover:bg-connect-700"
                          onClick={() => handleRemoveTag(tag)}
                        >
                          <span className="sr-only">Remove tag</span>
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profileData.customTags.length > 0 ? (
                    profileData.customTags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="bg-connect-50 text-connect-700 dark:bg-connect-900/50 dark:text-connect-300">
                        {tag}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm italic dark:text-gray-400">No tags added</p>
                  )}
                </div>
              )}
            </div>
            
            <Separator />
            
            {/* Social Media Links */}
            <div>
              <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Connect With Me</h3>
              
              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="twitter" className="flex items-center text-gray-900 dark:text-white">
                      <XIcon size={16} className="mr-2" />
                      X (Twitter)
                    </Label>
                    <Input
                      id="twitter"
                      value={profileData.links.twitter}
                      onChange={(e) => setProfileData({
                        ...profileData,
                        links: { ...profileData.links, twitter: e.target.value }
                      })}
                      placeholder="https://x.com/username"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="linkedin" className="flex items-center text-gray-900 dark:text-white">
                      <Linkedin size={16} className="mr-2" />
                      LinkedIn
                    </Label>
                    <Input
                      id="linkedin"
                      value={profileData.links.linkedin}
                      onChange={(e) => setProfileData({
                        ...profileData,
                        links: { ...profileData.links, linkedin: e.target.value }
                      })}
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="github" className="flex items-center text-gray-900 dark:text-white">
                      <Github size={16} className="mr-2" />
                      GitHub
                    </Label>
                    <Input
                      id="github"
                      value={profileData.links.github}
                      onChange={(e) => setProfileData({
                        ...profileData,
                        links: { ...profileData.links, github: e.target.value }
                      })}
                      placeholder="https://github.com/username"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="website" className="flex items-center text-gray-900 dark:text-white">
                      <Globe size={16} className="mr-2" />
                      Website
                    </Label>
                    <Input
                      id="website"
                      value={profileData.links.website}
                      onChange={(e) => setProfileData({
                        ...profileData,
                        links: { ...profileData.links, website: e.target.value }
                      })}
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="facebook" className="flex items-center text-gray-900 dark:text-white">
                      <Facebook size={16} className="mr-2" />
                      Facebook
                    </Label>
                    <Input
                      id="facebook"
                      value={profileData.links.facebook}
                      onChange={(e) => setProfileData({
                        ...profileData,
                        links: { ...profileData.links, facebook: e.target.value }
                      })}
                      placeholder="https://facebook.com/username"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="instagram" className="flex items-center text-gray-900 dark:text-white">
                      <Instagram size={16} className="mr-2" />
                      Instagram
                    </Label>
                    <Input
                      id="instagram"
                      value={profileData.links.instagram}
                      onChange={(e) => setProfileData({
                        ...profileData,
                        links: { ...profileData.links, instagram: e.target.value }
                      })}
                      placeholder="https://instagram.com/username"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                  {profileData.links.twitter && (
                    <a 
                      href={profileData.links.twitter} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex flex-col items-center justify-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
                    >
                      <XIcon size={24} className="text-black dark:text-white mb-2" />
                      <span className="text-xs text-gray-900 dark:text-white">X</span>
                    </a>
                  )}
                  
                  {profileData.links.linkedin && (
                    <a 
                      href={profileData.links.linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex flex-col items-center justify-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Linkedin size={24} className="text-[#0A66C2] mb-2" />
                      <span className="text-xs text-gray-900 dark:text-white">LinkedIn</span>
                    </a>
                  )}
                  
                  {profileData.links.github && (
                    <a 
                      href={profileData.links.github} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex flex-col items-center justify-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Github size={24} className="text-[#333] dark:text-white mb-2" />
                      <span className="text-xs text-gray-900 dark:text-white">GitHub</span>
                    </a>
                  )}
                  
                  {profileData.links.website && (
                    <a 
                      href={profileData.links.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex flex-col items-center justify-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Globe size={24} className="text-gray-700 dark:text-gray-300 mb-2" />
                      <span className="text-xs text-gray-900 dark:text-white">Website</span>
                    </a>
                  )}
                  
                  {profileData.links.facebook && (
                    <a 
                      href={profileData.links.facebook} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex flex-col items-center justify-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Facebook size={24} className="text-[#1877F2] mb-2" />
                      <span className="text-xs text-gray-900 dark:text-white">Facebook</span>
                    </a>
                  )}
                  
                  {profileData.links.instagram && (
                    <a 
                      href={profileData.links.instagram} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex flex-col items-center justify-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Instagram size={24} className="text-[#E4405F] mb-2" />
                      <span className="text-xs text-gray-900 dark:text-white">Instagram</span>
                    </a>
                  )}
                  
                  {!Object.values(profileData.links).some(link => link) && (
                    <p className="text-gray-500 text-sm italic col-span-full dark:text-gray-400">No social media links added</p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
          
          {isEditing && (
            <CardFooter className="bg-gray-50 dark:bg-gray-800 border-t dark:border-gray-700 flex justify-end">
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditing(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSave}
                  disabled={isSubmitting}
                  className="bg-connect-600 hover:bg-connect-700"
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardFooter>
          )}
        </Card>
      </div>
    </AppLayout>
  );
};

export default AttendeeProfile;
