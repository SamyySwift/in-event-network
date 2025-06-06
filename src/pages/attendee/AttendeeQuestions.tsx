
import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, Send, ArrowUpCircle, CheckCircle, MessageCircleReply } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface Question {
  id: string;
  content: string;
  created_at: string;
  upvotes: number;
  is_answered: boolean;
  user_id: string;
  is_anonymous: boolean;
  response: string | null;
  response_created_at: string | null;
}

const AttendeeQuestions = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchQuestions();
    
    // Set up real-time subscription for questions
    const channel = supabase
      .channel('questions-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'questions'
        },
        (payload) => {
          console.log('Real-time question update:', payload);
          fetchQuestions();
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
        .select('*')
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
    if (!newQuestion.trim() || !user) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('questions')
        .insert({
          content: newQuestion,
          user_id: user.id,
          is_anonymous: isAnonymous,
          upvotes: 0,
          is_answered: false
        });

      if (error) throw error;

      setNewQuestion('');
      setIsAnonymous(false);
      toast({
        title: "Success",
        description: "Your question has been submitted!",
      });
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
    try {
      const question = questions.find(q => q.id === questionId);
      if (!question) return;

      const { error } = await supabase
        .from('questions')
        .update({ upvotes: question.upvotes + 1 })
        .eq('id', questionId);

      if (error) throw error;

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
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Questions & Answers</h1>
          <p className="text-muted-foreground mt-2">
            Ask questions to speakers or event organizers and view responses.
          </p>
        </div>

        {/* Submit Question Form */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Ask a Question
            </CardTitle>
            <CardDescription>
              Your question will be reviewed and answered by the organizers or speakers.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Type your question here..."
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              rows={3}
              className="resize-none"
            />
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="anonymous"
                  checked={isAnonymous}
                  onCheckedChange={setIsAnonymous}
                />
                <Label htmlFor="anonymous" className="text-sm">Submit anonymously</Label>
              </div>
              <Button 
                onClick={handleSubmitQuestion}
                disabled={!newQuestion.trim() || submitting}
                className="w-full sm:w-auto"
              >
                <Send className="h-4 w-4 mr-2" />
                {submitting ? 'Submitting...' : 'Submit Question'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Questions List */}
        <div className="space-y-4">
          {questions.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No questions submitted yet.</p>
                <p className="text-sm mt-2">Be the first to ask a question!</p>
              </CardContent>
            </Card>
          ) : (
            questions.map(question => (
              <Card key={question.id} className={`${question.is_answered ? 'border-green-200 bg-green-50/30' : ''} transition-colors`}>
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {question.is_anonymous ? 'A' : 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base">
                          {question.is_anonymous ? 'Anonymous' : 'User'}
                        </CardTitle>
                        <CardDescription>
                          {format(new Date(question.created_at), 'MMM d, yyyy h:mm a')}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={question.is_answered ? 'default' : 'outline'}>
                        {question.is_answered ? 'Answered' : 'Pending'}
                      </Badge>
                      {question.is_anonymous && (
                        <Badge variant="secondary">Anonymous</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-base leading-relaxed">{question.content}</p>
                  
                  {/* Admin Response */}
                  {question.response && (
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageCircleReply size={16} className="text-green-600" />
                        <span className="text-sm font-medium text-green-800">Official Response</span>
                        {question.response_created_at && (
                          <span className="text-xs text-green-600">
                            {format(new Date(question.response_created_at), 'MMM d, yyyy h:mm a')}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-green-800 leading-relaxed">{question.response}</p>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleUpvote(question.id)}
                        className="flex items-center gap-1"
                      >
                        <ArrowUpCircle size={16} />
                        <span>{question.upvotes}</span>
                      </Button>
                      {question.is_answered && (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle size={16} />
                          <span className="text-sm">Answered</span>
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ID: {question.id.slice(0, 8)}...
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default AttendeeQuestions;
