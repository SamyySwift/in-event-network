
import React, { useState } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import CreatePollDialog from '@/components/admin/CreatePollDialog';
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
  BarChart4 
} from 'lucide-react';
import { format } from 'date-fns';
import { useIsMobile } from '@/hooks/use-mobile';
import { usePolls, Poll } from '@/hooks/usePolls';
import { useToast } from '@/hooks/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const AdminPolls = () => {
  const [activeTab, setActiveTab] = useState<string>('active');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const { polls, isLoading, updatePoll, deletePoll, isDeleting } = usePolls();
  
  // Filter polls based on tab and search query
  const filteredPolls = polls.filter(poll => {
    const matchesTab = 
      activeTab === 'all' || 
      (activeTab === 'active' && poll.is_active) || 
      (activeTab === 'inactive' && !poll.is_active);
    
    const matchesSearch = poll.question.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesTab && matchesSearch;
  });

  const handleCreatePoll = () => {
    // This will be handled by the CreatePollDialog component
  };

  const handleEditPoll = (poll: Poll) => {
    console.log('Edit poll', poll);
    toast({
      title: "Edit functionality",
      description: "Poll editing will be available in the next update"
    });
  };

  const handleDeletePoll = (poll: Poll) => {
    deletePoll(poll.id);
  };

  const handleTogglePollActive = (poll: Poll) => {
    updatePoll({
      id: poll.id,
      is_active: !poll.is_active
    });
  };

  const handleToggleShowResults = (poll: Poll) => {
    updatePoll({
      id: poll.id,
      show_results: !poll.show_results
    });
  };

  const handleToggleBanner = (poll: Poll) => {
    updatePoll({
      id: poll.id,
      display_as_banner: !poll.display_as_banner
    });
  };

  const calculatePercentage = (votes: number, poll: Poll) => {
    const totalVotes = poll.options.reduce((acc, option) => acc + (option.votes || 0), 0);
    if (totalVotes === 0) return 0;
    return Math.round((votes / totalVotes) * 100);
  };

  const getTotalVotes = (poll: Poll) => {
    return poll.options.reduce((acc, option) => acc + (option.votes || 0), 0);
  };

  const isPollActive = (poll: Poll) => {
    const now = new Date();
    return poll.is_active && 
           new Date(poll.start_time) <= now && 
           new Date(poll.end_time) >= now;
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <BarChart4 className="mx-auto h-12 w-12 text-muted-foreground opacity-30" />
            <p className="mt-2 text-muted-foreground">Loading polls...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <AdminPageHeader
        title="Polls"
        description="Create and manage polls for attendees"
        actionLabel="Create Poll"
        onAction={handleCreatePoll}
        ActionComponent={() => (
          <CreatePollDialog>
            <Button>
              <Plus size={16} className="mr-1" />
              Create Poll
            </Button>
          </CreatePollDialog>
        )}
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
                  Created: {format(new Date(poll.created_at), 'MMM d, yyyy')}
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

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10" 
                      disabled={isDeleting}
                    >
                      <Trash2 size={16} />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Poll</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this poll? This action cannot be undone and will remove all associated votes.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeletePoll(poll)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {isPollActive(poll) && (
                <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Live</Badge>
              )}
              {poll.display_as_banner && (
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Banner</Badge>
              )}
              {poll.show_results && (
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
                    <span className="font-medium">{calculatePercentage(option.votes || 0, poll)}%</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary" 
                      style={{ width: `${calculatePercentage(option.votes || 0, poll)}%` }}
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
                checked={poll.is_active}
                onCheckedChange={() => handleTogglePollActive(poll)}
              />
              <Label htmlFor={`active-${poll.id}`} className="text-sm">Active</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id={`results-${poll.id}`}
                checked={poll.show_results}
                onCheckedChange={() => handleToggleShowResults(poll)}
              />
              <Label htmlFor={`results-${poll.id}`} className="text-sm">Show Results</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id={`banner-${poll.id}`}
                checked={poll.display_as_banner}
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
        <CreatePollDialog>
          <Button className="mt-4">
            <Plus size={16} className="mr-1" />
            Create Poll
          </Button>
        </CreatePollDialog>
      </div>
    );
  }
};

export default AdminPolls;
