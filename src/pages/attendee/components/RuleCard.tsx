
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

  // Use only subtle border/icon cues for priority
  const getPriorityStyles = () => {
    switch (priority) {
      case "high":
        return {
          border: "border-red-300 dark:border-red-600",
          icon: <AlertTriangle className="text-red-400 dark:text-red-500" size={16} />,
        };
      case "medium":
        return {
          border: "border-yellow-200 dark:border-amber-400",
          icon: <Zap className="text-amber-400 dark:text-yellow-300" size={16} />,
        };
      case "low":
        return {
          border: "border-blue-100 dark:border-blue-500",
          icon: <Info className="text-blue-300 dark:text-blue-400" size={16} />,
        };
      default:
        return {
          border: "border-gray-200 dark:border-gray-700",
          icon: <Info className="text-gray-400" size={16} />,
        };
    }
  };

  return (
    <article
      role="button"
      className={`group rounded-xl glass-card border shadow-sm transition-all cursor-pointer overflow-hidden hover:shadow-lg hover:scale-[1.02] ${getPriorityStyles().border} bg-white/85 dark:bg-zinc-900/70 animate-fade-in`}
      tabIndex={0}
      aria-expanded={open}
      onClick={() => setOpen((o) => !o)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") setOpen((o) => !o);
      }}
      title={title}
      style={{
        boxShadow: open
          ? "0 8px 32px 0 rgba(31, 41, 55, 0.10), 0 1.5px 5px 0 rgba(43,29,63,0.06)"
          : undefined,
        transition: "box-shadow .22s",
      }}
    >
      <div className="flex flex-col gap-1.5 px-5 pt-5 pb-5">
        <div className="flex items-center gap-2 mb-1">
          {priority && (
            <Badge
              className="flex items-center gap-1 font-semibold px-2.5 py-1 text-xs bg-zinc-50 dark:bg-zinc-700/60 text-zinc-700 dark:text-zinc-100 border-0"
              style={{ background: "rgba(255,255,255,0.45)" }}>
              {getPriorityStyles().icon}
              <span className="text-xs capitalize">{priority}</span>
            </Badge>
          )}
          {category && (
            <span className="text-xs font-semibold uppercase tracking-wider ml-2 rounded px-2 py-0.5 border border-gray-200 dark:border-gray-700 bg-zinc-100/80 dark:bg-zinc-800/60 text-primary">
              {category}
            </span>
          )}
        </div>
        <h3 className="font-bold text-base md:text-lg group-hover:text-primary transition select-text mb-1 text-zinc-800 dark:text-zinc-100">{title}</h3>
        <div
          className={`text-zinc-700/90 dark:text-zinc-100/90 text-sm mt-0.5 will-change-max-height transition-all duration-300 origin-top-left overflow-hidden
          ${open ? "max-h-52 opacity-100 py-2 scale-y-100" : "max-h-0 opacity-0 scale-y-95"}
        `}
        >
          <p className="mb-2">{content}</p>
          <span className="block mt-1.5 text-xs text-muted-foreground">
            {format(new Date(created_at), "MMM d, yyyy")}
          </span>
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
