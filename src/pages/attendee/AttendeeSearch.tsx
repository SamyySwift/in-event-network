
import React, { useState, useEffect } from 'react';
import { Search, Filter, Users, X, UserPlus } from 'lucide-react';
import AppLayout from '@/components/layouts/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock data for attendees
const mockAttendees = [
  {
    id: '1',
    name: 'Alex Johnson',
    role: 'Frontend Developer',
    photoUrl: '',
    niche: 'Web Development',
    networkingPreferences: ['Investors', 'Designers'],
    bio: 'Building beautiful interfaces for 5+ years. Looking to connect with designers and potential investors.',
  },
  {
    id: '2',
    name: 'Sarah Williams',
    role: 'UX Designer',
    photoUrl: '',
    niche: 'Product Design',
    networkingPreferences: ['Developers', 'Product Managers'],
    bio: 'Passionate about creating intuitive user experiences. Always looking to collaborate with developers.',
  },
  {
    id: '3',
    name: 'Michael Rodriguez',
    role: 'Startup Founder',
    photoUrl: '',
    niche: 'EdTech',
    networkingPreferences: ['Investors', 'Developers', 'Marketers'],
    bio: 'Building the future of education technology. Looking for tech talent and potential investors.',
  },
  {
    id: '4',
    name: 'Priya Patel',
    role: 'Product Manager',
    photoUrl: '',
    niche: 'SaaS',
    networkingPreferences: ['Developers', 'Designers', 'Marketers'],
    bio: 'PM with 6+ years experience in SaaS. Looking to connect with talented developers and designers.',
  },
  {
    id: '5',
    name: 'David Chen',
    role: 'Investor',
    photoUrl: '',
    niche: 'Venture Capital',
    networkingPreferences: ['Founders', 'Entrepreneurs'],
    bio: 'Early-stage investor focusing on AI and blockchain startups. Always looking for the next big idea.',
  },
];

// Available niches and networking preferences for filtering
const niches = ['All', 'Web Development', 'Product Design', 'EdTech', 'SaaS', 'Venture Capital', 'Marketing', 'Data Science', 'AI', 'Blockchain'];
const networkingPreferences = ['All', 'Developers', 'Designers', 'Investors', 'Founders', 'Product Managers', 'Marketers', 'Students', 'Mentors'];

const AttendeeSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNiche, setSelectedNiche] = useState('All');
  const [selectedPreference, setSelectedPreference] = useState('All');
  const [filteredAttendees, setFilteredAttendees] = useState(mockAttendees);
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    const filtered = mockAttendees.filter((attendee) => {
      // Search term filter
      const matchesSearch = 
        searchTerm === '' || 
        attendee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        attendee.bio.toLowerCase().includes(searchTerm.toLowerCase()) ||
        attendee.role.toLowerCase().includes(searchTerm.toLowerCase());

      // Niche filter
      const matchesNiche = 
        selectedNiche === 'All' || 
        attendee.niche === selectedNiche;

      // Networking preference filter
      const matchesPreference = 
        selectedPreference === 'All' || 
        attendee.networkingPreferences.includes(selectedPreference);

      return matchesSearch && matchesNiche && matchesPreference;
    });

    setFilteredAttendees(filtered);
  }, [searchTerm, selectedNiche, selectedPreference]);

  const handleViewProfile = (id: string) => {
    navigate(`/attendee/profile/${id}`);
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Find Connections</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Discover and connect with other event attendees</p>
          </div>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              className="pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
              placeholder="Search by name, role, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7"
                onClick={() => setSearchTerm('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {showFilters && (
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm mb-6 animate-fade-in border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by:</h2>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setSelectedNiche('All');
                  setSelectedPreference('All');
                  setSearchTerm('');
                }}
                className="text-connect-600 dark:text-connect-400 hover:text-connect-700 dark:hover:text-connect-300 h-7 px-2"
              >
                Reset All
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 block">Industry/Niche</label>
                <Select 
                  value={selectedNiche}
                  onValueChange={setSelectedNiche}
                >
                  <SelectTrigger className="w-full bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                    <SelectValue placeholder="Select niche" />
                  </SelectTrigger>
                  <SelectContent>
                    {niches.map((niche) => (
                      <SelectItem key={niche} value={niche}>{niche}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 block">Looking For</label>
                <Select 
                  value={selectedPreference}
                  onValueChange={setSelectedPreference}
                >
                  <SelectTrigger className="w-full bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                    <SelectValue placeholder="Select preference" />
                  </SelectTrigger>
                  <SelectContent>
                    {networkingPreferences.map((pref) => (
                      <SelectItem key={pref} value={pref}>{pref}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {filteredAttendees.length > 0 ? (
            filteredAttendees.map((attendee) => (
              <Card 
                key={attendee.id} 
                className="overflow-hidden hover:shadow-md transition-all duration-300 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
              >
                <CardContent className="p-0">
                  <div className="p-4 flex items-start space-x-4">
                    <Avatar className="h-12 w-12 flex-shrink-0 border-2 border-connect-100 dark:border-connect-900">
                      {attendee.photoUrl ? (
                        <AvatarImage src={attendee.photoUrl} alt={attendee.name} />
                      ) : (
                        <AvatarFallback className="bg-connect-100 text-connect-600 dark:bg-connect-900 dark:text-connect-400 font-medium">
                          {attendee.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                        <div>
                          <h3 className="font-medium text-lg text-gray-900 dark:text-white">{attendee.name}</h3>
                          <p className="text-sm text-muted-foreground">{attendee.role}</p>
                        </div>
                        <Badge variant="outline" className="bg-connect-50 text-connect-800 dark:bg-connect-900/50 dark:text-connect-300 mt-1 sm:mt-0 self-start">
                          {attendee.niche}
                        </Badge>
                      </div>
                      
                      <p className="text-sm mt-2 text-gray-600 dark:text-gray-400 line-clamp-2">{attendee.bio}</p>
                      
                      <div className="mt-3 flex flex-wrap gap-1">
                        <span className="text-xs text-muted-foreground mr-1">Looking for:</span>
                        {attendee.networkingPreferences.map((pref, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                            {pref}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="mt-4 flex justify-between items-center">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          onClick={() => handleViewProfile(attendee.id)}
                        >
                          View Profile
                        </Button>
                        
                        <Button
                          size="sm"
                          className="text-xs bg-connect-600 hover:bg-connect-700 text-white"
                        >
                          <UserPlus className="h-3 w-3 mr-1" />
                          Connect
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              <Users className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No attendees found</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Try adjusting your search or filters</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSelectedNiche('All');
                  setSelectedPreference('All');
                  setSearchTerm('');
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>

        {/* Floating connection button for mobile */}
        {isMobile && filteredAttendees.length > 0 && (
          <Button 
            className="fixed bottom-20 right-4 rounded-full w-12 h-12 flex items-center justify-center bg-connect-600 hover:bg-connect-700 shadow-lg"
          >
            <UserPlus className="h-5 w-5" />
          </Button>
        )}
      </div>
    </AppLayout>
  );
};

export default AttendeeSearch;
