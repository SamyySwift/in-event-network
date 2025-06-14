import React, { useState, useEffect } from 'react';
import { Lightbulb, Star, Send, MessageSquare, TrendingUp, Clock, CheckCircle } from 'lucide-react';
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
import { useAttendeeEventContext } from '@/contexts/AttendeeEventContext';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

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

interface SuggestionStats {
  total: number;
  new: number;
  reviewed: number;
  implemented: number;
  averageRating: number;
}

const AttendeeSuggestions = () => {
  const { currentUser } = useAuth();
  const { currentEventId } = useAttendeeEventContext();
  const { toast } = useToast();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [stats, setStats] = useState<SuggestionStats>({
    total: 0,
    new: 0,
    reviewed: 0,
    implemented: 0,
    averageRating: 0
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newSuggestion, setNewSuggestion] = useState('');
  const [rating, setRating] = useState(0);
  const [ratingFeedback, setRatingFeedback] = useState('');

  useEffect(() => {
    if (currentUser) {
      fetchMySuggestions();
      fetchStats();
    }
  }, [currentUser]);

  const fetchMySuggestions = async () => {
    if (!currentUser) return;
    
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) return;

      console.log('Fetching suggestions for user:', user.data.user.id);

      const { data, error } = await supabase
        .from('suggestions')
        .select('*')
        .eq('user_id', user.data.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log('Fetched suggestions:', data);
      
      // Transform the data to match our interface
      const transformedData: Suggestion[] = (data || []).map(item => ({
        id: item.id,
        content: item.content,
        type: item.type as 'suggestion' | 'rating',
        rating: item.rating,
        status: item.status as 'new' | 'reviewed' | 'implemented',
        created_at: item.created_at,
        user_id: item.user_id,
        event_id: item.event_id
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

  const fetchStats = async () => {
    if (!currentUser) return;

    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) return;

      // Fetch all suggestions for stats
      const { data: allSuggestions, error } = await supabase
        .from('suggestions')
        .select('*')
        .eq('user_id', user.data.user.id);

      if (error) throw error;

      const total = allSuggestions?.length || 0;
      const newCount = allSuggestions?.filter(s => s.status === 'new').length || 0;
      const reviewed = allSuggestions?.filter(s => s.status === 'reviewed').length || 0;
      const implemented = allSuggestions?.filter(s => s.status === 'implemented').length || 0;
      
      const ratings = allSuggestions?.filter(s => s.type === 'rating' && s.rating) || [];
      const averageRating = ratings.length > 0 
        ? ratings.reduce((sum, s) => sum + (s.rating || 0), 0) / ratings.length 
        : 0;

      setStats({
        total,
        new: newCount,
        reviewed,
        implemented,
        averageRating: Math.round(averageRating * 10) / 10
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSubmitSuggestion = async () => {
    if (!currentUser || !newSuggestion.trim()) return;

    if (!currentEventId) {
      toast({
        title: "Error",
        description: "You must be part of an event to submit suggestions",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('User not authenticated');

      console.log('Submitting suggestion for event:', currentEventId);

      const { error } = await supabase
        .from('suggestions')
        .insert([{
          content: newSuggestion.trim(),
          type: 'suggestion',
          user_id: user.data.user.id,
          event_id: currentEventId,
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
      fetchStats();
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

    if (!currentEventId) {
      toast({
        title: "Error",
        description: "You must be part of an event to submit ratings",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('User not authenticated');

      console.log('Submitting rating for event:', currentEventId);

      const { error } = await supabase
        .from('suggestions')
        .insert([{
          content: ratingFeedback.trim() || `Rated the event ${rating} stars`,
          type: 'rating',
          user_id: user.data.user.id,
          event_id: currentEventId,
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
      fetchStats();
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
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="h-3 w-3 mr-1" />New</Badge>;
      case 'reviewed':
        return <Badge className="bg-yellow-100 text-yellow-800"><TrendingUp className="h-3 w-3 mr-1" />Under Review</Badge>;
      case 'implemented':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Implemented</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusProgress = () => {
    if (stats.total === 0) return 0;
    return ((stats.reviewed + stats.implemented) / stats.total) * 100;
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

  if (!currentEventId) {
    return (
      <AppLayout>
        <div className="animate-fade-in max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Join an Event First</h2>
            <p className="text-muted-foreground">
              You need to join an event before you can submit suggestions and ratings.
            </p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="animate-fade-in max-w-7xl mx-auto px-0 sm:px-6 lg:px-8 pb-8">
        {/* HERO Gradient Header */}
        <div className="mb-8 relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-6 sm:p-10 text-white z-10 shadow-xl">
          <div className="absolute inset-0 bg-black/25 z-0"></div>
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex flex-col items-center sm:items-start">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
                  <Lightbulb className="h-8 w-8 text-yellow-300" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold mb-2">Suggestions & Feedback</h1>
                <p className="text-lg opacity-95 max-w-2xl">
                  Share your ideas and rate your event experience!
                </p>
              </div>
              <div className="flex flex-col items-center sm:items-end space-y-1 mt-4 sm:mt-0">
                <div className="flex space-x-2">
                  <Badge variant="info" className="font-medium">
                    {stats.implemented} Implemented
                  </Badge>
                  <Badge variant="warning" className="font-medium">
                    {stats.new} New
                  </Badge>
                </div>
                <div>
                  <Badge variant="success" className="font-medium">{Math.round(getStatusProgress())}% Progress</Badge>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-12 -right-12 w-44 h-44 bg-white/10 rounded-full z-0"></div>
          <div className="absolute -top-12 -left-12 w-60 h-60 bg-white/5 rounded-full z-0"></div>
        </div>

        {/* Stats Overview */}
        <div className="relative mb-8 z-0 mt-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card className="p-3 sm:p-4 shadow-md hover:shadow-xl transition-all duration-200 rounded-2xl bg-white/90 backdrop-blur-sm border-0">
              <CardContent className="p-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Total</p>
                    <p className="text-lg sm:text-2xl font-bold">{stats.total}</p>
                  </div>
                  <MessageSquare className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="p-3 sm:p-4 shadow-md hover:shadow-xl transition-all duration-200 rounded-2xl bg-white/90 backdrop-blur-sm border-0">
              <CardContent className="p-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Progress</p>
                    <p className="text-lg sm:text-2xl font-bold">{Math.round(getStatusProgress())}%</p>
                  </div>
                  <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
                </div>
                <Progress value={getStatusProgress()} className="mt-2 h-1" />
              </CardContent>
            </Card>
            <Card className="p-3 sm:p-4 shadow-md hover:shadow-xl transition-all duration-200 rounded-2xl bg-white/90 backdrop-blur-sm border-0">
              <CardContent className="p-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Implemented</p>
                    <p className="text-lg sm:text-2xl font-bold">{stats.implemented}</p>
                  </div>
                  <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="p-3 sm:p-4 shadow-md hover:shadow-xl transition-all duration-200 rounded-2xl bg-white/90 backdrop-blur-sm border-0">
              <CardContent className="p-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Avg Rating</p>
                    <p className="text-lg sm:text-2xl font-bold">{stats.averageRating}</p>
                  </div>
                  <Star className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Carded Content */}
        <div className="w-full">
          <Tabs defaultValue="suggest" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6 bg-white/80 rounded-xl shadow-md">
              <TabsTrigger value="suggest" className="text-xs sm:text-sm">Make Suggestion</TabsTrigger>
              <TabsTrigger value="rate" className="text-xs sm:text-sm">Rate Event</TabsTrigger>
              <TabsTrigger value="history" className="text-xs sm:text-sm">History ({stats.total})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="suggest" className="space-y-4">
              <Card className="rounded-2xl shadow-lg bg-white/95 backdrop-blur-sm border-0">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <Lightbulb className="h-4 w-4 sm:h-5 sm:w-5 text-connect-600" />
                    Share Your Ideas
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Help us improve future events with your suggestions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="suggestion" className="text-sm">Your Suggestion</Label>
                    <Textarea
                      id="suggestion"
                      placeholder="What improvements or new features would you like to see?"
                      value={newSuggestion}
                      onChange={(e) => setNewSuggestion(e.target.value)}
                      rows={4}
                      className="mt-2"
                    />
                  </div>

                  <div className="space-y-2 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    <p className="text-xs sm:text-sm text-muted-foreground font-medium">Suggestion tips:</p>
                    <ul className="text-xs sm:text-sm text-muted-foreground space-y-1">
                      <li>• Be specific and actionable</li>
                      <li>• Explain the benefit of your suggestion</li>
                      <li>• Consider feasibility and impact</li>
                    </ul>
                  </div>

                  <Button 
                    onClick={handleSubmitSuggestion} 
                    disabled={!newSuggestion.trim() || submitting}
                    className="w-full sm:w-auto"
                    size="sm"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {submitting ? 'Submitting...' : 'Submit Suggestion'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rate" className="space-y-4">
              <Card className="rounded-2xl shadow-lg bg-white/95 backdrop-blur-sm border-0">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <Star className="h-4 w-4 sm:h-5 sm:w-5 text-connect-600" />
                    Rate This Event
                  </CardTitle>
                  <CardDescription className="text-sm">
                    How would you rate your overall experience?
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm">Your Rating</Label>
                    <div className="flex items-center gap-1 mt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRating(star)}
                          className="focus:outline-none transition-colors p-1"
                        >
                          <Star 
                            size={28} 
                            className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 hover:text-yellow-300'} 
                          />
                        </button>
                      ))}
                    </div>
                    {rating > 0 && (
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                        You rated: {rating}/5 stars
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="feedback" className="text-sm">Additional Feedback (Optional)</Label>
                    <Textarea
                      id="feedback"
                      placeholder="Tell us more about your experience..."
                      value={ratingFeedback}
                      onChange={(e) => setRatingFeedback(e.target.value)}
                      rows={3}
                      className="mt-2"
                    />
                  </div>

                  <Button 
                    onClick={handleSubmitRating} 
                    disabled={rating === 0 || submitting}
                    className="w-full sm:w-auto"
                    size="sm"
                  >
                    <Star className="h-4 w-4 mr-2" />
                    {submitting ? 'Submitting...' : 'Submit Rating'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              {suggestions.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {suggestions.map((suggestion) => (
                    <Card key={suggestion.id} className="hover:shadow-lg rounded-2xl transition-shadow border-0 bg-white/95 backdrop-blur">
                      <CardContent className="pt-4 sm:pt-6">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-3">
                          <div className="flex flex-wrap gap-2">
                            <Badge variant={suggestion.type === 'rating' ? 'default' : 'outline'} className="text-xs">
                              {suggestion.type === 'rating' ? (
                                <>
                                  <Star className="h-3 w-3 mr-1" />
                                  Rating
                                </>
                              ) : (
                                <>
                                  <Lightbulb className="h-3 w-3 mr-1" />
                                  Suggestion
                                </>
                              )}
                            </Badge>
                            {getStatusBadge(suggestion.status)}
                          </div>
                          <span className="text-xs sm:text-sm text-muted-foreground">
                            {new Date(suggestion.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm sm:text-base text-gray-800 dark:text-gray-200 mb-3 break-words">
                          {suggestion.content}
                        </p>
                        {suggestion.type === 'rating' && suggestion.rating && (
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                size={14} 
                                className={i < suggestion.rating! ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} 
                              />
                            ))}
                            <span className="ml-2 text-xs sm:text-sm text-muted-foreground">
                              {suggestion.rating}/5 stars
                            </span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-10 text-center text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm sm:text-base">You haven't submitted any suggestions or ratings yet.</p>
                    <p className="text-xs sm:text-sm mt-1">Use the tabs above to share your feedback!</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
};

export default AttendeeSuggestions;
