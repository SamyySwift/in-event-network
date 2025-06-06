import React, { useState, useEffect } from 'react';
import { ArrowUp, MessageSquare, Send, User, Reply } from 'lucide-react';
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
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Separator } from '@/components/ui/separator';
import FeedbackModal from '@/components/FeedbackModal';
import { format } from 'date-fns';
import EventAccessGuard from '@/components/EventAccessGuard';
import { useEventParticipation } from '@/hooks/useEventParticipation';

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

interface Session {
  id: string;
  name: string;
  session_title: string | null;
  session_time: string | null;
}

const AttendeeQuestions = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [questions, setQuestions] = useState<QuestionWithProfile[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const { hasJoinedEvent, getJoinedEvents, loading: participationLoading } = useEventParticipation();

  useEffect(() => {
    fetchQuestions();
    fetchSessions();

    // Set up real-time subscription for questions updates
    const channel = supabase
      .channel('attendee-questions-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'questions'
        },
        (payload) => {
          console.log('Questions updated:', payload);
          fetchQuestions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchSessions = async () => {
    try {
      const { data: sessionsData, error } = await supabase
        .from('speakers')
        .select('id, name, session_title, session_time')
        .not('session_time', 'is', null)
        .not('session_title', 'is', null)
        .order('session_time', { ascending: true });

      if (error) throw error;

      setSessions(sessionsData || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch sessions",
        variant: "destructive",
      });
    }
  };

  const fetchQuestions = async () => {
    try {
      console.log('Fetching questions with complete response data...');
      
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

      if (questionsError) throw questionsError;

      // Fetch profiles for each question
      const questionsWithProfiles = await Promise.all(
        (questionsData || []).map(async (question) => {
          if (question.is_anonymous) {
            return {
              ...question,
              profiles: null
            };
          }

          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('name, photo_url')
              .eq('id', question.user_id)
              .single();

            return {
              ...question,
              profiles: profile
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

      console.log('Questions loaded with complete data:', questionsWithProfiles);
      setQuestions(questionsWithProfiles);
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
          session_id: selectedSessionId === 'general' ? null : selectedSessionId || null,
          event_id: null,
          upvotes: 0,
          is_answered: false
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your question has been submitted!",
      });

      setNewQuestion('');
      setSelectedSessionId('');
      setIsAnonymous(false);
      await fetchQuestions();
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

  const renderQuestionCard = (question: QuestionWithProfile) => {
    const userName = question.profiles?.name || 'Anonymous';
    const userPhoto = question.profiles?.photo_url;
    const isMyQuestion = question.user_id === currentUser?.id;
    
    return (
      <Card key={question.id} className={`shadow-md border-l-4 ${question.is_answered ? 'border-l-green-400 bg-green-50/30' : 'border-l-primary/30'} ${isMyQuestion ? 'ring-2 ring-primary/10' : ''}`}>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Avatar className="flex-shrink-0 h-12 w-12">
              {!question.is_anonymous && userPhoto ? (
                <AvatarImage src={userPhoto} />
              ) : (
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {question.is_anonymous ? <User className="h-5 w-5" /> : userName.charAt(0)}
                </AvatarFallback>
              )}
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-3">
                <span className="font-semibold text-base">
                  {question.is_anonymous ? 'Anonymous' : userName}
                </span>
                {isMyQuestion && (
                  <Badge variant="outline" className="text-xs">
                    Your Question
                  </Badge>
                )}
                <span className="text-sm text-muted-foreground">
                  {format(new Date(question.created_at), 'MMM d, yyyy h:mm a')}
                </span>
                {question.is_answered && (
                  <Badge variant="default" className="text-xs bg-green-600">
                    ✓ Answered
                  </Badge>
                )}
              </div>
              
              <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border mb-4">
                <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                  {question.content}
                </p>
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
              
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleUpvote(question.id)}
                  className="text-gray-600 hover:text-primary hover:bg-primary/10"
                >
                  <ArrowUp className="h-4 w-4 mr-1" />
                  {question.upvotes}
                </Button>
                
                {question.response && isMyQuestion && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFeedback(question.id)}
                    className="text-primary border-primary/20 hover:bg-primary/10"
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
  };

  const myQuestions = questions.filter(q => q.user_id === currentUser?.id);
  const otherQuestions = questions.filter(q => q.user_id !== currentUser?.id);

  if (loading || participationLoading) {
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
      <EventAccessGuard hasAccess={hasEventAccess} loading={participationLoading}>
        <div className="animate-fade-in max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-600 bg-clip-text text-transparent">
              Q&A Session
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
              Ask questions to speakers and interact with other attendees
            </p>
          </div>

          {/* Submit Question Form */}
          <Card className="mb-8 shadow-lg border-2 border-primary/10">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
              <CardTitle className="flex items-center gap-2 text-xl">
                <MessageSquare className="h-6 w-6 text-primary" />
                Ask Your Question
              </CardTitle>
              <CardDescription className="text-base">
                Your question will be visible to speakers and other attendees
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div>
                <Label htmlFor="session" className="text-sm font-medium">Select Session</Label>
                <Select value={selectedSessionId} onValueChange={setSelectedSessionId}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Choose a session (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Question</SelectItem>
                    {sessions.map((session) => (
                      <SelectItem key={session.id} value={session.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {session.session_title || `${session.name}'s Session`}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            by {session.name}
                            {session.session_time && (
                              ` • ${new Date(session.session_time).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit',
                              })}`
                            )}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="question" className="text-sm font-medium">Your Question</Label>
                <Textarea
                  id="question"
                  placeholder="Type your question here..."
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  rows={4}
                  className="mt-1"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="anonymous"
                  checked={isAnonymous}
                  onCheckedChange={setIsAnonymous}
                />
                <Label htmlFor="anonymous" className="text-sm">Ask anonymously</Label>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">Tips for good questions:</p>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• Be specific and concise</li>
                  <li>• Ask about topics relevant to the session</li>
                  <li>• Avoid yes/no questions</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setNewQuestion('')}>
                  Clear
                </Button>
                <Button 
                  onClick={handleSubmitQuestion} 
                  disabled={!newQuestion.trim() || submitting}
                  className="flex-1"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {submitting ? 'Submitting...' : 'Submit Question'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* My Questions */}
          {myQuestions.length > 0 && (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-primary">My Questions</h2>
                <p className="text-muted-foreground">Questions you have submitted</p>
              </div>
              <div className="space-y-6 mb-8">
                {myQuestions.map(renderQuestionCard)}
              </div>
              <Separator className="my-8" />
            </>
          )}

          {/* All Questions */}
          <div className="mb-6">
            <h2 className="text-2xl font-semibold">Community Questions</h2>
            <p className="text-muted-foreground">Questions from other attendees</p>
          </div>
          
          <div className="space-y-6">
            {otherQuestions.length > 0 ? (
              otherQuestions.map(renderQuestionCard)
            ) : (
              <Card className="shadow-md">
                <CardContent className="py-12 text-center text-muted-foreground">
                  <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No questions from other attendees yet.</p>
                  <p className="text-sm mt-2">Be the first to ask a question!</p>
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
      </EventAccessGuard>
    </AppLayout>
  );
};

export default AttendeeQuestions;
