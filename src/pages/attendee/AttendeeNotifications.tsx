
import React, { useState } from 'react';
import { Bell, Check, MessageSquare, UserPlus, Calendar, Clock, Megaphone, Info, X } from 'lucide-react';
import AppLayout from '@/components/layouts/AppLayout';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

// Mock notification data
const initialNotifications = [
  {
    id: '1',
    content: 'Alex Johnson accepted your connection request',
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
    read: false,
    type: 'connection',
    linkTo: '/attendee/networking',
    imageUrl: ''
  },
  {
    id: '2',
    content: 'Your question has been answered by Maria Garcia',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    read: false,
    type: 'question',
    linkTo: '/attendee/questions',
    imageUrl: ''
  },
  {
    id: '3',
    content: 'Reminder: "Future of Tech Panel" starts in 15 minutes',
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
    read: true,
    type: 'schedule',
    linkTo: '/attendee/schedule',
    imageUrl: ''
  },
  {
    id: '4',
    content: 'New announcement: "Wi-Fi Access Code Updated"',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
    read: true,
    type: 'announcement',
    linkTo: '/attendee/announcements',
    imageUrl: ''
  },
  {
    id: '5',
    content: 'Welcome to the Tech Connect 2025 Conference!',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    read: true,
    type: 'other',
    linkTo: '/attendee',
    imageUrl: ''
  },
];

