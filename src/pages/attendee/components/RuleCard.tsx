
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

  const getPriorityStyles = () => {
    switch (priority) {
      case "high":
        return {
          color: "bg-gradient-to-br from-red-400/80 via-pink-500/80 to-orange-400/80",
          border: "border-red-500/70",
          icon: <AlertTriangle className="text-red-600" />
        };
      case "medium":
        return {
          color: "bg-gradient-to-br from-yellow-300/80 via-amber-400/80 to-pink-100/80",
          border: "border-yellow-400/70",
          icon: <Zap className="text-yellow-500" />
        };
      case "low":
        return {
          color: "bg-gradient-to-br from-blue-200/50 via-primary-200/80 to-teal-200/70",
          border: "border-blue-400/70",
          icon: <Info className="text-blue-600" />
        };
      default:
        return {
          color: "bg-gradient-to-br from-gray-100/80 to-gray-200/80",
          border: "border-gray-400/40",
          icon: <Info className="text-gray-400" />
        };
    }
  };

  return (
    <article
      role="button"
      className={`group rounded-2xl glass-card border-2 shadow-xl transition-all cursor-pointer overflow-hidden hover:shadow-2xl hover:scale-[1.03] ${getPriorityStyles().color} ${getPriorityStyles().border} animate-fade-in`}
      tabIndex={0}
      aria-expanded={open}
      onClick={() => setOpen((o) => !o)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") setOpen((o) => !o);
      }}
      title={title}
      style={{
        boxShadow: open
          ? "0 6px 32px 0 rgba(115, 92, 243, 0.23), 0 1.5px 5px 0 rgba(43,29,63,0.10)"
          : undefined,
        transition: "box-shadow .28s"
      }}
    >
      <div className="flex flex-col gap-2 px-6 pt-6 pb-5">
        <div className="flex items-center gap-2 mb-1">
          {priority && (
            <Badge className="flex items-center gap-1 capitalize font-semibold px-2 py-1 text-xs"
              style={{background: "rgba(255,255,255,0.4)", color: "#761bff"}}
            >
              {getPriorityStyles().icon}
              <span className="text-xs">{priority}</span>
            </Badge>
          )}
          {category && (
            <span className="text-xs font-semibold uppercase tracking-wider text-primary-600 bg-gradient-to-r from-primary-50/80 to-pink-100/70 rounded px-2 py-0.5 ml-2 border border-primary-200/60">
              {category}
            </span>
          )}
        </div>
        <h3 className="font-extrabold text-lg md:text-xl group-hover:text-primary-700 transition select-text mb-1">{title}</h3>
        <div className={`text-zinc-700/90 dark:text-zinc-100/90 text-base mt-0.5 will-change-max-height transition-all duration-300 origin-top-left overflow-hidden
          ${open ? "max-h-96 opacity-100 py-2 scale-y-100" : "max-h-0 opacity-0 scale-y-95"}
        `}>
          <p className="mb-2">{content}</p>
          <span className="block mt-1.5 text-xs text-muted-foreground">{format(new Date(created_at), 'MMM d, yyyy')}</span>
        </div>
        {!open && (
          <span className="mt-2 text-xs text-muted-foreground italic opacity-90 animate-fade-in">
            Tap to view details
          </span>
        )}
      </div>
    </article>
  );
}
