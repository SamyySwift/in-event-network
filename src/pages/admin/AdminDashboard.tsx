import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  Calendar,
  MessageSquare,
  User,
  BarChart4,
  TrendingUp,
} from "lucide-react";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import { useAuth } from "@/contexts/AuthContext";
import { AdminEventProvider } from "@/hooks/useAdminEventContext";
import DashboardMetrics from "./components/DashboardMetrics";
import EventPerformanceCard from "./components/EventPerformanceCard";
import EventFocusCard from "./components/EventFocusCard";

const AdminDashboardContent = () => {
  const { currentUser } = useAuth();
  const { dashboardData, isLoading } = useAdminDashboard();

  const metrics = [
    {
      title: "Total Events",
      value: dashboardData?.eventsCount,
      icon: Calendar,
      gradient: "from-blue-500 to-indigo-500",
    },
    {
      title: "Total Attendees",
      value: dashboardData?.attendeesCount,
      icon: Users,
      gradient: "from-green-400 to-emerald-500",
    },
    {
      title: "Total Speakers",
      value: dashboardData?.speakersCount,
      icon: User,
      gradient: "from-purple-500 to-violet-400",
    },
    {
      title: "Total Questions",
      value: dashboardData?.questionsCount,
      icon: MessageSquare,
      gradient: "from-yellow-400 to-orange-500",
    },
  ];

  // Remove Total Connections from extraMetrics
  const extraMetrics = [
    {
      title: "Event Performance",
      value: dashboardData ? `${dashboardData.performanceScore}%` : undefined,
      icon: "trending-up",
      gradient: "from-rose-500 to-pink-400",
      description:
        "Calculated from attendee questions, poll engagement, suggestions submitted, and ratings. Higher score = more engaged event!",
    },
  ];

  // Helper for rendering Lucide icons by name, so we stay inside allowed lucide list
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    "trending-up": TrendingUp,
    "bar-chart": BarChart4,
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Section */}
      <div className="p-8 rounded-2xl bg-gradient-to-br from-blue-100 to-primary-100 text-primary-900 shadow-2xl shadow-primary/20 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full opacity-50"></div>
        <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-white/5 rounded-full opacity-50"></div>

        <div className="relative">
          <h1 className="text-4xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-primary-700 mt-2 max-w-2xl">
            Welcome back, {currentUser?.name || currentUser?.email}! Here's a
            comprehensive overview of your events.
          </p>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/10">
              <p className="text-sm text-primary-700">Live Events</p>
              {isLoading ? (
                <Skeleton className="h-8 w-12 mt-1 bg-white/20" />
              ) : (
                <p className="text-3xl font-bold text-green-400">
                  {dashboardData?.liveEventsCount || 0}
                </p>
              )}
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/10">
              <p className="text-sm text-primary-700">Upcoming Events</p>
              {isLoading ? (
                <Skeleton className="h-8 w-12 mt-1 bg-white/20" />
              ) : (
                <p className="text-3xl font-bold text-blue-500">
                  {dashboardData?.upcomingEventsCount || 0}
                </p>
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

      <div className="grid gap-6 lg:grid-cols-1">
        <div className="space-y-6">
          {/* Event Selector */}
          <EventFocusCard />
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  return (
    <AdminEventProvider>
      <AdminDashboardContent />
    </AdminEventProvider>
  );
};

export default AdminDashboard;
