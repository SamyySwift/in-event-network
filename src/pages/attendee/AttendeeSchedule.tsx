
import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Users, ChevronRight } from 'lucide-react';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';
import AppLayout from '@/components/layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAttendeeSchedule } from '@/hooks/useAttendeeSchedule';

const AttendeeSchedule = () => {
  const [selectedDay, setSelectedDay] = useState<string>('today');
  const { scheduleItems, isLoading, error } = useAttendeeSchedule();

  const getEventTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'keynote':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'workshop':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'panel':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'session':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'break':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'general':
        return 'bg-slate-100 text-slate-800 border-slate-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTime = (timeString: string) => {
    try {
      const date = parseISO(timeString);
      return format(date, 'HH:mm');
    } catch (error) {
      console.error('Error formatting time:', error);
      return timeString;
    }
  };

  const filterScheduleByDay = (items: any[]) => {
    const now = new Date();
    
    return items.filter(item => {
      try {
        const itemDate = parseISO(item.start_time);
        
        switch (selectedDay) {
          case 'today':
            return isToday(itemDate);
          case 'tomorrow':
            return isTomorrow(itemDate);
          case 'all':
            return true;
          default:
            return true;
        }
      } catch (error) {
        console.error('Error parsing item date:', error);
        return false;
      }
    });
  };

  const filteredSchedule = filterScheduleByDay(scheduleItems);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center">
                <Calendar className="mr-2 h-8 w-8 text-primary" />
                Event Schedule
              </h1>
              <p className="text-muted-foreground mt-1">Stay updated with all sessions and activities.</p>
            </div>
          </div>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
              <p className="mt-4 text-lg">Loading schedule...</p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center">
                <Calendar className="mr-2 h-8 w-8 text-primary" />
                Event Schedule
              </h1>
              <p className="text-muted-foreground mt-1">Stay updated with all sessions and activities.</p>
            </div>
          </div>
          <Card>
            <CardContent className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
              <h3 className="mt-4 text-lg font-medium">Unable to load schedule</h3>
              <p className="text-muted-foreground">Please try again later or contact support if the problem persists.</p>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center">
              <Calendar className="mr-2 h-8 w-8 text-primary" />
              Event Schedule
            </h1>
            <p className="text-muted-foreground mt-1">Stay updated with all sessions and activities.</p>
          </div>
        </div>

        <Tabs value={selectedDay} onValueChange={setSelectedDay} className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="tomorrow">Tomorrow</TabsTrigger>
            <TabsTrigger value="all">All Days</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedDay} className="space-y-4 mt-6">
            {filteredSchedule.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                  <h3 className="mt-4 text-lg font-medium">No events scheduled</h3>
                  <p className="text-muted-foreground">
                    {selectedDay === 'today' && 'No events scheduled for today.'}
                    {selectedDay === 'tomorrow' && 'No events scheduled for tomorrow.'}
                    {selectedDay === 'all' && 'No events have been scheduled yet.'}
                    <br />Check back later for updates to the schedule.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredSchedule.map((item) => (
                  <Card key={item.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge variant="outline" className={getEventTypeColor(item.type || 'general')}>
                              {(item.type || 'General').charAt(0).toUpperCase() + (item.type || 'general').slice(1)}
                            </Badge>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Clock size={14} className="mr-1" />
                              {formatTime(item.start_time)} - {formatTime(item.end_time)}
                            </div>
                          </div>
                          
                          <h3 className="text-lg font-semibold mb-1">{item.title}</h3>
                          {item.description && (
                            <p className="text-muted-foreground text-sm mb-3">{item.description}</p>
                          )}
                          
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-muted-foreground">
                            {item.location && (
                              <div className="flex items-center">
                                <MapPin size={14} className="mr-1" />
                                {item.location}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <Button variant="outline" className="sm:ml-4">
                          View Details
                          <ChevronRight size={16} className="ml-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default AttendeeSchedule;
