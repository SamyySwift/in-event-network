
import React from 'react';
import { BarChart3, Clock, Users, Vote, Loader } from 'lucide-react';
import AppLayout from '@/components/layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { usePolls } from '@/hooks/usePolls';
import EventAccessGuard from '@/components/EventAccessGuard';
import { useEventParticipation } from '@/hooks/useEventParticipation';

const AttendeePolls = () => {
  const { polls, isLoading } = usePolls();
  const { getJoinedEvents, loading: participationLoading } = useEventParticipation();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const isActivePoll = (poll: any) => {
    const now = new Date();
    const startTime = new Date(poll.start_time);
    const endTime = new Date(poll.end_time);
    return now >= startTime && now <= endTime && poll.is_active;
  };

  const getVoteCount = (option: any) => {
    return option.votes || 0;
  };

  const getTotalVotes = (poll: any) => {
    if (!poll.options || !Array.isArray(poll.options)) return 0;
    return poll.options.reduce((total: number, option: any) => total + getVoteCount(option), 0);
  };

  const getVotePercentage = (option: any, totalVotes: number) => {
    if (totalVotes === 0) return 0;
    return Math.round((getVoteCount(option) / totalVotes) * 100);
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
              Live Polls
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Participate in live polls and see real-time results from the event.
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
                  Check back later for live polls from the event organizers.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {polls.map((poll) => {
                const totalVotes = getTotalVotes(poll);
                const isActive = isActivePoll(poll);
                
                return (
                  <Card key={poll.id} className={`overflow-hidden ${isActive ? 'border-green-200 bg-green-50/50' : ''}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl text-gray-900 dark:text-white">
                            {poll.question}
                          </CardTitle>
                          <CardDescription className="text-gray-600 dark:text-gray-400 mt-2">
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                Ends: {formatDate(poll.end_time)}
                              </div>
                              <div className="flex items-center">
                                <Users className="h-4 w-4 mr-1" />
                                {totalVotes} votes
                              </div>
                            </div>
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          {isActive && (
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                              Active
                            </Badge>
                          )}
                          {poll.display_as_banner && (
                            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                              Featured
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {poll.options && Array.isArray(poll.options) && poll.options.map((option: any, index: number) => {
                          const voteCount = getVoteCount(option);
                          const percentage = getVotePercentage(option, totalVotes);
                          
                          return (
                            <div key={index} className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">{option.text || option.label}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-gray-600">{voteCount} votes</span>
                                  <span className="text-sm font-medium">{percentage}%</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <Progress value={percentage} className="flex-1" />
                                {isActive && (
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    className="text-xs"
                                    disabled={!isActive}
                                  >
                                    <Vote className="h-3 w-3 mr-1" />
                                    Vote
                                  </Button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      {!isActive && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg text-center">
                          <p className="text-sm text-gray-600">This poll has ended</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </EventAccessGuard>
    </AppLayout>
  );
};

export default AttendeePolls;
