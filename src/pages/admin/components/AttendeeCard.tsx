
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
    return <Badge variant="info" className="gap-1"><Code size={14} />Technical</Badge>;
  if (txt.includes("design") || txt.includes("ux") || txt.includes("ui"))
    return <Badge variant="secondary" className="gap-1"><Palette size={14}/>Design</Badge>;
  if (txt.includes("business") || txt.includes("management") || txt.includes("marketing"))
    return <Badge variant="success" className="gap-1"><Briefcase size={14}/>Business</Badge>;
  return null;
}

const AttendeeCard: React.FC<AttendeeCardProps> = ({ attendee, onEdit, onDelete }) => {
  return (
    <div className="glass-card rounded-xl px-3 py-2 mb-4 flex flex-col sm:flex-row gap-4 sm:gap-4 items-start sm:items-center shadow hover:shadow-xl transition-all">
      <div className="flex-shrink-0">
        <Avatar className="h-12 w-12">
          <AvatarImage src={attendee.photo_url} alt={attendee.name} />
          <AvatarFallback>{attendee.name?.charAt(0) || 'U'}</AvatarFallback>
        </Avatar>
      </div>
      <div className="flex-1 min-w-0 flex flex-col gap-1 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
          <span className="font-semibold truncate text-base sm:text-lg max-w-[90vw]">{attendee.name || 'Unknown'}</span>
          {getCategoryBadge(attendee.bio)}
        </div>
        <div className="flex flex-col sm:flex-row flex-wrap sm:items-center gap-1.5 sm:gap-3 text-muted-foreground text-xs sm:text-xs w-full">
          <span className="flex items-center gap-1 min-w-0 break-all max-w-full">
            <Mail size={14} className="flex-shrink-0" />
            <span className="truncate break-all">{attendee.email}</span>
          </span>
          {attendee.company && (
            <span className="flex items-center gap-1 min-w-0 truncate max-w-full">
              <Briefcase size={13}/> <span className="truncate">{attendee.company}</span>
            </span>
          )}
          <span className="flex items-center gap-1 min-w-0">
            <Calendar size={13} /> {format(new Date(attendee.joined_at), "MMM d, yyyy")}
          </span>
        </div>
        {attendee.bio && (
          <div
            className="text-xs sm:text-sm text-muted-foreground break-words truncate sm:truncate max-w-full mt-1"
            title={attendee.bio}
            style={{ wordBreak: "break-word" }}
          >
            {attendee.bio}
          </div>
        )}
      </div>
      <div className="flex gap-1 mt-2 sm:mt-0 flex-row w-full sm:w-auto justify-end">
        <Button
          size="icon"
          variant="ghost"
          aria-label="Edit Attendee"
          onClick={() => onEdit(attendee)}
          className="sm:ml-0"
        >
          <Edit2 size={16} />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          aria-label="Delete Attendee"
          onClick={() => onDelete(attendee)}
        >
          <Trash2 size={16} className="text-destructive" />
        </Button>
      </div>
    </div>
  );
};

export default AttendeeCard;
