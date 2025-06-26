import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Search, Filter } from 'lucide-react';
import { useEvents } from '@/hooks/useEvents';
import { format } from 'date-fns';

const Discovery: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get('eventId');
  
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    location: '',
    dateRange: '',
    priceRange: ''
  });
  
  const { events, isLoading } = useEvents();
  
  const categories = [
    'Technology Conference',
    'Business Summit',
    'Professional Workshop',
    'Industry Meetup',
    'Training Seminar',
    'Networking Event'
  ];
  
  const locations = [
    'Lagos, Nigeria',
    'Abuja, Nigeria',
    'Port Harcourt, Nigeria',
    'Kano, Nigeria',
    'Ibadan, Nigeria',
    'Online/Virtual'
  ];
  
  const filteredEvents = events?.filter(event => {
    const matchesSearch = !filters.search || 
      event.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      event.description?.toLowerCase().includes(filters.search.toLowerCase());
    
    // Note: category filtering removed since Event interface doesn't have category
    const matchesLocation = !filters.location || event.location === filters.location;
    
    return matchesSearch && matchesLocation;
  }) || [];
  
  const featuredEvent = eventId ? events?.find(e => e.id === eventId) : filteredEvents[0];
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Discover Professional Events
            </h1>
            <p className="text-xl mb-8">
              Connect, learn, and grow with industry-leading conferences, workshops, and networking events
            </p>
            
            {/* Search Bar */}
            <div className="bg-white rounded-lg p-4 shadow-lg">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Search events, topics, or speakers..."
                    className="pl-10 text-gray-900"
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  />
                </div>
                <Select value={filters.location} onValueChange={(value) => setFilters(prev => ({ ...prev, location: value }))}>
                  <SelectTrigger className="w-full md:w-48 text-gray-900">
                    <MapPin className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Locations</SelectItem>
                    {locations.map(location => (
                      <SelectItem key={location} value={location}>{location}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Featured Event */}
      {featuredEvent && (
        <div className="container mx-auto px-4 py-12">
          <h2 className="text-3xl font-bold mb-8 text-center">
            {eventId ? 'Event Details' : 'Featured Event'}
          </h2>
          <Card className="max-w-4xl mx-auto overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/3">
                <img 
                  src={featuredEvent.banner_url || '/api/placeholder/400/300'} 
                  alt={featuredEvent.name}
                  className="w-full h-64 md:h-full object-cover"
                />
              </div>
              <div className="md:w-2/3 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="secondary">Professional Event</Badge>
                  <Badge variant="outline">Event</Badge>
                </div>
                <h3 className="text-2xl font-bold mb-4">{featuredEvent.name}</h3>
                <p className="text-gray-600 mb-6 line-clamp-3">{featuredEvent.description}</p>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-5 w-5" />
                    <span>{format(new Date(featuredEvent.start_time), 'PPP')} - {format(new Date(featuredEvent.end_time), 'PPP')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="h-5 w-5" />
                    <span>{featuredEvent.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="h-5 w-5" />
                    <span>0 attendees</span>
                  </div>
                </div>
                
                <Button 
                  onClick={() => navigate(`/tickets/${featuredEvent.id}`)}
                  className="w-full md:w-auto"
                >
                  Get Tickets
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
      
      {/* Filters */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-4 items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">All Events</h2>
          <div className="flex flex-wrap gap-4">
            <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={filters.dateRange} onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}>
              <SelectTrigger className="w-48">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any Date</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="tomorrow">Tomorrow</SelectItem>
                <SelectItem value="this-week">This Week</SelectItem>
                <SelectItem value="this-month">This Month</SelectItem>
                <SelectItem value="next-month">Next Month</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filters.priceRange} onValueChange={(value) => setFilters(prev => ({ ...prev, priceRange: value }))}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any Price</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="0-5000">₦0 - ₦5,000</SelectItem>
                <SelectItem value="5000-20000">₦5,000 - ₦20,000</SelectItem>
                <SelectItem value="20000-50000">₦20,000 - ₦50,000</SelectItem>
                <SelectItem value="50000+">₦50,000+</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Events Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map(event => (
              <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => navigate(`/tickets/${event.id}`)}>
                <div className="h-48 bg-gray-200 relative">
                  <img 
                    src={event.banner_url || '/api/placeholder/400/300'} 
                    alt={event.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge variant="secondary">Professional Event</Badge>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-2 line-clamp-2">{event.name}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{format(new Date(event.start_time), 'PPP')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span className="line-clamp-1">{event.location}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>0 attendees</span>
                      </div>
                      <Badge variant="outline">Event</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {filteredEvents.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold mb-2">No events found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Discovery;