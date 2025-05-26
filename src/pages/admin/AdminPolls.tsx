
import React, { useState } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent 
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Edit, 
  Trash2, 
  Plus, 
  Eye, 
  EyeOff, 
  BarChart4 
} from 'lucide-react';
import { format } from 'date-fns';
import { useIsMobile } from '@/hooks/use-mobile';
import { Poll } from '@/types';
import { useToast } from '@/hooks/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Mock data for polls
const mockPolls: Poll[] = [
  {
    id: '1',
    question: 'Which keynote session are you most looking forward to?',
    options: [
      { id: 'opt1', text: 'AI and Future of Tech', votes: 45 },
      { id: 'opt2', text: 'Sustainable Technology', votes: 32 },
      { id: 'opt3', text: 'Web3 and Blockchain', votes: 28 },
      { id: 'opt4', text: 'UX Design Trends', votes: 37 }
    ],
    startTime: '2025-06-15T10:00:00Z',
    endTime: '2025-06-15T18:00:00Z',
    createdAt: '2025-06-01T14:23:00Z',
    createdBy: 'admin1',
    isActive: true,
    showResults: false,
    displayAsBanner: true
  },
  {
    id: '2',
    question: 'How would you rate the networking reception?',
    options: [
      { id: 'opt1', text: 'Excellent', votes: 28 },
      { id: 'opt2', text: 'Good', votes: 42 },
      { id: 'opt3', text: 'Average', votes: 15 },
      { id: 'opt4', text: 'Poor', votes: 5 }
    ],
    startTime: '2025-06-16T20:00:00Z',
    endTime: '2025-06-17T08:00:00Z',
    createdAt: '2025-06-15T18:30:00Z',
    createdBy: 'admin1',
    isActive: false,
    showResults: true,
    displayAsBanner: false
  },
  {
    id: '3',
    question: 'Which workshop would you like to see added next year?',
    options: [
      { id: 'opt1', text: 'Advanced Mobile Development', votes: 56 },
      { id: 'opt2', text: 'Data Science Fundamentals', votes: 78 },
      { id: 'opt3', text: 'DevOps Best Practices', votes: 43 },
      { id: 'opt4', text: 'UI/UX Design Workshop', votes: 62 }
    ],
    startTime: '2025-06-17T09:00:00Z',
    endTime: '2025-06-17T23:59:59Z',
    createdAt: '2025-06-16T22:15:00Z',
    createdBy: 'admin2',
    isActive: true,
    showResults: true,
    displayAsBanner: true
  }
];

