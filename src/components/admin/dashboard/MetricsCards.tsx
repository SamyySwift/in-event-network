
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Calendar, MessageSquare, BarChart3 } from 'lucide-react';

interface MetricsCardsProps {
  attendeesCount: number;
  liveEvents: number;
  questionsCount: number;
  pollResponsesCount: number;
  isLoading: boolean;
}

export const MetricsCards = ({ 
  attendeesCount, 
  liveEvents, 
  questionsCount, 
  pollResponsesCount, 
  isLoading 
}: MetricsCardsProps) => {
  const metrics = [
    {
      title: 'Total Attendees',
      value: attendeesCount.toString(),
      change: 'Unique attendees',
      icon: Users,
      color: 'text-blue-600',
    },
    {
      title: 'Live Events',
      value: liveEvents.toString(),
      change: 'Currently active',
      icon: Calendar,
      color: 'text-green-600',
    },
    {
      title: 'Questions Asked',
      value: questionsCount.toString(),
      change: 'Total submitted',
      icon: MessageSquare,
      color: 'text-purple-600',
    },
    {
      title: 'Poll Responses',
      value: pollResponsesCount.toString(),
      change: 'Total votes',
      icon: BarChart3,
      color: 'text-orange-600',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <Card key={metric.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {metric.title}
            </CardTitle>
            <metric.icon className={`h-4 w-4 ${metric.color}`} />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16 mb-2" />
            ) : (
              <div className="text-2xl font-bold">{metric.value}</div>
            )}
            <p className="text-xs text-muted-foreground">
              {metric.change}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
