
import React from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
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
import { CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { Suggestion } from '@/types';

// Mock users data for reference
const mockUsers = [
  { id: 'user1', name: 'Alex Johnson', photoUrl: 'https://i.pravatar.cc/150?img=1' },
  { id: 'user2', name: 'Morgan Smith', photoUrl: 'https://i.pravatar.cc/150?img=2' },
  { id: 'user3', name: 'Jamie Wilson', photoUrl: 'https://i.pravatar.cc/150?img=3' }
];

// Mock data for suggestions
const mockSuggestions: (Suggestion & { status?: 'new' | 'reviewed' | 'implemented' })[] = [
  {
    id: '1',
    content: 'It would be great to have more vegetarian food options at lunch.',
    userId: 'user1',
    eventId: 'event1',
    createdAt: '2025-06-15T11:30:00Z',
    status: 'new'
  },
  {
    id: '2',
    content: 'Consider adding a quiet room for attendees who need to take calls or have a break from the noise.',
    userId: 'user2',
    eventId: 'event1',
    createdAt: '2025-06-15T14:45:00Z',
    status: 'reviewed'
  },
  {
    id: '3',
    content: 'The mobile app should have an offline mode for accessing the schedule when wifi is spotty.',
    userId: 'user3',
    eventId: 'event1',
    createdAt: '2025-06-16T09:15:00Z',
    status: 'implemented'
  },
  {
    id: '4',
    content: 'Please consider more charging stations throughout the venue.',
    userId: 'user1',
    eventId: 'event1',
    createdAt: '2025-06-16T10:20:00Z',
    status: 'new'
  }
];

const AdminSuggestions = () => {
  // Helper function to get user data
  const getUserData = (userId: string) => {
    return mockUsers.find(u => u.id === userId) || { name: 'Unknown User', photoUrl: '' };
  };

  // Status badge color mapping
  const getStatusBadgeClass = (status?: string) => {
    switch(status) {
      case 'implemented':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'new':
      default:
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
    }
  };

  const handleMarkAsImplemented = (suggestion: Suggestion) => {
    console.log('Mark as implemented', suggestion);
  };

  const handleMarkAsReviewed = (suggestion: Suggestion) => {
    console.log('Mark as reviewed', suggestion);
  };

  const handleDeleteSuggestion = (suggestion: Suggestion) => {
    console.log('Delete suggestion', suggestion);
  };

  return (
    <AdminLayout>
      <AdminPageHeader
        title="Attendee Suggestions"
        description="Review and manage feedback and suggestions from attendees"
      >
        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <MessageSquare size={18} className="text-primary" />
              <h2 className="text-lg font-semibold">Suggestions ({mockSuggestions.length})</h2>
            </div>
            <div className="flex gap-2">
              <Badge className="bg-yellow-100 text-yellow-800">
                New: {mockSuggestions.filter(s => s.status === 'new').length}
              </Badge>
              <Badge className="bg-blue-100 text-blue-800">
                Reviewed: {mockSuggestions.filter(s => s.status === 'reviewed').length}
              </Badge>
              <Badge className="bg-green-100 text-green-800">
                Implemented: {mockSuggestions.filter(s => s.status === 'implemented').length}
              </Badge>
            </div>
          </div>
          
          {mockSuggestions.map((suggestion) => {
            const user = getUserData(suggestion.userId);
            return (
              <Card key={suggestion.id}>
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
                    <Badge className={getStatusBadgeClass(suggestion.status)}>
                      {suggestion.status ? suggestion.status.charAt(0).toUpperCase() + suggestion.status.slice(1) : 'New'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-base">{suggestion.content}</p>
                </CardContent>
                <CardFooter className="border-t pt-3 flex justify-between">
                  <div className="text-sm text-muted-foreground">
                    Suggestion ID: {suggestion.id}
                  </div>
                  <div className="flex gap-2">
                    {suggestion.status !== 'implemented' && (
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
                    {suggestion.status === 'new' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        onClick={() => handleMarkAsReviewed(suggestion)}
                      >
                        <CheckCircle size={16} className="mr-1" />
                        Mark Reviewed
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
          })}
        </div>
      </AdminPageHeader>
    </AdminLayout>
  );
};

export default AdminSuggestions;