const AttendeeNotifications = () => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState(initialNotifications);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  // Handle marking a notification as read
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };
  
  // Handle clicking a notification
  const handleNotificationClick = (notification: typeof initialNotifications[0]) => {
    if (selectMode) {
      toggleSelectNotification(notification.id);
    } else {
      // Mark as read and navigate
      markAsRead(notification.id);
      // In a real app, we would navigate to the linkTo route
      console.log(`Navigate to: ${notification.linkTo}`);
    }
  };
  
  // Toggle select notification
  const toggleSelectNotification = (id: string) => {
    setSelectedNotifications(prev => {
      if (prev.includes(id)) {
        return prev.filter(notificationId => notificationId !== id);
      } else {
        return [...prev, id];
      }
    });
  };
  
  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
    toast({
      title: "Success",
      description: "All notifications marked as read",
    });
  };
  
  // Mark selected as read
  const markSelectedAsRead = () => {
    if (selectedNotifications.length === 0) return;
    
    setNotifications(prev => 
      prev.map(notification => 
        selectedNotifications.includes(notification.id) 
          ? { ...notification, read: true } 
          : notification
      )
    );
    
    toast({
      title: "Success",
      description: `${selectedNotifications.length} notification(s) marked as read`,
    });
    
    setSelectedNotifications([]);
    setSelectMode(false);
  };
  
  // Delete selected notifications
  const deleteSelectedNotifications = () => {
    if (selectedNotifications.length === 0) return;
    
    setNotifications(prev => 
      prev.filter(notification => !selectedNotifications.includes(notification.id))
    );
    
    toast({
      title: "Success",
      description: `${selectedNotifications.length} notification(s) deleted`,
    });
    
    setSelectedNotifications([]);
    setSelectMode(false);
  };
  
  // Format the time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 60) {
      return `${diffMins} min ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return `${diffDays}d ago`;
    }
  };
  
  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'connection':
        return <UserPlus className="h-5 w-5 text-connect-600" />;
      case 'question':
        return <MessageSquare className="h-5 w-5 text-amber-600" />;
      case 'schedule':
        return <Calendar className="h-5 w-5 text-green-600" />;
      case 'announcement':
        return <Megaphone className="h-5 w-5 text-blue-600" />;
      default:
        return <Info className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <AppLayout>
      <div className="animate-fade-in max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notifications</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Stay updated on your activities and event updates
            </p>
          </div>
          
          <div className="flex gap-2">
            {selectMode ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectMode(false);
                    setSelectedNotifications([]);
                  }}
                  className="text-sm"
                >
                  Cancel
                </Button>
                <Button
                  variant="outline"
                  onClick={markSelectedAsRead}
                  className="text-sm"
                  disabled={selectedNotifications.length === 0}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Mark Read
                </Button>
                <Button
                  variant="destructive"
                  onClick={deleteSelectedNotifications}
                  className="text-sm"
                  disabled={selectedNotifications.length === 0}
                >
                  <X className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => setSelectMode(true)}
                  className="text-sm"
                >
                  Select
                </Button>
                <Button
                  variant="outline"
                  onClick={markAllAsRead}
                  className="text-sm"
                  disabled={unreadCount === 0}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Mark All Read
                </Button>
              </>
            )}
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-connect-600 dark:text-connect-400" />
                <CardTitle>Your Notifications</CardTitle>
              </div>
              {unreadCount > 0 && (
                <Badge className="bg-connect-600">
                  {unreadCount} new
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="unread">Unread</TabsTrigger>
                <TabsTrigger value="read">Read</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="space-y-0 divide-y">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div 
                      key={notification.id}
                      className={`py-3 flex items-start gap-3 cursor-pointer ${
                        !notification.read ? 'bg-gray-50 dark:bg-gray-800/50' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      {selectMode ? (
                        <Checkbox
                          checked={selectedNotifications.includes(notification.id)}
                          onCheckedChange={() => toggleSelectNotification(notification.id)}
                          className="mt-1"
                        />
                      ) : (
                        <div className="mt-1 p-2 rounded-full bg-gray-100 dark:bg-gray-800">
                          {getNotificationIcon(notification.type)}
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${!notification.read ? 'font-medium' : ''}`}>
                          {notification.content}
                        </p>
                        <div className="flex items-center mt-1 space-x-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatTime(notification.createdAt)}
                          </span>
                          {!notification.read && (
                            <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 bg-connect-50 text-connect-600 dark:bg-connect-900/30 dark:text-connect-400">
                              New
                            </Badge>
                          )}
                          {notification.type === 'connection' && (
                            <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 bg-connect-50 text-connect-600 dark:bg-connect-900/30 dark:text-connect-400">
                              Connection
                            </Badge>
                          )}
                          {notification.type === 'announcement' && (
                            <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                              Announcement
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {!selectMode && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-800"
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification.id);
                          }}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="py-10 text-center">
                    <Bell className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600" />
                    <h3 className="mt-4 text-lg font-medium">No notifications</h3>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">
                      You don't have any notifications yet
                    </p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="unread" className="space-y-0 divide-y">
                {notifications.filter(n => !n.read).length > 0 ? (
                  notifications.filter(n => !n.read).map((notification) => (
                    <div 
                      key={notification.id}
                      className="py-3 flex items-start gap-3 cursor-pointer bg-gray-50 dark:bg-gray-800/50"
                      onClick={() => handleNotificationClick(notification)}
                    >
                      {selectMode ? (
                        <Checkbox
                          checked={selectedNotifications.includes(notification.id)}
                          onCheckedChange={() => toggleSelectNotification(notification.id)}
                          className="mt-1"
                        />
                      ) : (
                        <div className="mt-1 p-2 rounded-full bg-gray-100 dark:bg-gray-800">
                          {getNotificationIcon(notification.type)}
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">
                          {notification.content}
                        </p>
                        <div className="flex items-center mt-1 space-x-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatTime(notification.createdAt)}
                          </span>
                          <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 bg-connect-50 text-connect-600 dark:bg-connect-900/30 dark:text-connect-400">
                            New
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-10 text-center">
                    <Check className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600" />
                    <h3 className="mt-4 text-lg font-medium">No unread notifications</h3>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">
                      You're all caught up!
                    </p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="read" className="space-y-0 divide-y">
                {notifications.filter(n => n.read).length > 0 ? (
                  notifications.filter(n => n.read).map((notification) => (
                    <div 
                      key={notification.id}
                      className="py-3 flex items-start gap-3 cursor-pointer"
                      onClick={() => handleNotificationClick(notification)}
                    >
                      {selectMode ? (
                        <Checkbox
                          checked={selectedNotifications.includes(notification.id)}
                          onCheckedChange={() => toggleSelectNotification(notification.id)}
                          className="mt-1"
                        />
                      ) : (
                        <div className="mt-1 p-2 rounded-full bg-gray-100 dark:bg-gray-800">
                          {getNotificationIcon(notification.type)}
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">
                          {notification.content}
                        </p>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatTime(notification.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-10 text-center">
                    <Bell className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600" />
                    <h3 className="mt-4 text-lg font-medium">No read notifications</h3>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">
                      You haven't read any notifications yet
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default AttendeeNotifications;
