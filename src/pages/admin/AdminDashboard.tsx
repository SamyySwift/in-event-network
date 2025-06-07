
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
  
  // Calculate metrics from real data
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
