
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Send, Filter, UserPlus, MessageSquare } from 'lucide-react';
import AppLayout from '@/components/layouts/AppLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useNetworking } from '@/hooks/useNetworking';

const AttendeeNetworking = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('people');
  const { profiles, loading, sendConnectionRequest, getConnectionStatus } = useNetworking();
  
  // Filter profiles based on search term
  const filteredProfiles = profiles.filter(profile => 
    profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.bio.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (profile.tags && profile.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  // Function to handle connection request
  const handleConnect = (profileId: string) => {
    sendConnectionRequest(profileId);
  };

  // Function to handle message sending
  const handleMessage = (profileId: string) => {
    // For now, just switch to chats tab
    setActiveTab('chats');
    // In a real implementation, this would create a new chat or navigate to existing one
  };

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'twitter':
        return '𝕏';
      case 'linkedin':
        return 'in';
      case 'github':
        return '󰊤';
      case 'instagram':
        return '󰋾';
      default:
        return '🌐';
    }
  };

  const getSocialUrl = (platform: string, handle: string) => {
    switch (platform) {
      case 'twitter':
        return `https://twitter.com/${handle}`;
      case 'linkedin':
        return `https://linkedin.com/in/${handle}`;
      case 'github':
        return `https://github.com/${handle}`;
      case 'instagram':
        return `https://instagram.com/${handle}`;
      case 'website':
        return handle.startsWith('http') ? handle : `https://${handle}`;
      default:
        return '#';
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="animate-fade-in max-w-6xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-connect-600 mx-auto"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Loading profiles...</p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="animate-fade-in max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Networking</h1>
            <p className="text-gray-600 dark:text-gray-400">Connect with other attendees at the event</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="people" className="flex items-center gap-2">
              <UserPlus size={18} />
              <span>Find People</span>
            </TabsTrigger>
            <TabsTrigger value="chats" className="flex items-center gap-2">
              <MessageSquare size={18} />
              <span>Chats</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="people" className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, role, company, or skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter size={16} />
                <span>Filters</span>
              </Button>
            </div>
            
            {filteredProfiles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredProfiles.map((profile) => {
                  const connectionStatus = getConnectionStatus(profile.id);
                  const isConnected = connectionStatus?.status === 'accepted';
                  const isPending = connectionStatus?.status === 'pending';
                  
                  return (
                    <Card key={profile.id} className="hover-lift bg-white dark:bg-gray-800">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between">
                          <Avatar className="h-12 w-12">
                            {profile.photo_url ? (
                              <AvatarImage src={profile.photo_url} alt={profile.name} />
                            ) : (
                              <AvatarFallback className="bg-connect-100 text-connect-600">
                                {profile.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleMessage(profile.id)}
                              className="h-8"
                              disabled={!isConnected}
                            >
                              <MessageSquare size={16} className="mr-1" />
                              Message
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => handleConnect(profile.id)}
                              className="h-8 bg-connect-600 hover:bg-connect-700"
                              disabled={isConnected || isPending}
                            >
                              <UserPlus size={16} className="mr-1" />
                              {isPending ? 'Pending' : isConnected ? 'Connected' : 'Connect'}
                            </Button>
                          </div>
                        </div>
                        <CardTitle className="mt-3 text-xl">{profile.name}</CardTitle>
                        <CardDescription className="text-sm flex flex-col">
                          <span>{profile.role}</span>
                          {profile.company && (
                            <span className="text-gray-500 dark:text-gray-400">{profile.company}</span>
                          )}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {profile.bio && (
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{profile.bio}</p>
                        )}
                        
                        {profile.tags && profile.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {profile.tags.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="bg-connect-50 text-connect-600 dark:bg-connect-900 dark:text-connect-300">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                        
                        {profile.links && Object.keys(profile.links).length > 0 && (
                          <div className="mt-4">
                            <div className="text-sm font-medium mb-2">Connect on:</div>
                            <div className="flex flex-wrap gap-3">
                              {Object.entries(profile.links).map(([platform, handle]) => {
                                if (!handle) return null;
                                return (
                                  <a 
                                    key={platform} 
                                    href={getSocialUrl(platform, handle)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center text-sm bg-gray-100 dark:bg-gray-700 rounded-full py-1 px-3 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                  >
                                    <span className="font-semibold mr-1">{getSocialIcon(platform)}</span>
                                    <span>{platform === 'website' ? 'Website' : handle}</span>
                                  </a>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Search className="h-12 w-12 mx-auto text-gray-400" />
                <h3 className="mt-4 text-lg font-medium">No matches found</h3>
                <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                  {profiles.length === 0 
                    ? "No other users have registered yet. Check back soon!"
                    : "Try adjusting your search to find more people"
                  }
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="chats" className="space-y-4">
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <MessageSquare className="h-12 w-12 mx-auto text-gray-400" />
              <h3 className="mt-4 text-lg font-medium">Chat Feature Coming Soon</h3>
              <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                Real-time messaging will be available once you connect with other attendees.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default AttendeeNetworking;
