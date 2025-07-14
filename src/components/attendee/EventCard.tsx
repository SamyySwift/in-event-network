import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Users, ExternalLink, Wifi } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface EventCardProps {
  event: {
    id: string;
    name: string;
    description?: string;
    start_time: string;
    end_time: string;
    location?: string;
    banner_url?: string;
    logo_url?: string;
    website?: string;
  };
  isLive?: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({ event, isLive = false }) => {
  const navigate = useNavigate();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatDateTime = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const startDate = formatDate(startTime);
    const startTimeStr = formatTime(startTime);
    const endTimeStr = formatTime(endTime);

    return {
      date: startDate,
      time: `${startTimeStr} - ${endTimeStr}`,
    };
  };

  const { date, time } = formatDateTime(event.start_time, event.end_time);

  return (
    <Card className="border-0 shadow-lg bg-white backdrop-blur-sm overflow-hidden group hover:shadow-xl transition-all duration-300 relative">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/90 to-purple-50/90 z-0"></div>
      
      {/* Event image/banner */}
      {(event.banner_url || event.logo_url) && (
        <div className="relative h-48 w-full -mx-4 -mt-4 overflow-hidden">
          <img
            src={event.banner_url || event.logo_url}
            alt={event.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10"></div>
          {isLive && (
            <div className="absolute top-3 right-3 z-20">
              <Badge className="bg-green-500 text-white border-0 animate-pulse">
                <Wifi className="w-3 h-3 mr-1" />
                LIVE
              </Badge>
            </div>
          )}
        </div>
      )}

      <CardHeader className="relative z-20 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-3 h-3 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-blue-500'}`}></div>
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {isLive ? 'Live Event' : 'Event Details'}
              </span>
            </div>
            <CardTitle className="text-xl leading-tight">{event.name}</CardTitle>
          </div>
          {!event.banner_url && !event.logo_url && isLive && (
            <Badge className="bg-green-500 text-white border-0 animate-pulse">
              <Wifi className="w-3 h-3 mr-1" />
              LIVE
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="relative z-20 space-y-4">
        {/* Event Details */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 text-indigo-500 flex-shrink-0" />
            <span className="font-medium">{date}</span>
          </div>
          
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Clock className="h-4 w-4 text-indigo-500 flex-shrink-0" />
            <span className="font-medium">{time}</span>
          </div>
          
          {event.location && (
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 text-indigo-500 flex-shrink-0" />
              <span className="font-medium">{event.location}</span>
            </div>
          )}
        </div>

        {/* Event Description */}
        {event.description && (
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
            {event.description}
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/attendee/schedule")}
            className="flex-1"
          >
            <Calendar className="w-4 h-4 mr-2" />
            View Schedule
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/attendee/networking")}
            className="flex-1"
          >
            <Users className="w-4 h-4 mr-2" />
            Network
          </Button>

          {event.website && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(event.website, '_blank')}
              className="flex-1"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Website
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};