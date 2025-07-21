import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useNotificationCount } from "@/hooks/useNotificationCount";
import { useIsMobile } from "@/hooks/use-mobile";
import { AdminFormPersistenceProvider } from "@/hooks/useAdminFormPersistence";
import {
  Calendar,
  Users,
  Bell,
  MessageSquare,
  Star,
  MapPin,
  BarChart4,
  User,
  PanelLeft,
  Megaphone,
  BookText,
  MessageCircle,
  ChevronRight,
  LogOut,
  Menu,
  Search,
  Clock,
  BarChart,
  Moon,
  Sun,
  BookOpen,
  Ticket,
  Scan,
  Settings,
  Store,
  DollarSign,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { currentUser, logout } = useAuth();
  const { unreadCount } = useNotificationCount();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false); // Add this line
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [searchQuery, setSearchQuery] = useState("");

  // Toggle theme functionality
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark");
  };

  const isActive = (path: string) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(path);
  };

  // Generate breadcrumbs based on current path
  const generateBreadcrumbs = () => {
    const pathnames = location.pathname.split("/").filter((x) => x);
    return (
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin">
              <span className="flex items-center text-primary hover:text-primary-600 transition-colors">
                <BarChart4 size={16} className="mr-1" />
                Dashboard
              </span>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {pathnames.slice(1).map((name, index) => {
            const routeTo = `/${pathnames.slice(0, index + 2).join("/")}`;
            const isLast = index === pathnames.slice(1).length - 1;
            return (
              <React.Fragment key={name}>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage className="font-semibold">
                      {name.charAt(0).toUpperCase() + name.slice(1)}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink
                      href={routeTo}
                      className="text-primary hover:text-primary-600 transition-colors"
                    >
                      {name.charAt(0).toUpperCase() + name.slice(1)}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    );
  };

  // Admin navigation links with groups
  // In the adminNavigation array, update the icon styling to use rounded-md instead of fully rounded
  const adminNavigation = [
    // Main group
    {
      name: "Dashboard",
      href: "/admin",
      icon: (
        <div className="flex items-center justify-center w-5 h-5  rounded-md bg-purple-100">
          <BarChart4 size={14} className="text-purple-600" />
        </div>
      ),
    },
    {
      name: "Events",
      href: "/admin/events",
      icon: (
        <div className="flex items-center justify-center w-5 h-5 rounded-md bg-purple-100">
          <Calendar size={14} className="text-purple-600" />
        </div>
      ),
    },
    {
      name: "Tickets",
      href: "/admin/tickets",
      icon: (
        <div className="flex items-center justify-center w-5 h-5 rounded-md bg-purple-100">
          <Ticket size={14} className="text-purple-600" />
        </div>
      ),
    },
    {
      name: "Check-In",
      href: "/admin/checkin",
      icon: (
        <div className="flex items-center justify-center w-5 h-5 rounded-md bg-purple-100">
          <Scan size={14} className="text-purple-600" />
        </div>
      ),
    },
    {
      name: "Wallet",
      href: "/admin/wallet",
      icon: (
        <div className="flex items-center justify-center w-5 h-5 rounded-md bg-purple-100">
          <DollarSign size={14} className="text-purple-600" />
        </div>
      ),
    },

    // Separator
    { type: "separator" },

    // Attendee management group
    {
      name: "Attendees",
      href: "/admin/attendees",
      icon: (
        <div className="flex items-center justify-center w-5 h-5 rounded-md bg-purple-100">
          <Users size={14} className="text-purple-600" />
        </div>
      ),
    },
    {
      name: "Speakers",
      href: "/admin/speakers",
      icon: (
        <div className="flex items-center justify-center w-5 h-5 rounded-md bg-purple-100">
          <User size={14} className="text-purple-600" />
        </div>
      ),
    },

    // Separator
    { type: "separator" },

    // Content management group
    {
      name: "Announcements",
      href: "/admin/announcements",
      icon: (
        <div className="flex items-center justify-center w-5 h-5 rounded-md bg-purple-100">
          <Megaphone size={14} className="text-purple-600" />
        </div>
      ),
    },
    {
      name: "Schedule",
      href: "/admin/schedule",
      icon: (
        <div className="flex items-center justify-center w-5 h-5 rounded-md bg-purple-100">
          <Clock size={14} className="text-purple-600" />
        </div>
      ),
    },
    {
      name: "Polls & Surveys",
      href: "/admin/polls",
      icon: (
        <div className="flex items-center justify-center w-5 h-5 rounded-md bg-purple-100">
          <BarChart size={14} className="text-purple-600" />
        </div>
      ),
    },
    {
      name: "Facilities",
      href: "/admin/facilities",
      icon: (
        <div className="flex items-center justify-center w-5 h-5 rounded-md bg-purple-100">
          <MapPin size={14} className="text-purple-600" />
        </div>
      ),
    },

    // Separator
    { type: "separator" },

    // Engagement group
    {
      name: "Event Rules",
      href: "/admin/rules",
      icon: (
        <div className="flex items-center justify-center w-5 h-5 rounded-md bg-purple-100">
          <BookText size={14} className="text-purple-600" />
        </div>
      ),
    },
    {
      name: "Questions",
      href: "/admin/questions",
      icon: (
        <div className="flex items-center justify-center w-5 h-5 rounded-md bg-purple-100">
          <MessageSquare size={14} className="text-purple-600" />
        </div>
      ),
    },
    {
      name: "Suggestions",
      href: "/admin/suggestions",
      icon: (
        <div className="flex items-center justify-center w-5 h-5 rounded-md bg-purple-100">
          <MessageCircle size={14} className="text-purple-600" />
        </div>
      ),
    },
    {
      name: "Notifications",
      href: "/admin/notifications",
      icon: (
        <div className="flex items-center justify-center w-5 h-5 rounded-md bg-purple-100">
          <Bell size={14} className="text-purple-600" />
        </div>
      ),
    },

    // Separator
    { type: "separator" },

    // Partners group
    {
      name: "Sponsors & Partners",
      href: "/admin/sponsors",
      icon: (
        <div className="flex items-center justify-center w-5 h-5 rounded-md bg-purple-100">
          <Star size={14} className="text-purple-600" />
        </div>
      ),
    },
    {
      name: "Vendor Hub",
      href: "/admin/vendor-hub",
      icon: (
        <div className="flex items-center justify-center w-5 h-5 rounded-md bg-purple-100">
          <Store size={14} className="text-purple-600" />
        </div>
      ),
    },

    // Separator
    { type: "separator" },

    // Settings group
    {
      name: "Settings",
      href: "/admin/settings",
      icon: (
        <div className="flex items-center justify-center w-5 h-5 rounded-md bg-purple-100">
          <Settings size={14} className="text-purple-600" />
        </div>
      ),
    },
  ];

  // Mobile sidebar content
  const MobileSidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <img src="/logo.png" alt="Kconect Logo" className="h-8 w-8 mr-2" />
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Kconect
            </span>
          </div>
        </div>
      </div>

      {currentUser && (
        <div className="px-4 py-4 border-b border-sidebar-border">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10 ring-2 ring-primary/20">
              {currentUser.photoUrl ? (
                <AvatarImage
                  src={currentUser.photoUrl}
                  alt={currentUser.name}
                />
              ) : (
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {currentUser.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {currentUser.name}
              </p>
              <Badge
                variant="outline"
                className="text-[10px] font-normal px-1.5 bg-primary/10 hover:bg-primary/20 text-primary border-primary/20"
              >
                Administrator
              </Badge>
            </div>
          </div>
        </div>
      )}

      <nav className="flex-1 py-2 px-2 space-y-1 overflow-y-auto">
        {adminNavigation.map((item, index) => {
          // Render separator
          if (item.type === "separator") {
            return (
              <div
                key={`separator-${index}`}
                className="h-px bg-gray-200 dark:bg-gray-700 my-3 mx-2"
              />
            );
          }

          // Render navigation button
          return (
            // For mobile navigation - update the text color to match the icon color
            <Button
              key={item.name}
              variant={isActive(item.href) ? "secondary" : "ghost"}
              className={`w-full justify-start ${
                isActive(item.href)
                  ? "bg-primary/10 text-purple-600 hover:bg-primary/20"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              }`}
              onClick={() => {
                navigate(item.href);
                setMobileSidebarOpen(false);
              }}
            >
              <span className="mr-3">{item.icon}</span>
              <span className="flex-1 text-left">{item.name}</span>
              {isActive(item.href) && (
                <ChevronRight
                  size={16}
                  className="ml-auto opacity-70 text-purple-600"
                />
              )}
            </Button>
          );
        })}

        {currentUser && (
          <Button
            variant="ghost"
            className="w-full justify-start text-sidebar-foreground mt-4 hover:text-destructive hover:bg-destructive/10"
            onClick={() => {
              logout();
              navigate("/");
              setMobileSidebarOpen(false);
            }}
          >
            <LogOut size={20} className="mr-3" />
            Logout
          </Button>
        )}
      </nav>
    </div>
  );

  return (
    <AdminFormPersistenceProvider>
      <div className="min-h-screen bg-background flex flex-col md:flex-row">
        {/* Mobile Header */}
        <header className="md:hidden bg-sidebar glass shadow-lg shadow-primary/5 border-b border-sidebar-border py-3 px-4 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center space-x-3">
            <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-sidebar-foreground hover:bg-sidebar-accent"
                >
                  <Menu size={20} />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-[280px] bg-sidebar border-sidebar-border"
              >
                <MobileSidebarContent />
              </SheetContent>
            </Sheet>
            {/* Removed duplicate title from mobile header */}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/admin/notifications")}
            className="relative"
          >
            <Bell size={20} className="text-primary" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-primary text-primary-foreground rounded-full text-xs flex items-center justify-center">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Button>
        </header>

        {/* Sidebar Navigation for Desktop */}
        <aside
          className={`${
            sidebarOpen ? "w-64" : "w-20"
          } hidden md:flex flex-col bg-sidebar glass shadow-lg shadow-primary/5 fixed h-full transition-all duration-300 ease-in-out z-30`}
        >
          <div
            className={`p-4 border-b border-sidebar-border flex ${
              sidebarOpen ? "justify-between" : "justify-center"
            }`}
          >
            <div
              className={`flex items-center ${
                sidebarOpen ? "" : "justify-center"
              }`}
            >
              {sidebarOpen && (
                <>
                  <img
                    src="/logo.png"
                    alt="Kconect Logo"
                    className="h-8 w-8 mr-2"
                  />
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    Kconect
                  </span>
                </>
              )}
              {!sidebarOpen && (
                <img src="/logo.png" alt="Kconect Logo" className="h-8 w-8" />
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <PanelLeft
                size={18}
                className={`transition-transform duration-300 ${
                  sidebarOpen ? "" : "rotate-180"
                }`}
              />
            </Button>
          </div>

          {currentUser && (
            <div
              className={`${
                sidebarOpen ? "px-4" : "px-2"
              } py-4 border-b border-sidebar-border`}
            >
              <div
                className={`flex ${
                  sidebarOpen ? "items-center" : "justify-center"
                } space-x-3`}
              >
                <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                  {currentUser.photoUrl ? (
                    <AvatarImage
                      src={currentUser.photoUrl}
                      alt={currentUser.name}
                    />
                  ) : (
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>

                {sidebarOpen && (
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-sidebar-foreground truncate">
                      {currentUser.name}
                    </p>
                    <Badge
                      variant="outline"
                      className="text-[10px] font-normal px-1.5 bg-primary/10 hover:bg-primary/20 text-primary border-primary/20"
                    >
                      Administrator
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className={`${sidebarOpen ? "px-3" : "px-2"} py-2`}>
            {sidebarOpen && (
              <div className="relative mb-3">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  className="pl-8 bg-sidebar-accent border-sidebar-border text-sm h-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            )}
          </div>

          <nav className="flex-1 py-2 px-2 space-y-1 overflow-y-auto scrollbar-hide">
            {adminNavigation.map((item, index) => {
              // Render separator
              if (item.type === "separator") {
                return (
                  <div
                    key={`separator-${index}`}
                    className="h-px bg-gray-200 dark:bg-gray-700 my-3 mx-2"
                  />
                );
              }

              // Render navigation button
              return (
                <Button
                  key={item.name}
                  variant={isActive(item.href) ? "secondary" : "ghost"}
                  className={`w-full ${
                    sidebarOpen ? "justify-start" : "justify-center"
                  } ${
                    isActive(item.href)
                      ? "bg-primary/10 text-primary hover:bg-primary/20"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                  }`}
                  onClick={() => navigate(item.href)}
                  title={sidebarOpen ? "" : item.name}
                >
                  <span
                    className={`${sidebarOpen ? "mr-3" : ""} ${
                      isActive(item.href)
                        ? "text-primary-700"
                        : "text-muted-foreground"
                    }`}
                  >
                    {item.icon}
                  </span>
                  {sidebarOpen && (
                    <span className="flex-1 text-left">{item.name}</span>
                  )}
                  {sidebarOpen && isActive(item.href) && (
                    <ChevronRight size={16} className="ml-auto opacity-70" />
                  )}
                </Button>
              );
            })}

            {currentUser && (
              <Button
                variant="ghost"
                className={`w-full ${
                  sidebarOpen ? "justify-start" : "justify-center"
                } text-sidebar-foreground mt-4 hover:text-destructive hover:bg-destructive/10`}
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                title={sidebarOpen ? "" : "Logout"}
              >
                <span className={sidebarOpen ? "mr-3" : ""}>
                  <LogOut size={20} />
                </span>
                {sidebarOpen && "Logout"}
              </Button>
            )}
          </nav>

          {sidebarOpen && (
            <div className="mt-auto p-4 border-t border-sidebar-border">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-sidebar-foreground"
                onClick={toggleTheme}
              >
                {theme === "light" ? (
                  <>
                    <Moon size={16} className="mr-2" />
                    <span>Dark Mode</span>
                  </>
                ) : (
                  <>
                    <Sun size={16} className="mr-2" />
                    <span>Light Mode</span>
                  </>
                )}
              </Button>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main
          className={`flex-1 ${
            sidebarOpen ? "md:ml-64" : "md:ml-20"
          } transition-all duration-300 ease-in-out`}
        >
          {/* Desktop Header */}
          <header className="hidden md:flex h-16 bg-card glass-effect border-b px-6 items-center justify-between sticky top-0 z-20 shadow-sm">
            <div className="flex items-center">{generateBreadcrumbs()}</div>

            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="icon"
                onClick={toggleTheme}
                className="bg-card border-primary/20 hover:bg-accent"
              >
                {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={() => navigate("/admin/notifications")}
                className={`relative bg-card ${
                  isActive("/admin/notifications")
                    ? "border-primary/30 ring-1 ring-primary/30"
                    : "border-primary/20"
                } hover:bg-accent`}
              >
                <Bell
                  size={18}
                  className={
                    isActive("/admin/notifications") ? "text-primary" : ""
                  }
                />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-primary text-primary-foreground rounded-full text-xs flex items-center justify-center">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                  )}
              </Button>

              <Avatar className="h-9 w-9 cursor-pointer ring-2 ring-primary/20 hover:ring-primary/40 transition-all">
                {currentUser?.photoUrl ? (
                  <AvatarImage
                    src={currentUser.photoUrl}
                    alt={currentUser.name}
                  />
                ) : (
                  <AvatarFallback className="bg-primary text-white">
                    {currentUser?.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
            </div>
          </header>

          <div className="p-6">{children}</div>
        </main>
      </div>
    </AdminFormPersistenceProvider>
  );
};

export default AdminLayout;
