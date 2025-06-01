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
import { CheckCircle, XCircle, ArrowUpCircle, MessageSquare } from 'lucide-react';
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
  profiles: {
    name: string;
    photo_url: string | null;
  } | null;
}

const AdminQuestions = () => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [questions, setQuestions] = useState<QuestionWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

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
          profiles(name, photo_url)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedData: QuestionWithProfile[] = (data || []).map(item => ({
        ...item,
        profiles: Array.isArray(item.profiles) && item.profiles.length > 0 
          ? item.profiles[0] 
          : null
      }));
      
      setQuestions(transformedData);
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

  const handleMarkAsAnswered = async (question: QuestionWithProfile) => {
    try {
      const { error } = await supabase
        .from('questions')
        .update({ 
          is_answered: true,
          answered_at: new Date().toISOString(),
          answered_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', question.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Question marked as answered",
      });

      fetchQuestions();
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

      fetchQuestions();
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
            {filteredQuestions.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No questions found in this category.</p>
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
                      <div className="flex flex-wrap gap-2 text-sm">
                        <Badge variant="outline" className="flex items-center gap-1">
                          <ArrowUpCircle size={14} /> {question.upvotes} upvotes
                        </Badge>
                        {question.is_anonymous && (
                          <Badge variant="secondary">Anonymous</Badge>
                        )}
                      </div>
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
    </AdminLayout>
  );
};

export default AdminQuestions;
