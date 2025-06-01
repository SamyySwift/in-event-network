
import React, { useState, useEffect } from 'react';
import { Plus, ArrowUp, MessageSquare, Send, User } from 'lucide-react';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Separator } from '@/components/ui/separator';
import FeedbackModal from '@/components/FeedbackModal';

interface QuestionWithProfile {
  id: string;
  content: string;
  created_at: string;
  upvotes: number;
  is_answered: boolean;
  user_id: string;
  session_id: string | null;
  event_id: string | null;
  is_anonymous: boolean;
  profiles: {
    name: string;
    photo_url: string | null;
  } | null;
}

const AttendeeQuestions = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [questions, setQuestions] = useState<QuestionWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [sessionTitle, setSessionTitle] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select(`
          id,
          content,
          created_at,
          upvotes,
          is_answered,
          user_id,
          session_id,
          event_id,
          is_anonymous,
          profiles!inner(name, photo_url)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch questions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitQuestion = async () => {
    if (!currentUser || !newQuestion.trim()) return;

    setSubmitting(true);
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('questions')
        .insert([{
          content: newQuestion.trim(),
          user_id: user.data.user.id,
          is_anonymous: isAnonymous,
          session_id: sessionTitle ? sessionTitle : null,
          event_id: null, // You might want to get this from context
          upvotes: 0,
          is_answered: false
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your question has been submitted!",
      });

      setNewQuestion('');
      setSessionTitle('');
      setIsAnonymous(false);
      fetchQuestions();
    } catch (error) {
      console.error('Error submitting question:', error);
      toast({
        title: "Error",
        description: "Failed to submit question",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpvote = async (questionId: string) => {
    if (!currentUser) return;

    try {
      // Get current upvotes
      const { data: question, error: fetchError } = await supabase
        .from('questions')
        .select('upvotes')
        .eq('id', questionId)
        .single();

      if (fetchError) throw fetchError;

      // Update upvotes
      const { error } = await supabase
        .from('questions')
        .update({ upvotes: question.upvotes + 1 })
        .eq('id', questionId);

      if (error) throw error;

      // Update local state
      setQuestions(prev => prev.map(q => 
        q.id === questionId ? { ...q, upvotes: q.upvotes + 1 } : q
      ));

      toast({
        title: "Success",
        description: "Question upvoted!",
      });
    } catch (error) {
      console.error('Error upvoting question:', error);
      toast({
        title: "Error",
        description: "Failed to upvote question",
        variant: "destructive",
      });
    }
  };

  const handleFeedback = (questionId: string) => {
    setSelectedQuestionId(questionId);
    setShowFeedbackModal(true);
  };

  const myQuestions = questions.filter(q => q.user_id === currentUser?.id);
  const otherQuestions = questions.filter(q => q.user_id !== currentUser?.id);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading questions...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="animate-fade-in max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Q&A Session</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Ask questions to speakers and interact with other attendees
          </p>
        </div>

        {/* Submit Question Form */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-connect-600" />
              Ask a Question
            </CardTitle>
            <CardDescription>
              Submit your question for speakers or the community
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="session">Session Title (Optional)</Label>
              <Input
                id="session"
                placeholder="e.g., Keynote: Future of Tech"
                value={sessionTitle}
                onChange={(e) => setSessionTitle(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="question">Your Question</Label>
              <Textarea
                id="question"
                placeholder="What would you like to ask?"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="anonymous"
                checked={isAnonymous}
                onCheckedChange={setIsAnonymous}
              />
              <Label htmlFor="anonymous">Submit anonymously</Label>
            </div>

            <Button 
              onClick={handleSubmitQuestion} 
              disabled={!newQuestion.trim() || submitting}
              className="w-full sm:w-auto"
            >
              <Send className="h-4 w-4 mr-2" />
              {submitting ? 'Submitting...' : 'Submit Question'}
            </Button>
          </CardContent>
        </Card>

        {/* My Questions */}
        {myQuestions.length > 0 && (
          <>
            <div className="mb-4">
              <h2 className="text-xl font-semibold">My Questions</h2>
            </div>
            <div className="space-y-4 mb-6">
              {myQuestions.map(question => {
                const userName = question.profiles?.name || 'Anonymous';
                const userPhoto = question.profiles?.photo_url;
                
                return (
                  <Card key={question.id} className={question.is_answered ? 'border-green-200 bg-green-50/50' : ''}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <Avatar className="flex-shrink-0">
                          {!question.is_anonymous && userPhoto ? (
                            <AvatarImage src={userPhoto} />
                          ) : (
                            <AvatarFallback>
                              {question.is_anonymous ? <User className="h-4 w-4" /> : userName.charAt(0)}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium text-sm">
                              {question.is_anonymous ? 'Anonymous' : userName}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(question.created_at).toLocaleDateString()}
                            </span>
                            {question.is_answered && (
                              <Badge className="bg-green-100 text-green-800">
                                Answered
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-gray-800 dark:text-gray-200 mb-3">
                            {question.content}
                          </p>
                          
                          <div className="flex items-center gap-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUpvote(question.id)}
                              className="text-gray-600 hover:text-connect-600"
                            >
                              <ArrowUp className="h-4 w-4 mr-1" />
                              {question.upvotes}
                            </Button>
                            
                            {question.is_answered && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleFeedback(question.id)}
                              >
                                Rate Answer
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            <Separator className="my-6" />
          </>
        )}

        {/* All Questions */}
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Community Questions</h2>
        </div>
        
        <div className="space-y-4">
          {otherQuestions.length > 0 ? (
            otherQuestions.map(question => {
              const userName = question.profiles?.name || 'Anonymous';
              const userPhoto = question.profiles?.photo_url;
              
              return (
                <Card key={question.id} className={question.is_answered ? 'border-green-200 bg-green-50/50' : ''}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="flex-shrink-0">
                        {!question.is_anonymous && userPhoto ? (
                          <AvatarImage src={userPhoto} />
                        ) : (
                          <AvatarFallback>
                            {question.is_anonymous ? <User className="h-4 w-4" /> : userName.charAt(0)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-sm">
                            {question.is_anonymous ? 'Anonymous' : userName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(question.created_at).toLocaleDateString()}
                          </span>
                          {question.is_answered && (
                            <Badge className="bg-green-100 text-green-800">
                              Answered
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-gray-800 dark:text-gray-200 mb-3">
                          {question.content}
                        </p>
                        
                        <div className="flex items-center gap-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUpvote(question.id)}
                            className="text-gray-600 hover:text-connect-600"
                          >
                            <ArrowUp className="h-4 w-4 mr-1" />
                            {question.upvotes}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No questions from other attendees yet.</p>
                <p className="text-sm">Be the first to ask a question!</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && selectedQuestionId && (
        <FeedbackModal
          questionId={selectedQuestionId}
          isOpen={showFeedbackModal}
          onClose={() => {
            setShowFeedbackModal(false);
            setSelectedQuestionId(null);
          }}
        />
      )}
    </AppLayout>
  );
};

export default AttendeeQuestions;
