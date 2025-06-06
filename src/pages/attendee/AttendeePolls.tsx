import React, { useState, useEffect } from 'react';
import { BarChart3, Clock, Users, CheckCircle, Loader } from 'lucide-react';
import AppLayout from '@/components/layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { usePolls } from '@/hooks/usePolls';
import { useToast } from '@/hooks/use-toast';
import EventAccessGuard from '@/components/EventAccessGuard';
import { useEventParticipation } from '@/hooks/useEventParticipation';

const AttendeePolls = () => {
  const { polls, userVotes, loading, votePoll, refetch } = usePolls();
  const { toast } = useToast();
  const { getJoinedEvents, loading: participationLoading } = useEventParticipation();
  const [selectedOptions, setSelectedOptions] = useState<{ [key: string]: string }>({});

  const handleOptionChange = (pollId: string, optionId: string) => {
    setSelectedOptions(prev => ({ ...prev, [pollId]: optionId }));
  };

  const handleSubmit = async (pollId: string) => {
    if (!selectedOptions[pollId]) {
      toast({
        title: "Error",
        description: "Please select an option before submitting.",
        variant: "destructive",
      });
      return;
    }

    try {
      await votePoll(pollId, selectedOptions[pollId]);
      toast({
        title: "Vote submitted",
        description: "Thank you for voting!",
      });
      refetch(); // Refresh polls to update results
    } catch (error) {
      console.error("Error submitting vote:", error);
      toast({
        title: "Error",
        description: "Failed to submit vote. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getVotePercentage = (pollId: string, optionId: string) => {
    const poll = polls.find(p => p.id === pollId);
    if (!poll || !poll.options) return 0;

    const totalVotes = poll.options.reduce((sum, option) => sum + (option.votes || 0), 0);
    if (totalVotes === 0) return 0;

    const option = poll.options.find(opt => opt.id === optionId);
    if (!option) return 0;

    return (option.votes || 0) / totalVotes * 100;
  };

  const hasVoted = (pollId: string) => {
    return userVotes.some(vote => vote.poll_id === pollId);
  };

  const hasEventAccess = getJoinedEvents().length > 0;

  if (loading || participationLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <Loader className="h-8 w-8 animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <EventAccessGuard hasAccess={hasEventAccess} loading={participationLoading}>
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
              <BarChart3 className="h-8 w-8 mr-3" />
              Live Polls
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Participate in live polls and see what other attendees are thinking.
            </p>
          </div>

          {polls.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No Active Polls
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Check back later for live polls during the event.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {polls.map((poll) => (
                <Card key={poll.id} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl text-gray-900 dark:text-white">
                          {poll.title}
                        </CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-400">
                          <div className="flex items-center text-sm">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>Open until {new Date(poll.end_time).toLocaleString()}</span>
                          </div>
                        </CardDescription>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300">
                        {poll.type}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {hasVoted(poll.id) ? (
                      <div>
                        <h4 className="mb-4 font-semibold text-gray-700 dark:text-gray-300">
                          Results:
                        </h4>
                        <div className="space-y-3">
                          {poll.options && poll.options.map((option) => (
                            <div key={option.id} className="space-y-1">
                              <div className="flex items-center justify-between">
                                <Label htmlFor={option.id} className="text-sm font-medium">
                                  {option.text}
                                </Label>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                  {getVotePercentage(poll.id, option.id).toFixed(1)}%
                                </span>
                              </div>
                              <Progress value={getVotePercentage(poll.id, option.id)} />
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <RadioGroup onValueChange={(value) => handleOptionChange(poll.id, value)}>
                        <div className="space-y-3">
                          {poll.options && poll.options.map((option) => (
                            <div key={option.id} className="flex items-center space-x-2">
                              <RadioGroupItem value={option.id} id={option.id} />
                              <Label htmlFor={option.id}>{option.text}</Label>
                            </div>
                          ))}
                        </div>
                        <Button
                          className="mt-4 bg-connect-600 hover:bg-connect-700"
                          onClick={() => handleSubmit(poll.id)}
                        >
                          Submit Vote
                        </Button>
                      </RadioGroup>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </EventAccessGuard>
    </AppLayout>
  );
};

export default AttendeePolls;
