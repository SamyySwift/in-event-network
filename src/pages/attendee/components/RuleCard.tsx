
import React, { useState } from "react";
import { format } from "date-fns";
import { AlertTriangle, Zap, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface RuleCardProps {
  title: string;
  content: string;
  category?: string;
  priority?: "high" | "medium" | "low";
  created_at: string;
}

export default function RuleCard({ title, content, category, priority, created_at }: RuleCardProps) {
  const [open, setOpen] = useState(false);

  const getPriorityIcon = () => {
    switch (priority) {
      case "high": return <AlertTriangle className="text-red-600" />;
      case "medium": return <Zap className="text-yellow-500" />;
      case "low": return <Info className="text-blue-600" />;
      default: return <Info className="text-gray-400" />;
    }
  };

  const getPriorityColor = () => {
    switch (priority) {
      case "high": return "bg-red-100/80 border-red-400";
      case "medium": return "bg-yellow-100/80 border-yellow-400";
      case "low": return "bg-blue-100/80 border-blue-400";
      default: return "bg-gray-100/80 border-gray-300";
    }
  };

  return (
    <article
      role="button"
      className={`group rounded-xl border shadow-soft transition-all cursor-pointer glass-card overflow-hidden hover:shadow-lg ${getPriorityColor()}`}
      tabIndex={0}
      aria-expanded={open}
      onClick={() => setOpen(!open)}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setOpen(!open); }}
      title={title}
    >
      <div className="flex flex-col gap-2 p-5 animate-fade-in">
        <div className="flex items-center gap-2 mb-1">
          {priority && (
            <Badge className={`flex items-center gap-1 capitalize ${getPriorityColor()} px-2`}>
              {getPriorityIcon()}
              <span className="text-xs">{priority}</span>
            </Badge>
          )}
          {category && (
            <span className="text-xs font-semibold uppercase tracking-wider text-primary-600 bg-primary-50 rounded px-2 py-0.5 ml-2">
              {category}
            </span>
          )}
        </div>
        <h3 className="font-semibold text-lg group-hover:text-primary-700 transition select-text">{title}</h3>
        <div className={`text-gray-700 dark:text-gray-300 text-sm mt-1 transition-all origin-top-left
          ${open ? "max-h-80 opacity-100 scale-y-100" : "max-h-0 opacity-0 scale-y-95 overflow-hidden"}
        `}>
          <p>{content}</p>
          <span className="block mt-3 text-xs text-muted-foreground">{format(new Date(created_at), 'MMM d, yyyy')}</span>
        </div>
        {!open &&
          <span className="mt-2 text-xs text-muted-foreground italic opacity-80">Tap to view details</span>
        }
      </div>
    </article>
  );
}
