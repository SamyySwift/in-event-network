
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
import { CheckCircle, XCircle, ArrowUpCircle, MessageSquare, Send, Reply } from 'lucide-react';
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
  response_created_at: string | null;
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
    
    // Set up real-time subscription for questions table changes
    const channel = supabase
      .channel('admin-questions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'questions'
        },
        (payload) => {
          console.log('Questions table changed:', payload);
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
      console.log('Fetching questions with complete data...');
      
      const { data: questionsData, error: questionsError } = await supabase
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
          response,
          answered_at,
          answered_by,
          response_created_at
        `)
        .order('created_at', { ascending: false });

      if (questionsError) {
        console.error('Questions error:', questionsError);
        throw questionsError;
      }

      if (!questionsData || questionsData.length === 0) {
        setQuestions([]);
        setLoading(false);
        return;
      }

      // Fetch profiles for non-anonymous questions
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

      console.log('Questions with profiles loaded:', questionsWithProfiles);
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
      const now = new Date().toISOString();
      
      console.log('Submitting response for question:', questionId);
      
      const { error } = await supabase
        .from('questions')
        .update({ 
          response: responseText.trim(),
          is_answered: true,
          answered_at: now,
          answered_by: user.user?.id,
          response_created_at: now
        })
        .eq('id', questionId);

      if (error) {
        console.error('Error submitting response:', error);
        throw error;
      }

      console.log('Response submitted successfully');

      toast({
        title: "Success",
        description: "Response submitted successfully",
      });

      // Clear the response input
      setResponses(prev => ({
        ...prev,
        [questionId]: ''
      }));

      // Refresh questions to show the update
      await fetchQuestions();
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

      await fetchQuestions();
    } catch (error) {
      console.error('Error deleting question:', error);
      toast({
        title: "Error",
        description: "Failed to delete question",
        variant: "destructive",
      });
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
          <TabsContent key={tabId} value={tabId} className="space-y-6">
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
                  <Card key={question.id} className="shadow-lg border-l-4 border-l-primary/20">
                    <CardHeader className="bg-gray-50/50 dark:bg-gray-800/50">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={userPhoto || ''} />
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                              {userName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg font-semibold">{userName}</CardTitle>
                            <CardDescription className="flex items-center gap-2">
                              {format(new Date(question.created_at), 'MMM d, yyyy h:mm a')}
                              <Badge variant="outline" className="ml-2">
                                <ArrowUpCircle className="h-3 w-3 mr-1" />
                                {question.upvotes}
                              </Badge>
                            </CardDescription>
                          </div>
                        </div>
                        <Badge variant={question.is_answered ? 'default' : 'secondary'} className="text-xs">
                          {question.is_answered ? '✓ Answered' : '⏳ Pending'}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-4">
                      <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border mb-4">
                        <p className="text-base leading-relaxed">{question.content}</p>
                      </div>
                      
                      {question.response && (
                        <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700 rounded-lg">
                          <div className="flex items-center gap-2 mb-3">
                            <Reply className="h-4 w-4 text-green-600" />
                            <Badge variant="default" className="text-xs font-medium bg-green-600">
                              Admin Response
                            </Badge>
                            {question.response_created_at && (
                              <span className="text-xs text-green-600 dark:text-green-400">
                                {format(new Date(question.response_created_at), 'MMM d, yyyy h:mm a')}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed bg-white dark:bg-gray-800 p-3 rounded border-l-4 border-green-400">
                            {question.response}
                          </p>
                        </div>
                      )}

                      {!question.response && (
                        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                          <div className="flex items-center gap-2 mb-3">
                            <Send className="h-4 w-4 text-blue-600" />
                            <label className="text-sm font-medium text-blue-800 dark:text-blue-200">
                              Compose Response:
                            </label>
                          </div>
                          <Textarea
                            placeholder="Type your response to this question..."
                            value={responses[question.id] || ''}
                            onChange={(e) => handleResponseChange(question.id, e.target.value)}
                            rows={3}
                            className="mb-3 border-blue-300 focus:border-blue-500"
                          />
                          <Button
                            size="sm"
                            onClick={() => handleSubmitResponse(question.id)}
                            disabled={!responses[question.id]?.trim() || submittingResponse[question.id]}
                            className="w-full bg-blue-600 hover:bg-blue-700"
                          >
                            <Send size={16} className="mr-2" />
                            {submittingResponse[question.id] ? 'Submitting...' : 'Submit Response'}
                          </Button>
                        </div>
                      )}

                      {question.is_anonymous && (
                        <div className="mt-3">
                          <Badge variant="secondary" className="text-xs">
                            🔒 Anonymous Question
                          </Badge>
                        </div>
                      )}
                    </CardContent>
                    
                    <CardFooter className="border-t bg-gray-50/30 dark:bg-gray-800/30 flex justify-between items-center">
                      <div className="text-xs text-muted-foreground">
                        ID: {question.id.slice(0, 8)}...
                      </div>
                      <div className="flex gap-2">
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
