import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, MapPin, MessageSquare, Clock, Star, BookOpen, Wifi, WifiOff, ChevronRight, Zap, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AppLayout from '@/components/layouts/AppLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useDashboard } from '@/hooks/useDashboard';
import { Skeleton } from '@/components/ui/skeleton';
import { AttendeeEventProvider, useAttendeeEventContext } from '@/contexts/AttendeeEventContext';
import AttendeeRouteGuard from '@/components/attendee/AttendeeRouteGuard';

const AttendeeDashboardContent = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { hasJoinedEvent, isLoading: contextLoading } = useAttendeeEventContext();
  const { dashboardData, isLoading, error } = useDashboard();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  // Show loading state while checking event context
  if (contextLoading || isLoading) {
    return (
      <div className="animate-fade-in max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <Skeleton className="h-12 w-80 mb-4" />
          <Skeleton className="h-6 w-64" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Skeleton className="h-64 w-full" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="animate-fade-in max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <WifiOff className="h-16 w-16 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-semibold mb-3 text-gray-900">Connection Error</h3>
            <p className="text-gray-500 mb-4">Unable to load dashboard data</p>
            <Button onClick={() => window.location.reload()} className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
              Retry Connection
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show message if user hasn't joined any event
  if (!hasJoinedEvent || !dashboardData) {
    return (
      <div className="animate-fade-in max-w-7xl mx-auto p-6">
        {/* Hero Section */}
        <div className="mb-8 relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-8 sm:p-12 text-white">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10 text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="h-10 w-10" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">Welcome to Kconect</h1>
            <p className="text-lg sm:text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Join amazing events, connect with people, and create memorable experiences
            </p>
            <Button 
              onClick={() => navigate('/scan')} 
              size="lg"
              className="bg-white/20 hover:bg-white/30 border-2 border-white/30 backdrop-blur-sm text-white font-semibold px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-lg w-full sm:w-auto"
            >
              <Zap className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              <span className="truncate">Scan QR Code to Join Event</span>
            </Button>
          </div>
          <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full"></div>
          <div className="absolute -top-16 -left-16 w-40 h-40 bg-white/5 rounded-full"></div>
        </div>
      </div>
    );
  }

  const { currentEvent, upcomingEvents, nextSession, recentAnnouncements, suggestedConnections } = dashboardData;

  return (
    <div className="animate-fade-in max-w-7xl mx-auto p-6">
      {/* Hero Header */}
      <div className="mb-8 relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-6 sm:p-8 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium uppercase tracking-wider opacity-90">Live Dashboard</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">
                Welcome back, {currentUser?.name?.split(' ')[0]}!
              </h1>
              <p className="text-base sm:text-lg opacity-90">
                Your event experience, updated in real-time
              </p>
            </div>
            <Button 
              onClick={() => navigate('/scan')} 
              className="bg-white/20 hover:bg-white/30 border border-white/30 backdrop-blur-sm w-full sm:w-auto"
            >
              <Zap className="mr-2 h-4 w-4" />
              <span className="truncate">Scan New Event</span>
            </Button>
          </div>
        </div>
        <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-white/10 rounded-full"></div>
        <div className="absolute -top-8 -left-8 w-24 h-24 bg-white/5 rounded-full"></div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Current/Next Event Card */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden group hover:shadow-2xl transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 to-indigo-50/80"></div>
            <CardHeader className="relative z-10 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {currentEvent ? (
                    <>
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                        <Wifi className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl">Live Event</CardTitle>
                        <CardDescription>You're attending now</CardDescription>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl">Next Event</CardTitle>
                        <CardDescription>Coming up next</CardDescription>
                      </div>
                    </>
                  )}
                </div>
                <Badge className={`${currentEvent ? 'bg-green-500' : 'bg-blue-500'} text-white border-0`}>
                  {currentEvent ? 'LIVE' : 'UPCOMING'}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="relative z-10 pb-6">
              {currentEvent || upcomingEvents?.[0] ? (
                <>
                  <h3 className="text-2xl font-bold mb-4 text-gray-900">
                    {(currentEvent || upcomingEvents?.[0])?.name}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-gray-700">
                      <Clock className="h-5 w-5 text-indigo-500" />
                      <span className="font-medium">
                        {currentEvent ? (
                          `Started: ${formatTime(currentEvent.start_time)} - Ends: ${formatTime(currentEvent.end_time)}`
                        ) : (
                          `Starts: ${formatDate(upcomingEvents[0].start_time)}`
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <MapPin className="h-5 w-5 text-indigo-500" />
                      <span className="font-medium">{(currentEvent || upcomingEvents?.[0])?.location || 'Online Event'}</span>
                    </div>
                    {(currentEvent || upcomingEvents?.[0])?.description && (
                      <p className="text-gray-600 mt-4 leading-relaxed">
                        {(currentEvent || upcomingEvents?.[0])?.description}
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Events Scheduled</h3>
                  <p className="text-gray-500">Check back later for upcoming events</p>
                </div>
              )}
            </CardContent>
            
            {(currentEvent || upcomingEvents?.[0]) && (
              <CardFooter className="relative z-10 flex flex-col sm:flex-row gap-3 bg-gray-50/50 backdrop-blur-sm">
                <Button variant="outline" onClick={() => navigate('/attendee/map')} className="flex-1 w-full sm:w-auto">
                  <MapPin className="mr-2 h-4 w-4" />
                  <span className="truncate">Find Your Way</span>
                </Button>
                <Button onClick={() => navigate('/attendee/schedule')} className="flex-1 w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                  <Calendar className="mr-2 h-4 w-4" />
                  <span className="truncate">View Schedule</span>
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
        
        {/* Next Session Card */}
        <div>
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden group hover:shadow-2xl transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/80 to-orange-50/80"></div>
            <CardHeader className="relative z-10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <Star className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">Next Session</CardTitle>
                  <CardDescription>Upcoming speaker</CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="relative z-10 pb-6">
              {nextSession ? (
                <>
                  <h3 className="text-lg font-bold mb-3 text-gray-900">
                    {nextSession.session_title || 'Speaker Session'}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-gray-700">
                      <Clock className="h-4 w-4 text-orange-500" />
                      <span className="text-sm font-medium">{formatDate(nextSession.session_time)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <Users className="h-4 w-4 text-orange-500" />
                      <span className="text-sm font-medium">by {nextSession.name}</span>
                    </div>
                    {nextSession.title && (
                      <p className="text-xs text-gray-600 mt-2">{nextSession.title}</p>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No sessions scheduled</p>
                </div>
              )}
            </CardContent>
            
            <CardFooter className="relative z-10 bg-gray-50/50 backdrop-blur-sm">
              <Button variant="outline" className="w-full" onClick={() => navigate('/attendee/questions')}>
                <MessageSquare className="mr-2 h-4 w-4" />
                Ask a Question
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Recent Announcements */}
      {recentAnnouncements && recentAnnouncements.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Latest Updates</h2>
              <p className="text-gray-500">Stay informed with recent announcements</p>
            </div>
          </div>
          <div className="grid gap-4">
            {recentAnnouncements.map((announcement) => (
              <Card key={announcement.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-500 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900 mb-2">{announcement.title}</h3>
                      <p className="text-gray-600 leading-relaxed">
                        {announcement.content}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 ml-6">
                      <Badge variant={announcement.priority === 'high' ? 'destructive' : 'outline'} className="font-medium">
                        {announcement.priority}
                      </Badge>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
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
      
      {/* Quick Actions Grid */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
            <p className="text-gray-500">Everything you need at your fingertips</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { name: 'Event Rules', href: '/attendee/rules', icon: BookOpen, gradient: 'from-emerald-500 to-teal-600' },
            { name: 'Network', href: '/attendee/networking', icon: Users, gradient: 'from-blue-500 to-indigo-600' },
            { name: 'Q&A', href: '/attendee/questions', icon: MessageSquare, gradient: 'from-purple-500 to-violet-600' },
            { name: 'Find Way', href: '/attendee/map', icon: MapPin, gradient: 'from-red-500 to-pink-600' },
          ].map((action) => (
            <Card 
              key={action.name}
              className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-0 shadow-lg overflow-hidden bg-white/80 backdrop-blur-sm hover:-translate-y-1" 
              onClick={() => navigate(action.href)}
            >
              <CardContent className="p-6 text-center relative">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-gray-100/50 group-hover:from-gray-100/50 group-hover:to-gray-200/50 transition-all duration-300"></div>
                <div className="relative z-10">
                  <div className={`w-12 h-12 bg-gradient-to-br ${action.gradient} rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <p className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                    {action.name}
                  </p>
                  <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-indigo-500 mx-auto mt-2 transition-colors" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      {/* Suggested Connections */}
      {suggestedConnections && suggestedConnections.length > 0 && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">People to Meet</h2>
                <p className="text-gray-500">Expand your network with these connections</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => navigate('/attendee/search')} className="hover:bg-gray-50">
              View All
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {suggestedConnections.map(connection => (
              <Card key={connection.id} className="group overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <Avatar className="h-14 w-14 border-2 border-white shadow-md">
                      {connection.photo_url ? (
                        <AvatarImage src={connection.photo_url} alt={connection.name} />
                      ) : (
                        <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-lg font-semibold">
                          {connection.name?.split(' ').map(n => n[0]).join('') || '?'}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{connection.name || 'Unknown'}</h3>
                      <p className="text-sm text-gray-500 truncate">
                        {connection.niche || connection.company || 'Professional'}
                      </p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700" 
                    onClick={() => navigate(`/attendee/profile/${connection.id}`)}
                  >
                    View Profile
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      {/* Event Feedback */}
      {currentEvent && (
        <Card className="border-0 shadow-xl bg-gradient-to-r from-gray-50 to-gray-100 overflow-hidden">
          <CardContent className="p-8">
            <div className="flex flex-col sm:flex-row items-center justify-between">
              <div className="text-center sm:text-left mb-6 sm:mb-0">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">How's your experience?</h3>
                <p className="text-gray-600 text-lg">
                  Your feedback helps us create even better events
                </p>
              </div>
              <Button 
                size="lg"
                className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-semibold px-8 py-4" 
                onClick={() => navigate('/attendee/rate')}
              >
                <Star className="mr-2 h-5 w-5" />
                Rate This Event
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const AttendeeDashboard = () => {
  return (
    <AppLayout>
      <AttendeeEventProvider>
        <AttendeeRouteGuard requireEvent={false}>
          <AttendeeDashboardContent />
        </AttendeeRouteGuard>
      </AttendeeEventProvider>
    </AppLayout>
  );
};

export default AttendeeDashboard;
