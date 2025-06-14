
import React, { useState } from 'react';
import AppLayout from '@/components/layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Megaphone, Clock, Loader, AlertCircle, Search, Filter, Bell, BellRing, Calendar, User, Eye, ChevronRight, Sparkles, TrendingUp } from 'lucide-react';
import { useAttendeeAnnouncements } from '@/hooks/useAttendeeAnnouncements';
import { AttendeeEventProvider } from '@/contexts/AttendeeEventContext';
import AttendeeRouteGuard from '@/components/attendee/AttendeeRouteGuard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const AttendeeAnnouncementsContent = () => {
  const { announcements, isLoading, error } = useAttendeeAnnouncements();
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [expandedAnnouncement, setExpandedAnnouncement] = useState<string | null>(null);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600';
      case 'normal': return 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600';
      case 'low': return 'bg-gradient-to-r from-gray-500 to-slate-500 text-white hover:from-gray-600 hover:to-slate-600';
      default: return 'bg-gradient-to-r from-gray-500 to-slate-500 text-white hover:from-gray-600 hover:to-slate-600';
    }
  };

  const getPriorityGradient = (priority: string) => {
    switch (priority) {
      case 'high': return 'from-red-50 to-pink-50 border-red-200';
      case 'normal': return 'from-blue-50 to-indigo-50 border-blue-200';
      case 'low': return 'from-gray-50 to-slate-50 border-gray-200';
      default: return 'from-gray-50 to-slate-50 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         announcement.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = priorityFilter === 'all' || announcement.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  const toggleExpanded = (id: string) => {
    setExpandedAnnouncement(expandedAnnouncement === id ? null : id);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Megaphone className="h-10 w-10 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-pink-500 to-red-500 rounded-full animate-bounce">
              <Sparkles className="h-4 w-4 text-white p-1" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-32 mx-auto animate-pulse"></div>
            <div className="h-3 bg-gray-100 rounded w-24 mx-auto animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-6">
        <Alert className="max-w-md border-red-200 bg-white shadow-xl">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <AlertDescription className="text-red-700 font-medium">
            Error loading announcements: {error.message}
          </AlertDescription>
          <Button 
            variant="outline" 
            className="mt-4 w-full border-red-200 text-red-600 hover:bg-red-50"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </Alert>
      </div>
    );
  }

  return (
    <ScrollArea className="h-screen">
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        {/* Hero Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
          
          <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 sm:py-16">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-sm border border-white/30">
                    <Megaphone className="h-10 w-10" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-bounce">
                    <BellRing className="h-4 w-4 text-white" />
                  </div>
                </div>
              </div>
              
              <h1 className="text-4xl sm:text-5xl font-bold mb-4 tracking-tight">
                Event Announcements
              </h1>
              <p className="text-xl opacity-90 max-w-2xl mx-auto mb-8">
                Stay connected with the latest updates, important news, and exciting developments from your event
              </p>
              
              <div className="flex items-center justify-center gap-6 text-sm opacity-80">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  <span>Live Updates</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  <span>{announcements.length} Total</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Real-time</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white/10 to-transparent"></div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* Search and Filters */}
          <div className="mb-8">
            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      placeholder="Search announcements..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-12 border-0 bg-white/80 backdrop-blur-sm shadow-sm"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                      <SelectTrigger className="w-40 h-12 border-0 bg-white/80 backdrop-blur-sm shadow-sm">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Filter by priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Priorities</SelectItem>
                        <SelectItem value="high">High Priority</SelectItem>
                        <SelectItem value="normal">Normal Priority</SelectItem>
                        <SelectItem value="low">Low Priority</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Announcements List */}
          {filteredAnnouncements.length === 0 ? (
            <div className="text-center py-16">
              <Card className="max-w-md mx-auto border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardContent className="p-12">
                  <div className="w-20 h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Megaphone className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {searchTerm || priorityFilter !== 'all' ? 'No Results Found' : 'No Announcements Yet'}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {searchTerm || priorityFilter !== 'all' 
                      ? 'Try adjusting your search terms or filters to find what you\'re looking for.'
                      : 'Check back later for important updates and announcements from the event organizers.'
                    }
                  </p>
                  {(searchTerm || priorityFilter !== 'all') && (
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => {
                        setSearchTerm('');
                        setPriorityFilter('all');
                      }}
                    >
                      Clear Filters
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredAnnouncements.map((announcement, index) => (
                <Card 
                  key={announcement.id} 
                  className={`group border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden bg-gradient-to-r ${getPriorityGradient(announcement.priority)} backdrop-blur-sm hover:-translate-y-1 animate-fade-in`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardHeader className="bg-white/80 backdrop-blur-sm">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse"></div>
                            <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                              {announcement.title}
                            </CardTitle>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={`${getPriorityColor(announcement.priority)} font-semibold px-3 py-1 shadow-md`}>
                              {announcement.priority} priority
                            </Badge>
                            {announcement.send_immediately && (
                              <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 font-semibold px-3 py-1 shadow-md animate-pulse">
                                <BellRing className="h-3 w-3 mr-1" />
                                Urgent
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-indigo-500" />
                            <span className="font-medium">{formatDate(announcement.created_at)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-indigo-500" />
                            <span>Event Organizer</span>
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpanded(announcement.id)}
                        className="ml-4 opacity-70 hover:opacity-100 transition-opacity"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        {expandedAnnouncement === announcement.id ? 'Less' : 'More'}
                        <ChevronRight className={`h-4 w-4 ml-1 transition-transform ${expandedAnnouncement === announcement.id ? 'rotate-90' : ''}`} />
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="bg-white/90 backdrop-blur-sm">
                    <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
                      {expandedAnnouncement === announcement.id ? (
                        announcement.content.split('\n').map((paragraph, index) => (
                          <p key={index} className="mb-3 last:mb-0">
                            {paragraph}
                          </p>
                        ))
                      ) : (
                        <p className="mb-0 line-clamp-2">
                          {announcement.content.split('\n')[0]}
                          {announcement.content.length > 150 && '...'}
                        </p>
                      )}
                    </div>
                    
                    {announcement.image_url && (expandedAnnouncement === announcement.id) && (
                      <div className="mt-6">
                        <img 
                          src={announcement.image_url} 
                          alt="Announcement" 
                          className="w-full h-auto rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
                        />
                      </div>
                    )}
                    
                    {announcement.content.length > 150 && expandedAnnouncement !== announcement.id && (
                      <Button
                        variant="link"
                        onClick={() => toggleExpanded(announcement.id)}
                        className="mt-2 p-0 h-auto text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        Read more <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </ScrollArea>
  );
};

const AttendeeAnnouncements = () => {
  return (
    <AppLayout>
      <AttendeeEventProvider>
        <AttendeeRouteGuard>
          <AttendeeAnnouncementsContent />
        </AttendeeRouteGuard>
      </AttendeeEventProvider>
    </AppLayout>
  );
};

export default AttendeeAnnouncements;
