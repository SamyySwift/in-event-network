
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Send, Filter, UserPlus, MessageSquare } from 'lucide-react';
import AppLayout from '@/components/layouts/AppLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

// Mock data for attendees
const attendees = [
  {
    id: '1',
    name: 'Alex Johnson',
    role: 'Frontend Developer',
    company: 'TechCorp Inc.',
    bio: 'Passionate about creating beautiful UI experiences with React and TypeScript.',
    tags: ['React', 'TypeScript', 'UI/UX'],
    photoUrl: '',
    links: {
      twitter: 'alexjdev',
      linkedin: 'alexjohnson',
      github: 'alexj-dev',
      website: 'alexjohnson.dev'
    }
  },
  {
    id: '2',
    name: 'Maria Garcia',
    role: 'Product Manager',
    company: 'InnovateSoft',
    bio: 'Helping teams build products that users love. Focused on user research and agile methodologies.',
    tags: ['Product Management', 'Agile', 'User Research'],
    photoUrl: '',
    links: {
      twitter: 'mariagarcia_pm',
      linkedin: 'mariagarciaPM',
      instagram: 'maria.g.product'
    }
  },
  {
    id: '3',
    name: 'Raj Patel',
    role: 'UX Designer',
    company: 'DesignLabs',
    bio: 'Creating intuitive and accessible design solutions. Advocate for inclusive design practices.',
    tags: ['UX Design', 'Accessibility', 'Figma'],
    photoUrl: '',
    links: {
      linkedin: 'rajpatelux',
      instagram: 'raj.designs',
      website: 'rajpatel.design'
    }
  },
  {
    id: '4',
    name: 'Sarah Kim',
    role: 'Data Scientist',
    company: 'DataVision Analytics',
    bio: 'Working at the intersection of machine learning and business strategy. Python enthusiast.',
    tags: ['Machine Learning', 'Python', 'Data Analysis'],
    photoUrl: '',
    links: {
      twitter: 'sarahkim_data',
      github: 'sarahkim-ml',
      linkedin: 'sarahkimds'
    }
  },
  {
    id: '5',
    name: 'James Wilson',
    role: 'CTO',
    company: 'StartUp Ventures',
    bio: 'Experienced technology leader with a focus on building scalable architectures and engineering teams.',
    tags: ['Leadership', 'Architecture', 'Mentoring'],
    photoUrl: '',
    links: {
      twitter: 'jwilson_tech',
      linkedin: 'jameswilsoncto',
      website: 'jameswilson.tech'
    }
  }
];

// Mock data for chats
const initialChats = [
  {
    id: '1',
    with: {
      id: '1',
      name: 'Alex Johnson',
      photoUrl: '',
    },
    lastMessage: 'Hi there! Are you attending the React panel later today?',
    timestamp: '10:23 AM',
    unread: true
  },
  {
    id: '2',
    with: {
      id: '3',
      name: 'Raj Patel',
      photoUrl: '',
    },
    lastMessage: 'Thanks for sharing your presentation slides!',
    timestamp: 'Yesterday',
    unread: false
  }
];

