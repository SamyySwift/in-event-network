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
import { AdminEventProvider, useAdminEventContext } from "@/hooks/useAdminEventContext";
import DashboardMetrics from "./components/DashboardMetrics";
import EventPerformanceCard from "./components/EventPerformanceCard";
import EventFocusCard from "./components/EventFocusCard";
import ReferralCodeInput from "@/components/admin/ReferralCodeInput";

const AdminDashboardContent = () => {
  const { currentUser } = useAuth();
  const { dashboardData, isLoading } = useAdminDashboard();
  const { selectedEventId, selectedEvent } = useAdminEventContext();

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
    <div className="space-y-3 md:space-y-8 animate-fade-in px-3 md:px-0">
      {/* Hero Section */}
      <div className="p-3 md:p-8 rounded-lg md:rounded-2xl bg-gradient-to-br from-blue-100 to-primary-100 text-primary-900 shadow-lg shadow-primary/10 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 md:w-48 md:h-48 bg-white/10 rounded-full opacity-50"></div>
        <div className="absolute -bottom-8 -left-8 w-24 h-24 md:w-36 md:h-36 bg-white/5 rounded-full opacity-50"></div>

        <div className="relative">
          <h1 className="text-xl md:text-4xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-primary-700 mt-1 md:mt-2 text-xs md:text-base max-w-2xl leading-relaxed">
            Welcome back, {currentUser?.name || currentUser?.email}! Here's a
            comprehensive overview of your events.
          </p>
          <div className="mt-3 md:mt-6 grid grid-cols-2 gap-2 md:gap-6">
            <div className="bg-white/10 backdrop-blur-sm p-2 md:p-4 rounded-md md:rounded-lg border border-white/10">
              <p className="text-xs text-primary-700">Live Events</p>
              {isLoading ? (
                <Skeleton className="h-5 md:h-8 w-6 md:w-12 mt-1 bg-white/20" />
              ) : (
                <p className="text-lg md:text-3xl font-bold text-green-400">
                  {dashboardData?.liveEventsCount || 0}
                </p>
              )}
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-2 md:p-4 rounded-md md:rounded-lg border border-white/10">
              <p className="text-xs text-primary-700">Upcoming Events</p>
              {isLoading ? (
                <Skeleton className="h-5 md:h-8 w-6 md:w-12 mt-1 bg-white/20" />
              ) : (
                <p className="text-lg md:text-3xl font-bold text-blue-500">
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
          
          {/* Referral Code Input */}
          {selectedEventId && selectedEvent && (
            <ReferralCodeInput 
              eventId={selectedEventId} 
              eventName={selectedEvent.name} 
            />
          )}
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
