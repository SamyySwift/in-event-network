import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Calendar, MapPin, User, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface EventInfoCardProps {
  eventName: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  hostName?: string;
  description?: string;
}

const EventInfoCard: React.FC<EventInfoCardProps> = ({
  eventName,
  startTime,
  endTime,
  location,
  hostName,
  description,
}) => {
  const formatDateTime = (dateString?: string) => {
    if (!dateString) return null;
    try {
      return format(new Date(dateString), 'MMM dd, yyyy • h:mm a');
    } catch {
      return null;
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto border-2 border-primary/20 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 pb-4">
        <h2 className="text-2xl font-bold text-center text-foreground">{eventName}</h2>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-4">
        {(startTime || endTime) && (
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-sm text-muted-foreground">Date & Time</p>
              {startTime && (
                <p className="text-foreground">{formatDateTime(startTime)}</p>
              )}
              {endTime && startTime !== endTime && (
                <p className="text-sm text-muted-foreground">
                  Ends: {formatDateTime(endTime)}
                </p>
              )}
            </div>
          </div>
        )}

        {location && (
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-sm text-muted-foreground">Location</p>
              <p className="text-foreground">{location}</p>
            </div>
          </div>
        )}

        {hostName && (
          <div className="flex items-start gap-3">
            <User className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-sm text-muted-foreground">Hosted by</p>
              <p className="text-foreground">{hostName}</p>
            </div>
          </div>
        )}

        {description && (
          <div className="pt-2 border-t">
            <p className="font-medium text-sm text-muted-foreground mb-2">About</p>
            <p className="text-sm text-foreground leading-relaxed">{description}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EventInfoCard;
