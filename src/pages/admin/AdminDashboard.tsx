
import React from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import QRCodeGenerator from '@/components/admin/QRCodeGenerator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Users, 
  Calendar, 
  MessageSquare, 
  QrCode,
  User,
  TrendingUp
} from 'lucide-react';
import { useAdminDashboard } from '@/hooks/useAdminDashboard';
import { useAuth } from '@/contexts/AuthContext';

const AdminDashboard = () => {
  const { currentUser } = useAuth();
  const { dashboardData, isLoading } = useAdminDashboard();

  const metrics = [
    {
      title: 'Your Events',
      value: dashboardData?.eventsCount?.toString() || '0',
      change: 'Total created',
      icon: Calendar,
      color: 'text-blue-600',
    },
    {
      title: 'Your Attendees',
      value: dashboardData?.attendeesCount?.toString() || '0',
      change: 'Registered',
      icon: Users,
      color: 'text-green-600',
    },
    {
      title: 'Your Speakers',
      value: dashboardData?.speakersCount?.toString() || '0',
      change: 'Added',
      icon: User,
      color: 'text-purple-600',
    },
    {
      title: 'Questions Received',
      value: dashboardData?.questionsCount?.toString() || '0',
      change: 'Total submitted',
      icon: MessageSquare,
      color: 'text-orange-600',
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {currentUser?.name}! Here's what's happening with your events.
          </p>
        </div>

        {/* Metrics Cards */}
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

        <div className="grid gap-6 md:grid-cols-2">
          {/* QR Code Generator Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Event Registration QR Code
            </h2>
            {currentUser?.access_key ? (
              <QRCodeGenerator 
                eventName="Join Event" 
                eventUrl={`${window.location.origin}/register?code=${currentUser.access_key}`}
              />
            ) : (
              <div className="text-muted-foreground">
                Access key not available. Please contact support.
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Event Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="text-center">
                  {isLoading ? (
                    <Skeleton className="h-8 w-16 mx-auto mb-2" />
                  ) : (
                    <div className="text-2xl font-bold text-blue-600">
                      {dashboardData?.upcomingEventsCount || 0}
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground">Upcoming Events</p>
                </div>
                <div className="text-center">
                  {isLoading ? (
                    <Skeleton className="h-8 w-16 mx-auto mb-2" />
                  ) : (
                    <div className="text-2xl font-bold text-green-600">
                      {dashboardData?.liveEventsCount || 0}
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground">Live Events</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
