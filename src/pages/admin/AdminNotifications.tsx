
import React, { useState } from 'react';
import { Bell, Check, ChevronDown, ChevronUp, Filter, Search, Info, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAdminNotifications } from '@/hooks/useAdminNotifications';
import { formatDistanceToNow } from 'date-fns';

const AdminNotifications = () => {
  const { 
    notifications, 
    isLoading, 
    error, 
    markAsRead, 
    markAllAsRead, 
    isMarkingRead, 
    isMarkingAllRead 
  } = useAdminNotifications();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFilter, setExpandedFilter] = useState(false);
  const [typeFilters, setTypeFilters] = useState({
    info: true,
    warning: true,
    success: true
  });
  
  const filterNotifications = () => {
    return notifications.filter(notification => {
      // Search filter
      const matchesSearch = notification.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           notification.message.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Type filter
      const matchesType = typeFilters[notification.type as keyof typeof typeFilters] !== false;
      
      return matchesSearch && matchesType;
    });
  };
  
  const getNotificationIcon = (type: string) => {
    switch(type) {
      case 'info':
        return <Info size={18} className="text-blue-500" />;
      case 'warning':
        return <AlertTriangle size={18} className="text-amber-500" />;
      case 'success':
        return <CheckCircle size={18} className="text-emerald-500" />;
      default:
        return <Bell size={18} className="text-gray-500" />;
    }
  };
  
  const getNotificationBadge = (type: string) => {
    switch(type) {
      case 'info':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Info</Badge>;
      case 'warning':
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">Warning</Badge>;
      case 'success':
        return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200">Success</Badge>;
      default:
        return <Badge>Default</Badge>;
    }
  };
  
  const filteredNotifications = filterNotifications();
  const unreadCount = notifications.filter(n => !n.is_read).length;

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
          <AlertTriangle className="h-12 w-12 mx-auto text-destructive opacity-50" />
          <h3 className="mt-4 text-lg font-medium">Error loading notifications</h3>
          <p className="text-muted-foreground">Please try refreshing the page</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center">
              <Bell className="mr-2 h-8 w-8 text-primary" />
              Notifications
              {unreadCount > 0 && (
                <Badge className="ml-3 bg-primary hover:bg-primary-600">{unreadCount} new</Badge>
              )}
            </h1>
            <p className="text-muted-foreground mt-1">Real-time updates about your events and attendees.</p>
          </div>
          
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={markAllAsRead}
              disabled={!notifications.some(n => !n.is_read) || isMarkingAllRead}
              className="bg-card border-primary/20 hover:bg-accent flex items-center"
            >
              <Check size={16} className="mr-1" />
              {isMarkingAllRead ? 'Marking...' : 'Mark all read'}
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="all" className="w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
            <TabsList className="bg-muted/50">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">Unread ({notifications.filter(n => !n.is_read).length})</TabsTrigger>
              <TabsTrigger value="read">Read ({notifications.filter(n => n.is_read).length})</TabsTrigger>
            </TabsList>
            
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search notifications..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="relative">
                <Button 
                  variant="outline" 
                  className="flex items-center bg-card border-primary/20 hover:bg-accent"
                  onClick={() => setExpandedFilter(!expandedFilter)}
                >
                  <Filter size={16} className="mr-1.5" />
                  Filter
                  {expandedFilter ? 
                    <ChevronUp size={16} className="ml-1.5" /> : 
                    <ChevronDown size={16} className="ml-1.5" />
                  }
                </Button>
                
                {expandedFilter && (
                  <Card className="absolute right-0 top-full mt-1 z-10 w-64 shadow-lg glass-card animate-fade-in">
                    <CardContent className="p-3 space-y-3">
                      <div>
                        <p className="text-sm font-medium mb-2">Type</p>
                        <div className="flex flex-wrap gap-2">
                          <Button 
                            size="sm" 
                            variant={typeFilters.info ? "default" : "outline"} 
                            className={`text-xs h-7 px-2 ${typeFilters.info ? 'bg-blue-500' : 'bg-card border-blue-300 text-blue-700'}`}
                            onClick={() => setTypeFilters({...typeFilters, info: !typeFilters.info})}
                          >
                            <Info size={14} className="mr-1" />
                            Info
                          </Button>
                          <Button 
                            size="sm"
                            variant={typeFilters.warning ? "default" : "outline"}
                            className={`text-xs h-7 px-2 ${typeFilters.warning ? 'bg-amber-500' : 'bg-card border-amber-300 text-amber-700'}`}
                            onClick={() => setTypeFilters({...typeFilters, warning: !typeFilters.warning})}
                          >
                            <AlertTriangle size={14} className="mr-1" />
                            Warning
                          </Button>
                          <Button 
                            size="sm"
                            variant={typeFilters.success ? "default" : "outline"}
                            className={`text-xs h-7 px-2 ${typeFilters.success ? 'bg-emerald-500' : 'bg-card border-emerald-300 text-emerald-700'}`}
                            onClick={() => setTypeFilters({...typeFilters, success: !typeFilters.success})}
                          >
                            <CheckCircle size={14} className="mr-1" />
                            Success
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
          
          <TabsContent value="all">
            <div className="space-y-4">
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((notification) => (
                  <NotificationItem 
                    key={notification.id} 
                    notification={notification}
                    onMarkAsRead={markAsRead}
                    getNotificationIcon={getNotificationIcon}
                    getNotificationBadge={getNotificationBadge}
                    isMarking={isMarkingRead}
                  />
                ))
              ) : (
                <div className="text-center py-10">
                  <Bell className="h-12 w-12 mx-auto text-muted-foreground opacity-20" />
                  <h3 className="mt-4 text-lg font-medium">No notifications found</h3>
                  <p className="text-muted-foreground">
                    {searchQuery ? 'Try adjusting your search criteria' : 'New notifications will appear here as events happen'}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="unread">
            <div className="space-y-4">
              {filteredNotifications.filter(n => !n.is_read).length > 0 ? (
                filteredNotifications
                  .filter(notification => !notification.is_read)
                  .map((notification) => (
                    <NotificationItem 
                      key={notification.id} 
                      notification={notification}
                      onMarkAsRead={markAsRead}
                      getNotificationIcon={getNotificationIcon}
                      getNotificationBadge={getNotificationBadge}
                      isMarking={isMarkingRead}
                    />
                  ))
              ) : (
                <div className="text-center py-10">
                  <Check className="h-12 w-12 mx-auto text-muted-foreground opacity-20" />
                  <h3 className="mt-4 text-lg font-medium">No unread notifications</h3>
                  <p className="text-muted-foreground">You're all caught up!</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="read">
            <div className="space-y-4">
              {filteredNotifications.filter(n => n.is_read).length > 0 ? (
                filteredNotifications
                  .filter(notification => notification.is_read)
                  .map((notification) => (
                    <NotificationItem 
                      key={notification.id} 
                      notification={notification}
                      onMarkAsRead={markAsRead}
                      getNotificationIcon={getNotificationIcon}
                      getNotificationBadge={getNotificationBadge}
                      isMarking={isMarkingRead}
                    />
                  ))
              ) : (
                <div className="text-center py-10">
                  <Bell className="h-12 w-12 mx-auto text-muted-foreground opacity-20" />
                  <h3 className="mt-4 text-lg font-medium">No read notifications</h3>
                  <p className="text-muted-foreground">Nothing has been marked as read yet</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

interface NotificationItemProps {
  notification: {
    id: string;
    title: string;
    message: string;
    type: string;
    is_read: boolean;
    created_at: string;
  };
  onMarkAsRead: (id: string) => void;
  getNotificationIcon: (type: string) => JSX.Element;
  getNotificationBadge: (type: string) => JSX.Element;
  isMarking: boolean;
}

const NotificationItem = ({ 
  notification, 
  onMarkAsRead,
  getNotificationIcon,
  getNotificationBadge,
  isMarking
}: NotificationItemProps) => {
  const timeAgo = formatDistanceToNow(new Date(notification.created_at), { addSuffix: true });

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${
      !notification.is_read 
        ? 'gradient-card border-l-4 border-l-primary shadow-md' 
        : 'bg-card border hover:bg-accent/10'
    }`}>
      <CardContent className="p-0">
        <div className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className={`rounded-full p-3 ${
            notification.type === 'info' ? 'bg-blue-100' :
            notification.type === 'warning' ? 'bg-amber-100' :
            notification.type === 'success' ? 'bg-emerald-100' : 'bg-gray-100'
          }`}>
            {getNotificationIcon(notification.type)}
          </div>
          
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1">
              <h3 className="font-medium text-lg">{notification.title}</h3>
              <div className="flex items-center mt-1 sm:mt-0">
                {getNotificationBadge(notification.type)}
                <div className="ml-2 flex items-center text-muted-foreground text-xs">
                  <Clock size={14} className="mr-1" />
                  {timeAgo}
                </div>
              </div>
            </div>
            <p className="text-muted-foreground">{notification.message}</p>
          </div>
          
          <div className="flex items-center justify-end sm:flex-col gap-2">
            {!notification.is_read && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onMarkAsRead(notification.id)}
                disabled={isMarking}
                className="h-8 bg-accent/30 hover:bg-accent"
              >
                <Check size={14} className="mr-1" />
                {isMarking ? 'Marking...' : 'Mark read'}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminNotifications;
