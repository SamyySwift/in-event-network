import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, MapPin, MessageSquare, Clock, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AppLayout from '@/components/layouts/AppLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

// Mock data
const upcomingEvent = {
  id: '123',
  name: 'Tech Networking Summit 2025',
  time: '9:00 AM - 5:00 PM',
  location: 'Convention Center, Downtown'
};
const upcomingSession = {
  id: '456',
  title: 'AI-Powered Networking Strategies',
  time: '11:00 AM - 12:00 PM',
  speaker: 'Dr. Jane Smith'
};
const suggestedConnections = [{
  id: '1',
  name: 'Alex Johnson',
  role: 'Frontend Developer',
  photoUrl: ''
}, {
  id: '2',
  name: 'Maria Garcia',
  role: 'Product Manager',
  photoUrl: ''
}, {
  id: '3',
  name: 'Raj Patel',
  role: 'UX Designer',
  photoUrl: ''
}];
const AttendeeDashboard = () => {
  const navigate = useNavigate();
  const {
    currentUser
  } = useAuth();
  return <AppLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">
            Welcome back, {currentUser?.name?.split(' ')[0]}
          </h1>
          
          <Button onClick={() => navigate('/scan')} className="bg-connect-600 hover:bg-connect-700">
            Scan QR Code
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Current Event Card */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader className="bg-connect-50 border-b">
                <CardTitle className="text-xl">Current Event</CardTitle>
                <CardDescription>You're attending this event now</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-2">{upcomingEvent.name}</h3>
                <div className="flex flex-col space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>{upcomingEvent.time}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{upcomingEvent.location}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => navigate('/attendee/map')}>
                  Find Your Way
                </Button>
                <Button onClick={() => navigate('/attendee/schedule')}>
                  View Schedule
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          {/* Upcoming Session Card */}
          <div>
            <Card>
              <CardHeader className="bg-yellow-50 border-b">
                <CardTitle className="text-xl">Next Session</CardTitle>
                <CardDescription>Starting soon</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-2">{upcomingSession.title}</h3>
                <div className="flex flex-col space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>{upcomingSession.time}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    <span>Speaker: {upcomingSession.speaker}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => navigate('/attendee/questions')}>
                  Ask a Question
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
        
        {/* Quick Actions */}
        
        
        {/* Suggested Connections */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">People You Might Want to Meet</h2>
            <Button variant="link" className="text-connect-600 p-0" onClick={() => navigate('/attendee/search')}>
              View All
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {suggestedConnections.map(connection => <Card key={connection.id} className="overflow-hidden">
                <div className="p-4 flex space-x-4">
                  <Avatar className="h-12 w-12">
                    {connection.photoUrl ? <AvatarImage src={connection.photoUrl} alt={connection.name} /> : <AvatarFallback className="bg-connect-100 text-connect-600">
                        {connection.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>}
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-medium">{connection.name}</h3>
                    <p className="text-sm text-muted-foreground">{connection.role}</p>
                    <Button size="sm" variant="outline" className="mt-2 text-xs h-8" onClick={() => navigate(`/attendee/profile/${connection.id}`)}>
                      View Profile
                    </Button>
                  </div>
                </div>
              </Card>)}
          </div>
        </div>
        
        {/* Event Feedback */}
        <div className="mt-8 bg-gray-50 rounded-lg p-6 flex flex-col sm:flex-row items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">How's your event experience?</h3>
            <p className="text-muted-foreground text-sm">Help improve future events by sharing your feedback</p>
          </div>
          <Button className="mt-4 sm:mt-0 flex items-center" variant="outline" onClick={() => navigate('/attendee/rate')}>
            <Star className="h-4 w-4 mr-2" />
            Rate this Event
          </Button>
        </div>
      </div>
    </AppLayout>;
};
export default AttendeeDashboard;