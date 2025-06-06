
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Home, 
  User, 
  Calendar, 
  Users, 
  MessageSquare, 
  Bell, 
  Search, 
  FileText, 
  Map, 
  Lightbulb,
  Building,
  BarChart3,
  Megaphone,
  LogOut
} from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const { logout } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/attendee', icon: Home },
    { name: 'Profile', href: '/attendee/profile', icon: User },
    { name: 'Schedule', href: '/attendee/schedule', icon: Calendar },
    { name: 'Networking', href: '/attendee/networking', icon: Users },
    { name: 'Polls', href: '/attendee/polls', icon: BarChart3 },
    { name: 'Questions', href: '/attendee/questions', icon: MessageSquare },
    { name: 'Announcements', href: '/attendee/announcements', icon: Megaphone },
    { name: 'Facilities', href: '/attendee/facilities', icon: Building },
    { name: 'Rules', href: '/attendee/rules', icon: FileText },
    { name: 'Map', href: '/attendee/map', icon: Map },
    { name: 'Suggestions', href: '/attendee/suggestions', icon: Lightbulb },
    { name: 'Search', href: '/attendee/search', icon: Search },
    { name: 'Notifications', href: '/attendee/notifications', icon: Bell },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">Connect</h1>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex h-screen lg:h-auto">
        {/* Sidebar */}
        <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
          <div className="flex flex-col flex-grow bg-white border-r overflow-y-auto">
            <div className="flex items-center justify-between h-16 px-4 border-b">
              <h1 className="text-xl font-bold text-primary">Connect</h1>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
            <nav className="flex-1 px-2 py-4 space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-primary/10 text-primary border-r-2 border-primary'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 lg:pl-64">
          <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
            {children}
          </main>
        </div>

        {/* Mobile Bottom Navigation */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t">
          <div className="grid grid-cols-5 py-2">
            {navigation.slice(0, 5).map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex flex-col items-center py-2 text-xs ${
                    isActive ? 'text-primary' : 'text-gray-600'
                  }`}
                >
                  <item.icon className="h-5 w-5 mb-1" />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppLayout;
