
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart4 } from "lucide-react";
import EventSelector from "@/components/admin/EventSelector";

const EventFocusCard: React.FC = () => (
  <Card className="glass-card">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <BarChart4 className="h-5 w-5 text-primary" />
        Event Focus
      </CardTitle>
      <CardDescription>
        Select an event to see detailed stats and manage it.
      </CardDescription>
    </CardHeader>
    <CardContent>
      <EventSelector />
    </CardContent>
  </Card>
);

export default EventFocusCard;
