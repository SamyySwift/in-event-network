
import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Users, ChevronRight } from 'lucide-react';
import AppLayout from '@/components/layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAttendeeSpeakers } from '@/hooks/useAttendeeSpeakers';

const AttendeeSchedule = () => {
  const [selectedDay, setSelectedDay] = useState<string>('today');
  const { speakers } = useAttendeeSpeakers();

  // Mock schedule data - in a real app, this would come from an API
  const scheduleItems = [
    {
      id: '1',
      title: 'Opening Keynote',
      description: 'Welcome to the conference and overview of upcoming sessions',
      startTime: '09:00',
      endTime: '10:00',
      location: 'Main Auditorium',
      type: 'keynote',
      speaker: 'Dr. Sarah Johnson'
    },
    {
      id: '2',
      title: 'Tech Innovation Panel',
      description: 'Discussion on emerging technologies and their impact',
      startTime: '10:30',
      endTime: '11:30',
      location: 'Conference Room A',
      type: 'panel',
      speaker: 'Multiple Speakers'
    },
    {
      id: '3',
      title: 'Networking Break',
      description: 'Coffee and networking opportunity',
      startTime: '11:30',
      endTime: '12:00',
      location: 'Lobby',
      type: 'break',
      speaker: null
    },
    {
      id: '4',
      title: 'Workshop: AI in Practice',
      description: 'Hands-on workshop exploring practical AI applications',
      startTime: '12:00',
      endTime: '13:30',
      location: 'Workshop Room',
      type: 'workshop',
      speaker: 'Alex Chen'
    },
    {
      id: '5',
      title: 'Lunch Break',
      description: 'Networking lunch with fellow attendees',
      startTime: '13:30',
      endTime: '14:30',
      location: 'Dining Hall',
      type: 'break',
      speaker: null
    },
    {
      id: '6',
      title: 'Future of Web Development',
      description: 'Exploring upcoming trends and technologies',
      startTime: '14:30',
      endTime: '15:30',
      location: 'Main Auditorium',
      type: 'session',
      speaker: 'Maria Rodriguez'
    }
  ];

  const getEventTypeColor = (type: string) => {
    switch (type) {
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
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTime = (time: string) => {
    return time;
  };

  const filteredSchedule = scheduleItems.filter(() => {
    // For now, showing all items regardless of selectedDay
    // In a real app, you'd filter by actual dates
    return true;
  });

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
                  <p className="text-muted-foreground">Check back later for updates to the schedule.</p>
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
                            <Badge variant="outline" className={getEventTypeColor(item.type)}>
                              {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                            </Badge>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Clock size={14} className="mr-1" />
                              {formatTime(item.startTime)} - {formatTime(item.endTime)}
                            </div>
                          </div>
                          
                          <h3 className="text-lg font-semibold mb-1">{item.title}</h3>
                          <p className="text-muted-foreground text-sm mb-3">{item.description}</p>
                          
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <MapPin size={14} className="mr-1" />
                              {item.location}
                            </div>
                            {item.speaker && (
                              <div className="flex items-center">
                                <Users size={14} className="mr-1" />
                                {item.speaker}
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
