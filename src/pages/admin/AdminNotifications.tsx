
import React, { useState } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import NotificationStatsCards from "./components/NotificationStatsCards";
import NotificationCard from "./components/NotificationCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, Plus, Check } from "lucide-react";
import { useAdminNotifications } from "@/hooks/useAdminNotifications";
import { format, isThisWeek } from "date-fns";

const AdminNotifications = () => {
  const {
    notifications,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    isMarkingRead,
    isMarkingAllRead,
  } = useAdminNotifications();

  const [searchQuery, setSearchQuery] = useState("");
  const [tab, setTab] = useState<"all" | "unread" | "read">("all");

  // Stats for cards
  const total = notifications.length;
  const unread = notifications.filter((n) => !n.is_read).length;
  const recent = notifications.filter((n) =>
    isThisWeek(new Date(n.created_at))
  ).length;

  const filteredNotifications = notifications.filter((n) => {
    // tab filtering
    if (tab === "unread" && n.is_read) return false;
    if (tab === "read" && !n.is_read) return false;
    // search
    if (
      searchQuery &&
      !n.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !n.message.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  // Loading & error
  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading notifications...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="text-center py-10">
          <Bell className="h-12 w-12 mx-auto text-destructive opacity-50" />
          <h3 className="mt-4 text-lg font-medium">Error loading notifications</h3>
          <p className="text-muted-foreground">Please try refreshing the page</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Hero Gradient Section */}
        <div className="p-8 rounded-2xl bg-gradient-to-br from-primary-100 via-blue-100 to-indigo-50 text-primary-900 dark:text-white shadow-2xl shadow-primary/10 mb-2 relative overflow-hidden">
          <div className="absolute -top-12 -right-10 w-56 h-56 bg-white/10 rounded-full opacity-40 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-14 -left-14 w-36 h-36 bg-white/20 rounded-full opacity-30 pointer-events-none" />
          <div className="relative z-10">
            <h1 className="text-4xl font-bold tracking-tight flex items-center gap-2">
              <Bell className="h-8 w-8 text-primary" />
              Notifications Center
              {unread > 0 && (
                <span className="ml-3 bg-primary/90 text-white py-0.5 px-2.5 text-xs font-semibold rounded-full">{unread} new</span>
              )}
            </h1>
            <p className="mt-2 max-w-2xl text-primary-700 dark:text-primary-100">
              Stay updated with real-time notifications and system alerts.
            </p>
            <div className="mt-6">
              <NotificationStatsCards total={total} unread={unread} recent={recent} loading={isLoading} />
            </div>
          </div>
        </div>

        {/* Quick actions and tabs */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold">Notifications</h2>
            <p className="text-muted-foreground mt-1">
              Your latest activity and system messages are shown below.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Input
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
            <Button
              variant="outline"
              onClick={() => markAllAsRead()}
              disabled={unread === 0 || isMarkingAllRead}
              className="flex items-center"
            >
              <Check size={16} className="mr-1" />
              {isMarkingAllRead ? "Marking..." : "Mark all read"}
            </Button>
          </div>
        </div>
        {/* Tabs */}
        <div className="flex gap-1">
          <button
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              tab === "all"
                ? "bg-primary text-white shadow"
                : "bg-muted/70 hover:bg-muted"
            }`}
            onClick={() => setTab("all")}
          >
            All
          </button>
          <button
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              tab === "unread"
                ? "bg-primary text-white shadow"
                : "bg-muted/70 hover:bg-muted"
            }`}
            onClick={() => setTab("unread")}
          >
            Unread ({unread})
          </button>
          <button
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              tab === "read"
                ? "bg-primary text-white shadow"
                : "bg-muted/70 hover:bg-muted"
            }`}
            onClick={() => setTab("read")}
          >
            Read ({total - unread})
          </button>
        </div>
        {/* List */}
        <div className="space-y-4">
          {filteredNotifications.length ? (
            filteredNotifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                isMarking={isMarkingRead}
                onMarkAsRead={markAsRead}
              />
            ))
          ) : (
            <div className="text-center py-16">
              <Bell className="h-12 w-12 mx-auto text-muted-foreground opacity-20" />
              <h3 className="mt-4 text-lg font-medium">No notifications found</h3>
              <p className="text-muted-foreground">
                {searchQuery ? "Try adjusting your search criteria" : "Notifications will appear here as events happen."}
              </p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminNotifications;
