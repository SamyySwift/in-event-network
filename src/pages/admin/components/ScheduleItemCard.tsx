
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Clock, MapPin, Calendar } from "lucide-react";
import { formatDisplayTime, formatDisplayDate, formatDuration, parseTimeAllocation } from "@/utils/timezone";

interface ScheduleItem {
  id: string;
  title: string;
  description: string | null;
  start_date?: string | null;
  end_date?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  start_time_full?: string;
  end_time_full?: string;
  time_allocation?: string | null;
  location: string | null;
  type: string;
  priority: string;
  image_url: string | null;
  event_id: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

interface ScheduleItemCardProps {
  item: ScheduleItem;
  onEdit: (item: ScheduleItem) => void;
  onDelete: (item: ScheduleItem) => void;
}

const getTypeBadge = (type: string) => {
  switch (type) {
    case "session":
      return <Badge className="bg-gradient-to-r from-indigo-500 to-blue-400 text-white">Session</Badge>;
    case "break":
      return <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white">Break</Badge>;
    case "networking":
      return <Badge className="bg-gradient-to-r from-green-500 to-teal-400 text-white">Networking</Badge>;
    case "meal":
      return <Badge className="bg-gradient-to-r from-pink-400 to-fuchsia-500 text-white">Meal</Badge>;
    default:
      return <Badge variant="outline">{type}</Badge>;
  }
};

const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case 'high':
      return <Badge className="bg-gradient-to-r from-red-500 to-yellow-400 text-white">High</Badge>;
    case 'medium':
      return <Badge className="bg-gradient-to-r from-yellow-100 to-yellow-300 text-yellow-800">Medium</Badge>;
    case 'low':
      return <Badge className="bg-gradient-to-r from-emerald-200 to-green-300 text-green-900">Low</Badge>;
    default:
      return <Badge variant="outline">{priority}</Badge>;
  }
};

const formatTimeDisplay = (item: ScheduleItem): string => {
  // Priority order for time display:
  // 1. start_time/end_time (database timestamps)
  // 2. start_time_full/end_time_full (legacy)
  // 3. start_time_only/end_time_only (time fields)
  
  let startTimeStr = '';
  let endTimeStr = '';
  
  // Get start time
  if (item.start_time) {
    startTimeStr = formatDisplayTime(item.start_time);
  } else if (item.start_time_full) {
    startTimeStr = formatDisplayTime(item.start_time_full);
  }
  
  // Get end time
  if (item.end_time) {
    endTimeStr = formatDisplayTime(item.end_time);
  } else if (item.end_time_full) {
    endTimeStr = formatDisplayTime(item.end_time_full);
  }
  
  // Build display string
  if (startTimeStr && endTimeStr) {
    return `${startTimeStr} - ${endTimeStr}`;
  } else if (startTimeStr) {
    return startTimeStr;
  } else if (endTimeStr) {
    return `Until ${endTimeStr}`;
  }
  
  return '';
};

const formatDateDisplay = (item: ScheduleItem): string => {
  if (item.start_date) {
    if (item.end_date && item.end_date !== item.start_date) {
      return `${formatDisplayDate(item.start_date)} - ${formatDisplayDate(item.end_date)}`;
    }
    return formatDisplayDate(item.start_date);
  }
  
  // Fallback to extracting date from timestamp
  if (item.start_time) {
    return formatDisplayDate(item.start_time);
  } else if (item.start_time_full) {
    return formatDisplayDate(item.start_time_full);
  }
  
  return '';
};

const ScheduleItemCard: React.FC<ScheduleItemCardProps> = ({
  item, onEdit, onDelete
}) => {
  const timeDisplay = formatTimeDisplay(item);
  const dateDisplay = formatDateDisplay(item);
  const durationMinutes = item.time_allocation ? parseTimeAllocation(item.time_allocation) : 0;
  const durationDisplay = formatDuration(durationMinutes);

  return (
    <Card className="glass-card hover:shadow-md transition-shadow">
      <CardHeader className="pb-2 flex flex-row gap-4 items-center">
        {item.image_url && (
          <img
            src={item.image_url}
            alt={item.title}
            className="w-16 h-16 object-cover rounded border border-primary/30"
          />
        )}
        <div className="flex-1">
          <CardTitle className="text-lg">{item.title}</CardTitle>
          <CardDescription className="mt-1">{item.description}</CardDescription>
          
          {/* Date and Time Information */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mt-2">
            {dateDisplay && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{dateDisplay}</span>
              </div>
            )}
            
            {timeDisplay && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{timeDisplay}</span>
              </div>
            )}
            
            {item.location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{item.location}</span>
              </div>
            )}
          </div>
          
          {/* Badges */}
          <div className="flex gap-2 mt-2">
            {getTypeBadge(item.type)}
            {getPriorityBadge(item.priority)}
            {durationDisplay && (
              <Badge variant="outline" className="text-xs">
                {durationDisplay}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Button variant="outline" size="icon" onClick={() => onEdit(item)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline"
            className="text-destructive border-destructive/20 hover:bg-destructive/10"
            size="icon"
            onClick={() => onDelete(item)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
    </Card>
  );
};

export default ScheduleItemCard;