const AttendeeNetworking = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('people');
  const [chats, setChats] = useState(initialChats);
  
  // Filter attendees based on search term
  const filteredAttendees = attendees.filter(attendee => 
    attendee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    attendee.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    attendee.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    attendee.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Function to handle connection request
  const handleConnect = (attendeeId: string) => {
    toast({
      title: "Connection Request Sent",
      description: "Your connection request has been sent successfully.",
    });
  };

  // Function to handle message sending
  const handleMessage = (attendeeId: string) => {
    // Find the attendee
    const attendee = attendees.find(a => a.id === attendeeId);
    if (!attendee) return;
    
    // Check if chat exists
    const existingChat = chats.find(chat => chat.with.id === attendeeId);
    
    if (existingChat) {
      // Navigate to existing chat
      setActiveTab('chats');
      // In a real app, would navigate to specific chat
    } else {
      // Create new chat
      const newChat = {
        id: `new-${Date.now()}`,
        with: {
          id: attendee.id,
          name: attendee.name,
          photoUrl: attendee.photoUrl,
        },
        lastMessage: 'Start a conversation...',
        timestamp: 'Just now',
        unread: false
      };
      setChats([newChat, ...chats]);
      setActiveTab('chats');
    }
  };

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'twitter':
        return '𝕏'; // Twitter/X symbol
      case 'linkedin':
        return 'in';
      case 'github':
        return '󰊤';
      case 'instagram':
        return '󰋾';
      default:
        return '🌐';
    }
  };

  return (
    <AppLayout>
      <div className="animate-fade-in max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Networking</h1>
            <p className="text-gray-600 dark:text-gray-400">Connect with other attendees at the event</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="people" className="flex items-center gap-2">
              <UserPlus size={18} />
              <span>Find People</span>
            </TabsTrigger>
            <TabsTrigger value="chats" className="flex items-center gap-2">
              <MessageSquare size={18} />
              <span>Chats</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="people" className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, role, company, or interest..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter size={16} />
                <span>Filters</span>
              </Button>
            </div>
            
            {filteredAttendees.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredAttendees.map((attendee) => (
                  <Card key={attendee.id} className="hover-lift bg-white dark:bg-gray-800">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between">
                        <Avatar className="h-12 w-12">
                          {attendee.photoUrl ? (
                            <AvatarImage src={attendee.photoUrl} alt={attendee.name} />
                          ) : (
                            <AvatarFallback className="bg-connect-100 text-connect-600">
                              {attendee.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleMessage(attendee.id)}
                            className="h-8"
                          >
                            <MessageSquare size={16} className="mr-1" />
                            Message
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => handleConnect(attendee.id)}
                            className="h-8 bg-connect-600 hover:bg-connect-700"
                          >
                            <UserPlus size={16} className="mr-1" />
                            Connect
                          </Button>
                        </div>
                      </div>
                      <CardTitle className="mt-3 text-xl">{attendee.name}</CardTitle>
                      <CardDescription className="text-sm flex flex-col">
                        <span>{attendee.role}</span>
                        <span className="text-gray-500 dark:text-gray-400">{attendee.company}</span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{attendee.bio}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {attendee.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="bg-connect-50 text-connect-600 dark:bg-connect-900 dark:text-connect-300">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      
                      {attendee.links && Object.keys(attendee.links).length > 0 && (
                        <div className="mt-4">
                          <div className="text-sm font-medium mb-2">Connect on:</div>
                          <div className="flex flex-wrap gap-3">
                            {Object.entries(attendee.links).map(([platform, handle]) => (
                              <a 
                                key={platform} 
                                href={`#${platform}-${handle}`} 
                                className="inline-flex items-center text-sm bg-gray-100 dark:bg-gray-700 rounded-full py-1 px-3 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                              >
                                <span className="font-semibold mr-1">{getSocialIcon(platform)}</span>
                                <span>{platform === 'website' ? 'Website' : handle}</span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Search className="h-12 w-12 mx-auto text-gray-400" />
                <h3 className="mt-4 text-lg font-medium">No matches found</h3>
                <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                  Try adjusting your search or filters to find more people
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="chats" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 border rounded-lg overflow-hidden">
                <div className="bg-gray-50 dark:bg-gray-800 p-3 border-b">
                  <h3 className="font-medium">Your Conversations</h3>
                </div>
                <div className="max-h-[calc(100vh-250px)] overflow-y-auto">
                  {chats.map((chat) => (
                    <div 
                      key={chat.id} 
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer border-b last:border-b-0"
                    >
                      <Avatar className="h-10 w-10">
                        {chat.with.photoUrl ? (
                          <AvatarImage src={chat.with.photoUrl} alt={chat.with.name} />
                        ) : (
                          <AvatarFallback className="bg-connect-100 text-connect-600">
                            {chat.with.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <p className="font-medium truncate">{chat.with.name}</p>
                          <span className="text-xs text-gray-500">{chat.timestamp}</span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {chat.lastMessage}
                        </p>
                      </div>
                      {chat.unread && (
                        <div className="h-2 w-2 bg-connect-600 rounded-full"></div>
                      )}
                    </div>
                  ))}
                  
                  {chats.length === 0 && (
                    <div className="text-center py-8 px-4">
                      <MessageSquare className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-500">No conversations yet.</p>
                      <p className="text-sm text-gray-400">Connect with attendees to start chatting</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="lg:col-span-2 border rounded-lg overflow-hidden flex flex-col">
                <div className="bg-gray-50 dark:bg-gray-800 p-3 border-b flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-connect-100 text-connect-600">
                        AJ
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="font-medium">Alex Johnson</h3>
                  </div>
                  <Button variant="ghost" size="sm">
                    View Profile
                  </Button>
                </div>
                
                <div className="flex-1 p-4 space-y-4 bg-gray-50/50 dark:bg-gray-900/20 min-h-[300px] max-h-[calc(100vh-350px)] overflow-y-auto">
                  <div className="flex justify-start">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3 max-w-[80%] shadow-sm">
                      <p className="text-sm">Hi there! Are you attending the React panel later today?</p>
                      <span className="text-xs text-gray-500 mt-1 block">10:23 AM</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <div className="bg-connect-50 dark:bg-connect-900/40 text-connect-800 dark:text-connect-200 rounded-lg p-3 max-w-[80%] shadow-sm">
                      <p className="text-sm">Yes, I am! Looking forward to it. Will you be there?</p>
                      <span className="text-xs text-connect-600/70 dark:text-connect-400/70 mt-1 block">10:25 AM</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 border-t bg-white dark:bg-gray-800">
                  <div className="flex gap-2">
                    <Input placeholder="Type your message..." className="flex-1" />
                    <Button className="bg-connect-600 hover:bg-connect-700">
                      <Send size={18} />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default AttendeeNetworking;
