
import React, { useState } from 'react';
import { Bell, Check, MessageSquare, UserPlus, Calendar, Clock, Megaphone, Info, X, CheckCircle, XCircle } from 'lucide-react';
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
import { useConnectionRequests } from '@/hooks/useConnectionRequests';

const AttendeeNotifications = () => {
  const { toast } = useToast();
  const { 
    notifications, 
    loading, 
    acceptConnectionRequest, 
    declineConnectionRequest, 
    markAsRead 
  } = useConnectionRequests();
  
  const [selectMode, setSelectMode] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  
  const unreadCount = notifications.filter(n => !n.is_read).length;
  
  // Handle clicking a notification
  const handleNotificationClick = (notification: typeof notifications[0]) => {
    if (selectMode) {
      toggleSelectNotification(notification.id);
    } else if (!notification.is_read) {
      markAsRead(notification.id);
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
  const markAllAsRead = async () => {
    try {
      await Promise.all(
        notifications
          .filter(n => !n.is_read)
          .map(n => markAsRead(n.id))
      );
      
      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark all as read",
        variant: "destructive",
      });
    }
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

  const renderConnectionRequest = (notification: typeof notifications[0]) => {
    const connection = notification.connection;
    const requesterProfile = connection?.requester_profile;
    
    if (!connection || !requesterProfile) return null;
    
    const isPending = connection.status === 'pending';
    const isAccepted = connection.status === 'accepted';
    const isRejected = connection.status === 'rejected';

    return (
      <div className="py-3 flex items-start gap-3">
        <Avatar className="h-10 w-10">
          {requesterProfile.photo_url ? (
            <AvatarImage src={requesterProfile.photo_url} alt={requesterProfile.name} />
          ) : (
            <AvatarFallback className="bg-connect-100 text-connect-600">
              {requesterProfile.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          )}
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <p className={`text-sm ${!notification.is_read ? 'font-medium' : ''}`}>
                <span className="font-semibold">{requesterProfile.name}</span> wants to connect with you
              </p>
              {requesterProfile.role && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {requesterProfile.role}{requesterProfile.company && ` at ${requesterProfile.company}`}
                </p>
              )}
              <div className="flex items-center mt-1 space-x-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatTime(notification.created_at)}
                </span>
                {!notification.is_read && (
                  <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 bg-connect-50 text-connect-600 dark:bg-connect-900/30 dark:text-connect-400">
                    New
                  </Badge>
                )}
                {isAccepted && (
                  <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                    Accepted
                  </Badge>
                )}
                {isRejected && (
                  <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                    Declined
                  </Badge>
                )}
              </div>
            </div>
            
            {isPending && (
              <div className="flex gap-2 ml-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    declineConnectionRequest(connection.id, notification.id);
                  }}
                  className="h-7 px-2 text-xs"
                >
                  <XCircle className="h-3 w-3 mr-1" />
                  Decline
                </Button>
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    acceptConnectionRequest(connection.id, notification.id);
                  }}
                  className="h-7 px-2 text-xs bg-connect-600 hover:bg-connect-700"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Accept
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="animate-fade-in max-w-6xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-connect-600 mx-auto"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Loading notifications...</p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

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
                <TabsTrigger value="connections">Connections</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="space-y-0 divide-y">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div 
                      key={notification.id}
                      className={`cursor-pointer ${
                        !notification.is_read ? 'bg-gray-50 dark:bg-gray-800/50' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      {notification.type === 'connection' ? 
                        renderConnectionRequest(notification) : 
                        (
                          <div className="py-3 flex items-start gap-3">
                            <div className="mt-1 p-2 rounded-full bg-gray-100 dark:bg-gray-800">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm ${!notification.is_read ? 'font-medium' : ''}`}>
                                {notification.message}
                              </p>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {formatTime(notification.created_at)}
                              </span>
                            </div>
                          </div>
                        )
                      }
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
                {notifications.filter(n => !n.is_read).length > 0 ? (
                  notifications.filter(n => !n.is_read).map((notification) => (
                    <div 
                      key={notification.id}
                      className="cursor-pointer bg-gray-50 dark:bg-gray-800/50"
                      onClick={() => handleNotificationClick(notification)}
                    >
                      {notification.type === 'connection' ? 
                        renderConnectionRequest(notification) : 
                        (
                          <div className="py-3 flex items-start gap-3">
                            <div className="mt-1 p-2 rounded-full bg-gray-100 dark:bg-gray-800">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium">
                                {notification.message}
                              </p>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {formatTime(notification.created_at)}
                              </span>
                            </div>
                          </div>
                        )
                      }
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
              
              <TabsContent value="connections" className="space-y-0 divide-y">
                {notifications.filter(n => n.type === 'connection').length > 0 ? (
                  notifications.filter(n => n.type === 'connection').map((notification) => (
                    <div 
                      key={notification.id}
                      className={`cursor-pointer ${
                        !notification.is_read ? 'bg-gray-50 dark:bg-gray-800/50' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      {renderConnectionRequest(notification)}
                    </div>
                  ))
                ) : (
                  <div className="py-10 text-center">
                    <UserPlus className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600" />
                    <h3 className="mt-4 text-lg font-medium">No connection requests</h3>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">
                      You haven't received any connection requests yet
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
