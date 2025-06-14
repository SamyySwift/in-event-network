
import React from "react";
import { Users, BarChart4, Vote } from "lucide-react";
import { Card } from "@/components/ui/card";

interface PollStatsCardsProps {
  total: number;
  active: number;
  totalVotes: number;
  loading?: boolean;
}

const PollStatsCards: React.FC<PollStatsCardsProps> = ({
  total,
  active,
  totalVotes,
  loading,
}) => (
  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
    <Card className="glass-card flex items-center p-4 min-h-[84px]">
      <BarChart4 className="mr-3 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 p-2 text-white" />
      <div>
        <div className="text-2xl font-bold">
          {loading ? (
            <span className="animate-pulse">...</span>
          ) : (
            total
          )}
        </div>
        <div className="text-xs text-muted-foreground">Total Polls</div>
      </div>
    </Card>
    <Card className="glass-card flex items-center p-4 min-h-[84px]">
      <Vote className="mr-3 rounded-lg bg-gradient-to-br from-green-400 to-emerald-500 p-2 text-white" />
      <div>
        <div className="text-2xl font-bold">
          {loading ? <span className="animate-pulse">...</span> : active}
        </div>
        <div className="text-xs text-muted-foreground">Active Polls</div>
      </div>
    </Card>
    <Card className="glass-card flex items-center p-4 min-h-[84px]">
      <Users className="mr-3 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 p-2 text-white" />
      <div>
        <div className="text-2xl font-bold">
          {loading ? <span className="animate-pulse">...</span> : totalVotes}
        </div>
        <div className="text-xs text-muted-foreground">Total Votes</div>
      </div>
    </Card>
  </div>
);

export default PollStatsCards;
