import React, { useState } from 'react';
import { Send, MessageSquare, Star, Lightbulb, Loader } from 'lucide-react';
import AppLayout from '@/components/layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import EventAccessGuard from '@/components/EventAccessGuard';
import { useEventParticipation } from '@/hooks/useEventParticipation';

const AttendeeSuggestions = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const { getJoinedEvents, loading: participationLoading } = useEventParticipation();
  const [content, setContent] = useState('');
  const [type, setType] = useState('suggestion');
  const [rating, setRating] = useState<number | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Please enter your suggestion or feedback.",
        variant: "destructive",
      });
      return;
    }

    if (type === 'feedback' && !rating) {
      toast({
        title: "Error",
        description: "Please provide a rating for your feedback.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('suggestions')
        .insert({
          user_id: currentUser?.id,
          content,
          type,
          rating: type === 'feedback' ? rating : null,
        });

      if (error) throw error;

      toast({
        title: "Thank you!",
        description: `Your ${type} has been submitted successfully.`,
      });

      setContent('');
      setRating(undefined);
    } catch (error) {
      console.error('Error submitting suggestion:', error);
      toast({
        title: "Error",
        description: "Failed to submit. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasEventAccess = getJoinedEvents().length > 0;

  if (participationLoading) {
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
        <div className="max-w-3xl mx-auto py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Suggestions & Feedback
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Help us improve the event by sharing your thoughts and ideas.
            </p>
          </div>

          <Card className="bg-white dark:bg-gray-800 shadow-sm">
            <CardHeader>
              <CardTitle>Share your thoughts</CardTitle>
              <CardDescription>
                We appreciate your feedback and suggestions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Type
                  </Label>
                  <RadioGroup defaultValue="suggestion" className="flex mt-2 gap-4" onValueChange={(value) => setType(value)}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="suggestion" id="r1" className="peer relative h-5 w-5 rounded-full border-2 border-gray-300 dark:border-gray-700 text-connect-600 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-connect-500 dark:focus:ring-connect-400 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-connect-600 data-[state=checked]:text-white dark:data-[state=checked]:bg-connect-500" />
                      <Label htmlFor="r1" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-900 dark:text-gray-100">
                        Suggestion
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="feedback" id="r2" className="peer relative h-5 w-5 rounded-full border-2 border-gray-300 dark:border-gray-700 text-connect-600 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-connect-500 dark:focus:ring-connect-400 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-connect-600 data-[state=checked]:text-white dark:data-[state=checked]:bg-connect-500" />
                      <Label htmlFor="r2" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-900 dark:text-gray-100">
                        Feedback
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {type === 'feedback' && (
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Rating
                    </Label>
                    <div className="flex items-center mt-2">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <Button
                          key={value}
                          variant="outline"
                          className={`mr-2 ${rating === value ? 'bg-connect-100 text-connect-800 dark:bg-connect-900 dark:text-connect-300' : ''}`}
                          onClick={() => setRating(value)}
                        >
                          <Star className="h-4 w-4 mr-1" />
                          {value}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Content
                  </Label>
                  <div className="mt-1">
                    <Textarea
                      id="content"
                      rows={5}
                      className="shadow-sm focus:ring-connect-500 focus:border-connect-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder={`Enter your ${type} here...`}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-connect-600 hover:bg-connect-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        Submitting...
                        <Loader className="ml-2 h-4 w-4 animate-spin" />
                      </>
                    ) : (
                      <>
                        Submit {type === 'suggestion' ? 'Suggestion' : 'Feedback'}
                        <Send className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </EventAccessGuard>
    </AppLayout>
  );
};

export default AttendeeSuggestions;
