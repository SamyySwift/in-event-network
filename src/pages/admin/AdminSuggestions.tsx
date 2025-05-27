
import React, { useState } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { TabsContent } from '@/components/ui/tabs';
import { 
  Card, 
  CardContent,
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CheckCircle, XCircle, Star } from 'lucide-react';
import { format } from 'date-fns';
import { Suggestion } from '@/types';

// Mock users data for reference
const mockUsers = [
  { id: 'user1', name: 'Alex Johnson', photoUrl: 'https://i.pravatar.cc/150?img=1' },
  { id: 'user2', name: 'Morgan Smith', photoUrl: 'https://i.pravatar.cc/150?img=2' },
  { id: 'user3', name: 'Jamie Wilson', photoUrl: 'https://i.pravatar.cc/150?img=3' }
];

// Mock data for suggestions with proper type field
const mockSuggestions: (Suggestion & { status?: 'new' | 'reviewed' | 'implemented' })[] = [
  {
    id: '1',
    content: 'It would be great to have more networking breaks between sessions.',
    userId: 'user1',
    eventId: 'event1',
    createdAt: '2025-06-15T10:15:00Z',
    type: 'suggestion',
    status: 'new'
  },
  {
    id: '2',
    content: 'The WiFi connection could be improved in the main hall.',
    userId: 'user2',
    eventId: 'event1',
    createdAt: '2025-06-15T11:30:00Z',
    type: 'suggestion',
    status: 'reviewed'
  },
  {
    id: '3',
    content: 'Add more vegetarian options to the catering menu.',
    userId: 'user3',
    eventId: 'event1',
    createdAt: '2025-06-15T14:45:00Z',
    type: 'suggestion',
    status: 'implemented'
  },
  {
    id: '4',
    content: 'Provide charging stations in all meeting rooms.',
    userId: 'user1',
    eventId: 'event1',
    createdAt: '2025-06-15T16:20:00Z',
    type: 'suggestion',
    status: 'new'
  },
  {
    id: '5',
    content: 'Overall event rating: Excellent organization and content!',
    userId: 'user2',
    eventId: 'event1',
    createdAt: '2025-06-15T18:00:00Z',
    type: 'rating',
    rating: 5,
    status: 'new'
  }
];

const AdminSuggestions = () => {
  const [activeTab, setActiveTab] = useState<string>('all');
  
  // Filter suggestions based on active tab
  const getFilteredSuggestions = () => {
    switch(activeTab) {
      case 'suggestions':
        return mockSuggestions.filter(s => s.type === 'suggestion');
      case 'ratings':
        return mockSuggestions.filter(s => s.type === 'rating');
      case 'new':
        return mockSuggestions.filter(s => s.status === 'new');
      case 'reviewed':
        return mockSuggestions.filter(s => s.status === 'reviewed');
      default:
        return mockSuggestions;
    }
  };

  // Helper function to get user data
  const getUserData = (userId: string) => {
    return mockUsers.find(u => u.id === userId) || { name: 'Unknown User', photoUrl: '' };
  };

  const handleMarkAsReviewed = (suggestion: Suggestion) => {
    console.log('Mark as reviewed', suggestion);
  };

  const handleMarkAsImplemented = (suggestion: Suggestion) => {
    console.log('Mark as implemented', suggestion);
  };

  const handleDeleteSuggestion = (suggestion: Suggestion) => {
    console.log('Delete suggestion', suggestion);
  };

  const filteredSuggestions = getFilteredSuggestions();

  return (
    <AdminLayout>
      <AdminPageHeader
        title="Suggestions & Ratings"
        description="Review attendee feedback, suggestions, and event ratings"
        tabs={[
          { id: 'all', label: 'All Feedback' },
          { id: 'suggestions', label: 'Suggestions' },
          { id: 'ratings', label: 'Ratings' },
          { id: 'new', label: 'New' },
          { id: 'reviewed', label: 'Reviewed' }
        ]}
        defaultTab="all"
        onTabChange={setActiveTab}
      >
        {['all', 'suggestions', 'ratings', 'new', 'reviewed'].map(tabId => (
          <TabsContent key={tabId} value={tabId} className="space-y-4">
            {filteredSuggestions.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center text-muted-foreground">
                  No feedback found in this category.
                </CardContent>
              </Card>
            ) : (
              filteredSuggestions.map(suggestion => {
                const user = getUserData(suggestion.userId);
                return (
                  <Card key={suggestion.id} className={
                    suggestion.status === 'implemented' ? 'border-green-100' : 
                    suggestion.status === 'reviewed' ? 'border-yellow-100' : ''
                  }>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={user.photoUrl} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-base">{user.name}</CardTitle>
                            <CardDescription>
                              {format(new Date(suggestion.createdAt), 'MMM d, yyyy h:mm a')}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant={
                            suggestion.type === 'rating' ? 'default' : 'secondary'
                          }>
                            {suggestion.type === 'rating' ? 'Rating' : 'Suggestion'}
                          </Badge>
                          <Badge variant={
                            suggestion.status === 'implemented' ? 'outline' :
                            suggestion.status === 'reviewed' ? 'secondary' : 'default'
                          }>
                            {suggestion.status?.charAt(0).toUpperCase() + suggestion.status?.slice(1)}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-base mb-3">{suggestion.content}</p>
                      {suggestion.type === 'rating' && suggestion.rating && (
                        <div className="flex items-center gap-1 mt-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={16}
                              className={i < suggestion.rating! ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                            />
                          ))}
                          <span className="ml-2 text-sm text-muted-foreground">
                            {suggestion.rating}/5 stars
                          </span>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="border-t pt-3 flex justify-between">
                      <div className="text-sm text-muted-foreground">
                        ID: {suggestion.id}
                      </div>
                      <div className="flex gap-2">
                        {suggestion.status === 'new' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-yellow-600 border-yellow-200 hover:bg-yellow-50"
                            onClick={() => handleMarkAsReviewed(suggestion)}
                          >
                            <CheckCircle size={16} className="mr-1" />
                            Mark Reviewed
                          </Button>
                        )}
                        {suggestion.status === 'reviewed' && suggestion.type === 'suggestion' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-green-600 border-green-200 hover:bg-green-50"
                            onClick={() => handleMarkAsImplemented(suggestion)}
                          >
                            <CheckCircle size={16} className="mr-1" />
                            Mark Implemented
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-destructive border-destructive/20 hover:bg-destructive/10"
                          onClick={() => handleDeleteSuggestion(suggestion)}
                        >
                          <XCircle size={16} className="mr-1" />
                          Remove
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                );
              })
            )}
          </TabsContent>
        ))}
      </AdminPageHeader>
    </AdminLayout>
  );
};

export default AdminSuggestions;
