
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Star, CheckCircle, XCircle, Clock, Lightbulb, Building } from "lucide-react";
import { format } from "date-fns";

interface Profile {
  id: string;
  name: string | null;
  photo_url: string | null;
}

interface SuggestionWithProfile {
  id: string;
  content: string;
  type: 'suggestion' | 'rating';
  rating: number | null;
  status: 'new' | 'reviewed' | 'implemented';
  created_at: string;
  user_id: string;
  event_id: string | null;
  profile: Profile | null;
  event_name?: string;
}

type SuggestionCardProps = {
  suggestion: SuggestionWithProfile;
  onUpdateStatus: (suggestion: SuggestionWithProfile, newStatus: 'new' | 'reviewed' | 'implemented') => void;
  onDelete: (suggestion: SuggestionWithProfile) => void;
  selectedEventId?: string | null;
  isDeleting: boolean;
};

const SuggestionCard: React.FC<SuggestionCardProps> = ({
  suggestion,
  onUpdateStatus,
  onDelete,
  selectedEventId,
  isDeleting,
}) => {
  const userName = suggestion.profile?.name || 'Anonymous User';
  const userPhoto = suggestion.profile?.photo_url;

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'new':
        return <Badge className="bg-blue-100 text-blue-800">New</Badge>;
      case 'reviewed':
        return <Badge className="bg-yellow-100 text-yellow-800">Reviewed</Badge>;
      case 'implemented':
        return <Badge className="bg-green-100 text-green-800">Implemented</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card className="glass-card overflow-hidden hover:shadow-xl transition-all">
      <CardHeader className="pb-2 flex flex-row items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={userPhoto || ''} />
            <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-base">{userName}</CardTitle>
            <CardDescription>
              {format(new Date(suggestion.created_at), 'MMM d, yyyy h:mm a')}
            </CardDescription>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          {getStatusBadge(suggestion.status)}
          <Badge variant={suggestion.type === 'rating' ? 'default' : 'outline'}>
            {suggestion.type === 'rating' ? 'Rating' : 'Suggestion'}
          </Badge>
          {!selectedEventId && suggestion.event_name && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Building size={12} />
              {suggestion.event_name}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-base mb-3">{suggestion.content}</p>
        {suggestion.type === 'rating' && suggestion.rating && (
          <div className="flex items-center gap-1 mb-2">
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
          ID: {suggestion.id.slice(0, 8)}...
        </div>
        <div className="flex gap-2">
          {suggestion.status === 'new' && (
            <Button 
              size="sm" 
              variant="outline"
              className="text-yellow-600 border-yellow-200 hover:bg-yellow-50"
              onClick={() => onUpdateStatus(suggestion, 'reviewed')}
            >
              <Clock size={16} className="mr-1" />
              Mark Reviewed
            </Button>
          )}
          {suggestion.status !== 'implemented' && (
            <Button 
              size="sm" 
              variant="outline"
              className="text-green-600 border-green-200 hover:bg-green-50"
              onClick={() => onUpdateStatus(suggestion, 'implemented')}
            >
              <CheckCircle size={16} className="mr-1" />
              Mark Implemented
            </Button>
          )}
          <Button 
            size="sm" 
            variant="outline" 
            className="text-destructive border-destructive/20 hover:bg-destructive/10"
            onClick={() => onDelete(suggestion)}
            disabled={isDeleting}
          >
            <XCircle size={16} className="mr-1" />
            Delete
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default SuggestionCard;
