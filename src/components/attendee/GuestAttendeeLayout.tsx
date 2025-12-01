import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  MapPin,
  Menu,
  ChevronRight,
  BookOpen,
  BarChart,
  Megaphone,
  LayoutDashboard,
  LogIn,
  UserPlus,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { ExpandableTabs } from '@/components/ui/expandable-tabs';
import { useGuestEventContext } from '@/contexts/GuestEventContext';

interface GuestAttendeeLayoutProps {
  children: React.ReactNode;
}

const GuestAttendeeLayout: React.FC<GuestAttendeeLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const isMobile = useIsMobile();
  const { guestEvent } = useGuestEventContext();

  const displayLogo = guestEvent?.logo_url || '/logo.png';
  const displayTitle = guestEvent?.name || 'Kconect';

  const isActive = (path: string) => {
    if (path === '/attendee') {
      return location.pathname === path;
    }
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // Guest-accessible navigation (non-interactive pages only)
  const guestNavigation = [
    {
      name: 'Dashboard',
      href: '/attendee',
      icon: <LayoutDashboard className="text-muted-foreground" />,
    },
    {
      name: 'Event Schedule',
      href: '/attendee/schedule',
      icon: <Calendar className="text-muted-foreground" />,
    },
    {
      name: 'Event Facilities',
      href: '/attendee/map',
      icon: <MapPin className="text-muted-foreground" />,
    },
    {
      name: 'Polls',
      href: '/attendee/polls',
      icon: <BarChart className="text-muted-foreground" />,
    },
    {
      name: 'Announcements',
      href: '/attendee/announcements',
      icon: <Megaphone className="text-muted-foreground" />,
    },
    {
      name: 'Event Rules',
      href: '/attendee/rules',
      icon: <BookOpen className="text-muted-foreground" />,
    },
  ];

  const guestTabItems = [
    { title: 'Dashboard', icon: LayoutDashboard },
    { title: 'Schedule', icon: Calendar },
    { title: 'Facilities', icon: MapPin },
    { type: 'separator' as const },
    { title: 'Polls', icon: BarChart },
    { title: 'Announcements', icon: Megaphone },
  ];

  const indexToHref: (string | null)[] = [
    '/attendee',
    '/attendee/schedule',
    '/attendee/map',
    null,
    '/attendee/polls',
    '/attendee/announcements',
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
                    src={displayLogo}
                    alt="Logo"
                    className="h-6 w-6 mr-2 object-contain"
                  />
                  <span className="text-md font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    {displayTitle}
                  </span>
                </SheetTitle>
              </SheetHeader>
              
              {/* Guest mode indicator */}
              <div className="py-4 border-b dark:border-gray-700">
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Guest Mode</p>
                  <p className="text-xs text-amber-600 dark:text-amber-300">Sign in for full access</p>
                </div>
              </div>

              <div className="py-4">
                <nav className="flex flex-col space-y-1">
                  {guestNavigation.map((item) => (
                    <Button
                      key={item.name}
                      variant={isActive(item.href) ? 'secondary' : 'ghost'}
                      className={`justify-start ${
                        isActive(item.href)
                          ? 'bg-connect-50 text-connect-700 dark:bg-connect-900/50 dark:text-connect-300'
                          : 'text-gray-600 dark:text-gray-300'
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

                  <div className="border-t dark:border-gray-700 pt-4 mt-4 space-y-2">
                    <Button
                      variant="default"
                      className="w-full justify-start"
                      onClick={() => {
                        navigate('/login');
                        setMobileSidebarOpen(false);
                      }}
                    >
                      <LogIn className="mr-3 h-5 w-5" />
                      Sign In
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => {
                        navigate('/register?role=attendee');
                        setMobileSidebarOpen(false);
                      }}
                    >
                      <UserPlus className="mr-3 h-5 w-5" />
                      Create Account
                    </Button>
                  </div>
                </nav>
              </div>
            </SheetContent>
          </Sheet>

          <img src={displayLogo} alt="Logo" className="h-6 w-6 mr-2 object-contain" />
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            {displayTitle}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <ThemeToggle />
          <Button
            variant="default"
            size="sm"
            onClick={() => navigate('/login')}
          >
            Sign In
          </Button>
        </div>
      </header>

      {/* Sidebar Navigation for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-800 border-r dark:border-gray-700 shadow-sm fixed h-full">
        <div className="p-4 border-b dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <img
                src={displayLogo}
                alt="Logo"
                className="h-6 w-6 mr-2 object-contain"
              />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                {displayTitle}
              </span>
            </div>
            <ThemeToggle />
          </div>

          {/* Guest mode indicator */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
            <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Guest Mode</p>
            <p className="text-xs text-amber-600 dark:text-amber-300">Sign in for full access</p>
          </div>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {guestNavigation.map((item) => (
            <Button
              key={item.name}
              variant={isActive(item.href) ? 'secondary' : 'ghost'}
              className={`w-full justify-start ${
                isActive(item.href)
                  ? 'bg-connect-50 text-connect-700 dark:bg-connect-900/50 dark:text-connect-300 font-medium'
                  : 'text-gray-600 dark:text-gray-300'
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

          <div className="border-t dark:border-gray-700 pt-4 mt-4 space-y-2">
            <Button
              variant="default"
              className="w-full justify-start"
              onClick={() => navigate('/login')}
            >
              <LogIn className="mr-3 h-5 w-5" />
              Sign In
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate('/register?role=attendee')}
            >
              <UserPlus className="mr-3 h-5 w-5" />
              Create Account
            </Button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 min-h-screen pb-16 md:pb-0">
        <div className="p-4 sm:p-6 max-w-7xl mx-auto">{children}</div>
      </main>

      {/* Bottom Navigation Bar for Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40">
        <div className="overflow-x-auto">
          <ExpandableTabs
            className="min-w-max flex-nowrap overflow-x-auto"
            activeColor="text-connect-600"
            tabs={guestTabItems}
            onChange={(index) => {
              if (index === null) return;
              const href = indexToHref[index];
              if (href) navigate(href);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default GuestAttendeeLayout;