const AdminPolls = () => {
  const [activeTab, setActiveTab] = useState<string>('active');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const isMobile = useIsMobile();
  const { toast } = useToast();
  
  // Filter polls based on tab and search query
  const filteredPolls = mockPolls.filter(poll => {
    const matchesTab = 
      activeTab === 'all' || 
      (activeTab === 'active' && poll.isActive) || 
      (activeTab === 'inactive' && !poll.isActive);
    
    const matchesSearch = poll.question.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesTab && matchesSearch;
  });

  const handleCreatePoll = () => {
    console.log('Create new poll');
    toast({
      title: "Creating new poll",
      description: "Poll creation UI would open here"
    });
  };

  const handleEditPoll = (poll: Poll) => {
    console.log('Edit poll', poll);
    toast({
      title: "Editing poll",
      description: `Editing: ${poll.question}`
    });
  };

  const handleDeletePoll = (poll: Poll) => {
    console.log('Delete poll', poll);
    toast({
      title: "Delete poll?",
      description: "This action cannot be undone",
      variant: "destructive"
    });
  };

  const handleTogglePollActive = (poll: Poll) => {
    console.log('Toggle poll active state', poll);
    toast({
      title: poll.isActive ? "Poll deactivated" : "Poll activated",
      description: poll.question
    });
  };

  const handleToggleShowResults = (poll: Poll) => {
    console.log('Toggle show results', poll);
    toast({
      title: poll.showResults ? "Results hidden" : "Results shown",
      description: `Results for: ${poll.question}`
    });
  };

  const handleToggleBanner = (poll: Poll) => {
    console.log('Toggle banner display', poll);
    toast({
      title: poll.displayAsBanner ? "Banner disabled" : "Banner enabled",
      description: `For poll: ${poll.question}`
    });
  };

  const calculatePercentage = (votes: number, poll: Poll) => {
    const totalVotes = poll.options.reduce((acc, option) => acc + option.votes, 0);
    if (totalVotes === 0) return 0;
    return Math.round((votes / totalVotes) * 100);
  };

  const getTotalVotes = (poll: Poll) => {
    return poll.options.reduce((acc, option) => acc + option.votes, 0);
  };

  const isPollActive = (poll: Poll) => {
    const now = new Date();
    return poll.isActive && 
           new Date(poll.startTime) <= now && 
           new Date(poll.endTime) >= now;
  };

  return (
    <AdminLayout>
      <AdminPageHeader
        title="Polls"
        description="Create and manage polls for attendees"
        actionLabel="Create Poll"
        onAction={handleCreatePoll}
        tabs={[
          { id: 'all', label: 'All Polls' },
          { id: 'active', label: 'Active' },
          { id: 'inactive', label: 'Inactive' },
        ]}
        defaultTab="active"
        onTabChange={setActiveTab}
      >
        <TabsContent value="all" className="space-y-4">
          <div className="flex justify-between mb-4">
            <Input 
              placeholder="Search polls..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {renderPollsList(filteredPolls)}
          </div>
        </TabsContent>
        
        <TabsContent value="active" className="space-y-4">
          <div className="flex justify-between mb-4">
            <Input 
              placeholder="Search active polls..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {renderPollsList(filteredPolls)}
          </div>
        </TabsContent>
        
        <TabsContent value="inactive" className="space-y-4">
          <div className="flex justify-between mb-4">
            <Input 
              placeholder="Search inactive polls..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {renderPollsList(filteredPolls)}
          </div>
        </TabsContent>
      </AdminPageHeader>
    </AdminLayout>
  );

  function renderPollsList(polls: Poll[]) {
    return polls.length > 0 ? (
      polls.map(poll => (
        <Card key={poll.id} className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-medium">{poll.question}</CardTitle>
                <CardDescription className="text-xs mt-1">
                  Created: {format(new Date(poll.createdAt), 'MMM d, yyyy')}
                </CardDescription>
              </div>
              <div className="flex space-x-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-8 w-8 p-0" 
                        onClick={() => handleEditPoll(poll)}
                      >
                        <Edit size={16} />
                        <span className="sr-only">Edit</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Edit Poll</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10" 
                        onClick={() => handleDeletePoll(poll)}
                      >
                        <Trash2 size={16} />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Delete Poll</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {isPollActive(poll) && (
                <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Live</Badge>
              )}
              {poll.displayAsBanner && (
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Banner</Badge>
              )}
              {poll.showResults && (
                <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">Results Visible</Badge>
              )}
              <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">
                {getTotalVotes(poll)} votes
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 mt-2">
              {poll.options.map((option) => (
                <div key={option.id} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{option.text}</span>
                    <span className="font-medium">{calculatePercentage(option.votes, poll)}%</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary" 
                      style={{ width: `${calculatePercentage(option.votes, poll)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex flex-wrap gap-3 border-t pt-3">
            <div className="flex items-center space-x-2">
              <Switch 
                id={`active-${poll.id}`}
                checked={poll.isActive}
                onCheckedChange={() => handleTogglePollActive(poll)}
              />
              <Label htmlFor={`active-${poll.id}`} className="text-sm">Active</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id={`results-${poll.id}`}
                checked={poll.showResults}
                onCheckedChange={() => handleToggleShowResults(poll)}
              />
              <Label htmlFor={`results-${poll.id}`} className="text-sm">Show Results</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id={`banner-${poll.id}`}
                checked={poll.displayAsBanner}
                onCheckedChange={() => handleToggleBanner(poll)}
              />
              <Label htmlFor={`banner-${poll.id}`} className="text-sm">Show as Banner</Label>
            </div>
          </CardFooter>
        </Card>
      ))
    ) : (
      <div className="col-span-2 text-center py-8">
        <BarChart4 className="mx-auto h-12 w-12 text-muted-foreground opacity-30" />
        <h3 className="mt-4 text-lg font-medium">No polls found</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {activeTab === 'active' 
            ? "No active polls found. Create a new poll to get started."
            : activeTab === 'inactive'
            ? "No inactive polls found."
            : "No polls match your search criteria."
          }
        </p>
        <Button onClick={handleCreatePoll} className="mt-4">
          <Plus size={16} className="mr-1" />
          Create Poll
        </Button>
      </div>
    );
  }
};

export default AdminPolls;
