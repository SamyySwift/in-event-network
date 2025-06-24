
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, AlertTriangle, Loader, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

function getPriorityBadge(priority: string) {
  switch (priority) {
    case "high":
      return (
        <Badge className="bg-gradient-to-r from-red-500 to-yellow-400 text-white">
          <AlertTriangle className="inline-block w-4 h-4 mr-1" /> High
        </Badge>
      );
    case "normal":
      return <Badge className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white">Normal</Badge>;
    case "low":
      return <Badge className="bg-gradient-to-r from-slate-400 to-gray-200 text-white">Low</Badge>;
    default:
      return <Badge>Normal</Badge>;
  }
}

interface AnnouncementCardProps {
  announcement: any;
  onEdit: (a: any) => void;
  onDelete: (id: string) => void;
  isUpdating: boolean;
  isDeleting: boolean;
}

const AnnouncementCard: React.FC<AnnouncementCardProps> = ({
  announcement,
  onEdit,
  onDelete,
  isUpdating,
  isDeleting,
}) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="glass-card border p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row gap-4 shadow-lg hover:shadow-primary/20 transition-shadow">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <h3 className="font-semibold text-lg">{announcement.title}</h3>
          {getPriorityBadge(announcement.priority)}
          {announcement.send_immediately && (
            <Badge className="bg-gradient-to-r from-green-400 to-green-600 text-white">Immediate</Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground mb-2">{announcement.content}</p>
        {announcement.image_url && (
          <img
            src={announcement.image_url}
            alt="Announcement"
            className="w-full h-32 object-cover rounded-xl mb-2 border-2 border-primary/20"
          />
        )}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="w-4 h-4" />
          Created: {new Date(announcement.created_at).toLocaleString()}
        </div>
      </div>
      
      {/* Mobile: Horizontal button layout, Desktop: Vertical */}
      <div className={cn(
        "flex gap-2 shrink-0",
        isMobile ? "flex-row justify-end" : "flex-col"
      )}>
        <Button
          variant="ghost"
          size={isMobile ? "sm" : "icon"}
          onClick={() => onEdit(announcement)}
          disabled={isUpdating}
          className="hover:bg-gradient-to-tr from-primary/10 to-primary/30"
        >
          <Pencil className="h-4 w-4" />
          {isMobile && <span className="ml-1 text-xs">Edit</span>}
        </Button>
        <Button
          variant="ghost"
          size={isMobile ? "sm" : "icon"}
          onClick={() => onDelete(announcement.id)}
          disabled={isDeleting}
          className="hover:bg-gradient-to-tr from-destructive/10 to-destructive/30"
        >
          <Trash2 className="h-4 w-4" />
          {isMobile && <span className="ml-1 text-xs">Delete</span>}
        </Button>
      </div>
    </div>
  );
};

export default AnnouncementCard;
