import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, ChevronRight, Search, Users, ExternalLink, Linkedin, Globe } from 'lucide-react';
import AppLayout from '@/components/layouts/AppLayout';
import AttendeeRouteGuard from '@/components/attendee/AttendeeRouteGuard';
import { Card, CardContent } from '@/components/ui/card';
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
import XLogo from "@/components/icons/XLogo";
import { formatDisplayTime, formatDisplayDate, formatDuration, parseTimeAllocation } from '@/utils/timezone';

interface ScheduleItem {
  id: string;
  title: string;
  description: string | null;
  start_date?: string | null;
  end_date?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  start_time_full?: string;
  end_time_full?: string;
  start_time_only?: string | null;
  end_time_only?: string | null;
  location: string | null;
  type: string;
  priority: string;
  event_id: string;
  image_url?: string;
  time_allocation?: string | null;
}

interface CombinedScheduleItem {
  id: string;
  title: string;
  description?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  start_time_full?: string;
  end_time_full?: string;
  start_time_only?: string | null;
  end_time_only?: string | null;
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
  time_allocation?: string | null;
}

const AttendeeSchedule = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>('all');
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [combinedItems, setCombinedItems] = useState<CombinedScheduleItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<CombinedScheduleItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const {
    speakers,
    isLoading: speakersLoading,
    error: speakersError
  } = useAttendeeSpeakers();
  
  const {
    context,
    isLoading: contextLoading,
    error: contextError
  } = useAttendeeContext();

  console.log('AttendeeSchedule - Context:', context);
  console.log('AttendeeSchedule - Speakers:', speakers);
  console.log('AttendeeSchedule - Schedule items:', scheduleItems);

  // Fetch schedule items from database
  useEffect(() => {
    const fetchScheduleItems = async () => {
      if (!context?.currentEventId) {
        console.log('No current event ID, skipping schedule fetch');
        setScheduleItems([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('Fetching schedule items for event:', context.currentEventId);
        
        const { data, error } = await supabase
          .from('schedule_items')
          .select('*')
          .eq('event_id', context.currentEventId)
          .order('start_time', { ascending: true });

        if (error) {
          console.error('Error fetching schedule items:', error);
          setScheduleItems([]);
        } else {
          console.log('Schedule items fetched:', data);
          setScheduleItems(data || []);
        }
      } catch (error) {
        console.error('Error fetching schedule items:', error);
        setScheduleItems([]);
      } finally {
        setLoading(false);
      }
    };

    if (context?.currentEventId) {
      fetchScheduleItems();
    } else {
      setLoading(false);
    }

    // Set up real-time subscription for schedule items
    if (context?.currentEventId) {
      const channel = supabase
        .channel('attendee-schedule-changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'schedule_items',
          filter: `event_id=eq.${context.currentEventId}`
        }, () => {
          console.log('Schedule items updated, refetching...');
          fetchScheduleItems();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [context?.currentEventId]);

  // Combine speakers and schedule items
  useEffect(() => {
    console.log('Combining speakers and schedule items');
    console.log('Available speakers:', speakers?.length || 0);
    console.log('Available schedule items:', scheduleItems?.length || 0);
    
    const combined: CombinedScheduleItem[] = [];

    // Add ALL speaker sessions (including those without complete session info)
    if (speakers && speakers.length > 0) {
      console.log('Adding all speakers:', speakers.length);
      
      speakers.forEach(speaker => {
        combined.push({
          id: `speaker-${speaker.id}`,
          title: speaker.session_title || 'To be announced',
          description: null,
          start_time: speaker.session_time || undefined,
          start_time_full: speaker.session_time || undefined,
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
    }

    // Add schedule items
    if (scheduleItems && scheduleItems.length > 0) {
      scheduleItems.forEach(item => {
        combined.push({
          id: `schedule-${item.id}`,
          title: item.title,
          description: item.description,
          start_date: item.start_date,
          end_date: item.end_date,
          start_time: item.start_time,
          end_time: item.end_time,
          start_time_full: item.start_time_full,
          end_time_full: item.end_time_full,
          start_time_only: item.start_time_only,
          end_time_only: item.end_time_only,
          location: item.location,
          type: 'schedule',
          priority: item.priority,
          image_url: item.image_url,
          time_allocation: item.time_allocation
        });
      });
    }

    // Sort by start time - use the same logic as admin schedule
    combined.sort((a, b) => {
      const getStartTime = (item: CombinedScheduleItem) => {
        if (item.start_time) return new Date(item.start_time).getTime();
        if (item.start_time_full) return new Date(item.start_time_full).getTime();
        return 0;
      };
      
      return getStartTime(a) - getStartTime(b);
    });
    
    console.log('Final combined items:', combined.length);
    setCombinedItems(combined);
  }, [speakers, scheduleItems]);

  // Enhanced time display logic matching admin schedule
  const formatTimeDisplay = (item: CombinedScheduleItem): string => {
    let startTimeStr = '';
    let endTimeStr = '';
    
    // Get start time
    if (item.start_time) {
      startTimeStr = formatDisplayTime(item.start_time);
    } else if (item.start_time_full) {
      startTimeStr = formatDisplayTime(item.start_time_full);
    }
    
    // Get end time
    if (item.end_time) {
      endTimeStr = formatDisplayTime(item.end_time);
    } else if (item.end_time_full) {
      endTimeStr = formatDisplayTime(item.end_time_full);
    }
    
    // Build display string
    if (startTimeStr && endTimeStr) {
      return `${startTimeStr} - ${endTimeStr}`;
    } else if (startTimeStr) {
      return startTimeStr;
    } else if (endTimeStr) {
      return `Until ${endTimeStr}`;
    }
    
    // Return "To be announced" for speakers without time
    return 'To be announced';
  };

  const formatDateDisplay = (item: CombinedScheduleItem): string => {
    if (item.start_date) {
      if (item.end_date && item.end_date !== item.start_date) {
        return `${formatDisplayDate(item.start_date)} - ${formatDisplayDate(item.end_date)}`;
      }
      return formatDisplayDate(item.start_date);
    }
    
    // Fallback to extracting date from timestamp
    if (item.start_time) {
      return formatDisplayDate(item.start_time);
    } else if (item.start_time_full) {
      return formatDisplayDate(item.start_time_full);
    }
    
    return '';
  };

  // Filter items based on search and date
  const filteredItems = combinedItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.speaker_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.speaker_company?.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    
    if (selectedDate === 'all') return true;
    
    // Use the primary time source for date filtering
    const timeStr = item.start_time || item.start_time_full;
    if (!timeStr) {
      // For speakers without time, show them in "today" filter so they're visible
      return selectedDate === 'today';
    }
    
    try {
      const sessionDate = parseISO(timeStr);
      if (selectedDate === 'today') return isToday(sessionDate);
      if (selectedDate === 'tomorrow') return isTomorrow(sessionDate);
      if (selectedDate === 'yesterday') return isYesterday(sessionDate);
    } catch (error) {
      console.error('Error parsing date:', timeStr, error);
      return selectedDate === 'today'; // Default to today for parsing errors
    }
    return true;
  });

  // Group items by date
  const groupedByDate = filteredItems.reduce((groups, item) => {
    const timeStr = item.start_time || item.start_time_full;
    
    if (!timeStr) {
      // For items without proper dates, group them under "Speakers - Time TBA"
      const fallbackKey = 'speakers-tba';
      if (!groups[fallbackKey]) {
        groups[fallbackKey] = [];
      }
      groups[fallbackKey].push(item);
      return groups;
    }
    
    try {
      const date = format(parseISO(timeStr), 'yyyy-MM-dd');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(item);
    } catch (error) {
      console.error('Error formatting date:', timeStr, error);
      const fallbackKey = 'speakers-tba';
      if (!groups[fallbackKey]) {
        groups[fallbackKey] = [];
      }
      groups[fallbackKey].push(item);
    }
    return groups;
  }, {} as Record<string, typeof filteredItems>);

  const formatDateHeader = (dateStr: string) => {
    if (dateStr === 'speakers-tba') {
      return 'Speakers - Time To Be Announced';
    }
    
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
      case 'x':
        return <XLogo size={12} />;
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
    if (item.speaker_twitter) socialLinks.push({ platform: 'x', url: item.speaker_twitter });
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
              aria-label={link.platform === 'x' ? 'X' : link.platform.charAt(0).toUpperCase() + link.platform.slice(1)}
              title={link.platform === 'x' ? 'X' : link.platform.charAt(0).toUpperCase() + link.platform.slice(1)}
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

  // Show loading state
  if (speakersLoading || contextLoading || loading) {
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

  // Show error state
  if (speakersError || contextError) {
    return (
      <AppLayout>
        <AttendeeRouteGuard>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Error Loading Schedule</h3>
              <p className="text-muted-foreground">
                {speakersError?.message || contextError?.message || 'Failed to load schedule data'}
              </p>
            </div>
          </div>
        </AttendeeRouteGuard>
      </AppLayout>
    );
  }

  // Show no event selected state
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
        <div className="animate-fade-in max-w-6xl mx-auto p-4 sm:p-6">
          {/* Hero Section */}
          <div className="mb-6 sm:mb-8 relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-6 sm:p-8 text-white">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative z-10">
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">Event Schedule</h1>
              <p className="text-base sm:text-lg opacity-90 mb-4">
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
          <Card className="mb-6 sm:mb-8 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4 sm:p-6">
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
                    <TabsTrigger value="all" className="px-4 sm:px-6">All Days</TabsTrigger>
                    <TabsTrigger value="today" className="px-4 sm:px-6">Today</TabsTrigger>
                    <TabsTrigger value="tomorrow" className="px-4 sm:px-6">Tomorrow</TabsTrigger>
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
            <div className="space-y-6 sm:space-y-8">
              {Object.keys(groupedByDate).sort().map((date) => (
                <div key={date} className="space-y-4">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                        {formatDateHeader(date)}
                      </h2>
                      <p className="text-gray-500">{groupedByDate[date].length} events scheduled</p>
                    </div>
                  </div>

                  <div className="grid gap-4 md:gap-6">
                    {groupedByDate[date].map((item) => {
                      const timeDisplay = formatTimeDisplay(item);
                      const dateDisplay = formatDateDisplay(item);
                      const durationMinutes = item.time_allocation ? parseTimeAllocation(item.time_allocation) : 0;
                      const durationDisplay = formatDuration(durationMinutes);

                      return (
                        <Card 
                          key={item.id} 
                          className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md hover:-translate-y-1 cursor-pointer overflow-hidden"
                          onClick={() => handleViewDetails(item)}
                        >
                          <CardContent className="p-0">
                            <div className="flex flex-col sm:flex-row">
                              {/* Time Column */}
                              <div className="w-full sm:w-20 md:w-24 bg-gradient-to-b from-gray-50 to-gray-100 p-3 sm:p-4 flex flex-row sm:flex-col items-center justify-center border-b sm:border-b-0 sm:border-r">
                                <div className="text-base sm:text-lg font-bold text-gray-900">
                                  {timeDisplay ? (
                                    timeDisplay === 'To be announced' ? (
                                      <span className="text-sm text-amber-600 font-medium">TBA</span>
                                    ) : (
                                      timeDisplay.split(' - ')[0]
                                    )
                                  ) : (
                                    <span className="text-sm text-amber-600 font-medium">TBA</span>
                                  )}
                                </div>
                                {timeDisplay && timeDisplay.includes(' - ') && timeDisplay !== 'To be announced' && (
                                  <div className="text-sm text-gray-500 ml-2 sm:ml-0">
                                    {timeDisplay.split(' - ')[1]}
                                  </div>
                                )}
                                {/* Duration display */}
                                {durationDisplay && timeDisplay !== 'To be announced' && (
                                  <div className="text-xs text-gray-400 mt-1 flex items-center">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {durationDisplay}
                                  </div>
                                )}
                              </div>

                              {/* Main Content Section */}
                              <div className="flex-1 p-4 sm:p-6">
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                  <div className="flex-1">
                                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                                      {item.title}
                                    </h3>
                                    
                                    {item.description && (
                                      <p className="text-gray-600 text-sm sm:text-base mb-3 line-clamp-2">
                                        {item.description}
                                      </p>
                                    )}
                                    
                                    {/* Date and Location Information */}
                                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mb-3">
                                      {dateDisplay && (
                                        <div className="flex items-center gap-1">
                                          <Calendar className="h-3 w-3" />
                                          <span>{dateDisplay}</span>
                                        </div>
                                      )}
                                      
                                      {item.location && (
                                        <div className="flex items-center gap-1">
                                          <MapPin className="h-3 w-3" />
                                          <span>{item.location}</span>
                                        </div>
                                      )}
                                    </div>
                                    
                                    <div className="flex flex-wrap gap-2">
                                      {getTypeBadge(item.type)}
                                      {getPriorityBadge(item.priority)}
                                      {durationDisplay && (
                                        <Badge variant="outline" className="text-xs">
                                          <Clock className="w-3 h-3 mr-1" />
                                          {durationDisplay}
                                        </Badge>
                                      )}
                                    </div>

                                    {renderSocialLinks(item)}
                                  </div>
                                  
                                  {/* Speaker Info or Image */}
                                  {item.type === 'speaker' && item.speaker_name && (
                                    <div className="flex items-center gap-3 mt-3 sm:mt-0">
                                      {item.speaker_photo && (
                                        <img 
                                          src={item.speaker_photo} 
                                          alt={item.speaker_name}
                                          className="w-12 h-12 rounded-full object-cover"
                                        />
                                      )}
                                      <div>
                                        <p className="font-medium text-gray-900">{item.speaker_name}</p>
                                        {item.speaker_company && (
                                          <p className="text-sm text-gray-500">{item.speaker_company}</p>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {item.type === 'schedule' && item.image_url && (
                                    <div className="mt-3 sm:mt-0">
                                      <img 
                                        src={item.image_url} 
                                        alt={item.title}
                                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover"
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
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
