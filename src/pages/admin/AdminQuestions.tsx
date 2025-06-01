
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
import { CheckCircle, XCircle, ArrowUpCircle, Clock, Star } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

interface QuestionFeedback {
  id: string;
  question_id: string;
  satisfaction_level: number;
  feedback_text: string | null;
  created_at: string;
}

const AdminQuestions = () => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [feedback, setFeedback] = useState<QuestionFeedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    fetchQuestions();
    fetchFeedback();
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

  const fetchFeedback = async () => {
    try {
      const { data, error } = await supabase
        .from('question_feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFeedback(data || []);
    } catch (error) {
      console.error('Error fetching feedback:', error);
    }
  };

  // Filter questions based on active tab
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

  const handleMarkAsAnswered = async (question: Question) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('questions')
        .update({
          is_answered: true,
          answered_at: new Date().toISOString(),
          answered_by: user.id
        })
        .eq('id', question.id);

      if (error) throw error;

      // Create notification for the user
      if (question.user_id) {
        await supabase
          .from('notifications')
          .insert({
            user_id: question.user_id,
            title: 'Question Answered',
            message: 'Your question has been answered! Please provide feedback.',
            type: 'question_answered',
            related_id: question.id
          });
      }

      toast({
        title: "Success",
        description: "Question marked as answered and notification sent"
      });

      fetchQuestions();
    } catch (error) {
      console.error('Error marking question as answered:', error);
      toast({
        title: "Error",
        description: "Failed to mark question as answered",
        variant: "destructive"
      });
    }
  };

  const handleDeleteQuestion = async (question: Question) => {
    try {
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', question.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Question deleted successfully"
      });

      fetchQuestions();
    } catch (error) {
      console.error('Error deleting question:', error);
      toast({
        title: "Error",
        description: "Failed to delete question",
        variant: "destructive"
      });
    }
  };

  const getQuestionFeedback = (questionId: string) => {
    return feedback.filter(f => f.question_id === questionId);
  };

  const getAverageSatisfaction = (questionId: string) => {
    const questionFeedback = getQuestionFeedback(questionId);
    if (questionFeedback.length === 0) return 0;
    
    const total = questionFeedback.reduce((sum, f) => sum + f.satisfaction_level, 0);
    return Math.round(total / questionFeedback.length);
  };

  const filteredQuestions = getFilteredQuestions();

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <AdminPageHeader
          title="Attendee Questions"
          description="Review and moderate questions from attendees"
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
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-muted-foreground">Loading questions...</p>
                </div>
              ) : filteredQuestions.length === 0 ? (
                <Card>
                  <CardContent className="py-10 text-center text-muted-foreground">
                    No questions found in this category.
                  </CardContent>
                </Card>
              ) : (
                filteredQuestions.map(question => {
                  const questionFeedback = getQuestionFeedback(question.id);
                  const avgSatisfaction = getAverageSatisfaction(question.id);
                  
                  return (
                    <Card key={question.id} className={question.is_answered ? 'border-green-100' : ''}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={question.profiles?.photo_url || ''} />
                              <AvatarFallback>
                                {question.is_anonymous ? 'A' : (question.profiles?.name?.charAt(0) || 'U')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle className="text-base">
                                {question.is_anonymous ? 'Anonymous' : (question.profiles?.name || 'Unknown User')}
                              </CardTitle>
                              <CardDescription>
                                {format(new Date(question.created_at), 'MMM d, yyyy h:mm a')}
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={question.is_answered ? 'outline' : 'default'}>
                              {question.is_answered ? 'Answered' : 'Pending'}
                            </Badge>
                            {question.is_answered && questionFeedback.length > 0 && (
                              <Badge variant="secondary" className="flex items-center gap-1">
                                <Star className="h-3 w-3" />
                                {avgSatisfaction}/5
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-base mb-3">{question.content}</p>
                        <div className="flex flex-wrap gap-2 text-sm">
                          <Badge variant="outline" className="flex items-center gap-1">
                            <ArrowUpCircle size={14} /> {question.upvotes} upvotes
                          </Badge>
                          {question.is_answered && question.answered_at && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Clock size={14} />
                              Answered {format(new Date(question.answered_at), 'MMM d')}
                            </Badge>
                          )}
                          {questionFeedback.length > 0 && (
                            <Badge variant="outline">
                              {questionFeedback.length} feedback{questionFeedback.length !== 1 ? 's' : ''}
                            </Badge>
                          )}
                        </div>
                        
                        {/* Show feedback if available */}
                        {questionFeedback.length > 0 && (
                          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                            <h4 className="text-sm font-medium mb-2">Feedback:</h4>
                            <div className="space-y-2">
                              {questionFeedback.map(fb => (
                                <div key={fb.id} className="text-sm">
                                  <div className="flex items-center gap-2 mb-1">
                                    <div className="flex">
                                      {[1, 2, 3, 4, 5].map(star => (
                                        <Star 
                                          key={star}
                                          className={`h-3 w-3 ${star <= fb.satisfaction_level ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                        />
                                      ))}
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                      {format(new Date(fb.created_at), 'MMM d')}
                                    </span>
                                  </div>
                                  {fb.feedback_text && (
                                    <p className="text-muted-foreground italic">"{fb.feedback_text}"</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                      <CardFooter className="border-t pt-3 flex justify-between">
                        <div className="text-sm text-muted-foreground">
                          Question ID: {question.id}
                        </div>
                        <div className="flex gap-2">
                          {!question.is_answered && (
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
      </div>
    </AdminLayout>
  );
};

export default AdminQuestions;
