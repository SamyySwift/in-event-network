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
  Users2,
} from "lucide-react";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminEventContext } from "@/hooks/useAdminEventContext";
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
      navigationPath: "/admin/events",
    },
    {
      title: "Total Attendees",
      value: dashboardData?.attendeesCount,
      icon: Users,
      gradient: "from-green-400 to-emerald-500",
      navigationPath: "/admin/attendees",
    },
    {
      title: "Total Speakers",
      value: dashboardData?.speakersCount,
      icon: User,
      gradient: "from-purple-500 to-violet-400",
      navigationPath: "/admin/speakers",
    },
    {
      title: "Total Questions",
      value: dashboardData?.questionsCount,
      icon: MessageSquare,
      gradient: "from-yellow-400 to-orange-500",
      navigationPath: "/admin/questions",
    },
    {
      title: "Connections Made",
      value: dashboardData?.connectionsCount,
      icon: Users2,
      gradient: "from-teal-500 to-cyan-500",
      navigationPath: "/admin/attendees",
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
      <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 text-white shadow-2xl">
        {/* Animated background elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20"></div>
        <div className="absolute -top-20 -right-20 w-40 h-40 md:w-80 md:h-80 bg-gradient-to-br from-primary/30 to-accent/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-16 -left-16 w-32 h-32 md:w-64 md:h-64 bg-gradient-to-tr from-accent/20 to-primary/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px]"></div>

        <div className="relative p-6 md:p-12">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 animate-pulse"></div>
              <span className="text-sm font-medium text-emerald-400 tracking-wide uppercase">Dashboard Overview</span>
            </div>
            <h1 className="text-3xl md:text-6xl font-black tracking-tight bg-gradient-to-r from-white via-primary-200 to-accent-200 bg-clip-text text-transparent mb-4">
              Admin Control Center
            </h1>
            <p className="text-slate-300 text-base md:text-xl max-w-3xl leading-relaxed">
              Hey there, <span className="text-primary-300 font-medium">{currentUser?.name || currentUser?.email}</span>! 
              Command your events from this central hub with real-time insights and powerful tools.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
            {/* Live Events Card */}
            <div className="group relative overflow-hidden rounded-xl md:rounded-2xl bg-gradient-to-br from-emerald-500/20 to-green-600/20 backdrop-blur-sm border border-emerald-500/20 hover:border-emerald-400/40 transition-all duration-300 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/10 to-transparent"></div>
              <div className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></div>
                  </div>
                  <span className="text-xs font-semibold text-emerald-300 bg-emerald-500/20 px-3 py-1 rounded-full">LIVE</span>
                </div>
                <p className="text-emerald-200 text-sm font-medium mb-2">Live Events</p>
                {isLoading ? (
                  <Skeleton className="h-12 w-16 bg-emerald-400/20" />
                ) : (
                  <p className="text-4xl md:text-5xl font-black text-emerald-400">
                    {dashboardData?.liveEventsCount || 0}
                  </p>
                )}
              </div>
            </div>

            {/* Upcoming Events Card */}
            <div className="group relative overflow-hidden rounded-xl md:rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-600/20 backdrop-blur-sm border border-blue-500/20 hover:border-blue-400/40 transition-all duration-300 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-transparent"></div>
              <div className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-blue-400" />
                  </div>
                  <span className="text-xs font-semibold text-blue-300 bg-blue-500/20 px-3 py-1 rounded-full">SCHEDULED</span>
                </div>
                <p className="text-blue-200 text-sm font-medium mb-2">Upcoming Events</p>
                {isLoading ? (
                  <Skeleton className="h-12 w-16 bg-blue-400/20" />
                ) : (
                  <p className="text-4xl md:text-5xl font-black text-blue-400">
                    {dashboardData?.upcomingEventsCount || 0}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 flex flex-wrap gap-3">
            <button className="px-4 py-2 bg-primary/20 hover:bg-primary/30 text-primary-200 rounded-lg border border-primary/30 transition-all duration-200 text-sm font-medium">
              Create Event
            </button>
            <button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg border border-white/10 transition-all duration-200 text-sm font-medium">
              View Analytics
            </button>
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

const AdminDashboard = AdminDashboardContent;

export default AdminDashboard;
