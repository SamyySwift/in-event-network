
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Clock, MapPin } from "lucide-react";
import { format, parseISO } from "date-fns";

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

const ScheduleItemCard: React.FC<ScheduleItemCardProps> = ({
  item, onEdit, onDelete
}) => (
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
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
          <Clock className="h-4 w-4" />
          {format(parseISO(item.start_time), 'MMM d, h:mm a')} - {format(parseISO(item.end_time), 'h:mm a')}
          {item.location && (
            <>
              <MapPin className="h-4 w-4 ml-2" />
              {item.location}
            </>
          )}
        </div>
        <div className="flex gap-2 mt-1">
          {getTypeBadge(item.type)}
          {getPriorityBadge(item.priority)}
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

export default ScheduleItemCard;
