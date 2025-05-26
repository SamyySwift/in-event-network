import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layouts/AppLayout';
import { 
  Card, 
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Poll, PollOption, PollVote } from '@/types';
import { useIsMobile } from '@/hooks/use-mobile';
import FloatingPollBanner from '@/components/polls/FloatingPollBanner';
import { BarChart } from 'lucide-react';

// Mock data for polls
const mockPolls: Poll[] = [
  {
    id: '1',
    question: 'Which keynote session are you most looking forward to?',
    options: [
      { id: 'opt1', text: 'AI and Future of Tech', votes: 45 },
      { id: 'opt2', text: 'Sustainable Technology', votes: 32 },
      { id: 'opt3', text: 'Web3 and Blockchain', votes: 28 },
      { id: 'opt4', text: 'UX Design Trends', votes: 37 }
    ],
    startTime: '2025-06-15T10:00:00Z',
    endTime: '2025-06-15T18:00:00Z',
    createdAt: '2025-06-01T14:23:00Z',
    createdBy: 'admin1',
    isActive: true,
    showResults: false,
    displayAsBanner: true
  },
  {
    id: '2',
    question: 'How would you rate the networking reception?',
    options: [
      { id: 'opt1', text: 'Excellent', votes: 28 },
      { id: 'opt2', text: 'Good', votes: 42 },
      { id: 'opt3', text: 'Average', votes: 15 },
      { id: 'opt4', text: 'Poor', votes: 5 }
    ],
    startTime: '2025-06-16T20:00:00Z',
    endTime: '2025-06-17T08:00:00Z',
    createdAt: '2025-06-15T18:30:00Z',
    createdBy: 'admin1',
    isActive: true,
    showResults: true,
    displayAsBanner: false
  }
];

// Mock user votes
const mockUserVotes: PollVote[] = [
  {
    id: 'vote1',
    pollId: '2',
    userId: 'user1',
    optionId: 'opt2',
    timestamp: '2025-06-16T21:15:00Z'
  }
];

