import React, { useState, useEffect } from 'react';
import { MessageSquare, ThumbsUp, Send, User, UserX, Clock, CheckCircle } from 'lucide-react';
import AppLayout from '@/components/layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import FeedbackModal from '@/components/FeedbackModal';

interface Question {
  id: string;
  content: string;
  user_id: string | null;
  is_anonymous: boolean;
  is_answered: boolean;
  answered_at: string | null;
  upvotes: number;
  created_at: string;
  profiles?: {
    name: string;
    photo_url: string;
  } | null;
}

const AttendeeQuestions = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [feedbackModal, setFeedbackModal] = useState<{
    isOpen: boolean;
    questionId: string;
    questionContent: string;
  }>({
    isOpen: false,
    questionId: '',
    questionContent: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchQuestions();
    
    // Listen for real-time notifications
    const channel = supabase
      .channel('question-notifications')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'questions',
          filter: 'is_answered=eq.true'
        },
        (payload) => {
          const updatedQuestion = payload.new as Question;
          if (updatedQuestion.user_id) {
            // Show feedback modal for answered question
            const { data: { user } } = supabase.auth.getUser();
            user.then((userData) => {
              if (userData.user?.id === updatedQuestion.user_id) {
                setFeedbackModal({
                  isOpen: true,
                  questionId: updatedQuestion.id,
                  questionContent: updatedQuestion.content
                });
              }
            });
          }
          fetchQuestions(); // Refresh the list
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select(`
          *,
          profiles:user_id (name, photo_url)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Handle the case where profiles might be null or an error
      const processedData = (data || []).map(question => ({
        ...question,
        profiles: question.profiles && typeof question.profiles === 'object' && 'name' in question.profiles 
          ? question.profiles as { name: string; photo_url: string }
          : null
      }));
      
      setQuestions(processedData);
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast({
        title: "Error",
        description: "Failed to load questions",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const submitQuestion = async () => {
    if (!newQuestion.trim()) return;

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to ask questions",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('questions')
        .insert({
          content: newQuestion.trim(),
          user_id: user.id,
          is_anonymous: isAnonymous,
          upvotes: 0
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your question has been submitted"
      });

      setNewQuestion('');
      fetchQuestions();
    } catch (error) {
      console.error('Error submitting question:', error);
      toast({
        title: "Error",
        description: "Failed to submit question",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpvote = async (questionId: string) => {
    try {
      const question = questions.find(q => q.id === questionId);
      if (!question) return;

      const { error } = await supabase
        .from('questions')
        .update({ upvotes: question.upvotes + 1 })
        .eq('id', questionId);

      if (error) throw error;

      setQuestions(questions.map(q => 
        q.id === questionId ? { ...q, upvotes: q.upvotes + 1 } : q
      ));
    } catch (error) {
      console.error('Error upvoting question:', error);
      toast({
        title: "Error",
        description: "Failed to upvote question",
        variant: "destructive"
      });
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Q&A</h1>
            <p className="text-gray-600 dark:text-gray-400">Ask questions and engage with speakers</p>
          </div>

          {/* Submit Question Form */}
          <Card>
            <CardHeader>
              <CardTitle>Ask a Question</CardTitle>
              <CardDescription>
                Submit your questions for speakers to answer during sessions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="What would you like to ask?"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                rows={3}
                className="resize-none"
              />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="anonymous"
                    checked={isAnonymous}
                    onCheckedChange={setIsAnonymous}
                  />
                  <Label htmlFor="anonymous" className="flex items-center gap-2">
                    {isAnonymous ? <UserX className="h-4 w-4" /> : <User className="h-4 w-4" />}
                    Ask anonymously
                  </Label>
                </div>
                
                <Button 
                  onClick={submitQuestion}
                  disabled={!newQuestion.trim() || isSubmitting}
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Submitting...' : 'Submit Question'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Questions List */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">All Questions</h2>
            
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Loading questions...</p>
              </div>
            ) : questions.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center">
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                  <h3 className="mt-4 text-lg font-medium">No questions yet</h3>
                  <p className="text-muted-foreground">Be the first to ask a question!</p>
                </CardContent>
              </Card>
            ) : (
              questions.map((question) => (
                <Card key={question.id} className={question.is_answered ? 'border-green-200' : ''}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        {question.is_anonymous ? (
                          <Avatar>
                            <AvatarFallback>
                              <UserX className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <Avatar>
                            <AvatarImage src={question.profiles?.photo_url || ''} />
                            <AvatarFallback>
                              {question.profiles?.name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div>
                          <p className="font-medium">
                            {question.is_anonymous ? 'Anonymous' : question.profiles?.name || 'Unknown User'}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {format(new Date(question.created_at), 'MMM d, yyyy h:mm a')}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {question.is_answered && (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Answered
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-gray-900 dark:text-white mb-4">{question.content}</p>
                    
                    <div className="flex items-center justify-between">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUpvote(question.id)}
                        className="flex items-center gap-1"
                      >
                        <ThumbsUp className="h-4 w-4" />
                        {question.upvotes}
                      </Button>
                      
                      {question.is_answered && question.answered_at && (
                        <p className="text-sm text-muted-foreground">
                          Answered on {format(new Date(question.answered_at), 'MMM d, yyyy')}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      <FeedbackModal
        isOpen={feedbackModal.isOpen}
        onClose={() => setFeedbackModal({ isOpen: false, questionId: '', questionContent: '' })}
        questionId={feedbackModal.questionId}
        questionContent={feedbackModal.questionContent}
      />
    </AppLayout>
  );
};

export default AttendeeQuestions;
