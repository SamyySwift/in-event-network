
import React from 'react';
import { Sidebar, SidebarContent, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/ui/app-sidebar';
import { Toaster } from '@/components/ui/toaster';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Menu } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const menuItems = [
    { icon: 'LayoutDashboard', label: 'Dashboard', href: '/admin/dashboard' },
    { icon: 'Calendar', label: 'Events', href: '/admin/events' },
    { icon: 'Users', label: 'Attendees', href: '/admin/attendees' },
    { icon: 'Mic', label: 'Speakers', href: '/admin/speakers' },
    { icon: 'Megaphone', label: 'Announcements', href: '/admin/announcements' },
    { icon: 'FileText', label: 'Rules', href: '/admin/rules' },
    { icon: 'Building', label: 'Facilities', href: '/admin/facilities' },
    { icon: 'Bell', label: 'Notifications', href: '/admin/notifications' },
    { icon: 'BarChart3', label: 'Polls', href: '/admin/polls' },
    { icon: 'MessageSquare', label: 'Suggestions', href: '/admin/suggestions' },
    { icon: 'Settings', label: 'Settings', href: '/admin/settings' },
    { icon: 'Users', label: 'Team', href: '/admin/team' },
    { icon: 'Image', label: 'Advertisements', href: '/admin/advertisements' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SidebarProvider>
        <div className="flex h-screen w-full">
          <AppSidebar menuItems={menuItems} />
          <div className="flex flex-1 flex-col overflow-hidden">
            <header className="flex h-16 items-center justify-between border-b bg-background px-6">
              <div className="flex items-center gap-4">
                <SidebarTrigger asChild>
                  <button className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground md:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle navigation menu</span>
                  </button>
                </SidebarTrigger>
              </div>
              <div className="flex items-center gap-4">
                <ThemeToggle />
              </div>
            </header>
            <main className="flex-1 overflow-auto">
              <div className="container mx-auto p-6">
                {children}
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
      <Toaster />
    </div>
  );
};

export default AdminLayout;
