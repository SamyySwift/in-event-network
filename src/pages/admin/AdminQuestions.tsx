
import React, { useState } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import EventSelector from '@/components/admin/EventSelector';
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
import { CheckCircle, XCircle, ArrowUpCircle, MessageSquare, Reply } from 'lucide-react';
import { format } from 'date-fns';
import { useAdminQuestions } from '@/hooks/useAdminQuestions';
import { useAdminEventContext, AdminEventProvider } from '@/hooks/useAdminEventContext';

const AdminQuestionsContent = () => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');

  const { selectedEventId } = useAdminEventContext();

  const { 
    questions, 
    isLoading, 
    error, 
    markAsAnswered, 
    deleteQuestion, 
    respondToQuestion,
    isMarkingAnswered,
    isDeleting,
    isResponding
  } = useAdminQuestions(selectedEventId || '');

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

  const handleMarkAsAnswered = (questionId: string) => {
    markAsAnswered(questionId);
  };

  const handleDeleteQuestion = (questionId: string) => {
    deleteQuestion(questionId);
  };

  const handleStartResponse = (questionId: string) => {
    setRespondingTo(questionId);
    setResponseText('');
  };

  const handleSubmitResponse = () => {
    if (respondingTo && responseText.trim()) {
      respondToQuestion({ 
        questionId: respondingTo, 
        response: responseText.trim() 
      });
      setRespondingTo(null);
      setResponseText('');
    }
  };

  const handleCancelResponse = () => {
    setRespondingTo(null);
    setResponseText('');
  };

  const filteredQuestions = getFilteredQuestions();

  if (!selectedEventId) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Attendee Questions</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Review and moderate questions from attendees
            </p>
          </div>
          <EventSelector />
        </div>
      </AdminLayout>
    );
  }

  if (isLoading) {
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
      <div className="space-y-6">
        <EventSelector />
        
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
                          <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-200 rounded">
                            <p className="text-sm font-medium text-blue-800 mb-1">Admin Response:</p>
                            <p className="text-blue-700">{question.response}</p>
                            {question.response_created_at && (
                              <p className="text-xs text-blue-600 mt-1">
                                Responded on {format(new Date(question.response_created_at), 'MMM d, yyyy h:mm a')}
                              </p>
                            )}
                          </div>
                        )}
                        
                        {respondingTo === question.id && (
                          <div className="mt-4 space-y-3">
                            <Textarea
                              placeholder="Type your response here..."
                              value={responseText}
                              onChange={(e) => setResponseText(e.target.value)}
                              rows={3}
                            />
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                onClick={handleSubmitResponse}
                                disabled={!responseText.trim() || isResponding}
                              >
                                {isResponding ? 'Submitting...' : 'Submit Response'}
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={handleCancelResponse}
                              >
                                Cancel
                              </Button>
                            </div>
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
                      </CardContent>
                      <CardFooter className="border-t pt-3 flex justify-between">
                        <div className="text-sm text-muted-foreground">
                          Question ID: {question.id}
                        </div>
                        <div className="flex gap-2">
                          {!question.response && respondingTo !== question.id && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="text-blue-600 border-blue-200 hover:bg-blue-50"
                              onClick={() => handleStartResponse(question.id)}
                            >
                              <Reply size={16} className="mr-1" />
                              Respond
                            </Button>
                          )}
                          {!question.is_answered && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="text-green-600 border-green-200 hover:bg-green-50"
                              onClick={() => handleMarkAsAnswered(question.id)}
                              disabled={isMarkingAnswered}
                            >
                              <CheckCircle size={16} className="mr-1" />
                              Mark Answered
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-destructive border-destructive/20 hover:bg-destructive/10"
                            onClick={() => handleDeleteQuestion(question.id)}
                            disabled={isDeleting}
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

const AdminQuestions = () => {
  return (
    <AdminEventProvider>
      <AdminQuestionsContent />
    </AdminEventProvider>
  );
};

export default AdminQuestions;
