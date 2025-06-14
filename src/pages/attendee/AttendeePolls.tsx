
import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layouts/AppLayout';
import FloatingPollBanner from '@/components/polls/FloatingPollBanner';
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
import { useAttendeePolls, Poll } from '@/hooks/useAttendeePolls';
import { useIsMobile } from '@/hooks/use-mobile';
import { BarChart, Loader, ListChecks } from 'lucide-react';
import AttendeeRouteGuard from '@/components/attendee/AttendeeRouteGuard';

const AttendeePolls = () => {
  const [activeTab, setActiveTab] = useState<string>('active');
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [activeBannerPoll, setActiveBannerPoll] = useState<Poll | null>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const { polls, userVotes, submitVote, isSubmitting, isLoading } = useAttendeePolls();

  // Check for active banner polls
  useEffect(() => {
    const bannerPoll = polls.find(poll => poll.is_active && (poll as any).display_as_banner);
    if (bannerPoll && !hasUserVotedForPoll(bannerPoll.id)) {
      setActiveBannerPoll(bannerPoll);
    }
  }, [polls]);

  // Helper functions
  const hasUserVotedForPoll = (pollId: string) => {
    return userVotes.some(vote => vote.poll_id === pollId);
  };

  const getUserVoteForPoll = (pollId: string) => {
    return userVotes.find(vote => vote.poll_id === pollId)?.option_id;
  };
  
  // Filter polls based on tab
  const filteredPolls = polls.filter(poll => {
    if (activeTab === 'active') {
      return poll.is_active;
    } else if (activeTab === 'voted') {
      return hasUserVotedForPoll(poll.id) && poll.show_results;
    }
    return true; // 'all' tab
  });

  const handleVote = (pollId: string, optionId: string) => {
    if (hasUserVotedForPoll(pollId)) {
      toast({
        title: "Already voted",
        description: "You have already voted on this poll",
        variant: "destructive"
      });
      return;
    }
    if (!optionId) {
      toast({
        title: "Selection required",
        description: "Please select an option before voting",
        variant: "destructive"
      });
      return;
    }
    submitVote({ pollId, optionId });
    // Close banner if this was a banner poll
    if (activeBannerPoll?.id === pollId) {
      setActiveBannerPoll(null);
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
    const showResults = poll.show_results || userVoted;

    return (
      <Card
        key={poll.id}
        className="rounded-2xl bg-white/95 dark:bg-gray-900/80 backdrop-blur shadow-md border-0 hover:shadow-2xl transition-shadow duration-200"
      >
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">{poll.question}</CardTitle>
              <CardDescription className="mt-1 text-sm">
                Created {format(new Date(poll.created_at), 'MMM d, yyyy')}
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
        {!showResults && poll.is_active && (
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
        <div className="max-w-4xl mx-auto px-4 py-8">
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

  // === DESIGN OVERHAUL STARTS HERE ===
  return (
    <AppLayout>
      <AttendeeRouteGuard>
        <div className="animate-fade-in max-w-4xl mx-auto px-0 sm:px-6 pb-8">

          {/* HERO Gradient Header */}
          <div className="mb-8 relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-6 sm:p-10 text-white z-10 shadow-xl">
            <div className="absolute inset-0 bg-black/25 z-0"></div>
            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex flex-col items-center sm:items-start">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
                    <ListChecks className="h-8 w-8 text-yellow-300" />
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-bold mb-2">Live Polls</h1>
                  <p className="text-lg opacity-95 max-w-2xl">
                    Participate in polls and see what the community thinks!
                  </p>
                </div>
                <div className="flex flex-col items-center sm:items-end space-y-1 mt-4 sm:mt-0">
                  <div className="flex space-x-2">
                    <Badge variant="info" className="font-medium">
                      {polls.filter(p => p.is_active).length} Active
                    </Badge>
                    <Badge variant="warning" className="font-medium">
                      {userVotes.length} My Votes
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-12 -right-12 w-44 h-44 bg-white/10 rounded-full z-0"></div>
            <div className="absolute -top-12 -left-12 w-60 h-60 bg-white/5 rounded-full z-0"></div>
          </div>

          {/* Polls section with Card UI */}
          <Card className="rounded-2xl shadow-lg bg-white/95 backdrop-blur-sm border-0 mb-8">
            <CardContent className="p-6">

              <Tabs defaultValue="active" onValueChange={setActiveTab} className="w-full">
                <TabsList className="mb-6 bg-white/80 rounded-xl shadow-md grid grid-cols-3">
                  <TabsTrigger value="active" className="text-xs sm:text-sm">Active Polls</TabsTrigger>
                  <TabsTrigger value="voted" className="text-xs sm:text-sm">Your Votes</TabsTrigger>
                  <TabsTrigger value="all" className="text-xs sm:text-sm">All Polls</TabsTrigger>
                </TabsList>
                
                <TabsContent value="active" className="space-y-6">
                  {filteredPolls.length > 0 ? (
                    <div className="grid gap-6">
                      {filteredPolls.map(poll => renderPollCard(poll))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center text-center py-12">
                        <BarChart className="w-16 h-16 text-muted-foreground opacity-20" />
                        <h3 className="text-xl font-medium mt-4">No active polls</h3>
                        <p className="text-muted-foreground text-sm mt-1">
                          Check back soon for new polls from organizers!
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
                
                <TabsContent value="voted" className="space-y-6">
                  {filteredPolls.length > 0 ? (
                    <div className="grid gap-6">
                      {filteredPolls.map(poll => renderPollCard(poll))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center text-center py-12">
                        <BarChart className="w-16 h-16 text-muted-foreground opacity-20" />
                        <h3 className="text-xl font-medium mt-4">No votes yet</h3>
                        <p className="text-muted-foreground text-sm mt-1">
                          You haven't voted on any polls yet.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
                
                <TabsContent value="all" className="space-y-6">
                  {filteredPolls.length > 0 ? (
                    <div className="grid gap-6">
                      {filteredPolls.map(poll => renderPollCard(poll))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center text-center py-12">
                        <BarChart className="w-16 h-16 text-muted-foreground opacity-20" />
                        <h3 className="text-xl font-medium mt-4">No polls available</h3>
                        <p className="text-muted-foreground text-sm mt-1">
                          There are no polls available at this time.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Floating Poll Banner */}
          {activeBannerPoll && (
            <FloatingPollBanner
              poll={activeBannerPoll}
              onVote={handleVote}
              onClose={() => setActiveBannerPoll(null)}
              hasUserVoted={hasUserVotedForPoll(activeBannerPoll.id)}
              userVote={getUserVoteForPoll(activeBannerPoll.id)}
            />
          )}
        </div>
      </AttendeeRouteGuard>
    </AppLayout>
  );
};

export default AttendeePolls;
