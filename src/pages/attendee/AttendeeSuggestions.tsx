
import React, { useState, useEffect } from 'react';
import { Lightbulb, Star, Send, MessageSquare } from 'lucide-react';
import AppLayout from '@/components/layouts/AppLayout';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Suggestion {
  id: string;
  content: string;
  type: 'suggestion' | 'rating';
  rating: number | null;
  status: 'new' | 'reviewed' | 'implemented';
  created_at: string;
  user_id: string;
}

const AttendeeSuggestions = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newSuggestion, setNewSuggestion] = useState('');
  const [rating, setRating] = useState(0);
  const [ratingFeedback, setRatingFeedback] = useState('');

  useEffect(() => {
    if (currentUser) {
      fetchMySuggestions();
    }
  }, [currentUser]);

  const fetchMySuggestions = async () => {
    if (!currentUser) return;
    
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) return;

      const { data, error } = await supabase
        .from('suggestions')
        .select('*')
        .eq('user_id', user.data.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedData: Suggestion[] = (data || []).map(item => ({
        id: item.id,
        content: item.content,
        type: item.type as 'suggestion' | 'rating',
        rating: item.rating,
        status: item.status as 'new' | 'reviewed' | 'implemented',
        created_at: item.created_at,
        user_id: item.user_id
      }));
      
      setSuggestions(transformedData);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch your suggestions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitSuggestion = async () => {
    if (!currentUser || !newSuggestion.trim()) return;

    setSubmitting(true);
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('suggestions')
        .insert([{
          content: newSuggestion.trim(),
          type: 'suggestion',
          user_id: user.data.user.id,
          status: 'new',
          rating: null
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your suggestion has been submitted!",
      });

      setNewSuggestion('');
      fetchMySuggestions();
    } catch (error) {
      console.error('Error submitting suggestion:', error);
      toast({
        title: "Error",
        description: "Failed to submit suggestion",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitRating = async () => {
    if (!currentUser || rating === 0) return;

    setSubmitting(true);
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('suggestions')
        .insert([{
          content: ratingFeedback.trim() || `Rated the event ${rating} stars`,
          type: 'rating',
          user_id: user.data.user.id,
          status: 'new',
          rating: rating
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your rating has been submitted!",
      });

      setRating(0);
      setRatingFeedback('');
      fetchMySuggestions();
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast({
        title: "Error",
        description: "Failed to submit rating",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'new':
        return <Badge className="bg-blue-100 text-blue-800">New</Badge>;
      case 'reviewed':
        return <Badge className="bg-yellow-100 text-yellow-800">Under Review</Badge>;
      case 'implemented':
        return <Badge className="bg-green-100 text-green-800">Implemented</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="animate-fade-in max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Suggestions & Feedback</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Share your ideas and rate your event experience
          </p>
        </div>

        <Tabs defaultValue="suggest" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="suggest">Make Suggestion</TabsTrigger>
            <TabsTrigger value="rate">Rate Event</TabsTrigger>
            <TabsTrigger value="history">My Submissions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="suggest" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-connect-600" />
                  Share Your Ideas
                </CardTitle>
                <CardDescription>
                  Help us improve future events with your suggestions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="suggestion">Your Suggestion</Label>
                  <Textarea
                    id="suggestion"
                    placeholder="What improvements or new features would you like to see?"
                    value={newSuggestion}
                    onChange={(e) => setNewSuggestion(e.target.value)}
                    rows={4}
                  />
                </div>

                <Button 
                  onClick={handleSubmitSuggestion} 
                  disabled={!newSuggestion.trim() || submitting}
                  className="w-full sm:w-auto"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {submitting ? 'Submitting...' : 'Submit Suggestion'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rate" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-connect-600" />
                  Rate This Event
                </CardTitle>
                <CardDescription>
                  How would you rate your overall experience?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Your Rating</Label>
                  <div className="flex items-center gap-1 mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className="focus:outline-none"
                      >
                        <Star 
                          size={32} 
                          className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 hover:text-yellow-300'} 
                        />
                      </button>
                    ))}
                  </div>
                  {rating > 0 && (
                    <p className="text-sm text-muted-foreground mt-1">
                      You rated: {rating}/5 stars
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="feedback">Additional Feedback (Optional)</Label>
                  <Textarea
                    id="feedback"
                    placeholder="Tell us more about your experience..."
                    value={ratingFeedback}
                    onChange={(e) => setRatingFeedback(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button 
                  onClick={handleSubmitRating} 
                  disabled={rating === 0 || submitting}
                  className="w-full sm:w-auto"
                >
                  <Star className="h-4 w-4 mr-2" />
                  {submitting ? 'Submitting...' : 'Submit Rating'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {suggestions.length > 0 ? (
              suggestions.map((suggestion) => (
                <Card key={suggestion.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex gap-2">
                        <Badge variant={suggestion.type === 'rating' ? 'default' : 'outline'}>
                          {suggestion.type === 'rating' ? 'Rating' : 'Suggestion'}
                        </Badge>
                        {getStatusBadge(suggestion.status)}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(suggestion.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <p className="text-gray-800 dark:text-gray-200 mb-3">
                      {suggestion.content}
                    </p>
                    
                    {suggestion.type === 'rating' && suggestion.rating && (
                      <div className="flex items-center gap-1">
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
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="py-10 text-center text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>You haven't submitted any suggestions or ratings yet.</p>
                  <p className="text-sm">Use the tabs above to share your feedback!</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default AttendeeSuggestions;
