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
  TrendingUp,
  Users2,
  ArrowRight,
  Sparkles,
  Activity,
  Zap,
} from "lucide-react";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminEventContext } from "@/hooks/useAdminEventContext";
import EventFocusCard from "./components/EventFocusCard";
import AccessCodeInput from "@/components/admin/AccessCodeInput";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const AdminDashboardContent = () => {
  const { currentUser } = useAuth();
  const { dashboardData, isLoading } = useAdminDashboard();
  const { selectedEventId, selectedEvent } = useAdminEventContext();
  const navigate = useNavigate();

  const metrics = [
    {
      title: "Total Events",
      value: dashboardData?.eventsCount,
      icon: Calendar,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
      navigationPath: "/admin/events",
    },
    {
      title: "Total Attendees",
      value: dashboardData?.attendeesCount,
      icon: Users,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
      navigationPath: "/admin/attendees",
    },
    {
      title: "Speakers",
      value: dashboardData?.speakersCount,
      icon: User,
      color: "text-violet-500",
      bgColor: "bg-violet-500/10",
      borderColor: "border-violet-500/20",
      navigationPath: "/admin/speakers",
    },
    {
      title: "Questions",
      value: dashboardData?.questionsCount,
      icon: MessageSquare,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/20",
      navigationPath: "/admin/questions",
    },
    {
      title: "Connections",
      value: dashboardData?.connectionsCount,
      icon: Users2,
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10",
      borderColor: "border-cyan-500/20",
      navigationPath: "/admin/networking",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-primary/10 to-violet-500/10 p-6 md:p-8 border border-primary/10">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/20 to-violet-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <Badge variant="secondary" className="bg-primary/10 text-primary border-0">
              Admin Dashboard
            </Badge>
          </div>
          
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Welcome back, {currentUser?.name || 'Admin'}!
          </h1>
          <p className="text-muted-foreground max-w-xl">
            Here's an overview of your events and engagement metrics. Keep track of your performance and manage your events efficiently.
          </p>
          
          {/* Quick Stats Row */}
          <div className="mt-6 grid grid-cols-2 gap-3 max-w-md">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-background/60 backdrop-blur-sm border border-border/50">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <Activity className="h-4 w-4 text-emerald-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Live Events</p>
                {isLoading ? (
                  <Skeleton className="h-5 w-8 mt-1" />
                ) : (
                  <p className="text-lg font-bold text-emerald-500">
                    {dashboardData?.liveEventsCount || 0}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-xl bg-background/60 backdrop-blur-sm border border-border/50">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Zap className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Upcoming</p>
                {isLoading ? (
                  <Skeleton className="h-5 w-8 mt-1" />
                ) : (
                  <p className="text-lg font-bold text-blue-500">
                    {dashboardData?.upcomingEventsCount || 0}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card 
              key={metric.title}
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border ${metric.borderColor} bg-card/50 backdrop-blur-sm`}
              onClick={() => navigate(metric.navigationPath)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                    <Icon className={`h-4 w-4 ${metric.color}`} />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground/50" />
                </div>
                
                {isLoading ? (
                  <Skeleton className="h-7 w-16 mb-1" />
                ) : (
                  <p className="text-2xl font-bold text-foreground">
                    {metric.value || 0}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">{metric.title}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Performance Card */}
      <Card className="border border-primary/10 bg-gradient-to-br from-primary/5 to-violet-500/5">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Event Performance</CardTitle>
                <CardDescription className="text-xs">
                  Based on engagement metrics
                </CardDescription>
              </div>
            </div>
            
            {isLoading ? (
              <Skeleton className="h-10 w-20" />
            ) : (
              <div className="text-right">
                <p className="text-3xl font-bold text-primary">
                  {dashboardData?.performanceScore || 0}%
                </p>
                <p className="text-xs text-muted-foreground">Score</p>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Progress Bar */}
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-violet-500 rounded-full transition-all duration-500"
              style={{ width: `${dashboardData?.performanceScore || 0}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Calculated from attendee questions, poll engagement, suggestions, and ratings.
          </p>
        </CardContent>
      </Card>

      {/* Event Focus & Access Code Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <EventFocusCard />
        
        {selectedEventId && selectedEvent && (
          <AccessCodeInput 
            eventId={selectedEventId} 
            eventName={selectedEvent.name} 
          />
        )}
      </div>
    </div>
  );
};

const AdminDashboard = AdminDashboardContent;

export default AdminDashboard;
