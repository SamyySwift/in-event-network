import React, { useState } from 'react';
import { ArrowUp, MessageSquare, Send, User, Star, Lightbulb } from 'lucide-react';
import AppLayout from '@/components/layouts/AppLayout';
import AttendeeRouteGuard from '@/components/attendee/AttendeeRouteGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import FeedbackModal from '@/components/FeedbackModal';
import { useAuth } from '@/contexts/AuthContext';
import { useAttendeeQuestions } from '@/hooks/useAttendeeQuestions';
import { format } from 'date-fns';
const AttendeeQuestions = () => {
  const {
    currentUser
  } = useAuth();
  const [newQuestion, setNewQuestion] = useState('');
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const {
    questions,
    sessions,
    currentEventId,
    isLoading,
    error,
    submitQuestion,
    upvoteQuestion,
    isSubmitting
  } = useAttendeeQuestions();
  const handleSubmitQuestion = async () => {
    if (!newQuestion.trim()) return;
    if (!currentEventId) {
      return;
    }
    submitQuestion({
      content: newQuestion,
      isAnonymous,
      selectedSessionId
    });
    setNewQuestion('');
    setSelectedSessionId('');
    setIsAnonymous(false);
  };
  const handleUpvote = (questionId: string) => {
    upvoteQuestion(questionId);
  };
  const handleFeedback = (questionId: string) => {
    setSelectedQuestionId(questionId);
    setShowFeedbackModal(true);
  };
  const myQuestions = questions.filter(q => q.user_id === currentUser?.id);
  const otherQuestions = questions.filter(q => q.user_id !== currentUser?.id);
  if (isLoading) {
    return <AppLayout>
        <AttendeeRouteGuard>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading questions...</p>
            </div>
          </div>
        </AttendeeRouteGuard>
      </AppLayout>;
  }
  if (!currentEventId) {
    return <AppLayout>
        <AttendeeRouteGuard>
          <div className="animate-fade-in max-w-4xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Q&amp;A Session</h1>
              <p className="text-gray-600 dark:text-gray-400">
                You need to join an event first to ask questions
              </p>
            </div>
          </div>
        </AttendeeRouteGuard>
      </AppLayout>;
  }
  const renderQuestionCard = (question: any) => {
    const userName = question.profiles?.name || 'Anonymous';
    const userPhoto = question.profiles?.photo_url;
    return <Card key={question.id} className={"shadow-md rounded-2xl transition-shadow border-0 bg-white/95 backdrop-blur mb-3 sm:mb-4" + (question.is_answered ? ' border-green-200 bg-green-50/60' : '')}>
        <CardContent className="pt-6 pb-4">
          <div className="flex items-start gap-4">
            <Avatar className="flex-shrink-0">
              {!question.is_anonymous && userPhoto ? <AvatarImage src={userPhoto} /> : <AvatarFallback>
                  {question.is_anonymous ? <User className="h-4 w-4" /> : userName.charAt(0)}
                </AvatarFallback>}
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="font-medium text-sm">
                  {question.is_anonymous ? 'Anonymous' : userName}
                </span>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(question.created_at), 'MMM d, yyyy')}
                </span>
                {question.is_answered && <Badge className="bg-green-100 text-green-800">Answered</Badge>}
              </div>
              <p className="text-gray-800 dark:text-gray-200 mb-3">
                {question.content}
              </p>

              {/* Admin Response */}
              {question.response && <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-200 rounded">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-xs font-semibold text-white">A</span>
                    </div>
                    <span className="text-sm font-medium text-blue-800">Admin Response</span>
                    {question.response_created_at && <span className="text-xs text-blue-600">
                        • {format(new Date(question.response_created_at), 'MMM d, h:mm a')}
                      </span>}
                  </div>
                  <p className="text-blue-700 pl-8">{question.response}</p>
                </div>}

              <div className="flex items-center gap-4 mt-3">
                <Button variant="ghost" size="sm" onClick={() => handleUpvote(question.id)} className="text-gray-600 hover:text-connect-600">
                  <ArrowUp className="h-4 w-4 mr-1" />
                  {question.upvotes}
                </Button>

                {question.is_answered && question.user_id === currentUser?.id}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>;
  };
  return <AppLayout>
      <AttendeeRouteGuard>
        <div className="animate-fade-in max-w-4xl mx-auto px-0 sm:px-6 pb-8">
          {/* HERO Gradient Header */}
          <div className="mb-8 relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-6 sm:p-10 text-white z-10 shadow-xl">
            <div className="absolute inset-0 bg-black/25 z-0"></div>
            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex flex-col items-center sm:items-start">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
                    <MessageSquare className="h-8 w-8 text-yellow-300" />
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-bold mb-2">Q&amp;A Session</h1>
                  <p className="text-lg opacity-95 max-w-2xl">
                    Ask questions and engage with the event speakers!
                  </p>
                </div>
                <div className="flex flex-col items-center sm:items-end space-y-1 mt-4 sm:mt-0">
                  <div className="flex space-x-2">
                    <Badge variant="info" className="font-medium">
                      {myQuestions.length} My Questions
                    </Badge>
                    <Badge variant="warning" className="font-medium">
                      {otherQuestions.length} Community
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-12 -right-12 w-44 h-44 bg-white/10 rounded-full z-0"></div>
            <div className="absolute -top-12 -left-12 w-60 h-60 bg-white/5 rounded-full z-0"></div>
          </div>

          {/* Submit Question Form */}
          <div className="w-full mb-8">
            <Card className="rounded-2xl shadow-lg bg-white/95 backdrop-blur-sm border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-connect-600" />
                  Ask Your Question
                </CardTitle>
                <CardDescription>
                  Your question will be visible to speakers and other attendees
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="session">Select Session</Label>
                  <Select value={selectedSessionId} onValueChange={setSelectedSessionId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a session (optional)" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 z-30">
                      <SelectItem value="general">General Question</SelectItem>
                      {sessions.map(session => <SelectItem key={session.id} value={session.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {session.session_title || `${session.name}'s Session`}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              by {session.name}
                              {session.session_time && ` • ${new Date(session.session_time).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit'
                          })}`}
                            </span>
                          </div>
                        </SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="question">Your Question</Label>
                  <Textarea id="question" placeholder="Type your question here..." value={newQuestion} onChange={e => setNewQuestion(e.target.value)} rows={4} />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="anonymous" checked={isAnonymous} onCheckedChange={setIsAnonymous} />
                  <Label htmlFor="anonymous">Ask anonymously</Label>
                </div>

                <div className="space-y-2 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground font-medium">Tips for good questions:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Be specific and concise</li>
                    <li>• Ask about topics relevant to the session</li>
                    <li>• Avoid yes/no questions</li>
                  </ul>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    Cancel
                  </Button>
                  <Button onClick={handleSubmitQuestion} disabled={!newQuestion.trim() || isSubmitting} className="flex-1">
                    <Send className="h-4 w-4 mr-2" />
                    {isSubmitting ? 'Submitting...' : 'Submit Question'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* My Questions */}
          {myQuestions.length > 0 && <>
              <div className="mb-4">
                <h2 className="text-xl font-semibold">My Questions</h2>
              </div>
              <div className="space-y-4 mb-6">
                {myQuestions.map(question => renderQuestionCard(question))}
              </div>
              <Separator className="my-6" />
            </>}

          {/* Community Questions */}
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Community Questions</h2>
          </div>
          <div className="space-y-4">
            {otherQuestions.length > 0 ? otherQuestions.map(question => renderQuestionCard(question)) : <Card>
                <CardContent className="py-10 text-center text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No questions from other attendees yet.</p>
                  <p className="text-sm">Be the first to ask a question!</p>
                </CardContent>
              </Card>}
          </div>
        </div>

        {/* Feedback Modal */}
        {showFeedbackModal && selectedQuestionId && <FeedbackModal questionId={selectedQuestionId} isOpen={showFeedbackModal} onClose={() => {
        setShowFeedbackModal(false);
        setSelectedQuestionId(null);
      }} />}
      </AttendeeRouteGuard>
    </AppLayout>;
};
export default AttendeeQuestions;