
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Bell } from 'lucide-react';

interface Activity {
  id: string;
  type: string;
  content: string;
  time: string;
  status: string;
}

interface RecentActivityProps {
  recentActivity: Activity[];
  isLoading: boolean;
}

export const RecentActivity = ({ recentActivity, isLoading }: RecentActivityProps) => {
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Success</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'answered':
        return <Badge className="bg-blue-100 text-blue-800">Answered</Badge>;
      case 'published':
        return <Badge className="bg-purple-100 text-purple-800">Published</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Recent Activity
        </CardTitle>
        <CardDescription>
          Latest updates from your events
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            // Loading skeletons
            [...Array(4)].map((_, i) => (
              <div key={i} className="flex items-start space-x-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))
          ) : recentActivity.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No recent activity found.
            </p>
          ) : (
            recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {activity.content}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {activity.time}
                  </p>
                </div>
                {getStatusBadge(activity.status)}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
