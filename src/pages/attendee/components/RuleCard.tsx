
import React, { useState } from "react";
import { format } from "date-fns";
import { AlertTriangle, Zap, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface RuleCardProps {
  title: string;
  content: string;
  category?: string;
  priority?: "high" | "medium" | "low";
  created_at: string;
}

export default function RuleCard({ title, content, category, priority, created_at }: RuleCardProps) {
  const [open, setOpen] = useState(false);

  // Dashboard-style icon chips & border styling
  const getPriorityStyles = () => {
    switch (priority) {
      case "high":
        return {
          border: "border-red-400",
          grad: "from-red-400 to-rose-400",
          icon: <AlertTriangle className="text-white" size={18} />
        };
      case "medium":
        return {
          border: "border-yellow-300",
          grad: "from-yellow-400 to-amber-400",
          icon: <Zap className="text-white" size={18} />
        };
      case "low":
        return {
          border: "border-blue-300",
          grad: "from-blue-300 to-blue-400",
          icon: <Info className="text-white" size={18} />
        };
      default:
        return {
          border: "border-gray-200 dark:border-gray-700",
          grad: "from-zinc-300 to-zinc-500",
          icon: <Info className="text-white" size={18} />
        };
    }
  };

  return (
    <Card
      role="button"
      className={`group rounded-2xl border-0 bg-white/90 dark:bg-zinc-900/70 shadow-xl transition-all cursor-pointer overflow-hidden hover:shadow-2xl hover:scale-[1.02] ${getPriorityStyles().border} animate-fade-in relative`}
      tabIndex={0}
      aria-expanded={open}
      onClick={() => setOpen((o) => !o)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") setOpen((o) => !o);
      }}
      title={title}
      style={{
        transition: "box-shadow .23s, transform .23s",
      }}
    >
      {/* Dashboard-style icon chip */}
      <div className="absolute top-4 right-4 z-10">
        <span className={`w-9 h-9 bg-gradient-to-br ${getPriorityStyles().grad} rounded-xl flex items-center justify-center shadow-lg`}>
          {getPriorityStyles().icon}
        </span>
      </div>
      <div className="flex flex-col gap-2 px-6 pt-6 pb-5 relative z-10">
        <div className="flex items-center gap-2">
          {priority && (
            <Badge
              className="flex items-center gap-1 font-semibold px-2.5 py-1 text-xs bg-zinc-50/90 dark:bg-zinc-800/70 text-zinc-800 dark:text-zinc-100 border-0"
              style={{ background: "rgba(255,255,255,0.62)" }}>
              <span className="capitalize">{priority}</span>
            </Badge>
          )}
          {category && (
            <span className="text-xs font-semibold uppercase tracking-wider ml-2 rounded px-2 py-0.5 border border-gray-200 dark:border-gray-700 bg-zinc-100/80 dark:bg-zinc-800/60 text-primary">
              {category}
            </span>
          )}
        </div>
        <h3 className="font-bold text-lg group-hover:text-primary transition select-text mb-1 text-zinc-900 dark:text-zinc-100">{title}</h3>
        <div
          className={`text-zinc-700/90 dark:text-zinc-100/90 text-base mt-0.5 will-change-max-height transition-all duration-300 origin-top-left overflow-hidden
          ${open ? "max-h-60 opacity-100 py-2 scale-y-100" : "max-h-0 opacity-0 scale-y-95"}
        `}
        >
          <p className="mb-2 whitespace-pre-wrap">{content}</p>
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
    </Card>
  );
}
