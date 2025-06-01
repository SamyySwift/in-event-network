
import React, { useState, useEffect } from 'react';
import { Star, Send, MessageSquare, TrendingUp } from 'lucide-react';
import AppLayout from '@/components/layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface Suggestion {
  id: string;
  content: string;
  type: 'suggestion' | 'rating';
  rating: number | null;
  status: 'new' | 'reviewed' | 'implemented';
  created_at: string;
}

const AttendeeRating = () => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [activeTab, setActiveTab] = useState('suggestion');
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      const { data, error } = await supabase
        .from('suggestions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Type cast the data to ensure proper types
      const processedData = (data || []).map(suggestion => ({
        ...suggestion,
        type: suggestion.type as 'suggestion' | 'rating',
        status: suggestion.status as 'new' | 'reviewed' | 'implemented'
      }));
      
      setSuggestions(processedData);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      toast({
        title: "Error",
        description: "Failed to load suggestions",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const submitSuggestion = async () => {
    if (!content.trim()) return;
    if (activeTab === 'rating' && rating === 0) {
      toast({
        title: "Error",
        description: "Please select a rating",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to submit suggestions",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('suggestions')
        .insert({
          content: content.trim(),
          user_id: user.id,
          type: activeTab as 'suggestion' | 'rating',
          rating: activeTab === 'rating' ? rating : null
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Your ${activeTab} has been submitted`
      });

      setContent('');
      setRating(0);
      fetchSuggestions();
    } catch (error) {
      console.error('Error submitting suggestion:', error);
      toast({
        title: "Error",
        description: `Failed to submit ${activeTab}`,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge variant="default">New</Badge>;
      case 'reviewed':
        return <Badge variant="secondary">Reviewed</Badge>;
      case 'implemented':
        return <Badge className="bg-green-100 text-green-800">Implemented</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const renderStars = (currentRating: number, isInteractive = false) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 cursor-pointer transition-colors ${
              star <= (isInteractive ? hoverRating || rating : currentRating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
            onClick={isInteractive ? () => setRating(star) : undefined}
            onMouseEnter={isInteractive ? () => setHoverRating(star) : undefined}
            onMouseLeave={isInteractive ? () => setHoverRating(0) : undefined}
          />
        ))}
      </div>
    );
  };

  const filteredSuggestions = suggestions.filter(s => s.type === activeTab);

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Suggestions & Ratings</h1>
            <p className="text-gray-600 dark:text-gray-400">Share your feedback and rate events</p>
          </div>

          {/* Submit Form */}
          <Card>
            <CardHeader>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="suggestion" className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Suggestion
                  </TabsTrigger>
                  <TabsTrigger value="rating" className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Rating
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="suggestion">
                  <CardTitle>Submit a Suggestion</CardTitle>
                  <CardDescription>
                    Help us improve by sharing your suggestions
                  </CardDescription>
                </TabsContent>

                <TabsContent value="rating">
                  <CardTitle>Rate an Event</CardTitle>
                  <CardDescription>
                    Share your experience and rate events you attended
                  </CardDescription>
                </TabsContent>
              </Tabs>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder={
                  activeTab === 'suggestion'
                    ? "What improvements would you like to see?"
                    : "How was your experience? Share your thoughts..."
                }
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                className="resize-none"
              />

              {activeTab === 'rating' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Your Rating</label>
                  <div className="flex items-center gap-2">
                    {renderStars(rating, true)}
                    <span className="text-sm text-muted-foreground ml-2">
                      {rating > 0 ? `${rating}/5 stars` : 'Click to rate'}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <Button 
                  onClick={submitSuggestion}
                  disabled={!content.trim() || isSubmitting || (activeTab === 'rating' && rating === 0)}
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Submitting...' : `Submit ${activeTab}`}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Suggestions/Ratings List */}
          <Card>
            <CardHeader>
              <CardTitle>
                {activeTab === 'suggestion' ? 'All Suggestions' : 'All Ratings'}
              </CardTitle>
              <CardDescription>
                See what others have {activeTab === 'suggestion' ? 'suggested' : 'rated'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-muted-foreground">Loading...</p>
                </div>
              ) : filteredSuggestions.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                  <h3 className="mt-4 text-lg font-medium">
                    No {activeTab}s yet
                  </h3>
                  <p className="text-muted-foreground">
                    Be the first to submit a {activeTab}!
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto">
                  {filteredSuggestions.map((item) => (
                    <Card key={item.id} className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          {item.type === 'rating' && item.rating && renderStars(item.rating)}
                          {getStatusBadge(item.status)}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(item.created_at), 'MMM d, yyyy')}
                        </span>
                      </div>
                      <p className="text-gray-900 dark:text-white">{item.content}</p>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default AttendeeRating;
