
import React, { useState } from 'react';
import {
  MessageSquare,
  Search,
  Filter,
  ChevronUp,
  MessageCircle,
  User,
  Check,
  Clock,
  Send
} from 'lucide-react';
import AppLayout from '@/components/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

// Mock data for sessions
const sessions = [
  { id: '1', title: 'Opening Keynote', speaker: 'Alex Johnson' },
  { id: '2', title: 'Future of Tech Panel', speaker: 'Maria Garcia & Team' },
  { id: '3', title: 'Workshop: AI Integration', speaker: 'David Lee' },
  { id: '4', title: 'Closing Remarks', speaker: 'Alex Johnson' },
];

// Mock data for questions
const initialQuestions = [
  {
    id: '1',
    userId: 'user1',
    userName: 'Sarah Thompson',
    userPhotoUrl: '',
    sessionId: '1',
    sessionTitle: 'Opening Keynote',
    question: 'Could you elaborate on your vision for the company in the next 5 years?',
    createdAt: '2025-05-20T09:15:00',
    upvotes: 24,
    answered: true,
    answer: 'We\'re focused on expanding our AI capabilities while maintaining our commitment to sustainability. Our 5-year plan includes...',
    answeredBy: 'Alex Johnson',
    answeredAt: '2025-05-20T09:20:00'
  },
  {
    id: '2',
    userId: 'user2',
    userName: 'Michael Chen',
    userPhotoUrl: '',
    sessionId: '2',
    sessionTitle: 'Future of Tech Panel',
    question: 'What do you think will be the biggest challenge for companies adopting AI in the next year?',
    createdAt: '2025-05-20T11:05:00',
    upvotes: 18,
    answered: false
  },
  {
    id: '3',
    userId: 'user3',
    userName: 'Priya Patel',
    userPhotoUrl: '',
    sessionId: '3',
    sessionTitle: 'Workshop: AI Integration',
    question: 'Can you recommend resources for learning more about implementing AI in legacy systems?',
    createdAt: '2025-05-20T14:10:00',
    upvotes: 12,
    answered: true,
    answer: 'Absolutely! I recommend starting with these resources: 1) "Modern AI Integration" by Smith et al. 2) The AILegacy.dev website 3) Our company blog has several case studies...',
    answeredBy: 'David Lee',
    answeredAt: '2025-05-20T14:30:00'
  },
  {
    id: '4',
    userId: 'user1',
    userName: 'Sarah Thompson',
    userPhotoUrl: '',
    sessionId: '2',
    sessionTitle: 'Future of Tech Panel',
    question: 'How do you see the role of quantum computing evolving in the next decade?',
    createdAt: '2025-05-20T11:30:00',
    upvotes: 15,
    answered: false
  }
];

