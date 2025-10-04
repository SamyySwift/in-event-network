import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAttendeeContext } from "@/hooks/useAttendeeContext";
import { useEventTheme } from "@/hooks/useEventTheme";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Users,
  User,
  Bell,
  Settings,
  MessageSquare,
  Star,
  MapPin,
  Search,
  Menu,
  X,
  LogOut,
  ChevronRight,
  UserPlus,
  Megaphone,
  BookOpen,
  BarChart,
  Lightbulb,
  Ticket,
  Store,
  Tickets,
  LayoutDashboard,
  Book,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNotificationCount } from "@/hooks/useNotificationCount";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { NotificationBadge } from "@/components/notifications/NotificationBadge";
import { ExpandableTabs } from "@/components/ui/expandable-tabs";
import { FloatingDidYouKnow } from "@/components/attendee/FloatingDidYouKnow";
interface AppLayoutProps {
  children: React.ReactNode;
}
const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { currentUser, logout } = useAuth();
  const { context: attendeeContext } = useAttendeeContext();
  const eventTheme = useEventTheme(attendeeContext?.currentEventId || null);
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const isMobile = useIsMobile();
  const { unreadCount } = useNotificationCount();
  const isActive = (path: string) => {
    // For dashboard routes, check exact match
    if (path === "/" || path === "/attendee" || path === "/host") {
      return location.pathname === path;
    }
    // For other routes, check if path matches exactly or starts with path + "/"
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };
  const attendeeNavigation = [
    {
      name: "Dashboard",
      href: "/attendee",
      icon: <LayoutDashboard className="text-muted-foreground" />,
    },
    {
      name: "My Tickets",
      href: "/attendee/my-tickets",
      icon: <Tickets className="text-muted-foreground" />,
    },
    {
      name: "Profile",
      href: "/attendee/profile",
      icon: <User className="text-muted-foreground" />,
    },
    {
      name: "Networking",
      href: "/attendee/networking",
      icon: <UserPlus className="text-muted-foreground" />,
    },
    {
      name: "Event Schedule",
      href: "/attendee/schedule",
      icon: <Calendar className="text-muted-foreground" />,
    },
    {
      name: "Q&A",
      href: "/attendee/questions",
      icon: <MessageSquare className="text-muted-foreground" />,
    },
    {
      name: "Event Facilities",
      href: "/attendee/map",
      icon: <MapPin className="text-muted-foreground" />,
    },
    {
      name: "Polls",
      href: "/attendee/polls",
      icon: <BarChart className="text-muted-foreground" />,
    },
    {
      name: "Suggestions",
      href: "/attendee/suggestions",
      icon: <Lightbulb className="text-muted-foreground" />,
    },
    {
      name: "Announcements",
      href: "/attendee/announcements",
      icon: <Megaphone className="text-muted-foreground" />,
    },
    {
      name: "Event Rules",
      href: "/attendee/rules",
      icon: <BookOpen className="text-muted-foreground" />,
    },
  ];
  const hostNavigation = [
    {
      name: "Dashboard",
      href: "/host",
      icon: <LayoutDashboard size={20} />,
    },
    {
      name: "Events",
      href: "/host/events",
      icon: <Calendar size={20} />,
    },
    {
      name: "Attendees",
      href: "/host/attendees",
      icon: <Users size={20} />,
    },
    {
      name: "Speakers",
      href: "/host/speakers",
      icon: <User size={20} />,
    },
    {
      name: "Announcements",
      href: "/host/announcements",
      icon: <Bell size={20} />,
    },
    {
      name: "Facilities",
      href: "/host/facilities",
      icon: <MapPin size={20} />,
    },
    {
      name: "Questions",
      href: "/host/questions",
      icon: <MessageSquare size={20} />,
    },
    {
      name: "Settings",
      href: "/host/settings",
      icon: <Settings size={20} />,
    },
  ];
  const navigation =
    currentUser?.role === "host" ? hostNavigation : attendeeNavigation;

  // Define attendee tabs for mobile bottom nav using ExpandableTabs
  const attendeeTabItems = [
    { title: "Dashboard", icon: LayoutDashboard },
    { title: "Networking", icon: UserPlus },
    { title: "Schedule", icon: Calendar },
    { title: "Tickets", icon: Tickets },
    { type: "separator" as const },
    { title: "Q&A", icon: MessageSquare },
    { title: "Polls", icon: BarChart },
    { title: "Announcements", icon: Megaphone },
    // { title: "Notifications", icon: Bell, badgeCount: unreadCount },
  ];
  const indexToHref: (string | null)[] = [
    "/attendee",
    "/attendee/networking",
    "/attendee/schedule",
    "/attendee/my-tickets",
    null,
    "/attendee/questions",
    "/attendee/polls",
    "/attendee/announcements", // <-- added missing mapping
    // "/attendee/notifications",
  ];
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden bg-white dark:bg-gray-800 border-b dark:border-gray-700 py-4 px-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center">
          <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2">
                <Menu size={20} />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-[240px] sm:w-[300px] border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            >
              <SheetHeader>
                <SheetTitle className="flex items-center">
                  <img
                    src={eventTheme?.logo_url || "/logo.png"}
                    alt={eventTheme?.custom_title || "Kconect Logo"}
                    className="h-6 w-6 mr-2 object-contain"
                  />
                  <span className="text-md font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    {eventTheme?.custom_title || "Kconect"}
                  </span>
                </SheetTitle>
              </SheetHeader>
              {currentUser && (
                <div className="py-4 border-b dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      {currentUser.photoUrl ? (
                        <AvatarImage
                          src={currentUser.photoUrl}
                          alt={currentUser.name}
                        />
                      ) : (
                        <AvatarFallback className="bg-connect-100 text-connect-600 dark:bg-connect-900 dark:text-connect-300">
                          {currentUser.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium dark:text-white">
                        {currentUser.name}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {currentUser.role}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <div className="py-4">
                <nav className="flex flex-col space-y-1">
                  {navigation.map((item) => (
                    <Button
                      key={item.name}
                      variant={isActive(item.href) ? "secondary" : "ghost"}
                      className={`justify-start ${
                        isActive(item.href)
                          ? "bg-connect-50 text-connect-700 dark:bg-connect-900/50 dark:text-connect-300"
                          : "text-gray-600 dark:text-gray-300"
                      }`}
                      onClick={() => {
                        navigate(item.href);
                        setMobileSidebarOpen(false);
                      }}
                    >
                      <span className="mr-3">{item.icon}</span>
                      {item.name}
                    </Button>
                  ))}

                  {currentUser && (
                    <Button
                      variant="ghost"
                      className="justify-start mt-4 text-connect-600 hover:bg-connect-50 dark:text-connect-400 dark:hover:bg-connect-900/40"
                      onClick={() => {
                        logout();
                        navigate("/");
                        setMobileSidebarOpen(false);
                      }}
                    >
                      <LogOut className="mr-3 h-5 w-5" />
                      Logout
                    </Button>
                  )}
                </nav>
              </div>
            </SheetContent>
          </Sheet>

          <img 
            src={eventTheme?.logo_url || "/logo.png"} 
            alt={eventTheme?.custom_title || "Kconect Logo"} 
            className="h-6 w-6 mr-2 object-contain" 
          />
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            {eventTheme?.custom_title || "Kconect"}
          </span>
        </div>

        {currentUser && (
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <NotificationBadge
              count={unreadCount}
              size="md"
              onClick={() => navigate("/attendee/notifications")}
            />

            <Avatar
              className="h-8 w-8 cursor-pointer"
              onClick={() => navigate("/attendee/profile")}
            >
              {currentUser.photoUrl ? (
                <AvatarImage
                  src={currentUser.photoUrl}
                  alt={currentUser.name}
                />
              ) : (
                <AvatarFallback className="bg-connect-100 text-connect-600 dark:bg-connect-900 dark:text-connect-300">
                  {currentUser.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
          </div>
        )}
      </header>

      {/* Sidebar Navigation for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-800 border-r dark:border-gray-700 shadow-sm fixed h-full">
        <div className="p-4 border-b dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <img
                src={eventTheme?.logo_url || "/logo.png"}
                alt={eventTheme?.custom_title || "Kconect Logo"}
                className="h-6 w-6 mr-2 object-contain"
              />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                {eventTheme?.custom_title || "Kconect"}
              </span>
            </div>
            <ThemeToggle />
          </div>

          {currentUser && (
            <div className="flex items-center space-x-3 mb-2">
              <Avatar>
                {currentUser.photoUrl ? (
                  <AvatarImage
                    src={currentUser.photoUrl}
                    alt={currentUser.name}
                  />
                ) : (
                  <AvatarFallback className="bg-connect-600 text-white">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {currentUser.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {currentUser.role}
                </p>
              </div>
              <NotificationBadge
                count={unreadCount}
                size="sm"
                onClick={() => navigate("/attendee/notifications")}
              />
            </div>
          )}
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navigation.map((item) => (
            <Button
              key={item.name}
              variant={isActive(item.href) ? "secondary" : "ghost"}
              className={`w-full justify-start ${
                isActive(item.href)
                  ? "bg-connect-50 text-connect-700 dark:bg-connect-900/50 dark:text-connect-300 font-medium"
                  : "text-gray-600 dark:text-gray-300"
              }`}
              onClick={() => navigate(item.href)}
            >
              <span className="mr-3">{item.icon}</span>
              {item.name}
              {isActive(item.href) && (
                <ChevronRight className="ml-auto h-4 w-4" />
              )}
            </Button>
          ))}

          {currentUser && (
            <Button
              variant="ghost"
              className="w-full justify-start mt-6 border-t border-gray-100 dark:border-gray-700 pt-4 text-connect-600 hover:bg-connect-50 dark:text-connect-400 dark:hover:bg-connect-900/40"
              onClick={() => {
                logout();
                navigate("/");
              }}
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </Button>
          )}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 min-h-screen pb-16 md:pb-0">
        <div className="p-4 sm:p-6 max-w-7xl mx-auto">{children}</div>
      </main>

      {/* Floating Did You Know (attendee only) */}
      {currentUser && currentUser.role === "attendee" && (
        <FloatingDidYouKnow />
      )}

      {/* Bottom Navigation Bar for Mobile */}
      {currentUser && currentUser.role === "attendee" && (
        <div className="md:hidden fixed bottom-0 left-0 right-0  z-40">
          <div className="overflow-x-auto">
            <ExpandableTabs
              className="min-w-max flex-nowrap overflow-x-auto"
              activeColor="text-connect-600"
              tabs={attendeeTabItems}
              onChange={(index) => {
                if (index === null) return;
                const href = indexToHref[index];
                if (href) navigate(href);
              }}
            />
          </div>
        </div>
      )}

      {currentUser && currentUser.role !== "attendee" && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t dark:border-gray-700 flex items-center justify-around p-2 z-40 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
          {navigation.slice(0, 4).map((item) => (
            <button
              key={item.name}
              className={`flex flex-col items-center py-1 px-2 rounded-md ${
                isActive(item.href)
                  ? "text-connect-600 dark:text-connect-400 bg-connect-50 dark:bg-connect-900/50"
                  : "text-gray-500 dark:text-gray-400"
              }`}
              onClick={() => navigate(item.href)}
            >
              {item.icon}
              <span className="text-xs mt-1">{item.name}</span>
            </button>
          ))}
          <button
            className={`flex flex-col items-center py-1 px-2 rounded-md relative ${
              isActive("/attendee/notifications")
                ? "text-connect-600 dark:text-connect-400 bg-connect-50 dark:bg-connect-900/50"
                : "text-gray-500 dark:text-gray-400"
            }`}
            onClick={() => navigate("/attendee/notifications")}
          >
            <Bell size={20} />
            <span className="text-xs mt-1">Notifications</span>
            {unreadCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 text-xs bg-primary text-primary-foreground flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </Badge>
            )}
          </button>
        </nav>
      )}
    </div>
  );
};
export default AppLayout;
