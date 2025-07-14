
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart4 } from "lucide-react";
import EventSelector from "@/components/admin/EventSelector";

const EventFocusCard: React.FC = () => (
  <Card className="glass-card">
    <CardHeader className="pb-3 md:pb-6">
      <CardTitle className="flex items-center gap-2 text-base md:text-lg">
        <BarChart4 className="h-4 w-4 md:h-5 md:w-5 text-primary" />
        Event Focus
      </CardTitle>
      <CardDescription className="text-xs md:text-sm">
        Select an event to see detailed stats and manage it.
      </CardDescription>
    </CardHeader>
    <CardContent className="pt-0">
      <EventSelector />
    </CardContent>
  </Card>
);

export default EventFocusCard;
