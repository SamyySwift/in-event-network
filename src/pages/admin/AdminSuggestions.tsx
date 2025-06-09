import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import EventSelector from '@/components/admin/EventSelector';
import { TabsContent } from '@/components/ui/tabs';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, CheckCircle, XCircle, Clock, Lightbulb, Building } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminEventContext, AdminEventProvider } from '@/hooks/useAdminEventContext';

interface Suggestion {
  id: string;
  content: string;
  type: 'suggestion' | 'rating';
  rating: number | null;
  status: 'new' | 'reviewed' | 'implemented';
  created_at: string;
  user_id: string;
  event_id: string | null;
}

interface Profile {
  id: string;
  name: string | null;
  photo_url: string | null;
}

interface SuggestionWithProfile extends Suggestion {
  profile: Profile | null;
  event_name?: string;
}

const AdminSuggestionsContent = () => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [suggestions, setSuggestions] = useState<SuggestionWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const { selectedEventId, selectedEvent } = useAdminEventContext();

  useEffect(() => {
    fetchSuggestions();
    
    // Set up real-time subscription for suggestions
    const channel = supabase
      .channel('admin-suggestions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'suggestions'
        },
        () => {
          console.log('Suggestions updated, refetching...');
          fetchSuggestions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser, selectedEventId]);

  const fetchSuggestions = async () => {
    if (!currentUser?.id) return;

    try {
      console.log('Fetching suggestions for admin:', currentUser.id, 'event:', selectedEventId);
      
      let suggestionsQuery;
      
      if (selectedEventId) {
        // Get suggestions for specific event
        suggestionsQuery = supabase
          .from('suggestions')
          .select('*')
          .eq('event_id', selectedEventId);
      } else {
        // Get all admin's events first
        const { data: adminEvents, error: eventsError } = await supabase
          .from('events')
          .select('id')
          .eq('host_id', currentUser.id);

        if (eventsError) {
          console.error('Error fetching admin events:', eventsError);
          throw eventsError;
        }

        if (!adminEvents || adminEvents.length === 0) {
          setSuggestions([]);
          setLoading(false);
          return;
        }

        const eventIds = adminEvents.map(event => event.id) as string[];

        // Get suggestions from all admin events
        suggestionsQuery = supabase
          .from('suggestions')
          .select('*')
          .in('event_id', eventIds);
      }

      const { data: suggestionsData, error: suggestionsError } = await suggestionsQuery
        .order('created_at', { ascending: false });

      if (suggestionsError) {
        console.error('Error fetching suggestions:', suggestionsError);
        throw suggestionsError;
      }
      
      console.log('Suggestions data:', suggestionsData);
      
      if (!suggestionsData || suggestionsData.length === 0) {
        setSuggestions([]);
        setLoading(false);
        return;
      }

      // Get unique user IDs and filter out null/undefined values
      const userIds = [...new Set(suggestionsData.map(s => s.user_id).filter(Boolean))] as string[];
      
      // Fetch profiles for these users
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, photo_url')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        // Continue without profiles rather than failing completely
      }

      console.log('Profiles data:', profilesData);

      // Get event names if showing all events
      let eventsData = null;
      if (!selectedEventId) {
        const eventIds = [...new Set(suggestionsData.map(s => s.event_id).filter(Boolean))] as string[];
        const { data, error } = await supabase
          .from('events')
          .select('id, name')
          .in('id', eventIds);
        
        if (!error) {
          eventsData = data;
        }
      }

      // Map profiles by ID for easy lookup
      const profilesMap = new Map();
      if (profilesData) {
        profilesData.forEach(profile => {
          profilesMap.set(profile.id, profile);
        });
      }

      const eventsMap = new Map();
      if (eventsData) {
        eventsData.forEach(event => {
          eventsMap.set(event.id, event);
        });
      }

      // Combine suggestions with profiles and event names
      const suggestionsWithProfiles: SuggestionWithProfile[] = suggestionsData.map(suggestion => ({
        ...suggestion,
        type: suggestion.type as 'suggestion' | 'rating',
        status: suggestion.status as 'new' | 'reviewed' | 'implemented',
        profile: suggestion.user_id ? profilesMap.get(suggestion.user_id) || null : null,
        event_name: suggestion.event_id ? eventsMap.get(suggestion.event_id)?.name || 'Unknown Event' : undefined
      }));
      
      setSuggestions(suggestionsWithProfiles);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch suggestions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getFilteredSuggestions = () => {
    switch(activeTab) {
      case 'suggestions':
        return suggestions.filter(s => s.type === 'suggestion');
      case 'ratings':
        return suggestions.filter(s => s.type === 'rating');
      case 'new':
        return suggestions.filter(s => s.status === 'new');
      case 'reviewed':
        return suggestions.filter(s => s.status === 'reviewed');
      default:
        return suggestions;
    }
  };

  const handleUpdateStatus = async (suggestion: SuggestionWithProfile, newStatus: 'new' | 'reviewed' | 'implemented') => {
    try {
      console.log('Updating suggestion status:', suggestion.id, 'to:', newStatus);
      
      const { error } = await supabase
        .from('suggestions')
        .update({ status: newStatus })
        .eq('id', suggestion.id);

      if (error) {
        console.error('Error updating suggestion status:', error);
        throw error;
      }

      toast({
        title: "Success",
        description: `Suggestion marked as ${newStatus}`,
      });

      fetchSuggestions();
    } catch (error) {
      console.error('Error updating suggestion:', error);
      toast({
        title: "Error",
        description: "Failed to update suggestion",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSuggestion = async (suggestion: SuggestionWithProfile) => {
    try {
      console.log('Deleting suggestion:', suggestion.id);
      
      const { error } = await supabase
        .from('suggestions')
        .delete()
        .eq('id', suggestion.id);

      if (error) {
        console.error('Error deleting suggestion:', error);
        throw error;
      }

      toast({
        title: "Success",
        description: "Suggestion deleted successfully",
      });

      fetchSuggestions();
    } catch (error) {
      console.error('Error deleting suggestion:', error);
      toast({
        title: "Error",
        description: "Failed to delete suggestion",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'new':
        return <Badge className="bg-blue-100 text-blue-800">New</Badge>;
      case 'reviewed':
        return <Badge className="bg-yellow-100 text-yellow-800">Reviewed</Badge>;
      case 'implemented':
        return <Badge className="bg-green-100 text-green-800">Implemented</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPageTitle = () => {
    if (selectedEvent) {
      return `Suggestions for ${selectedEvent.name}`;
    }
    return 'All Suggestions from Your Events';
  };

  const getPageDescription = () => {
    if (selectedEvent) {
      return `Review suggestions and ratings from ${selectedEvent.name} attendees`;
    }
    return 'Review suggestions and ratings from all your event attendees';
  };

  const filteredSuggestions = getFilteredSuggestions();

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading suggestions...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <EventSelector />
        
        {/* Context Information */}
        {!selectedEventId && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="py-4">
              <div className="flex items-center gap-2 text-blue-800">
                <Building className="h-5 w-5" />
                <span className="font-medium">
                  Showing suggestions from all your events. Select a specific event above to filter.
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        <AdminPageHeader
          title={getPageTitle()}
          description={getPageDescription()}
          tabs={[
            { id: 'all', label: 'All' },
            { id: 'suggestions', label: 'Suggestions' },
            { id: 'ratings', label: 'Ratings' },
            { id: 'new', label: 'New' },
            { id: 'reviewed', label: 'Reviewed' }
          ]}
          defaultTab="all"
          onTabChange={setActiveTab}
        >
          {['all', 'suggestions', 'ratings', 'new', 'reviewed'].map(tabId => (
            <TabsContent key={tabId} value={tabId} className="space-y-4">
              {filteredSuggestions.length === 0 ? (
                <Card>
                  <CardContent className="py-10 text-center text-muted-foreground">
                    <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No {tabId === 'all' ? 'suggestions' : tabId} found.</p>
                    {activeTab === 'all' && (
                      <p className="text-sm mt-2">Suggestions and feedback from attendees will appear here.</p>
                    )}
                  </CardContent>
                </Card>
              ) : (
                filteredSuggestions.map(suggestion => {
                  const userName = suggestion.profile?.name || 'Anonymous User';
                  const userPhoto = suggestion.profile?.photo_url;
                  
                  return (
                    <Card key={suggestion.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={userPhoto || ''} />
                              <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle className="text-base">{userName}</CardTitle>
                              <CardDescription>
                                {format(new Date(suggestion.created_at), 'MMM d, yyyy h:mm a')}
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            {getStatusBadge(suggestion.status)}
                            <Badge variant={suggestion.type === 'rating' ? 'default' : 'outline'}>
                              {suggestion.type === 'rating' ? 'Rating' : 'Suggestion'}
                            </Badge>
                            {/* Show event name when viewing all events */}
                            {!selectedEventId && suggestion.event_name && (
                              <Badge variant="secondary" className="flex items-center gap-1">
                                <Building size={12} />
                                {suggestion.event_name}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-base mb-3">{suggestion.content}</p>
                        {suggestion.type === 'rating' && suggestion.rating && (
                          <div className="flex items-center gap-1 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                size={16} 
                                className={i < suggestion.rating! ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} 
                              />
                            ))}
                            <span className="ml-2 text-sm text-muted-foreground">
                              {suggestion.rating}/5 stars
                            </span>
                          </div>
                        )}
                      </CardContent>
                      <CardFooter className="border-t pt-3 flex justify-between">
                        <div className="text-sm text-muted-foreground">
                          ID: {suggestion.id.slice(0, 8)}...
                        </div>
                        <div className="flex gap-2">
                          {suggestion.status === 'new' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="text-yellow-600 border-yellow-200 hover:bg-yellow-50"
                              onClick={() => handleUpdateStatus(suggestion, 'reviewed')}
                            >
                              <Clock size={16} className="mr-1" />
                              Mark Reviewed
                            </Button>
                          )}
                          {suggestion.status !== 'implemented' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="text-green-600 border-green-200 hover:bg-green-50"
                              onClick={() => handleUpdateStatus(suggestion, 'implemented')}
                            >
                              <CheckCircle size={16} className="mr-1" />
                              Mark Implemented
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-destructive border-destructive/20 hover:bg-destructive/10"
                            onClick={() => handleDeleteSuggestion(suggestion)}
                          >
                            <XCircle size={16} className="mr-1" />
                            Delete
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  );
                })
              )}
            </TabsContent>
          ))}
        </AdminPageHeader>
      </div>
    </AdminLayout>
  );
};

const AdminSuggestions = () => {
  return (
    <AdminEventProvider>
      <AdminSuggestionsContent />
    </AdminEventProvider>
  );
};

export default AdminSuggestions;
