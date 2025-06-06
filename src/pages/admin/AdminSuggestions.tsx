import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
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
import { Star, CheckCircle, XCircle, Clock, Lightbulb } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SuggestionWithProfile {
  id: string;
  content: string;
  type: 'suggestion' | 'rating';
  rating: number | null;
  status: 'new' | 'reviewed' | 'implemented';
  created_at: string;
  user_id: string;
  event_id: string | null;
  profiles: {
    name: string;
    photo_url: string | null;
  } | null;
}

const AdminSuggestions = () => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [suggestions, setSuggestions] = useState<SuggestionWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSuggestions();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('suggestions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'suggestions'
        },
        (payload) => {
          console.log('Real-time suggestion update:', payload);
          fetchSuggestions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchSuggestions = async () => {
    try {
      const { data, error } = await supabase
        .from('suggestions')
        .select(`
          id,
          content,
          type,
          rating,
          status,
          created_at,
          user_id,
          event_id,
          profiles(name, photo_url)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedData: SuggestionWithProfile[] = (data || []).map(item => ({
        ...item,
        type: item.type as 'suggestion' | 'rating',
        status: item.status as 'new' | 'reviewed' | 'implemented',
        profiles: Array.isArray(item.profiles) && item.profiles.length > 0 
          ? item.profiles[0] 
          : null
      }));
      
      setSuggestions(transformedData);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch suggestions",
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
      const { error } = await supabase
        .from('suggestions')
        .update({ status: newStatus })
        .eq('id', suggestion.id);

      if (error) throw error;

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
      const { error } = await supabase
        .from('suggestions')
        .delete()
        .eq('id', suggestion.id);

      if (error) throw error;

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
      <AdminPageHeader
        title="Suggestions & Feedback"
        description={`Review suggestions and ratings from attendees (${suggestions.length} total)`}
        tabs={[
          { id: 'all', label: `All (${suggestions.length})` },
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
                </CardContent>
              </Card>
            ) : (
              filteredSuggestions.map(suggestion => {
                const userName = suggestion.profiles?.name || 'Anonymous User';
                const userPhoto = suggestion.profiles?.photo_url;
                
                return (
                  <Card key={suggestion.id}>
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
                        <div className="flex gap-2">
                          {getStatusBadge(suggestion.status)}
                          <Badge variant={suggestion.type === 'rating' ? 'default' : 'outline'}>
                            {suggestion.type === 'rating' ? 'Rating' : 'Suggestion'}
                          </Badge>
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
                        ID: {suggestion.id}
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
    </AdminLayout>
  );
};

export default AdminSuggestions;
