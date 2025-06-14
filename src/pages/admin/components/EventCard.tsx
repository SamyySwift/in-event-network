
import React from "react";
import { Calendar, MapPin, Pencil, Trash2, Clock, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type EventCardProps = {
  event: {
    id: string;
    name: string;
    banner_url?: string | null;
    description?: string;
    start_time: string;
    end_time: string;
    location?: string;
  };
  onEdit: (event: any) => void;
  onDelete: (id: string) => void;
};

function getStatus(start: string, end: string) {
  const now = new Date();
  const s = new Date(start);
  const e = new Date(end);
  if (now >= s && now <= e) return "live";
  if (now < s) return "upcoming";
  // past events are not currently shown by AdminEvents per current functionality, but badge is here for possible future use
  return "past";
}

function statusBadge(status: string) {
  switch (status) {
    case "live":
      return (
        <Badge className="bg-gradient-to-r from-green-500 to-emerald-400 text-white border-0 shadow-md animate-pulse">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-1"></div>
          Live
        </Badge>
      );
    case "upcoming":
      return (
        <Badge className="bg-gradient-to-r from-blue-500 to-orange-400 text-white border-0 shadow-md">
          <Clock className="w-3 h-3 mr-1" />
          Upcoming
        </Badge>
      );
    case "past":
      return (
        <Badge className="bg-gray-200 text-gray-900 border-0">
          Past
        </Badge>
      );
    default: return null;
  }
}

export const EventCard: React.FC<EventCardProps> = ({ event, onEdit, onDelete }) => {
  const status = getStatus(event.start_time, event.end_time);
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  return (
    <div className="glass-card group p-4 rounded-xl border border-primary/10 bg-gradient-to-br from-background to-primary/5 hover:from-primary/5 hover:to-primary/10 transition-all hover:shadow-lg flex gap-4 items-stretch">
      <div className="w-32 min-w-[8rem] h-28 rounded-lg overflow-hidden bg-muted border border-muted-foreground/10 flex items-center justify-center">
        {event.banner_url 
          ? <img src={event.banner_url} alt={event.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" />
          : <Calendar className="w-8 h-8 text-muted-foreground opacity-60" />
        }
      </div>
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">{event.name}</h3>
            {statusBadge(status)}
          </div>
          {event.description && (
            <p className="text-sm text-muted-foreground mb-1 line-clamp-2">{event.description}</p>
          )}
        </div>
        <div className="flex flex-col gap-1 text-xs text-muted-foreground mt-2">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-primary/10">
              <Calendar className="h-3 w-3 text-primary" />
            </div>
            <span className="font-medium">
              {formatDate(event.start_time)} – {formatDate(event.end_time)}
            </span>
          </div>
          {event.location && (
            <div className="flex items-center gap-2">
              <div className="p-1 rounded bg-orange-100 dark:bg-orange-900">
                <MapPin className="h-3 w-3 text-orange-600" />
              </div>
              <span>{event.location}</span>
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-2 ml-4 self-center">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => onEdit(event)}
          className="hover:bg-primary/10 hover:text-primary transition-colors"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => onDelete(event.id)}
          className="hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
export default EventCard;