const AttendeePolls = () => {
  const [activeTab, setActiveTab] = useState<string>('active');
  const [userVotes, setUserVotes] = useState<PollVote[]>(mockUserVotes);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [floatingPoll, setFloatingPoll] = useState<Poll | null>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Find polls to display as floating banners
  useEffect(() => {
    const now = new Date();
    const activeBannerPolls = mockPolls.filter(poll => 
      poll.isActive && 
      poll.displayAsBanner && 
      new Date(poll.startTime) <= now && 
      new Date(poll.endTime) >= now &&
      !hasUserVotedForPoll(poll.id)
    );
    
    if (activeBannerPolls.length > 0) {
      setFloatingPoll(activeBannerPolls[0]);
    }
  }, [userVotes]);
  
  // Filter polls based on tab
  const filteredPolls = mockPolls.filter(poll => {
    const now = new Date();
    const isPollActive = poll.isActive && 
                        new Date(poll.startTime) <= now && 
                        new Date(poll.endTime) >= now;
    
    if (activeTab === 'active') {
      return isPollActive;
    } else if (activeTab === 'voted') {
      return hasUserVotedForPoll(poll.id) && poll.showResults;
    }
    
    return true; // 'all' tab
  });

  const hasUserVotedForPoll = (pollId: string) => {
    return userVotes.some(vote => vote.pollId === pollId);
  };

  const getUserVoteForPoll = (pollId: string) => {
    return userVotes.find(vote => vote.pollId === pollId)?.optionId;
  };

  const handleVote = (pollId: string, optionId: string) => {
    if (hasUserVotedForPoll(pollId)) return;
    
    // Create new vote
    const newVote: PollVote = {
      id: `vote-${Date.now()}`,
      pollId,
      userId: 'user1', // Would be current user ID in real app
      optionId,
      timestamp: new Date().toISOString()
    };
    
    // Update mock data (in a real app, this would be an API call)
    setUserVotes(prev => [...prev, newVote]);
    
    // Update poll option vote count
    // In a real app, this would be handled by the backend
    
    toast({
      title: "Vote submitted",
      description: "Thank you for your feedback!",
    });
    
    if (floatingPoll?.id === pollId) {
      // Close floating poll after a delay
      setTimeout(() => {
        setFloatingPoll(null);
      }, 2000);
    }
  };

  const handleSelectOption = (pollId: string, optionId: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [pollId]: optionId
    }));
  };

  const calculatePercentage = (votes: number, poll: Poll) => {
    const totalVotes = poll.options.reduce((acc, option) => acc + option.votes, 0);
    if (totalVotes === 0) return 0;
    return Math.round((votes / totalVotes) * 100);
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-start justify-between mb-6 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold">Polls</h1>
            <p className="text-muted-foreground mt-1">
              Share your feedback and see what others think
            </p>
          </div>
        </div>

        <Tabs defaultValue="active" onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="active">Active Polls</TabsTrigger>
            <TabsTrigger value="voted">Your Votes</TabsTrigger>
            <TabsTrigger value="all">All Polls</TabsTrigger>
          </TabsList>
          
          <TabsContent value="active" className="space-y-6">
            {filteredPolls.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2">
                {filteredPolls.map(poll => renderPollCard(poll))}
              </div>
            ) : (
              <Card className="py-16">
                <CardContent className="flex flex-col items-center justify-center text-center">
                  <BarChart className="w-16 h-16 text-muted-foreground opacity-20" />
                  <h3 className="text-xl font-medium mt-4">No active polls</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    Check back soon for new polls from the event organizers
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="voted" className="space-y-6">
            {filteredPolls.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2">
                {filteredPolls.map(poll => renderPollCard(poll))}
              </div>
            ) : (
              <Card className="py-16">
                <CardContent className="flex flex-col items-center justify-center text-center">
                  <BarChart className="w-16 h-16 text-muted-foreground opacity-20" />
                  <h3 className="text-xl font-medium mt-4">No votes yet</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    You haven't voted on any polls yet
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="all" className="space-y-6">
            {filteredPolls.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2">
                {filteredPolls.map(poll => renderPollCard(poll))}
              </div>
            ) : (
              <Card className="py-16">
                <CardContent className="flex flex-col items-center justify-center text-center">
                  <BarChart className="w-16 h-16 text-muted-foreground opacity-20" />
                  <h3 className="text-xl font-medium mt-4">No polls available</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    There are no polls available at this time
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Floating poll banner */}
      {floatingPoll && (
        <FloatingPollBanner 
          poll={floatingPoll}
          onVote={handleVote}
          onClose={() => setFloatingPoll(null)}
        />
      )}
    </AppLayout>
  );
  
  function renderPollCard(poll: Poll) {
    const userVoted = hasUserVotedForPoll(poll.id);
    const userVoteId = getUserVoteForPoll(poll.id);
    const isPollActive = new Date(poll.startTime) <= new Date() && new Date(poll.endTime) >= new Date();
    const showResults = poll.showResults || userVoted;
    
    return (
      <Card key={poll.id} className="overflow-hidden">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">{poll.question}</CardTitle>
              <CardDescription className="mt-1">
                {isPollActive 
                  ? `Ends ${format(new Date(poll.endTime), 'MMM d, h:mm a')}` 
                  : `Ended ${format(new Date(poll.endTime), 'MMM d, yyyy')}`
                }
              </CardDescription>
            </div>
            {userVoted && (
              <Badge 
                className="bg-green-100 text-green-800 hover:bg-green-200"
              >
                You voted
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {showResults ? (
            <div className="space-y-3">
              {poll.options.map((option) => (
                <div key={option.id} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center">
                      {option.text}
                      {option.id === userVoteId && (
                        <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          Your vote
                        </span>
                      )}
                    </span>
                    <span className="font-medium">{calculatePercentage(option.votes, poll)}%</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${option.id === userVoteId ? 'bg-primary' : 'bg-primary/70'}`}
                      style={{ width: `${calculatePercentage(option.votes, poll)}%` }}
                    />
                  </div>
                </div>
              ))}
              <p className="text-xs text-muted-foreground mt-2">
                Total votes: {poll.options.reduce((acc, option) => acc + option.votes, 0)}
              </p>
            </div>
          ) : (
            <RadioGroup 
              value={selectedOptions[poll.id] || ''} 
              onValueChange={(value) => handleSelectOption(poll.id, value)}
              className="space-y-3"
            >
              {poll.options.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.id} id={`${poll.id}-${option.id}`} />
                  <Label htmlFor={`${poll.id}-${option.id}`}>{option.text}</Label>
                </div>
              ))}
            </RadioGroup>
          )}
        </CardContent>
        {!showResults && isPollActive && (
          <CardFooter className="flex justify-end border-t pt-3">
            <Button 
              onClick={() => handleVote(poll.id, selectedOptions[poll.id] || '')}
              disabled={!selectedOptions[poll.id]}
            >
              Submit Vote
            </Button>
          </CardFooter>
        )}
      </Card>
    );
  }
};

export default AttendeePolls;
