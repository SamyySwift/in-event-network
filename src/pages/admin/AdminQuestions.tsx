
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
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, XCircle, ArrowUpCircle, MessageSquare, Send } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  response: string | null;
  answered_at: string | null;
  answered_by: string | null;
  profiles: {
    name: string;
    photo_url: string | null;
  } | null;
}

const AdminQuestions = () => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [questions, setQuestions] = useState<QuestionWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [responses, setResponses] = useState<{[key: string]: string}>({});
  const [submittingResponse, setSubmittingResponse] = useState<{[key: string]: boolean}>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchQuestions();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('questions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'questions'
        },
        () => {
          console.log('Questions table changed, refetching...');
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
      console.log('Fetching questions...');
      
      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .order('created_at', { ascending: false });

      if (questionsError) {
        console.error('Questions error:', questionsError);
        throw questionsError;
      }

      console.log('Questions data:', questionsData);

      if (!questionsData || questionsData.length === 0) {
        setQuestions([]);
        setLoading(false);
        return;
      }

      const questionsWithProfiles = await Promise.all(
        questionsData.map(async (question) => {
          if (question.is_anonymous) {
            return {
              ...question,
              profiles: null
            };
          }

          try {
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('name, photo_url')
              .eq('id', question.user_id)
              .single();

            if (profileError) {
              console.warn('Profile error for user:', question.user_id, profileError);
              return {
                ...question,
                profiles: null
              };
            }

            return {
              ...question,
              profiles: profileData
            };
          } catch (error) {
            console.warn('Error fetching profile for user:', question.user_id, error);
            return {
              ...question,
              profiles: null
            };
          }
        })
      );

      console.log('Questions with profiles:', questionsWithProfiles);
      setQuestions(questionsWithProfiles);
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch questions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getFilteredQuestions = () => {
    switch(activeTab) {
      case 'answered':
        return questions.filter(q => q.is_answered);
      case 'unanswered':
        return questions.filter(q => !q.is_answered);
      case 'trending':
        return [...questions].sort((a, b) => b.upvotes - a.upvotes);
      default:
        return questions;
    }
  };

  const handleMarkAsAnswered = async (question: QuestionWithProfile) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('questions')
        .update({ 
          is_answered: true,
          answered_at: new Date().toISOString(),
          answered_by: user.user?.id
        })
        .eq('id', question.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Question marked as answered",
      });
    } catch (error) {
      console.error('Error updating question:', error);
      toast({
        title: "Error",
        description: "Failed to update question",
        variant: "destructive",
      });
    }
  };

  const handleDeleteQuestion = async (question: QuestionWithProfile) => {
    try {
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', question.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Question deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting question:', error);
      toast({
        title: "Error",
        description: "Failed to delete question",
        variant: "destructive",
      });
    }
  };

  const handleResponseChange = (questionId: string, value: string) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmitResponse = async (questionId: string) => {
    const responseText = responses[questionId];
    if (!responseText?.trim()) return;

    setSubmittingResponse(prev => ({ ...prev, [questionId]: true }));

    try {
      const { data: user } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('questions')
        .update({ 
          response: responseText.trim(),
          is_answered: true,
          answered_at: new Date().toISOString(),
          answered_by: user.user?.id,
          response_created_at: new Date().toISOString()
        })
        .eq('id', questionId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Response submitted successfully",
      });

      // Clear the response input
      setResponses(prev => ({
        ...prev,
        [questionId]: ''
      }));
    } catch (error) {
      console.error('Error submitting response:', error);
      toast({
        title: "Error",
        description: "Failed to submit response",
        variant: "destructive",
      });
    } finally {
      setSubmittingResponse(prev => ({ ...prev, [questionId]: false }));
    }
  };

  const filteredQuestions = getFilteredQuestions();

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading questions...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <AdminPageHeader
        title="Attendee Questions"
        description="Review, respond to, and moderate questions from attendees"
        tabs={[
          { id: 'all', label: 'All Questions' },
          { id: 'unanswered', label: 'Unanswered' },
          { id: 'answered', label: 'Answered' },
          { id: 'trending', label: 'Trending' }
        ]}
        defaultTab="all"
        onTabChange={setActiveTab}
      >
        {['all', 'unanswered', 'answered', 'trending'].map(tabId => (
          <TabsContent key={tabId} value={tabId} className="space-y-4">
            {filteredQuestions.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No questions found in this category.</p>
                  {activeTab === 'all' && (
                    <p className="text-sm mt-2">Questions submitted by attendees will appear here.</p>
                  )}
                </CardContent>
              </Card>
            ) : (
              filteredQuestions.map(question => {
                const userName = question.profiles?.name || 'Anonymous User';
                const userPhoto = question.profiles?.photo_url;
                
                return (
                  <Card key={question.id} className={question.is_answered ? 'border-green-100' : ''}>
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
                              {format(new Date(question.created_at), 'MMM d, yyyy h:mm a')}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge variant={question.is_answered ? 'outline' : 'default'}>
                          {question.is_answered ? 'Answered' : 'Pending'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-base mb-3">{question.content}</p>
                      
                      {question.response && (
                        <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-200 rounded-r">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary">Admin Response</Badge>
                            {question.answered_at && (
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(question.answered_at), 'MMM d, yyyy h:mm a')}
                              </span>
                            )}
                          </div>
                          <p className="text-sm">{question.response}</p>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2 text-sm mt-3">
                        <Badge variant="outline" className="flex items-center gap-1">
                          <ArrowUpCircle size={14} /> {question.upvotes} upvotes
                        </Badge>
                        {question.is_anonymous && (
                          <Badge variant="secondary">Anonymous</Badge>
                        )}
                      </div>

                      {!question.response && (
                        <div className="mt-4 space-y-3">
                          <div>
                            <label className="text-sm font-medium">Admin Response:</label>
                            <Textarea
                              placeholder="Type your response to this question..."
                              value={responses[question.id] || ''}
                              onChange={(e) => handleResponseChange(question.id, e.target.value)}
                              rows={3}
                              className="mt-1"
                            />
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleSubmitResponse(question.id)}
                            disabled={!responses[question.id]?.trim() || submittingResponse[question.id]}
                            className="w-full"
                          >
                            <Send size={16} className="mr-2" />
                            {submittingResponse[question.id] ? 'Submitting...' : 'Submit Response'}
                          </Button>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="border-t pt-3 flex justify-between">
                      <div className="text-sm text-muted-foreground">
                        Question ID: {question.id}
                      </div>
                      <div className="flex gap-2">
                        {!question.is_answered && question.response && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-green-600 border-green-200 hover:bg-green-50"
                            onClick={() => handleMarkAsAnswered(question)}
                          >
                            <CheckCircle size={16} className="mr-1" />
                            Mark Answered
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-destructive border-destructive/20 hover:bg-destructive/10"
                          onClick={() => handleDeleteQuestion(question)}
                        >
                          <XCircle size={16} className="mr-1" />
                          Remove
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

export default AdminQuestions;