const AttendeeQuestions = () => {
  const { toast } = useToast();
  const [questions, setQuestions] = useState(initialQuestions);
  const [activeTab, setActiveTab] = useState('browse');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSession, setSelectedSession] = useState<string | undefined>('all');
  const [questionText, setQuestionText] = useState('');
  const [questionSession, setQuestionSession] = useState<string>('');
  
  // Filter questions based on search term and selected session
  const filteredQuestions = questions.filter(question => {
    const matchesSearch = 
      question.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.sessionTitle.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSession = !selectedSession || selectedSession === 'all' || question.sessionId === selectedSession;
    
    return matchesSearch && matchesSession;
  });
  
  // Sort questions by upvotes (most upvoted first)
  const sortedQuestions = [...filteredQuestions].sort((a, b) => b.upvotes - a.upvotes);
  
  // Function to handle upvoting a question
  const handleUpvote = (questionId: string) => {
    setQuestions(questions.map(q => 
      q.id === questionId 
        ? { ...q, upvotes: q.upvotes + 1 } 
        : q
    ));
  };
  
  // Function to handle submitting a new question
  const handleSubmitQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!questionText.trim() || !questionSession) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    
    // Find the selected session
    const session = sessions.find(s => s.id === questionSession);
    if (!session) return;
    
    // Create new question
    const newQuestion = {
      id: `new-${Date.now()}`,
      userId: 'currentUser', // In a real app, get from auth context
      userName: 'You', // In a real app, get from auth context
      userPhotoUrl: '',
      sessionId: session.id,
      sessionTitle: session.title,
      question: questionText,
      createdAt: new Date().toISOString(),
      upvotes: 0,
      answered: false
    };
    
    // Add the new question to the list
    setQuestions([newQuestion, ...questions]);
    
    // Reset form
    setQuestionText('');
    
    toast({
      title: "Question Submitted",
      description: "Your question has been submitted successfully.",
    });
    
    // Switch to browse tab
    setActiveTab('browse');
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <AppLayout>
      <div className="animate-fade-in max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Questions & Answers</h1>
            <p className="text-gray-600 dark:text-gray-400">Ask questions to speakers and see answers in real-time</p>
          </div>
          <Button
            onClick={() => setActiveTab('ask')}
            className="bg-connect-600 hover:bg-connect-700"
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Ask a Question
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="browse" className="flex items-center gap-2">
              <MessageCircle size={18} />
              <span>Browse Questions</span>
            </TabsTrigger>
            <TabsTrigger value="ask" className="flex items-center gap-2">
              <MessageSquare size={18} />
              <span>Ask a Question</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="browse" className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedSession} onValueChange={setSelectedSession}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="All Sessions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sessions</SelectItem>
                  {sessions.map((session) => (
                    <SelectItem key={session.id} value={session.id}>
                      {session.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter size={16} />
                <span>Filters</span>
              </Button>
            </div>
            
            {sortedQuestions.length > 0 ? (
              <div className="space-y-4">
                {sortedQuestions.map((question) => (
                  <Card key={question.id} className={`overflow-hidden ${question.answered ? 'border-green-200 dark:border-green-800' : ''}`}>
                    <div className="flex">
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 flex flex-col items-center justify-start">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUpvote(question.id)}
                          className="px-3 h-auto flex flex-col items-center"
                        >
                          <ChevronUp size={18} />
                          <span className="text-lg font-semibold">{question.upvotes}</span>
                        </Button>
                        {question.answered && (
                          <Badge className="mt-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                            <Check size={12} className="mr-1" />
                            Answered
                          </Badge>
                        )}
                      </div>
                      
                      <CardContent className="p-4 flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-6 w-6">
                              {question.userPhotoUrl ? (
                                <AvatarImage src={question.userPhotoUrl} alt={question.userName} />
                              ) : (
                                <AvatarFallback className="bg-connect-100 text-connect-600 text-xs">
                                  {question.userName.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <span className="text-sm font-medium">{question.userName}</span>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <Clock size={12} />
                            <span>{formatDate(question.createdAt)}</span>
                          </div>
                        </div>
                        
                        <Badge variant="outline" className="mb-2">
                          {question.sessionTitle}
                        </Badge>
                        
                        <p className="text-gray-800 dark:text-gray-200 mb-3 text-base">
                          {question.question}
                        </p>
                        
                        {question.answered && (
                          <div className="mt-4 pl-3 border-l-2 border-green-400 dark:border-green-600">
                            <div className="flex items-center space-x-2 mb-2">
                              <Avatar className="h-5 w-5">
                                <AvatarFallback className="bg-green-100 text-green-800 text-xs">
                                  {question.answeredBy.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm font-medium">{question.answeredBy}</span>
                              <span className="text-xs text-gray-500">
                                {formatDate(question.answeredAt!)}
                              </span>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 text-sm">
                              {question.answer}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <MessageSquare className="h-12 w-12 mx-auto text-gray-400" />
                <h3 className="mt-4 text-lg font-medium">No questions found</h3>
                <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                  {searchTerm || selectedSession ? 
                    "Try adjusting your search or filters" : 
                    "Be the first to ask a question to the speakers"
                  }
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="ask">
            <Card>
              <CardHeader>
                <CardTitle>Ask Your Question</CardTitle>
                <CardDescription>
                  Your question will be visible to speakers and other attendees
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmitQuestion}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="session" className="text-sm font-medium">
                      Select Session or Speaker
                    </label>
                    <Select 
                      value={questionSession} 
                      onValueChange={setQuestionSession}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a session" />
                      </SelectTrigger>
                      <SelectContent>
                        {sessions.map((session) => (
                          <SelectItem key={session.id} value={session.id}>
                            {session.title} - {session.speaker}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="question" className="text-sm font-medium">
                      Your Question
                    </label>
                    <Textarea
                      id="question"
                      placeholder="Type your question here..."
                      value={questionText}
                      onChange={(e) => setQuestionText(e.target.value)}
                      rows={4}
                      required
                      className="resize-none"
                    />
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    <p>Tips for good questions:</p>
                    <ul className="list-disc list-inside ml-2 mt-1 space-y-1">
                      <li>Be specific and concise</li>
                      <li>Ask about topics relevant to the session</li>
                      <li>Avoid yes/no questions</li>
                    </ul>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end space-x-2 border-t pt-6">
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={() => setActiveTab('browse')}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    className="bg-connect-600 hover:bg-connect-700"
                  >
                    <Send size={16} className="mr-2" />
                    Submit Question
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default AttendeeQuestions;
