
import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { BarChart3, Users, Clock, CheckCircle, Loader } from 'lucide-react';
import { usePolls, usePollVotes } from '@/hooks/usePolls';
import EventAccessGuard from '@/components/EventAccessGuard';
import { useEventParticipation } from '@/hooks/useEventParticipation';

const AttendeePolls = () => {
  const { polls, isLoading } = usePolls();
  const { submitVote, userVotes, isSubmitting } = usePollVotes();
  const { getJoinedEvents, loading: participationLoading } = useEventParticipation();
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  const handleVoteSubmit = async (pollId: string) => {
    const selectedOption = selectedOptions[pollId];
    if (!selectedOption) return;

    try {
      await submitVote({ pollId, optionId: selectedOption });
      // Remove the selected option after successful vote
      setSelectedOptions(prev => ({ ...prev, [pollId]: '' }));
    } catch (error) {
      console.error('Error submitting vote:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (poll: any) => {
    const now = new Date();
    const startTime = new Date(poll.start_time);
    const endTime = poll.end_time ? new Date(poll.end_time) : null;

    if (now < startTime) {
      return <Badge variant="outline">Upcoming</Badge>;
    } else if (endTime && now > endTime) {
      return <Badge variant="secondary">Ended</Badge>;
    } else {
      return <Badge className="bg-green-100 text-green-800">Active</Badge>;
    }
  };

  const isPollActive = (poll: any) => {
    const now = new Date();
    const startTime = new Date(poll.start_time);
    const endTime = poll.end_time ? new Date(poll.end_time) : null;
    
    return now >= startTime && (!endTime || now <= endTime);
  };

  const hasUserVoted = (pollId: string) => {
    return userVotes.some(vote => vote.poll_id === pollId);
  };

  const hasEventAccess = getJoinedEvents().length > 0;

  if (isLoading || participationLoading) {
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
              Event Polls
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Participate in live polls and see real-time results from the community.
            </p>
          </div>

          {polls.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No Polls Available
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  No polls have been created for this event yet. Check back later!
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
                          {poll.question}
                        </CardTitle>
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>Started: {formatDate(poll.start_time)}</span>
                          </div>
                          {poll.end_time && (
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              <span>Ends: {formatDate(poll.end_time)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {getStatusBadge(poll)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isPollActive(poll) && !hasUserVoted(poll.id) ? (
                      <div className="space-y-4">
                        <RadioGroup
                          value={selectedOptions[poll.id] || ''}
                          onValueChange={(value) => 
                            setSelectedOptions(prev => ({ ...prev, [poll.id]: value }))
                          }
                        >
                          {poll.options.map((option, index) => (
                            <div key={option.id || index} className="flex items-center space-x-2">
                              <RadioGroupItem value={option.id || option.text} id={`${poll.id}-${index}`} />
                              <Label htmlFor={`${poll.id}-${index}`} className="flex-1 cursor-pointer">
                                {option.text}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                        <Button
                          onClick={() => handleVoteSubmit(poll.id)}
                          disabled={!selectedOptions[poll.id] || isSubmitting}
                          className="w-full"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader className="h-4 w-4 mr-2 animate-spin" />
                              Submitting Vote...
                            </>
                          ) : (
                            'Submit Vote'
                          )}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {hasUserVoted(poll.id) && (
                          <div className="flex items-center text-green-600 mb-4">
                            <CheckCircle className="h-5 w-5 mr-2" />
                            <span className="font-medium">You've already voted in this poll</span>
                          </div>
                        )}
                        
                        <h4 className="font-medium text-gray-900 dark:text-white mb-3">Results:</h4>
                        <div className="space-y-3">
                          {poll.options.map((option, index) => {
                            const voteCount = option.votes || 0;
                            const totalVotes = poll.options.reduce((acc, opt) => acc + (opt.votes || 0), 0);
                            const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
                            
                            return (
                              <div key={option.id || index} className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="font-medium">{option.text}</span>
                                  <span className="text-gray-500">
                                    {voteCount} votes ({percentage.toFixed(1)}%)
                                  </span>
                                </div>
                                <Progress value={percentage} className="h-2" />
                              </div>
                            );
                          })}
                        </div>
                        
                        <div className="flex items-center justify-between pt-2 text-sm text-gray-500 border-t">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            <span>Total votes: {poll.options.reduce((acc, opt) => acc + (opt.votes || 0), 0)}</span>
                          </div>
                        </div>
                      </div>
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
