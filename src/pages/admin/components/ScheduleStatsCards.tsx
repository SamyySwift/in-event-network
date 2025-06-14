
import React from "react";
import { Calendar, Clock, Loader } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ScheduleStatsCardsProps {
  total: number;
  sessions: number;
  breaks: number;
  loading?: boolean;
}

const ScheduleStatsCards: React.FC<ScheduleStatsCardsProps> = ({
  total,
  sessions,
  breaks,
  loading,
}) => (
  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
    <Card className="glass-card flex items-center p-4 min-h-[84px]">
      <Calendar className="mr-3 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 p-2 text-white" />
      <div>
        <div className="text-2xl font-bold">
          {loading ? <Loader className="animate-spin" /> : total}
        </div>
        <div className="text-xs text-muted-foreground">Total Items</div>
      </div>
    </Card>
    <Card className="glass-card flex items-center p-4 min-h-[84px]">
      <Clock className="mr-3 rounded-lg bg-gradient-to-br from-green-400 to-emerald-500 p-2 text-white" />
      <div>
        <div className="text-2xl font-bold">
          {loading ? <Loader className="animate-spin" /> : sessions}
        </div>
        <div className="text-xs text-muted-foreground">Sessions</div>
      </div>
    </Card>
    <Card className="glass-card flex items-center p-4 min-h-[84px]">
      <Clock className="mr-3 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 p-2 text-white" />
      <div>
        <div className="text-2xl font-bold">
          {loading ? <Loader className="animate-spin" /> : breaks}
        </div>
        <div className="text-xs text-muted-foreground">Breaks</div>
      </div>
    </Card>
  </div>
);

export default ScheduleStatsCards;
