
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Star, CheckCircle, XCircle, Clock, Lightbulb, Building } from "lucide-react";
import { format } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'new':
        return <Badge className="bg-blue-100 text-blue-800 text-xs">New</Badge>;
      case 'reviewed':
        return <Badge className="bg-yellow-100 text-yellow-800 text-xs">Reviewed</Badge>;
      case 'implemented':
        return <Badge className="bg-green-100 text-green-800 text-xs">Implemented</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{status}</Badge>;
    }
  };

  return (
    <Card className="glass-card overflow-hidden hover:shadow-xl transition-all">
      <CardHeader className={`pb-2 flex ${isMobile ? 'flex-col gap-3' : 'flex-row'} items-start justify-between`}>
        <div className="flex items-center gap-3 w-full">
          <Avatar className={isMobile ? 'w-8 h-8' : 'w-10 h-10'}>
            <AvatarImage src={userPhoto || ''} />
            <AvatarFallback className="text-xs">{userName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <CardTitle className={`${isMobile ? 'text-sm' : 'text-base'} truncate`}>{userName}</CardTitle>
            <CardDescription className="text-xs">
              {format(new Date(suggestion.created_at), isMobile ? 'MMM d, yyyy' : 'MMM d, yyyy h:mm a')}
            </CardDescription>
          </div>
        </div>
        <div className={`flex ${isMobile ? 'flex-row flex-wrap justify-start w-full' : 'flex-col items-end'} gap-2`}>
          {getStatusBadge(suggestion.status)}
          <Badge variant={suggestion.type === 'rating' ? 'default' : 'outline'} className="text-xs">
            {suggestion.type === 'rating' ? 'Rating' : 'Suggestion'}
          </Badge>
          {!selectedEventId && suggestion.event_name && (
            <Badge variant="secondary" className="flex items-center gap-1 text-xs max-w-full">
              <Building size={10} />
              <span className="truncate">{suggestion.event_name}</span>
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <p className={`${isMobile ? 'text-sm' : 'text-base'} mb-3 leading-relaxed`}>{suggestion.content}</p>
        {suggestion.type === 'rating' && suggestion.rating && (
          <div className="flex items-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                size={isMobile ? 14 : 16} 
                className={i < suggestion.rating! ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} 
              />
            ))}
            <span className="ml-2 text-xs text-muted-foreground">
              {suggestion.rating}/5 stars
            </span>
          </div>
        )}
      </CardContent>
      <CardFooter className={`border-t pt-3 ${isMobile ? 'flex-col gap-3' : 'flex-row justify-between'}`}>
        <div className="text-xs text-muted-foreground">
          ID: {suggestion.id.slice(0, 8)}...
        </div>
        <div className={`flex gap-2 ${isMobile ? 'flex-col w-full' : 'flex-row'}`}>
          {suggestion.status === 'new' && (
            <Button 
              size={isMobile ? "sm" : "sm"}
              variant="outline"
              className={`text-yellow-600 border-yellow-200 hover:bg-yellow-50 ${isMobile ? 'w-full justify-center' : ''}`}
              onClick={() => onUpdateStatus(suggestion, 'reviewed')}
            >
              <Clock size={14} className="mr-1" />
              <span className="text-xs">Mark Reviewed</span>
            </Button>
          )}
          {suggestion.status !== 'implemented' && (
            <Button 
              size={isMobile ? "sm" : "sm"}
              variant="outline"
              className={`text-green-600 border-green-200 hover:bg-green-50 ${isMobile ? 'w-full justify-center' : ''}`}
              onClick={() => onUpdateStatus(suggestion, 'implemented')}
            >
              <CheckCircle size={14} className="mr-1" />
              <span className="text-xs">Mark Implemented</span>
            </Button>
          )}
          <Button 
            size={isMobile ? "sm" : "sm"}
            variant="outline" 
            className={`text-destructive border-destructive/20 hover:bg-destructive/10 ${isMobile ? 'w-full justify-center' : ''}`}
            onClick={() => onDelete(suggestion)}
            disabled={isDeleting}
          >
            <XCircle size={14} className="mr-1" />
            <span className="text-xs">Delete</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default SuggestionCard;
