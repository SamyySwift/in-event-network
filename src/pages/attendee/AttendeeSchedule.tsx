
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAttendeeSpeakers } from '@/hooks/useAttendeeSpeakers';
import { Calendar, Clock, MapPin, User, Search, Filter } from 'lucide-react';
import { format, parseISO, isToday, isTomorrow, isYesterday } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ScheduleItemModal from '@/components/schedule/ScheduleItemModal';

interface CombinedScheduleItem {
  id: string;
  title: string;
  description?: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  type: 'schedule' | 'speaker';
  speaker_name?: string;
  speaker_photo?: string;
  speaker_company?: string;
  speaker_bio?: string;
  session_title?: string;
  priority?: string;
}

const AttendeeSchedule = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'schedule' | 'speaker'>('all');
  const [selectedDate, setSelectedDate] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<CombinedScheduleItem | null>(null);
  
  const { speakers, scheduleItems, isLoading, error } = useAttendeeSpeakers();

  // Combine speakers and schedule items
  const combinedItems: CombinedScheduleItem[] = [
    ...(scheduleItems || []).map(item => ({
      id: item.id,
      title: item.title,
      description: item.description,
      start_time: item.start_time || '',
      end_time: item.end_time,
      location: item.location,
      type: 'schedule' as const,
      priority: item.priority,
    })),
    ...(speakers || []).map(speaker => ({
      id: speaker.id,
      title: speaker.session_title || `Session by ${speaker.name}`,
      description: speaker.bio,
      start_time: speaker.session_time || '',
      end_time: undefined,
      location: undefined,
      type: 'speaker' as const,
      speaker_name: speaker.name,
      speaker_photo: speaker.photo_url,
      speaker_company: speaker.company,
      speaker_bio: speaker.bio,
      session_title: speaker.session_title,
    })),
  ];

  // Filter items that have valid start_time
  const validItems = combinedItems.filter(item => item.start_time);

  // Sort by start time
  const sortedItems = validItems.sort((a, b) => {
    if (!a.start_time || !b.start_time) return 0;
    return new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
  });

  // Apply filters
  const filteredItems = sortedItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.speaker_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || item.type === filterType;
    
    let matchesDate = true;
    if (selectedDate !== 'all' && item.start_time) {
      const itemDate = format(parseISO(item.start_time), 'yyyy-MM-dd');
      matchesDate = itemDate === selectedDate;
    }
    
    return matchesSearch && matchesType && matchesDate;
  });

  // Get unique dates for filter
  const uniqueDates = Array.from(new Set(
    validItems
      .filter(item => item.start_time)
      .map(item => format(parseISO(item.start_time!), 'yyyy-MM-dd'))
  )).sort();

  const formatDateLabel = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return `Today (${format(date, 'MMM d')})`;
    if (isTomorrow(date)) return `Tomorrow (${format(date, 'MMM d')})`;
    if (isYesterday(date)) return `Yesterday (${format(date, 'MMM d')})`;
    return format(date, 'EEE, MMM d');
  };

  const formatTime = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'h:mm a');
    } catch {
      return 'Time TBA';
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = parseISO(dateStr);
      if (isToday(date)) return 'Today';
      if (isTomorrow(date)) return 'Tomorrow';
      if (isYesterday(date)) return 'Yesterday';
      return format(date, 'EEE, MMM d');
    } catch {
      return 'Date TBA';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">
              Failed to load schedule. Please try again.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Event Schedule</h1>
        <p className="text-muted-foreground">
          View upcoming sessions, speakers, and activities
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search schedule..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterType} onValueChange={(value: 'all' | 'schedule' | 'speaker') => setFilterType(value)}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Items</SelectItem>
            <SelectItem value="schedule">Schedule</SelectItem>
            <SelectItem value="speaker">Speakers</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedDate} onValueChange={setSelectedDate}>
          <SelectTrigger className="w-[200px]">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Dates</SelectItem>
            {uniqueDates.map(date => (
              <SelectItem key={date} value={date}>
                {formatDateLabel(date)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Schedule Items */}
      {filteredItems.length > 0 ? (
        <div className="space-y-4">
          {filteredItems.map((item) => (
            <Card 
              key={item.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedItem(item)}
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{item.title}</h3>
                      <Badge variant={item.type === 'speaker' ? 'default' : 'secondary'}>
                        {item.type === 'speaker' ? 'Speaker Session' : 'Schedule Item'}
                      </Badge>
                    </div>
                    
                    {item.description && (
                      <p className="text-muted-foreground mb-3 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      {item.start_time && (
                        <>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(item.start_time)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {formatTime(item.start_time)}
                            {item.end_time && ` - ${formatTime(item.end_time)}`}
                          </div>
                        </>
                      )}
                      {item.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {item.location}
                        </div>
                      )}
                      {item.speaker_name && (
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {item.speaker_name}
                          {item.speaker_company && ` (${item.speaker_company})`}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {item.speaker_photo && (
                    <div className="ml-4">
                      <img
                        src={item.speaker_photo}
                        alt={item.speaker_name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchTerm || filterType !== 'all' || selectedDate !== 'all'
                ? 'No schedule items match your filters.'
                : 'No schedule items available yet.'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Schedule Item Modal */}
      {selectedItem && selectedItem.start_time && (
        <ScheduleItemModal
          item={{
            id: selectedItem.id,
            title: selectedItem.title,
            description: selectedItem.description,
            start_time: selectedItem.start_time,
            end_time: selectedItem.end_time,
            location: selectedItem.location,
            type: selectedItem.type,
            speaker_name: selectedItem.speaker_name,
            speaker_photo: selectedItem.speaker_photo,
            speaker_company: selectedItem.speaker_company,
            speaker_bio: selectedItem.speaker_bio,
            session_title: selectedItem.session_title,
            priority: selectedItem.priority,
          }}
          isOpen={true}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
};

export default AttendeeSchedule;
