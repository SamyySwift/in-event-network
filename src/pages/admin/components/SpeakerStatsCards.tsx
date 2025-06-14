
import React from "react";
import { User, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface SpeakerStatsCardsProps {
  totalSpeakers: number;
  sessions: number;
}

const SpeakerStatsCards: React.FC<SpeakerStatsCardsProps> = ({
  totalSpeakers,
  sessions,
}) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    <Card className="glass-card flex items-center p-4">
      <User className="mr-3 rounded-lg bg-gradient-to-br from-purple-500 to-fuchsia-500 p-2 text-white" />
      <div>
        <div className="text-2xl font-bold">{totalSpeakers}</div>
        <div className="text-xs text-muted-foreground">Speakers</div>
      </div>
    </Card>
    <Card className="glass-card flex items-center p-4">
      <Calendar className="mr-3 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400 p-2 text-white" />
      <div>
        <div className="text-2xl font-bold">{sessions}</div>
        <div className="text-xs text-muted-foreground">Sessions</div>
      </div>
    </Card>
    {/* You can add more stats here */}
  </div>
);

export default SpeakerStatsCards;
