
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
    <Card className="glass-card shadow-lg rounded-xl p-3 md:p-6 flex flex-col gap-2 md:gap-3">
      <CardHeader className="flex-row items-center justify-between pb-1 md:pb-2 space-y-0 p-0">
        <div className="flex items-center gap-2 md:gap-3">
          <div className={`p-1 md:p-2 rounded-lg bg-gradient-to-br ${metric.gradient} shadow-md`}>
            <Icon className="h-5 w-5 md:h-7 md:w-7 text-white" />
          </div>
          <CardTitle className="text-base md:text-lg font-bold text-card-foreground">{metric.title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-1 md:pt-2 p-0">
        <div className="text-2xl md:text-4xl font-extrabold mt-1 md:mt-2 text-card-foreground">
          {isLoading ? (
            <span className="inline-block w-10 h-8 md:w-14 md:h-10 rounded bg-muted animate-pulse" />
          ) : (
            metric.value ?? "0"
          )}
        </div>
        <div className="text-sm md:text-base mt-1 md:mt-2 text-muted-foreground">{metric.description}</div>
      </CardContent>
    </Card>
  );
};

export default EventPerformanceCard;
