import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
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
interface AppLayoutProps {
  children: React.ReactNode;
}
const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { currentUser, logout } = useAuth();
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
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };
  const attendeeNavigation = [
    {
      name: "Dashboard",
      href: "/attendee",
      icon: <Users size={20} />,
    },
    {
      name: "My Tickets",
      href: "/attendee/my-tickets",
      icon: <Ticket size={20} />,
    },
    {
      name: "Profile",
      href: "/attendee/profile",
      icon: <User size={20} />,
    },
    {
      name: "Networking",
      href: "/attendee/networking",
      icon: <UserPlus size={20} />,
    },
    {
      name: "Event Schedule",
      href: "/attendee/schedule",
      icon: <Calendar size={20} />,
    },
    {
      name: "Q&A",
      href: "/attendee/questions",
      icon: <MessageSquare size={20} />,
    },
    {
      name: "Event Facilities",
      href: "/attendee/map",
      icon: <MapPin size={20} />,
    },
    {
      name: "Polls",
      href: "/attendee/polls",
      icon: <BarChart size={20} />,
    },
    {
      name: "Suggestions",
      href: "/attendee/suggestions",
      icon: <Lightbulb size={20} />,
    },
    {
      name: "Announcements",
      href: "/attendee/announcements",
      icon: <Megaphone size={20} />,
    },
    {
      name: "Event Rules",
      href: "/attendee/rules",
      icon: <BookOpen size={20} />,
    },
  ];
  const hostNavigation = [
    {
      name: "Dashboard",
      href: "/host",
      icon: <Users size={20} />,
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
                    src="/logo.png"
                    alt="Kconect Logo"
                    className="h-8 w-8 mr-2"
                  />
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    Kconect
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
                      {renderNavIcon(item.icon, item.href)}
                      {item.name}
                    </Button>
                  ))}

                  {currentUser && (
                    <Button
                      variant="destructive"
                      className="justify-start mt-4"
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

          <img src="/logo.png" alt="Kconect Logo" className="h-8 w-8 mr-2" />
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Kconect
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
                src="/logo.png"
                alt="Kconect Logo"
                className="h-8 w-8 mr-2"
              />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Kconect
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
              {renderNavIcon(item.icon, item.href)}
              {item.name}
              {isActive(item.href) && (
                <ChevronRight className="ml-auto h-4 w-4" />
              )}
            </Button>
          ))}

          {currentUser && (
            <Button
              variant="destructive"
              className="w-full justify-start mt-6 border-t border-gray-100 dark:border-gray-700 pt-4"
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

      {/* Bottom Navigation Bar for Mobile */}
      {currentUser && (
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
              <span className="relative inline-flex">
                {item.icon}
                {item.href === "/attendee/networking" && (
                  <span
                    className={`absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full border border-white dark:border-gray-800 ${networkingIndicatorColor}`}
                    aria-label="Networking status indicator"
                  />
                )}
              </span>
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
              <Badge className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 text-xs bg-red-500 text-white flex items-center justify-center">
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

// Add page-visibility and online/offline detection
const [isPageVisible, setIsPageVisible] = React.useState(!document.hidden);
const [isOnline, setIsOnline] = React.useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

React.useEffect(() => {
  const handleVisibility = () => setIsPageVisible(!document.hidden);
  document.addEventListener('visibilitychange', handleVisibility);
  return () => document.removeEventListener('visibilitychange', handleVisibility);
}, []);

React.useEffect(() => {
  const handleOnline = () => setIsOnline(true);
  const handleOffline = () => setIsOnline(false);
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  // initialize
  setIsOnline(navigator.onLine);
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}, []);

// Compute networking indicator color based on requirements
const isInAttendeeDashboard = location.pathname.startsWith('/attendee');
const networkingIndicatorColor = !isOnline
  ? 'bg-red-500'                      // only red when offline/connection error
  : isInAttendeeDashboard
    ? (isPageVisible ? 'bg-green-500' // green when in dashboard and app visible
                       : 'bg-orange-500') // orange when app is not visible (away)
    : 'bg-gray-300';                  // neutral when not in attendee dashboard

// helper to render icon with status badge for Networking item
const renderNavIcon = (itemIcon: React.ReactNode, itemHref: string) => (
<span className="mr-3 relative inline-flex">
  {itemIcon}
  {itemHref === "/attendee/networking" && (
    <span
      className={`absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full border border-white dark:border-gray-800 ${networkingIndicatorColor}`}
      aria-label="Networking status indicator"
    />
  )}
</span>
);
