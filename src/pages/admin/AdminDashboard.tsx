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
  TrendingUp,
} from 'lucide-react';
import { useAdminDashboard } from '@/hooks/useAdminDashboard';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminEventProvider } from '@/hooks/useAdminEventContext';
import DashboardMetrics from "./components/DashboardMetrics";
import EventPerformanceCard from "./components/EventPerformanceCard";
import EventFocusCard from "./components/EventFocusCard";
import RegistrationQRCodeCard from "./components/RegistrationQRCodeCard";

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
      gradient: 'from-blue-500 to-indigo-500',
    },
    {
      title: 'Total Attendees',
      value: dashboardData?.attendeesCount,
      icon: Users,
      gradient: 'from-green-400 to-emerald-500',
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
      gradient: 'from-yellow-400 to-orange-500',
    },
  ];

  // Remove Total Connections from extraMetrics
  const extraMetrics = [
    {
      title: 'Event Performance',
      value: dashboardData
        ? `${dashboardData.performanceScore}%`
        : undefined,
      icon: 'trending-up',
      gradient: 'from-rose-500 to-pink-400',
      description: 'Calculated from attendee questions, poll engagement, suggestions submitted, and ratings. Higher score = more engaged event!',
    }
  ];

  // Helper for rendering Lucide icons by name, so we stay inside allowed lucide list
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
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
      <DashboardMetrics metrics={metrics} isLoading={isLoading} />

      {/* Only Event Performance, no grid needed */}
      <div className="mt-4">
        {extraMetrics.map((metric) => {
          const Icon = iconMap[metric.icon] || (() => null);
          return (
            <EventPerformanceCard
              key={metric.title}
              metric={{ ...metric, icon: Icon }}
              isLoading={isLoading}
            />
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-6">
          {/* Event Selector */}
          <EventFocusCard />
        </div>
        <div className="lg:col-span-2 space-y-6">
          {/* QR Code Generator Section */}
          <RegistrationQRCodeCard accessKey={userProfile?.access_key} isLoading={isLoading} />
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
