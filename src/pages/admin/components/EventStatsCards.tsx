
import React from "react";
import { Calendar, Clock, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type EventStatsCardsProps = {
  total: number;
  live: number;
  upcoming: number;
  loading?: boolean;
};

const statsData = [
  {
    key: "total",
    icon: Calendar,
    bg: "from-blue-400 to-indigo-400",
    label: "Total Events",
  },
  {
    key: "live",
    icon: Clock,
    bg: "from-green-400 to-emerald-400",
    label: "Live",
  },
  {
    key: "upcoming",
    icon: Users,
    bg: "from-orange-400 to-red-300",
    label: "Upcoming",
  },
];

const EventStatsCards: React.FC<EventStatsCardsProps> = ({ total, live, upcoming, loading }) => {
  const values = { total, live, upcoming };
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
      {statsData.map((stat) => (
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

export default EventStatsCards;
