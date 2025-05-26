
import React, { useState } from 'react';
import { Megaphone, Filter, CalendarClock, MoreVertical, Pin, Share, Search } from 'lucide-react';
import AppLayout from '@/components/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock announcements data
const announcements = [
  {
    id: '1',
    title: 'Welcome to Tech Connect 2025',
    content: 'We are excited to welcome you to our annual Tech Connect Conference. Please check in at the registration desk to collect your badge before proceeding to the main hall.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
    authorName: 'Event Organizers',
    authorRole: 'Admin',
    authorPhotoUrl: '',
    important: true,
    category: 'general'
  },
  {
    id: '2',
    title: 'Wi-Fi Access Code Updated',
    content: 'The Wi-Fi access code for the event has been updated. New network: "TechConnect2025", Password: "InnovationMatters25". Please reconnect using the new credentials.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
    authorName: 'IT Support',
    authorRole: 'Technical Team',
    authorPhotoUrl: '',
    important: false,
    category: 'technical'
  },
  {
    id: '3',
    title: 'Lunchtime Schedule Change',
    content: 'Due to high attendance, we\'ve adjusted the lunch schedule. Hall A: 12:00-1:00 PM, Hall B: 1:00-2:00 PM. Please check your badge for your assigned lunch hall.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    authorName: 'Event Coordinators',
    authorRole: 'Admin',
    authorPhotoUrl: '',
    important: true,
    category: 'schedule'
  },
  {
    id: '4',
    title: 'Networking Event This Evening',
    content: 'Don\'t forget about our networking mixer this evening at 7:00 PM in the Grand Ballroom. Light refreshments and drinks will be served. Great opportunity to connect with industry leaders!',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8 hours ago
    authorName: 'Events Team',
    authorRole: 'Coordinator',
    authorPhotoUrl: '',
    important: false,
    category: 'networking'
  },
  {
    id: '5',
    title: 'Speaker Change for AI Panel',
    content: 'Please note that Dr. Jane Smith will be replacing Prof. Robert Johnson on the AI Ethics panel scheduled for tomorrow at 2:00 PM due to unforeseen circumstances.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    authorName: 'Programming Committee',
    authorRole: 'Admin',
    authorPhotoUrl: '',
    important: true,
    category: 'speakers'
  }
];

// Category badge colors
const categoryColors: Record<string, string> = {
  general: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  technical: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  schedule: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
  networking: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  speakers: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
};

const AttendeeAnnouncements = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedAnnouncementId, setExpandedAnnouncementId] = useState<string | null>(null);
  
  // Filter announcements based on search and category filter
  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = 
      announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.authorName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !selectedCategory || announcement.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  // Sort announcements (important first, then by date)
  const sortedAnnouncements = [...filteredAnnouncements].sort((a, b) => {
    if (a.important && !b.important) return -1;
    if (!a.important && b.important) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  
  // Toggle expanded announcement
  const toggleExpanded = (id: string) => {
    setExpandedAnnouncementId(prev => prev === id ? null : id);
  };
  
  // Format the time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 60) {
      return `${diffMins} min ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return `${diffDays}d ago`;
    }
  };
  
  // Get unique categories
  const categories = Array.from(new Set(announcements.map(a => a.category)));

  return (
    <AppLayout>
      <div className="animate-fade-in max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Announcements</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Important updates and information from the event organizers
            </p>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-2/3">
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Megaphone className="h-5 w-5 text-connect-600" />
                    <CardTitle>Event Announcements</CardTitle>
                  </div>
                  <Badge className="bg-blue-600">
                    {announcements.length} Total
                  </Badge>
                </div>
                <CardDescription>
                  Stay updated with the latest event information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search announcements..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                {sortedAnnouncements.length > 0 ? (
                  <div className="space-y-4">
                    {sortedAnnouncements.map((announcement) => (
                      <Card 
                        key={announcement.id} 
                        className={`overflow-hidden hover:shadow-md transition-all ${
                          announcement.important ? 'border-amber-300 dark:border-amber-800' : ''
                        }`}
                      >
                        {announcement.important && (
                          <div className="bg-amber-50 dark:bg-amber-900/30 px-4 py-1 text-amber-800 dark:text-amber-300 text-sm flex items-center gap-1">
                            <Pin className="h-4 w-4" />
                            <span>Important Announcement</span>
                          </div>
                        )}
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-xl">
                              {announcement.title}
                            </CardTitle>
                            <div className="flex items-center gap-2">
                              <Badge className={categoryColors[announcement.category]}>
                                {announcement.category.charAt(0).toUpperCase() + announcement.category.slice(1)}
                              </Badge>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Share className="h-4 w-4 mr-2" />
                                    <span>Share</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <CalendarClock className="h-4 w-4 mr-2" />
                                    <span>Add to Calendar</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-2 mb-3">
                            <Avatar className="h-6 w-6">
                              {announcement.authorPhotoUrl ? (
                                <AvatarImage src={announcement.authorPhotoUrl} alt={announcement.authorName} />
                              ) : (
                                <AvatarFallback className="bg-connect-100 text-connect-600 text-xs">
                                  {announcement.authorName.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                              <span className="font-medium">{announcement.authorName}</span>
                              <span className="mx-1">•</span>
                              <span>{announcement.authorRole}</span>
                              <span className="mx-1">•</span>
                              <span>{formatTime(announcement.createdAt)}</span>
                            </div>
                          </div>
                          
                          <p className={`text-gray-700 dark:text-gray-300 ${
                            expandedAnnouncementId !== announcement.id && announcement.content.length > 150
                              ? 'line-clamp-3'
                              : ''
                          }`}>
                            {announcement.content}
                          </p>
                          
                          {announcement.content.length > 150 && (
                            <Button 
                              variant="link" 
                              onClick={() => toggleExpanded(announcement.id)}
                              className="mt-1 h-auto p-0"
                            >
                              {expandedAnnouncementId === announcement.id ? 'Show Less' : 'Read More'}
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Megaphone className="h-12 w-12 mx-auto text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium">No announcements found</h3>
                    <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                      {searchTerm || selectedCategory ? 
                        "Try adjusting your search or filters" : 
                        "There are no announcements at this moment"
                      }
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="w-full md:w-1/3">
            <div className="space-y-6 sticky top-20">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Filter by Category
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      className={`cursor-pointer ${!selectedCategory ? 'bg-connect-100 text-connect-800 dark:bg-connect-900 dark:text-connect-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'}`}
                      onClick={() => setSelectedCategory(null)}
                    >
                      All
                    </Badge>
                    {categories.map(category => (
                      <Badge
                        key={category}
                        className={`cursor-pointer ${selectedCategory === category ? categoryColors[category] : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'}`}
                        onClick={() => setSelectedCategory(category)}
                      >
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Pin className="h-4 w-4 text-amber-600" />
                    Important Announcements
                  </CardTitle>
                  <CardDescription>
                    Prioritized updates you should know
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {announcements.filter(a => a.important).length > 0 ? (
                    announcements
                      .filter(a => a.important)
                      .map(announcement => (
                        <div 
                          key={announcement.id}
                          className="p-3 rounded-md border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20"
                        >
                          <p className="font-medium text-gray-900 dark:text-white">
                            {announcement.title}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                            {announcement.content}
                          </p>
                        </div>
                      ))
                  ) : (
                    <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-2">
                      No important announcements right now
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default AttendeeAnnouncements;
