
import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminEventContext } from '@/hooks/useAdminEventContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Mic,
  Megaphone,
  Clock,
  BarChart3,
  MapPin,
  FileText,
  HelpCircle,
  MessageSquare,
  Bell,
  Handshake,
  Building2,
  Ticket,
  UserCheck,
  Settings,
  User,
  Menu,
  Lock,
  UserCog
} from 'lucide-react';
import { EventSelector } from '@/components/admin/EventSelector';

interface NavigationItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  section: string;
}

const navigationItems: NavigationItem[] = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, section: 'dashboard' },
  { label: 'Events', href: '/admin/events', icon: Calendar, section: 'events' },
  { label: 'Tickets', href: '/admin/tickets', icon: Ticket, section: 'tickets' },
  { label: 'Check-in', href: '/admin/checkin', icon: UserCheck, section: 'checkin' },
  { label: 'Attendees', href: '/admin/attendees', icon: Users, section: 'attendees' },
  { label: 'Speakers', href: '/admin/speakers', icon: Mic, section: 'speakers' },
  { label: 'Announcements', href: '/admin/announcements', icon: Megaphone, section: 'announcements' },
  { label: 'Schedule', href: '/admin/schedule', icon: Clock, section: 'schedule' },
  { label: 'Polls', href: '/admin/polls', icon: BarChart3, section: 'polls' },
  { label: 'Facilities', href: '/admin/facilities', icon: MapPin, section: 'facilities' },
  { label: 'Rules', href: '/admin/rules', icon: FileText, section: 'rules' },
  { label: 'Questions', href: '/admin/questions', icon: HelpCircle, section: 'questions' },
  { label: 'Suggestions', href: '/admin/suggestions', icon: MessageSquare, section: 'suggestions' },
  { label: 'Notifications', href: '/admin/notifications', icon: Bell, section: 'notifications' },
  { label: 'Sponsors', href: '/admin/sponsors', icon: Handshake, section: 'sponsors' },
  { label: 'Vendor Hub', href: '/admin/vendor-hub', icon: Building2, section: 'vendor-hub' },
  { label: 'Team Management', href: '/admin/team-management', icon: UserCog, section: 'team-management' },
  { label: 'Settings', href: '/admin/settings', icon: Settings, section: 'settings' },
];

export function AdminLayout() {
  const { user, logout } = useAuth();
  const { currentEvent } = useAdminEventContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [sectionPermissions, setSectionPermissions] = useState<Record<string, boolean>>({});

  // Fetch user role and permissions
  useEffect(() => {
    const fetchPermissions = async () => {
      if (!user || !currentEvent) return;

      try {
        // Get user role
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profile) {
          setUserRole(profile.role);
        }

        // If not a host, check team member permissions
        if (profile?.role !== 'host') {
          const permissions: Record<string, boolean> = {};
          
          // Check each section permission
          for (const item of navigationItems) {
            const { data: hasAccess } = await supabase
              .rpc('has_section_access', { 
                section_name: item.section,
                target_event_id: currentEvent.id 
              });
            permissions[item.section] = hasAccess || false;
          }
          
          setSectionPermissions(permissions);
        } else {
          // Hosts have access to everything
          const permissions: Record<string, boolean> = {};
          navigationItems.forEach(item => {
            permissions[item.section] = true;
          });
          setSectionPermissions(permissions);
        }
      } catch (error) {
        console.error('Error fetching permissions:', error);
      }
    };

    fetchPermissions();
  }, [user, currentEvent]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isActiveRoute = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  const hasAccess = (section: string) => {
    if (userRole === 'host') return true;
    return sectionPermissions[section] || false;
  };

  const NavigationContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">Admin Dashboard</h2>
        <EventSelector />
        {userRole && userRole !== 'host' && (
          <Badge variant="outline" className="mt-2">
            Team Member
          </Badge>
        )}
      </div>
      
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {navigationItems.map((item) => {
          const hasAccessToSection = hasAccess(item.section);
          const Icon = item.icon;
          
          return (
            <div key={item.href} className="relative">
              {hasAccessToSection ? (
                <Link
                  to={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActiveRoute(item.href)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon className="mr-3 h-4 w-4" />
                  {item.label}
                </Link>
              ) : (
                <div className={`flex items-center px-3 py-2 text-sm font-medium rounded-md opacity-50 cursor-not-allowed ${
                  'text-muted-foreground'
                }`}>
                  <Icon className="mr-3 h-4 w-4" />
                  {item.label}
                  <Lock className="ml-auto h-3 w-3" />
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="p-4 border-t">
        <div className="flex items-center space-x-3 mb-3">
          <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {user?.user_metadata?.name || user?.email}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {userRole === 'host' ? 'Event Host' : 'Team Member'}
            </p>
          </div>
        </div>
        <div className="space-y-1">
          <Link
            to="/admin/profile"
            className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <User className="mr-3 h-4 w-4" />
            Profile
          </Link>
          <Button
            variant="ghost"
            className="w-full justify-start px-3 py-2 h-auto font-medium"
            onClick={handleLogout}
          >
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64 border-r bg-card">
          <NavigationContent />
        </div>
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetTrigger asChild className="lg:hidden">
          <Button variant="ghost" size="sm" className="fixed top-4 left-4 z-40">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <NavigationContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
