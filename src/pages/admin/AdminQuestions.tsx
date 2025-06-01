
import React, { useState } from 'react';
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
import { CheckCircle, XCircle, ArrowUpCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Question } from '@/types';

// Mock sessions data for reference
const mockSessions = [
  { id: 'session1', title: 'Keynote: Future of Tech', speakerId: 'speaker1' },
  { id: 'session2', title: 'Hands-on Workshop: AI Development', speakerId: 'speaker2' },
  { id: 'session3', title: 'Panel: Cybersecurity Trends', speakerId: 'speaker3' }
];

// Mock speakers data for reference
const mockSpeakers = [
  { id: 'speaker1', name: 'Dr. Eliza Martinez' },
  { id: 'speaker2', name: 'James Wilson' },
  { id: 'speaker3', name: 'Sophia Chen' }
];

// Mock users data for reference
const mockUsers = [
  { id: 'user1', name: 'Alex Johnson', photoUrl: 'https://i.pravatar.cc/150?img=1' },
  { id: 'user2', name: 'Morgan Smith', photoUrl: 'https://i.pravatar.cc/150?img=2' },
  { id: 'user3', name: 'Jamie Wilson', photoUrl: 'https://i.pravatar.cc/150?img=3' }
];

// Mock data for questions
const mockQuestions: Question[] = [
  {
    id: '1',
    question: 'How do you see artificial intelligence impacting the job market in the next 5 years?',
    sessionId: 'session1',
    userId: 'user1',
    speakerId: 'speaker1',
    upvotes: 15,
    answered: false,
    createdAt: '2025-06-15T10:15:00Z'
  },
  {
    id: '2',
    question: 'What security measures should startups prioritize when building their first product?',
    sessionId: 'session2',
    userId: 'user2',
    speakerId: 'speaker2',
    upvotes: 8,
    answered: true,
    createdAt: '2025-06-15T11:30:00Z'
  },
  {
    id: '3',
    question: 'Could you elaborate on the design thinking process you mentioned earlier?',
    sessionId: 'session3',
    userId: 'user3',
    speakerId: 'speaker3',
    upvotes: 12,
    answered: false,
    createdAt: '2025-06-15T14:45:00Z'
  },
  {
    id: '4',
    question: 'What programming languages do you recommend for beginners interested in AI?',
    sessionId: 'session1',
    userId: 'user2',
    speakerId: 'speaker1',
    upvotes: 7,
    answered: false,
    createdAt: '2025-06-15T10:25:00Z'
  }
];

const AdminQuestions = () => {
  const [activeTab, setActiveTab] = useState<string>('all');
  
  // Filter questions based on active tab
  const getFilteredQuestions = () => {
    switch(activeTab) {
      case 'answered':
        return mockQuestions.filter(q => q.answered);
      case 'unanswered':
        return mockQuestions.filter(q => !q.answered);
      case 'trending':
        return [...mockQuestions].sort((a, b) => b.upvotes - a.upvotes);
      default:
        return mockQuestions;
    }
  };

  // Helper functions to get related data
  const getSessionTitle = (sessionId: string) => {
    const session = mockSessions.find(s => s.id === sessionId);
    return session ? session.title : 'Unknown Session';
  };

  const getSpeakerName = (speakerId: string) => {
    const speaker = mockSpeakers.find(s => s.id === speakerId);
    return speaker ? speaker.name : 'Unknown Speaker';
  };

  const getUserData = (userId: string) => {
    return mockUsers.find(u => u.id === userId) || { name: 'Unknown User', photoUrl: '' };
  };

  const handleMarkAsAnswered = (question: Question) => {
    console.log('Mark as answered', question);
  };

  const handleDeleteQuestion = (question: Question) => {
    console.log('Delete question', question);
  };

  const filteredQuestions = getFilteredQuestions();

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
                  No questions found in this category.
                </CardContent>
              </Card>
            ) : (
              filteredQuestions.map(question => {
                const user = getUserData(question.userId);
                return (
                  <Card key={question.id} className={question.answered ? 'border-green-100' : ''}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={user.photoUrl} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-base">{user.name}</CardTitle>
                            <CardDescription>
                              {format(new Date(question.createdAt), 'MMM d, yyyy h:mm a')}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge variant={question.answered ? 'outline' : 'default'}>
                          {question.answered ? 'Answered' : 'Pending'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-base mb-3">{question.question}</p>
                      <div className="flex flex-wrap gap-2 text-sm">
                        <Badge variant="secondary">Session: {getSessionTitle(question.sessionId)}</Badge>
                        <Badge variant="secondary">Speaker: {getSpeakerName(question.speakerId || '')}</Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <ArrowUpCircle size={14} /> {question.upvotes} upvotes
                        </Badge>
                      </div>
                    </CardContent>
                    <CardFooter className="border-t pt-3 flex justify-between">
                      <div className="text-sm text-muted-foreground">
                        Question ID: {question.id}
                      </div>
                      <div className="flex gap-2">
                        {!question.answered && (
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
