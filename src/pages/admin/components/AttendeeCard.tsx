
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Mail, Calendar, Edit2, Trash2, Briefcase, Code, Palette } from "lucide-react";
import { format } from "date-fns";

type AttendeeCardProps = {
  attendee: {
    id: string;
    name: string;
    email: string;
    photo_url?: string;
    bio?: string;
    company?: string;
    role?: string;
    joined_at: string;
  };
  onEdit: (attendee: any) => void;
  onDelete: (attendee: any) => void;
};

function getCategoryBadge(bio?: string) {
  const txt = bio?.toLowerCase() || "";
  if (txt.includes("tech") || txt.includes("dev") || txt.includes("engineer"))
    return <Badge variant="info" className="gap-1 text-xs"><Code size={12} />Technical</Badge>;
  if (txt.includes("design") || txt.includes("ux") || txt.includes("ui"))
    return <Badge variant="secondary" className="gap-1 text-xs"><Palette size={12}/>Design</Badge>;
  if (txt.includes("business") || txt.includes("management") || txt.includes("marketing"))
    return <Badge variant="success" className="gap-1 text-xs"><Briefcase size={12}/>Business</Badge>;
  return null;
}

const AttendeeCard: React.FC<AttendeeCardProps> = ({ attendee, onEdit, onDelete }) => {
  return (
    <div className="glass-card rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row gap-3 sm:gap-4 items-start shadow hover:shadow-xl transition-all w-full max-w-full overflow-hidden">
      <div className="flex-shrink-0 self-center sm:self-start">
        <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
          <AvatarImage src={attendee.photo_url} alt={attendee.name} />
          <AvatarFallback className="text-xs sm:text-sm">{attendee.name?.charAt(0) || 'U'}</AvatarFallback>
        </Avatar>
      </div>
      
      <div className="flex-1 min-w-0 w-full space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <span className="font-semibold text-sm sm:text-base truncate max-w-full">
            {attendee.name || 'Unknown'}
          </span>
          <div className="flex-shrink-0">
            {getCategoryBadge(attendee.bio)}
          </div>
        </div>
        
        <div className="flex flex-col gap-1.5 text-muted-foreground text-xs w-full">
          <div className="flex items-center gap-1.5 min-w-0">
            <Mail size={12} className="flex-shrink-0" />
            <span className="truncate break-all text-xs">{attendee.email}</span>
          </div>
          
          {attendee.company && (
            <div className="flex items-center gap-1.5 min-w-0">
              <Briefcase size={12} className="flex-shrink-0" />
              <span className="truncate text-xs">{attendee.company}</span>
            </div>
          )}
          
          <div className="flex items-center gap-1.5">
            <Calendar size={12} className="flex-shrink-0" />
            <span className="text-xs">{format(new Date(attendee.joined_at), "MMM d, yyyy")}</span>
          </div>
        </div>
        
        {attendee.bio && (
          <div className="text-xs text-muted-foreground break-words line-clamp-2 max-w-full">
            {attendee.bio}
          </div>
        )}
      </div>
      
      <div className="flex gap-1 self-center sm:self-start flex-shrink-0">
        <Button
          size="icon"
          variant="ghost"
          aria-label="Edit Attendee"
          onClick={() => onEdit(attendee)}
          className="h-8 w-8"
        >
          <Edit2 size={14} />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          aria-label="Delete Attendee"
          onClick={() => onDelete(attendee)}
          className="h-8 w-8"
        >
          <Trash2 size={14} className="text-destructive" />
        </Button>
      </div>
    </div>
  );
};

export default AttendeeCard;
