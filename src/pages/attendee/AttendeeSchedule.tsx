import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, ChevronRight, Search, Filter, Star, Users, ExternalLink, Twitter, Linkedin, Globe } from 'lucide-react';
import AppLayout from '@/components/layouts/AppLayout';
import AttendeeRouteGuard from '@/components/attendee/AttendeeRouteGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ScheduleItemModal from '@/components/schedule/ScheduleItemModal';
import { useAttendeeSpeakers } from '@/hooks/useAttendeeSpeakers';
import { useAttendeeContext } from '@/hooks/useAttendeeContext';
import { format, isToday, isTomorrow, isYesterday, parseISO } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

interface ScheduleItem {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  location: string | null;
  type: string;
  priority: string;
  event_id: string;
  image_url?: string;
}

interface CombinedScheduleItem {
  id: string;
  title: string;
  description?: string | null;
  start_time: string;
  end_time?: string;
  location?: string | null;
  type: 'speaker' | 'schedule';
  speaker_name?: string;
  speaker_photo?: string;
  speaker_company?: string;
  speaker_bio?: string;
  speaker_twitter?: string;
  speaker_linkedin?: string;
  speaker_website?: string;
  priority?: string;
  image_url?: string;
}

const AttendeeSchedule = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>('all');
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [combinedItems, setCombinedItems] = useState<CombinedScheduleItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<CombinedScheduleItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const {
    speakers,
    isLoading: speakersLoading,
    error
  } = useAttendeeSpeakers();
  const {
    context,
    isLoading: contextLoading
  } = useAttendeeContext();

  // Fetch schedule items from database
  useEffect(() => {
    const fetchScheduleItems = async () => {
      if (!context?.currentEventId) {
        console.log('No current event ID, skipping schedule fetch');
        return;
      }
      try {
        console.log('Fetching schedule items for event:', context.currentEventId);
        const {
          data,
          error
        } = await supabase.from('schedule_items').select('*').eq('event_id', context.currentEventId).order('start_time', {
          ascending: true
        });
        if (error) {
          console.error('Error fetching schedule items:', error);
          return;
        }
        console.log('Schedule items fetched:', data);
        setScheduleItems(data || []);
      } catch (error) {
        console.error('Error fetching schedule items:', error);
      }
    };
    if (context?.currentEventId) {
      fetchScheduleItems();
    }

    // Set up real-time subscription for schedule items
    if (context?.currentEventId) {
      const channel = supabase.channel('attendee-schedule-changes').on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'schedule_items',
        filter: `event_id=eq.${context.currentEventId}`
      }, () => {
        console.log('Schedule items updated, refetching...');
        fetchScheduleItems();
      }).subscribe();
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [context?.currentEventId]);

  // Combine speakers and schedule items
  useEffect(() => {
    console.log('Combining speakers and schedule items');
    console.log('Speakers:', speakers);
    console.log('Schedule items:', scheduleItems);
    const combined: CombinedScheduleItem[] = [];

    // Add speaker sessions
    const speakersWithSessions = speakers.filter(speaker => speaker.session_time && speaker.session_title);
    console.log('Speakers with sessions:', speakersWithSessions);
    speakersWithSessions.forEach(speaker => {
      combined.push({
        id: `speaker-${speaker.id}`,
        title: speaker.session_title!,
        description: speaker.bio,
        start_time: speaker.session_time!,
        location: undefined,
        type: 'speaker',
        speaker_name: speaker.name,
        speaker_photo: speaker.photo_url,
        speaker_company: speaker.company,
        speaker_bio: speaker.bio,
        speaker_twitter: speaker.twitter_link,
        speaker_linkedin: speaker.linkedin_link,
        speaker_website: speaker.website_link
      });
    });

    // Add schedule items
    scheduleItems.forEach(item => {
      combined.push({
        id: `schedule-${item.id}`,
        title: item.title,
        description: item.description,
        start_time: item.start_time,
        end_time: item.end_time,
        location: item.location,
        type: 'schedule',
        priority: item.priority
      });
    });

    // Sort by start time
    combined.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
    console.log('Combined items:', combined);
    setCombinedItems(combined);
  }, [speakers, scheduleItems]);

  // Filter items based on search and date
  const filteredItems = combinedItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.speaker_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.speaker_company?.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (selectedDate === 'all') return true;
    try {
      const sessionDate = parseISO(item.start_time);
      if (selectedDate === 'today') return isToday(sessionDate);
      if (selectedDate === 'tomorrow') return isTomorrow(sessionDate);
      if (selectedDate === 'yesterday') return isYesterday(sessionDate);
    } catch (error) {
      console.error('Error parsing date:', item.start_time, error);
      return false;
    }
    return true;
  });

  // Group items by date
  const groupedByDate = filteredItems.reduce((groups, item) => {
    try {
      const date = format(parseISO(item.start_time), 'yyyy-MM-dd');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(item);
    } catch (error) {
      console.error('Error formatting date:', item.start_time, error);
    }
    return groups;
  }, {} as Record<string, typeof filteredItems>);
  const formatDateHeader = (dateStr: string) => {
    try {
      const date = parseISO(dateStr);
      if (isToday(date)) return 'Today';
      if (isTomorrow(date)) return 'Tomorrow';
      if (isYesterday(date)) return 'Yesterday';
      return format(date, 'EEEE, MMMM d');
    } catch (error) {
      console.error('Error formatting date header:', dateStr, error);
      return dateStr;
    }
  };
  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'speaker':
        return <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
          <User className="w-3 h-3 mr-1" />
          Speaker Session
        </Badge>;
      case 'schedule':
        return <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0">
          <Calendar className="w-3 h-3 mr-1" />
          Event Item
        </Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };
  const getPriorityBadge = (priority?: string) => {
    if (!priority) return null;
    switch (priority) {
      case 'high':
        return <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white border-0">
          <Star className="w-3 h-3 mr-1" />
          High Priority
        </Badge>;
      case 'medium':
        return <Badge className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white border-0">
          Medium Priority
        </Badge>;
      case 'low':
        return <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
          Low Priority
        </Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'twitter':
        return <Twitter className="w-3 h-3" />;
      case 'linkedin':
        return <Linkedin className="w-3 h-3" />;
      case 'website':
        return <Globe className="w-3 h-3" />;
      default:
        return <ExternalLink className="w-3 h-3" />;
    }
  };

  const renderSocialLinks = (item: CombinedScheduleItem) => {
    if (item.type !== 'speaker') return null;
    
    const socialLinks = [];
    if (item.speaker_twitter) socialLinks.push({ platform: 'twitter', url: item.speaker_twitter });
    if (item.speaker_linkedin) socialLinks.push({ platform: 'linkedin', url: item.speaker_linkedin });
    if (item.speaker_website) socialLinks.push({ platform: 'website', url: item.speaker_website });
    
    if (socialLinks.length === 0) return null;
    
    return (
      <div className="flex items-center gap-2 mt-2">
        <span className="text-xs text-gray-500">Connect:</span>
        <div className="flex gap-1">
          {socialLinks.map((link, index) => (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-gray-100"
              onClick={(e) => {
                e.stopPropagation();
                window.open(link.url, '_blank');
              }}
            >
              {getSocialIcon(link.platform)}
            </Button>
          ))}
        </div>
      </div>
    );
  };

  const handleViewDetails = (item: CombinedScheduleItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  if (speakersLoading || contextLoading) {
    return (
      <AppLayout>
        <AttendeeRouteGuard>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading schedule...</p>
            </div>
          </div>
        </AttendeeRouteGuard>
      </AppLayout>
    );
  }
  if (!context?.currentEventId) {
    return (
      <AppLayout>
        <AttendeeRouteGuard>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No Event Selected</h3>
              <p className="text-muted-foreground">You need to join an event to view its schedule.</p>
            </div>
          </div>
        </AttendeeRouteGuard>
      </AppLayout>
    );
  }
  return (
    <AppLayout>
      <AttendeeRouteGuard>
        <div className="animate-fade-in max-w-6xl mx-auto p-6">
          {/* Hero Section */}
          <div className="mb-8 relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-8 text-white">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative z-10">
              <h1 className="text-4xl font-bold mb-2">Event Schedule</h1>
              <p className="text-lg opacity-90 mb-4">
                Discover amazing sessions, speakers, and activities
              </p>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{filteredItems.length} Events</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{Object.keys(groupedByDate).length} Days</span>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-white/10 rounded-full"></div>
            <div className="absolute -top-8 -left-8 w-24 h-24 bg-white/5 rounded-full"></div>
          </div>

          {/* Search and Filter Section */}
          <Card className="mb-8 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search sessions, speakers, or events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-12 border-0 bg-gray-50 focus:bg-white transition-colors"
                  />
                </div>
                <Tabs value={selectedDate} onValueChange={setSelectedDate} className="w-auto">
                  <TabsList className="bg-gray-100 p-1">
                    <TabsTrigger value="all" className="px-6">All Days</TabsTrigger>
                    <TabsTrigger value="today" className="px-6">Today</TabsTrigger>
                    <TabsTrigger value="tomorrow" className="px-6">Tomorrow</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardContent>
          </Card>

          {/* Schedule Content */}
          {filteredItems.length === 0 ? (
            <Card className="border-0 shadow-lg">
              <CardContent className="py-16 text-center">
                <Calendar className="h-16 w-16 mx-auto mb-6 text-gray-300" />
                <h3 className="text-2xl font-semibold mb-3 text-gray-900">No schedule items found</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  {combinedItems.length === 0 
                    ? "No schedule items have been created yet" 
                    : "Try adjusting your search or filter criteria"
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8">
              {Object.keys(groupedByDate).sort().map((date) => (
                <div key={date} className="space-y-4">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {formatDateHeader(date)}
                      </h2>
                      <p className="text-gray-500">{groupedByDate[date].length} events scheduled</p>
                    </div>
                  </div>

                  <div className="grid gap-4 md:gap-6">
                    {groupedByDate[date].map((item) => (
                      <Card 
                        key={item.id} 
                        className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md hover:-translate-y-1 cursor-pointer overflow-hidden"
                        onClick={() => handleViewDetails(item)}
                      >
                        <CardContent className="p-0">
                          <div className="flex">
                            {/* Time Column */}
                            <div className="w-24 bg-gradient-to-b from-gray-50 to-gray-100 p-4 flex flex-col items-center justify-center border-r">
                              <div className="text-lg font-bold text-gray-900">
                                {(() => {
                                  try {
                                    return format(parseISO(item.start_time), 'HH:mm');
                                  } catch (error) {
                                    return '00:00';
                                  }
                                })()}
                              </div>
                              {item.end_time && (
                                <div className="text-sm text-gray-500">
                                  {(() => {
                                    try {
                                      return format(parseISO(item.end_time), 'HH:mm');
                                    } catch (error) {
                                      return '';
                                    }
                                  })()}
                                </div>
                              )}
                            </div>

                            {/* Content Column */}
                            <div className="flex-1 p-4">
                              <div className="flex items-start gap-4">
                                {/* Image or Avatar */}
                                <div className="flex-shrink-0">
                                  {item.type === 'speaker' ? (
                                    <Avatar className="w-12 h-12 border-2 border-white shadow-md">
                                      <AvatarImage src={item.speaker_photo} alt={item.speaker_name} />
                                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                                        {item.speaker_name?.split(' ').map(n => n[0]).join('') || 'S'}
                                      </AvatarFallback>
                                    </Avatar>
                                  ) : item.image_url ? (
                                    <img 
                                      src={item.image_url} 
                                      alt={item.title}
                                      className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow-md"
                                    />
                                  ) : (
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                                      <Calendar className="w-6 h-6 text-white" />
                                    </div>
                                  )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between mb-2">
                                    <div>
                                      <h3 className="font-semibold text-lg text-gray-900 group-hover:text-indigo-600 transition-colors">
                                        {item.title}
                                      </h3>
                                      {item.type === 'speaker' && (
                                        <p className="text-gray-600 text-sm">
                                          by <span className="font-medium">{item.speaker_name}</span>
                                          {item.speaker_company && ` • ${item.speaker_company}`}
                                        </p>
                                      )}
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                                  </div>

                                  {item.location && (
                                    <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                                      <MapPin className="h-4 w-4" />
                                      {item.location}
                                    </div>
                                  )}

                                  {item.description && (
                                    <p className="text-gray-700 text-sm mb-3 line-clamp-2">
                                      {item.description}
                                    </p>
                                  )}

                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      {getTypeBadge(item.type)}
                                      {getPriorityBadge(item.priority)}
                                    </div>
                                    {renderSocialLinks(item)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </AttendeeRouteGuard>
      
      <ScheduleItemModal
        item={selectedItem}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </AppLayout>
  );
};

export default AttendeeSchedule;
