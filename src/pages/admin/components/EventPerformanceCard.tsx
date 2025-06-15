
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface EventPerformanceMetric {
  title: string;
  value: string | number | undefined;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  description: string;
}

interface EventPerformanceCardProps {
  metric: EventPerformanceMetric;
  isLoading: boolean;
}

const EventPerformanceCard: React.FC<EventPerformanceCardProps> = ({ metric, isLoading }) => {
  const Icon = metric.icon;
  return (
    <Card className="glass-card shadow-lg rounded-xl p-6 flex flex-col gap-3">
      <CardHeader className="flex-row items-center justify-between pb-2 space-y-0">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-gradient-to-br ${metric.gradient} shadow-md`}>
            <Icon className="h-7 w-7 text-white" />
          </div>
          <CardTitle className="text-lg font-bold text-card-foreground">{metric.title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="text-4xl font-extrabold mt-2 text-card-foreground">
          {isLoading ? (
            <span className="inline-block w-14 h-10 rounded bg-muted animate-pulse" />
          ) : (
            metric.value ?? "0"
          )}
        </div>
        <div className="text-base mt-2 text-muted-foreground">{metric.description}</div>
      </CardContent>
    </Card>
  );
};

export default EventPerformanceCard;
