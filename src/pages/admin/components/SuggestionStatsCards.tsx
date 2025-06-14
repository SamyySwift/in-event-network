
import React from "react";
import { Lightbulb, Clock, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type SuggestionStatsCardsProps = {
  total: number;
  newCount: number;
  implemented: number;
  loading?: boolean;
};

const icons = [
  {
    key: "total",
    icon: Lightbulb,
    bg: "from-blue-400 to-indigo-400",
    label: "Total Suggestions",
  },
  {
    key: "newCount",
    icon: Clock,
    bg: "from-orange-300 to-red-400",
    label: "New",
  },
  {
    key: "implemented",
    icon: CheckCircle,
    bg: "from-green-300 to-emerald-400",
    label: "Implemented",
  },
];

const SuggestionStatsCards: React.FC<SuggestionStatsCardsProps> = ({
  total, newCount, implemented, loading
}) => {
  const values = { total, newCount, implemented };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
      {icons.map((stat) => (
        <Card
          key={stat.key}
          className={cn(
            "glass-card flex items-center p-4 min-h-[84px] relative",
            loading && "animate-pulse"
          )}
        >
          <div
            className={`bg-gradient-to-br ${stat.bg} rounded-full p-3 mr-4 flex items-center justify-center`}
          >
            <stat.icon className="text-white w-5 h-5" />
          </div>
          <CardContent className="p-0 flex flex-col">
            <span className="text-2xl font-bold">
              {loading ? "–" : values[stat.key as keyof typeof values]}
            </span>
            <span className="text-xs text-muted-foreground mt-1 font-medium">{stat.label}</span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SuggestionStatsCards;
