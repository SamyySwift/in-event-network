
import React from "react";
import { Megaphone, AlertTriangle, Loader } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface AnnouncementStatsCardsProps {
  total: number;
  highPriority: number;
  loading?: boolean;
}

const AnnouncementStatsCards: React.FC<AnnouncementStatsCardsProps> = ({
  total,
  highPriority,
  loading,
}) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    <Card className="glass-card flex items-center p-4 min-h-[84px]">
      <Megaphone className="mr-3 rounded-lg bg-gradient-to-br from-fuchsia-500 to-indigo-500 p-2 text-white" />
      <div>
        <div className="text-2xl font-bold">
          {loading ? <Loader className="animate-spin" /> : total}
        </div>
        <div className="text-xs text-muted-foreground">Announcements</div>
      </div>
    </Card>
    <Card className="glass-card flex items-center p-4 min-h-[84px]">
      <AlertTriangle className="mr-3 rounded-lg bg-gradient-to-br from-red-500 to-yellow-400 p-2 text-white" />
      <div>
        <div className="text-2xl font-bold">
          {loading ? <Loader className="animate-spin" /> : highPriority}
        </div>
        <div className="text-xs text-muted-foreground">High Priority</div>
      </div>
    </Card>
    {/* Add more statistics here if needed */}
  </div>
);

export default AnnouncementStatsCards;
