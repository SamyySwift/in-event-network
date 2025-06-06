import React, { useState, useMemo } from 'react';
import { Search, Filter, UserPlus, MessageSquare, Loader } from 'lucide-react';
import AppLayout from '@/components/layouts/AppLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useNetworking } from '@/hooks/useNetworking';
import { NetworkingFilter } from '@/components/networking/NetworkingFilter';
import EventAccessGuard from '@/components/EventAccessGuard';
import { useEventParticipation } from '@/hooks/useEventParticipation';

const AttendeeSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNiches, setSelectedNiches] = useState<string[]>([]);
  const [selectedNetworkingPrefs, setSelectedNetworkingPrefs] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const { profiles, loading, sendConnectionRequest, getConnectionStatus } = useNetworking();
  const { getJoinedEvents, loading: participationLoading } = useEventParticipation();

  // Get unique filter options from all profiles
  const { availableNiches, availableNetworkingPrefs, availableTags } = useMemo(() => {
    const niches = new Set<string>();
    const networkingPrefs = new Set<string>();
    const tags = new Set<string>();

    profiles.forEach(profile => {
      if (profile.niche) niches.add(profile.niche);
      if (profile.networking_preferences) {
        profile.networking_preferences.forEach(pref => networkingPrefs.add(pref));
      }
      if (profile.tags) {
        profile.tags.forEach(tag => tags.add(tag));
      }
    });

    return {
      availableNiches: Array.from(niches).sort(),
      availableNetworkingPrefs: Array.from(networkingPrefs).sort(),
      availableTags: Array.from(tags).sort(),
    };
  }, [profiles]);

  // Filter profiles based on search term and selected filters
  const filteredProfiles = useMemo(() => {
    return profiles.filter(profile => {
      // Text search
      const matchesSearch = !searchTerm || (
        profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.bio.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.niche.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (profile.tags && profile.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))) ||
        (profile.networking_preferences && profile.networking_preferences.some(pref => pref.toLowerCase().includes(searchTerm.toLowerCase())))
      );

      // Niche filter
      const matchesNiche = selectedNiches.length === 0 || (
        profile.niche && selectedNiches.includes(profile.niche)
      );

      // Networking preferences filter
      const matchesNetworkingPref = selectedNetworkingPrefs.length === 0 || (
        profile.networking_preferences && 
        profile.networking_preferences.some(pref => selectedNetworkingPrefs.includes(pref))
      );

      // Tags filter
      const matchesTags = selectedTags.length === 0 || (
        profile.tags && 
        profile.tags.some(tag => selectedTags.includes(tag))
      );

      return matchesSearch && matchesNiche && matchesNetworkingPref && matchesTags;
    });
  }, [profiles, searchTerm, selectedNiches, selectedNetworkingPrefs, selectedTags]);

  const handleClearFilters = () => {
    setSelectedNiches([]);
    setSelectedNetworkingPrefs([]);
    setSelectedTags([]);
    setSearchTerm('');
  };

  // Function to handle connection request
  const handleConnect = (profileId: string) => {
    sendConnectionRequest(profileId);
  };

  // Function to handle message sending - now opens direct message
  const handleMessage = (profileId: string, profileName: string, profilePhoto?: string) => {
    // setSelectedConversation({
    //   userId: profileId,
    //   userName: profileName,
    //   userPhoto: profilePhoto
    // });
    // setActiveTab('messages');
  };

  const hasEventAccess = getJoinedEvents().length > 0;

  if (loading || participationLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <Loader className="h-8 w-8 animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <EventAccessGuard hasAccess={hasEventAccess} loading={participationLoading}>
        <div className="animate-fade-in max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Find People</h1>
              <p className="text-gray-600 dark:text-gray-400">Search for other attendees at the event</p>
            </div>
          </div>

          <NetworkingFilter
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedNiches={selectedNiches}
            onNicheChange={setSelectedNiches}
            selectedNetworkingPrefs={selectedNetworkingPrefs}
            onNetworkingPrefChange={setSelectedNetworkingPrefs}
            selectedTags={selectedTags}
            onTagChange={setSelectedTags}
            availableNiches={availableNiches}
            availableNetworkingPrefs={availableNetworkingPrefs}
            availableTags={availableTags}
            onClearFilters={handleClearFilters}
          />
          
          {filteredProfiles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredProfiles.map((profile) => {
                const connectionStatus = getConnectionStatus(profile.id);
                const isConnected = connectionStatus?.status === 'accepted';
                const isPending = connectionStatus?.status === 'pending';
                
                return (
                  <Card key={profile.id} className="hover-lift bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between">
                        <Avatar className="h-12 w-12">
                          {profile.photo_url ? (
                            <AvatarImage src={profile.photo_url} alt={profile.name} />
                          ) : (
                            <AvatarFallback className="bg-connect-100 text-connect-600 dark:bg-connect-900 dark:text-connect-300">
                              {profile.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleMessage(profile.id, profile.name, profile.photo_url)}
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
                      <CardTitle className="mt-3 text-xl text-gray-900 dark:text-white">{profile.name}</CardTitle>
                      <CardDescription className="text-sm flex flex-col">
                        <span className="text-gray-700 dark:text-gray-300">{profile.role}</span>
                        {profile.company && (
                          <span className="text-gray-500 dark:text-gray-400">{profile.company}</span>
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {profile.bio && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{profile.bio}</p>
                      )}

                      {/* Professional Niche */}
                      {profile.niche && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Professional Niche</h4>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-700">
                            {profile.niche}
                          </Badge>
                        </div>
                      )}

                      {/* Networking Preferences */}
                      {profile.networking_preferences && profile.networking_preferences.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Looking to connect with</h4>
                          <div className="flex flex-wrap gap-1">
                            {profile.networking_preferences.map((pref, index) => (
                              <Badge key={index} variant="secondary" className="bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                                {pref}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Custom Tags */}
                      {profile.tags && profile.tags.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Skills & Interests</h4>
                          <div className="flex flex-wrap gap-2">
                            {profile.tags.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="bg-connect-50 text-connect-600 dark:bg-connect-900/30 dark:text-connect-300">
                                {tag}
                              </Badge>
                            ))}
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
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No matches found</h3>
              <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                Try adjusting your search or filters to find more people
              </p>
              {(selectedNiches.length > 0 || selectedNetworkingPrefs.length > 0 || selectedTags.length > 0) && (
                <Button 
                  variant="outline" 
                  onClick={handleClearFilters}
                  className="mt-4"
                >
                  Clear All Filters
                </Button>
              )}
            </div>
          )}
        </div>
      </EventAccessGuard>
    </AppLayout>
  );
};

export default AttendeeSearch;
