
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
import { usePolls, usePollVotes, Poll } from '@/hooks/usePolls';
import { useIsMobile } from '@/hooks/use-mobile';
import FloatingPollBanner from '@/components/polls/FloatingPollBanner';
import { BarChart, Loader } from 'lucide-react';

const AttendeePolls = () => {
  const [activeTab, setActiveTab] = useState<string>('active');
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [floatingPoll, setFloatingPoll] = useState<Poll | null>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const { polls, isLoading } = usePolls();
  const { userVotes, submitVote, isSubmitting } = usePollVotes();

  // Helper functions
  const hasUserVotedForPoll = (pollId: string) => {
    return userVotes.some(vote => vote.poll_id === pollId);
  };

  const getUserVoteForPoll = (pollId: string) => {
    return userVotes.find(vote => vote.poll_id === pollId)?.option_id;
  };

  // Find polls to display as floating banners
  useEffect(() => {
    const now = new Date();
    const activeBannerPolls = polls.filter(poll => 
      poll.is_active && 
      poll.display_as_banner && 
      new Date(poll.start_time) <= now && 
      new Date(poll.end_time) >= now &&
      !hasUserVotedForPoll(poll.id)
    );
    
    if (activeBannerPolls.length > 0) {
      setFloatingPoll(activeBannerPolls[0]);
    } else {
      setFloatingPoll(null);
    }
  }, [polls, userVotes]);
  
  // Filter polls based on tab
  const filteredPolls = polls.filter(poll => {
    const now = new Date();
    const isPollActive = poll.is_active && 
                        new Date(poll.start_time) <= now && 
                        new Date(poll.end_time) >= now;
    
    if (activeTab === 'active') {
      return isPollActive;
    } else if (activeTab === 'voted') {
      return hasUserVotedForPoll(poll.id) && poll.show_results;
    }
    
    return true; // 'all' tab
  });

  const handleVote = (pollId: string, optionId: string) => {
    if (hasUserVotedForPoll(pollId)) return;
    
    submitVote({ pollId, optionId });
    
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
    const totalVotes = poll.options.reduce((acc, option) => acc + (option.votes || 0), 0);
    if (totalVotes === 0) return 0;
    return Math.round((votes / totalVotes) * 100);
  };

  function renderPollCard(poll: Poll) {
    const userVoted = hasUserVotedForPoll(poll.id);
    const userVoteId = getUserVoteForPoll(poll.id);
    const isPollActive = new Date(poll.start_time) <= new Date() && new Date(poll.end_time) >= new Date();
    const showResults = poll.show_results || userVoted;
    
    return (
      <Card key={poll.id} className="overflow-hidden">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">{poll.question}</CardTitle>
              <CardDescription className="mt-1">
                {isPollActive 
                  ? `Ends ${format(new Date(poll.end_time), 'MMM d, h:mm a')}` 
                  : `Ended ${format(new Date(poll.end_time), 'MMM d, yyyy')}`
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
                    <span className="font-medium">{calculatePercentage(option.votes || 0, poll)}%</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${option.id === userVoteId ? 'bg-primary' : 'bg-primary/70'}`}
                      style={{ width: `${calculatePercentage(option.votes || 0, poll)}%` }}
                    />
                  </div>
                </div>
              ))}
              <p className="text-xs text-muted-foreground mt-2">
                Total votes: {poll.options.reduce((acc, option) => acc + (option.votes || 0), 0)}
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
              disabled={!selectedOptions[poll.id] || isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Vote'}
            </Button>
          </CardFooter>
        )}
      </Card>
    );
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader className="mx-auto h-12 w-12 animate-spin text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">Loading polls...</p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

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
};

export default AttendeePolls;
