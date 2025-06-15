import React from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import QRCodeGenerator from '@/components/admin/QRCodeGenerator';
import EventSelector from '@/components/admin/EventSelector';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Users, 
  Calendar, 
  MessageSquare, 
  QrCode,
  User,
  BarChart4,
  Network,
  Handshake,
  TrendingUp,
} from 'lucide-react';
import { useAdminDashboard } from '@/hooks/useAdminDashboard';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminEventProvider } from '@/hooks/useAdminEventContext';

const AdminDashboardContent = () => {
  const { currentUser } = useAuth();
  const { dashboardData, isLoading } = useAdminDashboard();

  // Get the current user's profile data including access_key
  const { data: userProfile } = useQuery({
    queryKey: ['user-profile', currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('access_key')
        .eq('id', currentUser.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return data;
    },
    enabled: !!currentUser?.id,
  });

  const metrics = [
    {
      title: 'Total Events',
      value: dashboardData?.eventsCount,
      icon: Calendar,
      gradient: 'from-blue-500 to-cyan-400',
    },
    {
      title: 'Total Attendees',
      value: dashboardData?.attendeesCount,
      icon: Users,
      gradient: 'from-green-500 to-emerald-400',
    },
    {
      title: 'Total Speakers',
      value: dashboardData?.speakersCount,
      icon: User,
      gradient: 'from-purple-500 to-violet-400',
    },
    {
      title: 'Total Questions',
      value: dashboardData?.questionsCount,
      icon: MessageSquare,
      gradient: 'from-orange-500 to-amber-400',
    },
  ];

  // NEW: Extra Metrics Section
  const extraMetrics = [
    {
      title: 'Total Connections',
      value: dashboardData?.connectionsCount,
      icon: 'network', // string for later mapping to lucide icon
      gradient: 'from-teal-500 to-cyan-400',
      description: 'Number of accepted attendee connections across your events.'
    },
    {
      title: 'Event Performance',
      value: dashboardData
        ? `${dashboardData.performanceScore}%`
        : undefined,
      icon: 'trending-up',
      gradient: 'from-rose-500 to-pink-400',
      description: 'Engagement score calculated from attendee questions and networking.'
    }
  ];

  // Log metrics for debugging real data
  console.log("[ExtraMetrics] Data:", extraMetrics);

  // Helper for rendering Lucide icons by name, so we stay inside allowed lucide list
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    'network': Network,
    'handshake': Handshake,
    'trending-up': TrendingUp,
    'bar-chart': BarChart4,
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Section */}
      <div className="p-8 rounded-2xl bg-gradient-to-br from-primary via-indigo-600 to-purple-600 text-white shadow-2xl shadow-primary/20 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full opacity-50"></div>
        <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-white/5 rounded-full opacity-50"></div>

        <div className="relative">
          <h1 className="text-4xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-primary-200 mt-2 max-w-2xl">
            Welcome back, {currentUser?.name || currentUser?.email}! Here's a comprehensive overview of your events.
          </p>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/10">
              <p className="text-sm text-primary-200">Live Events</p>
              {isLoading ? (
                <Skeleton className="h-8 w-12 mt-1 bg-white/20" />
              ) : (
                <p className="text-3xl font-bold text-green-300">{dashboardData?.liveEventsCount || 0}</p>
              )}
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/10">
              <p className="text-sm text-primary-200">Upcoming Events</p>
              {isLoading ? (
                <Skeleton className="h-8 w-12 mt-1 bg-white/20" />
              ) : (
                <p className="text-3xl font-bold text-blue-300">{dashboardData?.upcomingEventsCount || 0}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.title} className="glass-card hover:-translate-y-1 hover:shadow-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </CardTitle>
              <div className={`p-2 rounded-lg bg-gradient-to-br ${metric.gradient} shadow-md shadow-black/20`}>
                <metric.icon className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-3xl font-bold">{metric.value?.toString() || '0'}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Extra Metrics Section */}
      <div className="mt-4 grid md:grid-cols-2 gap-6">
        {extraMetrics.map((metric) => {
          const Icon = iconMap[metric.icon] || (() => null);
          return (
            <Card
              key={metric.title}
              className="glass-card shadow-lg rounded-xl p-6 flex flex-col gap-3"
            >
              <CardHeader className="flex-row items-center justify-between pb-2 space-y-0">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${metric.gradient} shadow-md`}>
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  {/* Use theme-aware color for title */}
                  <CardTitle className="text-lg font-bold text-card-foreground">{metric.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                {/* Use theme-aware color for value */}
                <div className="text-4xl font-extrabold mt-2 text-card-foreground">
                  {isLoading ? (
                    <span className="inline-block w-14 h-10 rounded bg-muted animate-pulse" />
                  ) : (
                    metric.value ?? '0'
                  )}
                </div>
                {/* Use muted foreground for the description */}
                <div className="text-base mt-2 text-muted-foreground">{metric.description}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-6">
          {/* Event Selector */}
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
        </div>
        
        <div className="lg:col-span-2 space-y-6">
          {/* QR Code Generator Section */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-primary" />
                Event Registration QR
              </CardTitle>
              <CardDescription>
                Share this QR code for easy event registration.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              {userProfile?.access_key ? (
                <QRCodeGenerator 
                  eventName="Join Event" 
                  eventUrl={`${window.location.origin}/register?code=${userProfile.access_key}`}
                />
              ) : (
                isLoading ? 
                <div className="flex flex-col items-center justify-center h-48">
                  <Skeleton className="h-32 w-32" />
                  <Skeleton className="h-4 w-40 mt-4" />
                </div>
                :
                <div className="text-muted-foreground text-center p-4">
                  Access key not available. Please contact support.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  return (
    <AdminLayout>
      <AdminEventProvider>
        <AdminDashboardContent />
      </AdminEventProvider>
    </AdminLayout>
  );
};

export default AdminDashboard;
