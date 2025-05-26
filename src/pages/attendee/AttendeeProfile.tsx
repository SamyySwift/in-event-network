
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/layouts/AppLayout';
import { Github, Instagram, Linkedin, Twitter, Facebook, Globe } from 'lucide-react';

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
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [profileData, setProfileData] = useState({
    name: currentUser?.name || '',
    photoUrl: currentUser?.photoUrl || '',
    bio: currentUser?.bio || '',
    niche: currentUser?.niche || '',
    customTags: currentUser?.customTags || [],
    networkingPreferences: currentUser?.networkingPreferences || [],
    links: {
      twitter: currentUser?.links?.twitter || '',
      linkedin: currentUser?.links?.linkedin || '',
      github: currentUser?.links?.github || '',
      website: currentUser?.links?.website || '',
      facebook: currentUser?.links?.facebook || '',
      instagram: currentUser?.links?.instagram || '',
    }
  });
  
  const [newTag, setNewTag] = useState('');
  const [selectedNiche, setSelectedNiche] = useState(profileData.niche || '');
  const [selectedNetworking, setSelectedNetworking] = useState<string[]>(
    profileData.networkingPreferences || []
  );
  
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
  
  const handleSave = async () => {
    setIsSubmitting(true);
    
    try {
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
          <CardHeader className="bg-connect-50 border-b">
            <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
              <div className="relative">
                <Avatar className="h-24 w-24 border-4 border-white shadow-md">
                  {profileData.photoUrl ? (
                    <AvatarImage src={profileData.photoUrl} alt={profileData.name} />
                  ) : (
                    <AvatarFallback className="text-2xl bg-connect-100 text-connect-600">
                      {profileData.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  )}
                </Avatar>
                
                {isEditing && (
                  <div className="absolute bottom-0 right-0">
                    <Button size="sm" variant="secondary" className="h-8 w-8 rounded-full p-0">
                      <span className="sr-only">Edit photo</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                      </svg>
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    />
                  </div>
                ) : (
                  <div>
                    <h2 className="text-2xl font-bold">{profileData.name}</h2>
                    {profileData.niche && (
                      <Badge variant="secondary" className="mt-1 bg-connect-100 text-connect-800 hover:bg-connect-200">
                        {profileData.niche}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-6 space-y-8">
            {/* Bio Section */}
            <div>
              <h3 className="font-semibold mb-2">About</h3>
              {isEditing ? (
                <Textarea
                  placeholder="Tell others about yourself..."
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  className="min-h-[120px]"
                />
              ) : (
                <p className="text-gray-700">
                  {profileData.bio || "No bio added yet."}
                </p>
              )}
            </div>
            
            <Separator />
            
            {/* Professional Niche */}
            <div>
              <h3 className="font-semibold mb-2">Professional Niche</h3>
              
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
                              ? 'bg-connect-50 border-connect-500'
                              : 'bg-white hover:bg-gray-50'
                          } p-2 text-sm font-medium`}
                        >
                          {niche}
                        </label>
                      </div>
                    ))}
                  </div>
                  
                  <div>
                    <Label htmlFor="custom-niche">Other (specify)</Label>
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
                    <Badge variant="outline" className="bg-connect-50 border-connect-200 text-connect-800">
                      {selectedNiche}
                    </Badge>
                  ) : (
                    <p className="text-gray-500 text-sm italic">No niche selected</p>
                  )}
                </div>
              )}
            </div>
            
            <Separator />
            
            {/* Networking Preferences */}
            <div>
              <h3 className="font-semibold mb-2">Networking Preferences</h3>
              <p className="text-sm text-gray-500 mb-4">Who are you interested in meeting?</p>
              
              {isEditing ? (
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
                            ? 'bg-connect-50 border-connect-300'
                            : 'bg-white hover:bg-gray-50'
                        } p-2 text-sm font-medium`}
                      >
                        {pref}
                      </label>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {selectedNetworking.length > 0 ? (
                    selectedNetworking.map((pref) => (
                      <Badge key={pref} variant="outline" className="bg-gray-50">
                        {pref}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm italic">No preferences selected</p>
                  )}
                </div>
              )}
            </div>
            
            <Separator />
            
            {/* Custom Tags */}
            <div>
              <h3 className="font-semibold mb-2">Custom Tags</h3>
              <p className="text-sm text-gray-500 mb-4">Add tags that represent your interests</p>
              
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
                        className="flex items-center space-x-1 bg-connect-50 text-connect-700"
                      >
                        <span>{tag}</span>
                        <button 
                          className="ml-1 h-4 w-4 rounded-full inline-flex items-center justify-center text-connect-700 hover:text-connect-900 hover:bg-connect-200"
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
                      <Badge key={tag} variant="secondary" className="bg-connect-50 text-connect-700">
                        {tag}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm italic">No tags added</p>
                  )}
                </div>
              )}
            </div>
            
            <Separator />
            
            {/* Social Media Links */}
            <div>
              <h3 className="font-semibold mb-4">Connect With Me</h3>
              
              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="twitter" className="flex items-center">
                      <Twitter size={16} className="mr-2" />
                      Twitter
                    </Label>
                    <Input
                      id="twitter"
                      value={profileData.links.twitter}
                      onChange={(e) => setProfileData({
                        ...profileData,
                        links: { ...profileData.links, twitter: e.target.value }
                      })}
                      placeholder="https://twitter.com/username"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="linkedin" className="flex items-center">
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
                    <Label htmlFor="github" className="flex items-center">
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
                    <Label htmlFor="website" className="flex items-center">
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
                    <Label htmlFor="facebook" className="flex items-center">
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
                    <Label htmlFor="instagram" className="flex items-center">
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
                      className="flex flex-col items-center justify-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <Twitter size={24} className="text-[#1DA1F2] mb-2" />
                      <span className="text-xs">Twitter</span>
                    </a>
                  )}
                  
                  {profileData.links.linkedin && (
                    <a 
                      href={profileData.links.linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex flex-col items-center justify-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <Linkedin size={24} className="text-[#0A66C2] mb-2" />
                      <span className="text-xs">LinkedIn</span>
                    </a>
                  )}
                  
                  {profileData.links.github && (
                    <a 
                      href={profileData.links.github} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex flex-col items-center justify-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <Github size={24} className="text-[#333] mb-2" />
                      <span className="text-xs">GitHub</span>
                    </a>
                  )}
                  
                  {profileData.links.website && (
                    <a 
                      href={profileData.links.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex flex-col items-center justify-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <Globe size={24} className="text-gray-700 mb-2" />
                      <span className="text-xs">Website</span>
                    </a>
                  )}
                  
                  {profileData.links.facebook && (
                    <a 
                      href={profileData.links.facebook} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex flex-col items-center justify-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <Facebook size={24} className="text-[#1877F2] mb-2" />
                      <span className="text-xs">Facebook</span>
                    </a>
                  )}
                  
                  {profileData.links.instagram && (
                    <a 
                      href={profileData.links.instagram} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex flex-col items-center justify-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <Instagram size={24} className="text-[#E4405F] mb-2" />
                      <span className="text-xs">Instagram</span>
                    </a>
                  )}
                  
                  {!Object.values(profileData.links).some(link => link) && (
                    <p className="text-gray-500 text-sm italic col-span-full">No social media links added</p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
          
          {isEditing && (
            <CardFooter className="bg-gray-50 border-t flex justify-end">
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
