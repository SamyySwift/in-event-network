
import React from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { useEvents } from '@/hooks/useEvents';
import { useSpeakers } from '@/hooks/useSpeakers';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { useDashboardData } from '@/hooks/useDashboardData';
import { MetricsCards } from '@/components/admin/dashboard/MetricsCards';
import { RecentActivity } from '@/components/admin/dashboard/RecentActivity';
import { EventOverview } from '@/components/admin/dashboard/EventOverview';
import QRCodeGenerator from '@/components/admin/QRCodeGenerator';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

const AdminDashboard = () => {
  const { events, isLoading: eventsLoading } = useEvents();
  const { speakers, isLoading: speakersLoading } = useSpeakers();
  const { announcements, isLoading: announcementsLoading } = useAnnouncements();
  const { 
    attendeesCount, 
    questionsCount, 
    pollResponsesCount, 
    recentActivity, 
    loading: dashboardLoading 
  } = useDashboardData();
  
  // Calculate metrics from admin's own data only
  const totalSpeakers = speakers.length;
  
  const liveEvents = events.filter(event => {
    const now = new Date();
    return new Date(event.start_time) <= now && new Date(event.end_time) >= now;
  }).length;

  const upcomingEvents = events.filter(event => {
    const now = new Date();
    return new Date(event.start_time) > now;
  }).length;

  const isDataLoading = dashboardLoading || eventsLoading || speakersLoading || announcementsLoading;

  // Show empty state for new admins with no events
  if (!isDataLoading && events.length === 0) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome to your admin dashboard!
            </p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Welcome to your Admin Dashboard!
                </h3>
                <p className="text-muted-foreground mb-4">
                  You haven't created any events yet. Create your first event to start managing attendees, speakers, and more.
                </p>
                <p className="text-sm text-gray-500">
                  This dashboard will show data only from your events. Each admin has their own isolated view.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Host Access Key Section - always show */}
          <QRCodeGenerator />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your events.
          </p>
        </div>

        {/* Metrics Cards */}
        <MetricsCards
          attendeesCount={attendeesCount}
          liveEvents={liveEvents}
          questionsCount={questionsCount}
          pollResponsesCount={pollResponsesCount}
          isLoading={isDataLoading}
        />

        <div className="grid gap-6 md:grid-cols-2">
          {/* Host Access Key Section */}
          <QRCodeGenerator />

          {/* Recent Activity */}
          <RecentActivity
            recentActivity={recentActivity}
            isLoading={isDataLoading}
          />
        </div>

        {/* Quick Stats */}
        <EventOverview
          upcomingEvents={upcomingEvents}
          liveEvents={liveEvents}
          totalSpeakers={totalSpeakers}
          isLoading={isDataLoading}
        />
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
