
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

  // Return strong contrasting colors for badge based on priority
  const getPriorityBadgeStyle = () => {
    switch (priority) {
      case "high":
        return "bg-red-600 text-white border-red-700 dark:bg-red-500 dark:text-white";
      case "medium":
        return "bg-amber-500 text-white border-amber-600 dark:bg-amber-400 dark:text-black";
      case "low":
        return "bg-blue-600 text-white border-blue-700 dark:bg-blue-400 dark:text-black";
      default:
        return "bg-gray-200 text-gray-900 border-gray-300 dark:bg-gray-700 dark:text-white";
    }
  };

  return (
    <article
      role="button"
      className={`group rounded-xl border shadow-soft transition-all cursor-pointer glass-card overflow-hidden hover:shadow-lg ${getPriorityBadgeStyle()}-shadow`}
      tabIndex={0}
      aria-expanded={open}
      onClick={() => setOpen(!open)}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setOpen(!open); }}
      title={title}
    >
      <div className="flex flex-col gap-2 p-5 animate-fade-in">
        <div className="flex items-center gap-2 mb-1">
          {priority && (
            <Badge className={`flex items-center gap-1 capitalize border ${getPriorityBadgeStyle()} px-2`}>
              {getPriorityIcon()}
              <span className="text-xs font-semibold">{priority}</span>
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

