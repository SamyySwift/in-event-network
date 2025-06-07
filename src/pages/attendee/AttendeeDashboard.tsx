
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, MapPin, MessageSquare, Clock, Star, BookOpen, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AppLayout from '@/components/layouts/AppLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useDashboard } from '@/hooks/useDashboard';
import { Skeleton } from '@/components/ui/skeleton';
import { useQueryClient } from '@tanstack/react-query';

const AttendeeDashboard = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { dashboardData, isLoading, error } = useDashboard();
  const queryClient = useQueryClient();

  // Reset dashboard data when user changes or when component mounts
  useEffect(() => {
    if (currentUser?.id) {
      // Clear all cached data to ensure fresh load based on access key
      queryClient.clear();
    }
  }, [currentUser?.id, queryClient]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Skeleton className="h-48 w-full" />
            </div>
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <WifiOff className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Unable to load dashboard data</p>
              <Button onClick={() => window.location.reload()} variant="outline" className="mt-2">
                Retry
              </Button>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  const {
    currentEvent,
    upcomingEvents,
    nextSession,
    recentAnnouncements,
    suggestedConnections
  } = dashboardData || {};

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
              <Wifi className="h-6 w-6 text-green-500" />
              Welcome back, {currentUser?.name?.split(' ')[0]}
            </h1>
            <p className="text-muted-foreground">Live dashboard updated every 30 seconds</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Current Event Card */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader className="bg-connect-50 border-b">
                <CardTitle className="text-xl flex items-center gap-2">
                  {currentEvent ? (
                    <>
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      Live Event
                    </>
                  ) : (
                    <>
                      <Calendar className="h-5 w-5" />
                      {upcomingEvents?.[0] ? 'Next Event' : 'No Events Scheduled'}
                    </>
                  )}
                </CardTitle>
                <CardDescription>
                  {currentEvent ? 'You\'re attending this event now' : 'Upcoming event information'}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {currentEvent || upcomingEvents?.[0] ? (
                  <>
                    <h3 className="text-xl font-semibold mb-2">
                      {(currentEvent || upcomingEvents?.[0])?.name}
                    </h3>
                    <div className="flex flex-col space-y-3 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>
                          {currentEvent 
                            ? `Started: ${formatTime(currentEvent.start_time)} - Ends: ${formatTime(currentEvent.end_time)}` 
                            : `Starts: ${formatDate(upcomingEvents[0].start_time)}`
                          }
                        </span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{(currentEvent || upcomingEvents?.[0])?.location || 'Online'}</span>
                      </div>
                      {(currentEvent || upcomingEvents?.[0])?.description && (
                        <p className="text-sm mt-2">
                          {(currentEvent || upcomingEvents?.[0])?.description}
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No events scheduled at this time</p>
                  </div>
                )}
              </CardContent>
              {(currentEvent || upcomingEvents?.[0]) && (
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => navigate('/attendee/map')}>
                    Find Your Way
                  </Button>
                  <Button onClick={() => navigate('/attendee/schedule')}>
                    View Schedule
                  </Button>
                </CardFooter>
              )}
            </Card>
          </div>
          
          {/* Next Session Card */}
          <div>
            <Card>
              <CardHeader className="bg-yellow-50 border-b">
                <CardTitle className="text-xl">Next Session</CardTitle>
                <CardDescription>
                  {nextSession ? 'Upcoming speaker session' : 'No sessions scheduled'}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {nextSession ? (
                  <>
                    <h3 className="text-lg font-semibold mb-2">
                      {nextSession.session_title || 'Speaker Session'}
                    </h3>
                    <div className="flex flex-col space-y-3 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>{formatDate(nextSession.session_time)}</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        <span>Speaker: {nextSession.name}</span>
                      </div>
                      {nextSession.title && (
                        <p className="text-xs">{nextSession.title}</p>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No sessions scheduled</p>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => navigate('/attendee/questions')}>
                  Ask a Question
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>

        {/* Recent Announcements */}
        {recentAnnouncements && recentAnnouncements.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Recent Announcements
            </h2>
            <div className="grid gap-4">
              {recentAnnouncements.map(announcement => (
                <Card key={announcement.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium">{announcement.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {announcement.content}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Badge variant={announcement.priority === 'high' ? 'destructive' : 'outline'}>
                          {announcement.priority}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(announcement.created_at)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
        
        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/attendee/rules')}>
              <CardContent className="p-4 text-center">
                <BookOpen className="h-8 w-8 mx-auto mb-2 text-connect-600" />
                <p className="text-sm font-medium">Event Rules</p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/attendee/networking')}>
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 mx-auto mb-2 text-connect-600" />
                <p className="text-sm font-medium">Network</p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/attendee/questions')}>
              <CardContent className="p-4 text-center">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 text-connect-600" />
                <p className="text-sm font-medium">Q&A</p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/attendee/map')}>
              <CardContent className="p-4 text-center">
                <MapPin className="h-8 w-8 mx-auto mb-2 text-connect-600" />
                <p className="text-sm font-medium">Find Way</p>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Suggested Connections */}
        {suggestedConnections && suggestedConnections.length > 0 && (
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">People You Might Want to Meet</h2>
              <Button variant="link" className="text-connect-600 p-0" onClick={() => navigate('/attendee/search')}>
                View All
              </Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {suggestedConnections.map(connection => (
                <Card key={connection.id} className="overflow-hidden">
                  <div className="p-4 flex space-x-4">
                    <Avatar className="h-12 w-12">
                      {connection.photo_url ? (
                        <AvatarImage src={connection.photo_url} alt={connection.name} />
                      ) : (
                        <AvatarFallback className="bg-connect-100 text-connect-600">
                          {connection.name?.split(' ').map(n => n[0]).join('') || '?'}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-medium">{connection.name || 'Unknown'}</h3>
                      <p className="text-sm text-muted-foreground">
                        {connection.niche || connection.company || 'Professional'}
                      </p>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="mt-2 text-xs h-8" 
                        onClick={() => navigate(`/attendee/profile/${connection.id}`)}
                      >
                        View Profile
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
        
        {/* Event Feedback */}
        {currentEvent && (
          <div className="mt-8 bg-gray-50 rounded-lg p-6 flex flex-col sm:flex-row items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">How's your event experience?</h3>
              <p className="text-muted-foreground text-sm">Help improve future events by sharing your feedback</p>
            </div>
            <Button 
              className="mt-4 sm:mt-0 flex items-center" 
              variant="outline" 
              onClick={() => navigate('/attendee/rate')}
            >
              <Star className="h-4 w-4 mr-2" />
              Rate this Event
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default AttendeeDashboard;
