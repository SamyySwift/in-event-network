
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp } from 'lucide-react';

interface EventOverviewProps {
  upcomingEvents: number;
  liveEvents: number;
  totalSpeakers: number;
  isLoading: boolean;
}

export const EventOverview = ({ 
  upcomingEvents, 
  liveEvents, 
  totalSpeakers, 
  isLoading 
}: EventOverviewProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Event Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="text-center">
            {isLoading ? (
              <Skeleton className="h-8 w-16 mx-auto mb-2" />
            ) : (
              <div className="text-2xl font-bold text-blue-600">{upcomingEvents}</div>
            )}
            <p className="text-sm text-muted-foreground">Upcoming Events</p>
          </div>
          <div className="text-center">
            {isLoading ? (
              <Skeleton className="h-8 w-16 mx-auto mb-2" />
            ) : (
              <div className="text-2xl font-bold text-green-600">{liveEvents}</div>
            )}
            <p className="text-sm text-muted-foreground">Live Events</p>
          </div>
          <div className="text-center">
            {isLoading ? (
              <Skeleton className="h-8 w-16 mx-auto mb-2" />
            ) : (
              <div className="text-2xl font-bold text-purple-600">{totalSpeakers}</div>
            )}
            <p className="text-sm text-muted-foreground">Total Speakers</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
