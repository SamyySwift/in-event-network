
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Calendar, Users, Bell, Settings, MessageSquare, 
  Star, MapPin, BarChart4, User, PanelLeft, 
  Megaphone, Landmark, BookText, MessageCircle, ChevronRight,
  LogOut, Menu, Search, Sun, Moon, BarChart
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Toggle theme functionality
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark');
  };
  
  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  // Generate breadcrumbs based on current path
  const generateBreadcrumbs = () => {
    const pathnames = location.pathname.split('/').filter(x => x);
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
            const routeTo = `/${pathnames.slice(0, index + 2).join('/')}`;
            const isLast = index === pathnames.slice(1).length - 1;
            
            return isLast ? (
              <BreadcrumbItem key={name}>
                <BreadcrumbSeparator />
                <BreadcrumbPage className="font-semibold">
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </BreadcrumbPage>
              </BreadcrumbItem>
            ) : (
              <BreadcrumbItem key={name}>
                <BreadcrumbSeparator />
                <BreadcrumbLink href={routeTo} className="text-primary hover:text-primary-600 transition-colors">
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </BreadcrumbLink>
              </BreadcrumbItem>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    );
  };
  
  const adminNavigation = [
    { name: 'Dashboard', href: '/admin', icon: <BarChart4 size={20} /> },
    { name: 'Events', href: '/admin/events', icon: <Calendar size={20} /> },
    { name: 'Attendees', href: '/admin/attendees', icon: <Users size={20} /> },
    { name: 'Speakers', href: '/admin/speakers', icon: <User size={20} /> },
    { name: 'Announcements', href: '/admin/announcements', icon: <Megaphone size={20} /> },
    { name: 'Polls', href: '/admin/polls', icon: <BarChart size={20} /> },
    { name: 'Facilities', href: '/admin/facilities', icon: <MapPin size={20} /> },
    { name: 'Event Rules', href: '/admin/rules', icon: <BookText size={20} /> },
    { name: 'Questions', href: '/admin/questions', icon: <MessageSquare size={20} /> },
    { name: 'Suggestions', href: '/admin/suggestions', icon: <MessageCircle size={20} /> },
    { name: 'Team Management', href: '/admin/team', icon: <Landmark size={20} /> },
    { name: 'Notifications', href: '/admin/notifications', icon: <Bell size={20} /> },
    { name: 'Settings', href: '/admin/settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden bg-card glass-effect border-b py-4 px-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center">
          <Button
            variant="ghost" 
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="mr-2"
          >
            <Menu size={20} className="text-primary" />
          </Button>
          <img
            src="/logo-placeholder.svg"
            alt="Connect Logo"
            className="h-8 w-auto"
          />
          <span className="ml-2 font-semibold text-gradient">Connect Admin</span>
        </div>
        
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate('/admin/notifications')}
          className="relative"
        >
          <Bell size={20} className="text-primary" />
          <span className="absolute top-0 right-0 h-2 w-2 bg-primary rounded-full animate-pulse"></span>
        </Button>
      </header>
      
      {/* Sidebar Navigation for Desktop */}
      <aside 
        className={`${sidebarOpen ? 'w-64' : 'w-20'} hidden md:flex flex-col bg-sidebar glass shadow-lg shadow-primary/5 fixed h-full transition-all duration-300 ease-in-out z-30`}
      >
        <div className={`p-4 border-b border-sidebar-border flex ${sidebarOpen ? 'justify-between' : 'justify-center'}`}>
          <div className={`flex items-center ${sidebarOpen ? '' : 'justify-center'}`}>
            <img
              src="/logo-placeholder.svg"
              alt="Connect Logo"
              className="h-8 w-auto"
            />
            {sidebarOpen && <span className="ml-2 font-semibold text-xl text-gradient">Admin</span>}
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <PanelLeft size={18} className={`transition-transform duration-300 ${sidebarOpen ? '' : 'rotate-180'}`} />
          </Button>
        </div>
        
        {currentUser && (
          <div className={`${sidebarOpen ? 'px-4' : 'px-2'} py-4 border-b border-sidebar-border`}>
            <div className={`flex ${sidebarOpen ? 'items-center' : 'justify-center'} space-x-3`}>
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
                  <Badge variant="outline" className="text-[10px] font-normal px-1.5 bg-primary/10 hover:bg-primary/20 text-primary border-primary/20">
                    Administrator
                  </Badge>
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className={`${sidebarOpen ? 'px-3' : 'px-2'} py-2`}>
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
          {adminNavigation.map((item) => (
            <Button
              key={item.name}
              variant={isActive(item.href) ? "secondary" : "ghost"}
              className={`w-full ${sidebarOpen ? 'justify-start' : 'justify-center'} ${isActive(item.href) 
                ? 'bg-primary/10 text-primary hover:bg-primary/20' 
                : 'text-sidebar-foreground hover:bg-sidebar-accent/50'}`}
              onClick={() => navigate(item.href)}
              title={sidebarOpen ? '' : item.name}
            >
              <span className={`${sidebarOpen ? 'mr-3' : ''} ${isActive(item.href) ? 'text-primary-700' : 'text-muted-foreground'}`}>
                {item.icon}
              </span>
              {sidebarOpen && (
                <span className="flex-1 text-left">{item.name}</span>
              )}
              {sidebarOpen && isActive(item.href) && (
                <ChevronRight size={16} className="ml-auto opacity-70" />
              )}
            </Button>
          ))}
          
          {currentUser && (
            <Button 
              variant="ghost" 
              className={`w-full ${sidebarOpen ? 'justify-start' : 'justify-center'} text-sidebar-foreground mt-4 hover:text-destructive hover:bg-destructive/10`}
              onClick={() => {
                logout();
                navigate('/');
              }}
              title={sidebarOpen ? '' : 'Logout'}
            >
              <span className={sidebarOpen ? 'mr-3' : ''}>
                <LogOut size={20} />
              </span>
              {sidebarOpen && 'Logout'}
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
              {theme === 'light' ? (
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
      <main className={`flex-1 ${sidebarOpen ? 'md:ml-64' : 'md:ml-20'} transition-all duration-300 ease-in-out`}>
        {/* Desktop Header */}
        <header className="hidden md:flex h-16 bg-card glass-effect border-b px-6 items-center justify-between sticky top-0 z-20 shadow-sm">
          <div className="flex items-center">
            {generateBreadcrumbs()}
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              className="bg-card border-primary/20 hover:bg-accent"
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/admin/notifications')}
              className={`relative bg-card ${isActive('/admin/notifications') ? 'border-primary/30 ring-1 ring-primary/30' : 'border-primary/20'} hover:bg-accent`}
            >
              <Bell size={18} className={isActive('/admin/notifications') ? 'text-primary' : ''} />
              <span className="absolute top-0 right-0 h-2 w-2 bg-primary rounded-full animate-pulse"></span>
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/admin/settings')}
              className={`bg-card ${isActive('/admin/settings') ? 'border-primary/30 ring-1 ring-primary/30' : 'border-primary/20'} hover:bg-accent`}
            >
              <Settings size={18} className={isActive('/admin/settings') ? 'text-primary' : ''} />
            </Button>
            
            <Avatar 
              className="h-9 w-9 cursor-pointer ring-2 ring-primary/20 hover:ring-primary/40 transition-all"
              onClick={() => navigate('/admin/profile')}
            >
              {currentUser?.photoUrl ? (
                <AvatarImage src={currentUser.photoUrl} alt={currentUser.name} />
              ) : (
                <AvatarFallback className="bg-primary text-white">
                  {currentUser?.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
          </div>
        </header>
        
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
