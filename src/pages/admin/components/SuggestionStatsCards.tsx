
import React from "react";
import { Lightbulb, Clock, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5">
      {icons.map((stat) => (
        <Card
          key={stat.key}
          className={cn(
            "glass-card flex items-center p-3 sm:p-4 min-h-[72px] sm:min-h-[84px] relative",
            loading && "animate-pulse"
          )}
        >
          <div
            className={`bg-gradient-to-br ${stat.bg} rounded-full p-2 sm:p-3 mr-3 sm:mr-4 flex items-center justify-center flex-shrink-0`}
          >
            <stat.icon className={`text-white ${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
          </div>
          <CardContent className="p-0 flex flex-col min-w-0 flex-1">
            <span className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold`}>
              {loading ? "–" : values[stat.key as keyof typeof values]}
            </span>
            <span className="text-xs text-muted-foreground mt-1 font-medium truncate">{stat.label}</span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SuggestionStatsCards;
