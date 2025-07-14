
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export interface Metric {
  title: string;
  value?: string | number;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
}

interface DashboardMetricsProps {
  metrics: Metric[];
  isLoading: boolean;
}

const DashboardMetrics: React.FC<DashboardMetricsProps> = ({ metrics, isLoading }) => (
  <div className="grid gap-3 md:gap-6 grid-cols-2 lg:grid-cols-4">
    {metrics.map((metric) => (
      <Card key={metric.title} className="glass-card hover:-translate-y-1 hover:shadow-primary/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2">
          <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
            {metric.title}
          </CardTitle>
          <div className={`p-1 md:p-2 rounded-lg bg-gradient-to-br ${metric.gradient} shadow-md shadow-black/20`}>
            <metric.icon className="h-3 w-3 md:h-5 md:w-5 text-white" />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {isLoading ? (
            <Skeleton className="h-6 md:h-8 w-12 md:w-20" />
          ) : (
            <div className="text-xl md:text-3xl font-bold">{metric.value?.toString() || "0"}</div>
          )}
        </CardContent>
      </Card>
    ))}
  </div>
);

export default DashboardMetrics;
