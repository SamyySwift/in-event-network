
import React, { useState } from 'react';
import { Bell, Check, MessageSquare, UserPlus, Calendar, Clock, Megaphone, Info, X, CheckCircle, XCircle, Mail, Users } from 'lucide-react';
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
import { useAttendeeNotifications } from '@/hooks/useAttendeeNotifications';

const AttendeeNotifications = () => {
  const { toast } = useToast();
  const { 
    notifications: connectionNotifications, 
    loading: connectionLoading, 
    acceptConnectionRequest, 
    declineConnectionRequest, 
    markAsRead: markConnectionAsRead 
  } = useConnectionRequests();
  
  const {
    notifications,
    loading,
    markAsRead,
    markAllAsRead: attendeeMarkAllAsRead,
    getNotificationsByType,
    requestNotificationPermission
  } = useAttendeeNotifications();
  
  const [selectMode, setSelectMode] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  
  const unreadCount = notifications.filter(n => !n.is_read).length;
  
  // Request notification permission on component mount
  React.useEffect(() => {
    requestNotificationPermission();
  }, []);
  
  // Handle clicking a notification
  const handleNotificationClick = (notification: typeof notifications[0] | typeof connectionNotifications[0]) => {
    if (selectMode) {
      toggleSelectNotification(notification.id);
    } else if (!notification.is_read) {
      if ('connection' in notification) {
        markConnectionAsRead(notification.id);
      } else {
        markAsRead(notification.id);
      }
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
      case 'connection_accepted':
        return <UserPlus className="h-5 w-5 text-connect-600" />;
      case 'direct_message':
        return <Mail className="h-5 w-5 text-blue-600" />;
      case 'group_message':
        return <Users className="h-5 w-5 text-purple-600" />;
      case 'question':
        return <MessageSquare className="h-5 w-5 text-amber-600" />;
      case 'schedule_update':
        return <Calendar className="h-5 w-5 text-green-600" />;
      case 'facility_update':
        return <Info className="h-5 w-5 text-orange-600" />;
      case 'announcement':
        return <Megaphone className="h-5 w-5 text-blue-600" />;
      case 'poll_created':
        return <Clock className="h-5 w-5 text-indigo-600" />;
      default:
        return <Info className="h-5 w-5 text-gray-600" />;
    }
  };

  const renderConnectionRequest = (notification: typeof connectionNotifications[0]) => {
    const connection = notification.connection;
    const requesterProfile = connection?.requester_profile;
    
    if (!connection || !requesterProfile) return null;
    
    const isPending = connection.status === 'pending';
    const isAccepted = connection.status === 'accepted';
    const isRejected = connection.status === 'rejected';

    return (
      <div className="py-5 px-3 flex items-start gap-4">
        <Avatar className="h-12 w-12 flex-shrink-0">
          {requesterProfile.photo_url ? (
            <AvatarImage src={requesterProfile.photo_url} alt={requesterProfile.name} />
          ) : (
            <AvatarFallback className="bg-connect-100 text-connect-600">
              {requesterProfile.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          )}
        </Avatar>
        
          <div className="flex-1 min-w-0 space-y-3">
            <div className="space-y-2">
              <div className="flex-1 min-w-0">
                <p className={`text-sm leading-relaxed ${!notification.is_read ? 'font-medium' : ''} break-words`}>
                  <span className="font-semibold">{requesterProfile.name}</span> wants to connect with you
                </p>
                {requesterProfile.role && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 break-words mt-1">
                    {requesterProfile.role}{requesterProfile.company && ` at ${requesterProfile.company}`}
                  </p>
                )}
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatTime(notification.created_at)}
                </span>
                {!notification.is_read && (
                  <Badge variant="outline" className="text-[10px] px-2 py-0.5 h-5 bg-connect-50 text-connect-600 dark:bg-connect-900/30 dark:text-connect-400">
                    New
                  </Badge>
                )}
                {isAccepted && (
                  <Badge variant="outline" className="text-[10px] px-2 py-0.5 h-5 bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                    Accepted
                  </Badge>
                )}
                {isRejected && (
                  <Badge variant="outline" className="text-[10px] px-2 py-0.5 h-5 bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                    Declined
                  </Badge>
                )}
              </div>
            </div>
            
            {isPending && (
              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    declineConnectionRequest(connection.id, notification.id);
                  }}
                  className="h-8 px-3 text-xs flex-1 sm:flex-none"
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
                  className="h-8 px-3 text-xs bg-connect-600 hover:bg-connect-700 flex-1 sm:flex-none"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Accept
                </Button>
              </div>
            )}
          </div>
      </div>
    );
  };

  if (loading || connectionLoading) {
    return (
      <div className="animate-fade-in max-w-6xl mx-auto p-4 sm:p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-connect-600 mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading notifications...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-6xl mx-auto p-4 sm:p-6">
      {/* Header Section */}
      <div className="flex flex-col space-y-4 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white break-words">
              Notifications
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
              Stay updated on your activities and event updates
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {selectMode ? (
              <Button
                variant="outline"
                onClick={() => {
                  setSelectMode(false);
                  setSelectedNotifications([]);
                }}
                className="text-sm flex-1 sm:flex-none"
              >
                Cancel
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => setSelectMode(true)}
                  className="text-sm flex-1 sm:flex-none"
                >
                  Select
                </Button>
                <Button
                  variant="outline"
                  onClick={attendeeMarkAllAsRead}
                  className="text-sm flex-1 sm:flex-none"
                  disabled={unreadCount === 0}
                >
                  <Check className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Mark All Read</span>
                  <span className="sm:hidden">Read All</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <Card className="shadow-lg">
        <CardHeader className="pb-3 px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-connect-600 dark:text-connect-400 flex-shrink-0" />
              <CardTitle className="text-lg sm:text-xl">Your Notifications</CardTitle>
            </div>
            {unreadCount > 0 && (
              <Badge className="bg-connect-600 text-xs">
                {unreadCount} new
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="px-4 sm:px-6">
          <Tabs defaultValue="all" className="w-full">
            <div className="mb-6 overflow-x-auto">
              <TabsList className="inline-flex w-auto min-w-full h-auto p-1 gap-1">
                <TabsTrigger value="all" className="px-4 py-2.5 text-sm font-medium whitespace-nowrap">
                  All
                </TabsTrigger>
                <TabsTrigger value="unread" className="px-4 py-2.5 text-sm font-medium whitespace-nowrap">
                  Unread
                </TabsTrigger>
                <TabsTrigger value="messages" className="px-4 py-2.5 text-sm font-medium whitespace-nowrap">
                  Messages
                </TabsTrigger>
                <TabsTrigger value="connections" className="px-4 py-2.5 text-sm font-medium whitespace-nowrap">
                  Connections
                </TabsTrigger>
                <TabsTrigger value="updates" className="px-4 py-2.5 text-sm font-medium whitespace-nowrap">
                  Updates
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="all" className="space-y-0 divide-y divide-gray-100 dark:divide-gray-800">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div 
                    key={notification.id}
                    className={`cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                      !notification.is_read ? 'bg-gray-50 dark:bg-gray-800/50' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    {notification.type === 'connection' ? 
                      renderConnectionRequest(notification) : 
                      (
                        <div className="py-5 px-3 flex items-start gap-4">
                          <div className="mt-1 p-2.5 rounded-full bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0 space-y-2">
                            <p className={`text-sm leading-relaxed ${!notification.is_read ? 'font-medium' : ''} break-words`}>
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
                  <p className="mt-2 text-gray-500 dark:text-gray-400 text-sm">
                    You don't have any notifications yet
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="unread" className="space-y-0 divide-y divide-gray-100 dark:divide-gray-800">
              {notifications.filter(n => !n.is_read).length > 0 ? (
                notifications.filter(n => !n.is_read).map((notification) => (
                  <div 
                    key={notification.id}
                    className="cursor-pointer bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800/70 transition-colors"
                    onClick={() => handleNotificationClick(notification)}
                  >
                    {notification.type === 'connection' ? 
                      renderConnectionRequest(notification) : 
                      (
                        <div className="py-5 px-3 flex items-start gap-4">
                          <div className="mt-1 p-2.5 rounded-full bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0 space-y-2">
                            <p className="text-sm font-medium leading-relaxed break-words">
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
                  <p className="mt-2 text-gray-500 dark:text-gray-400 text-sm">
                    You're all caught up!
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="messages" className="space-y-0 divide-y divide-gray-100 dark:divide-gray-800">
              {notifications.filter(n => n.type === 'direct_message' || n.type === 'group_message').length > 0 ? (
                notifications.filter(n => n.type === 'direct_message' || n.type === 'group_message').map((notification) => (
                  <div 
                    key={notification.id}
                    className={`cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                      !notification.is_read ? 'bg-gray-50 dark:bg-gray-800/50' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="py-5 px-3 flex items-start gap-4">
                      <div className="mt-1 p-2.5 rounded-full bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0 space-y-2">
                        <p className={`text-sm leading-relaxed ${!notification.is_read ? 'font-medium' : ''} break-words`}>
                          {notification.message}
                        </p>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatTime(notification.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-10 text-center">
                  <MessageSquare className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600" />
                  <h3 className="mt-4 text-lg font-medium">No messages</h3>
                  <p className="mt-2 text-gray-500 dark:text-gray-400 text-sm">
                    You haven't received any messages yet
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="connections" className="space-y-0 divide-y divide-gray-100 dark:divide-gray-800">
              {connectionNotifications.filter(n => n.type === 'connection').length > 0 ? (
                connectionNotifications.filter(n => n.type === 'connection').map((notification) => (
                  <div 
                    key={notification.id}
                    className={`cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
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
                  <p className="mt-2 text-gray-500 dark:text-gray-400 text-sm">
                    You haven't received any connection requests yet
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="updates" className="space-y-0 divide-y divide-gray-100 dark:divide-gray-800">
              {notifications.filter(n => ['announcement', 'schedule_update', 'facility_update', 'poll_created'].includes(n.type)).length > 0 ? (
                notifications.filter(n => ['announcement', 'schedule_update', 'facility_update', 'poll_created'].includes(n.type)).map((notification) => (
                  <div 
                    key={notification.id}
                    className={`cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                      !notification.is_read ? 'bg-gray-50 dark:bg-gray-800/50' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="py-5 px-3 flex items-start gap-4">
                      <div className="mt-1 p-2.5 rounded-full bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0 space-y-2">
                        <p className={`text-sm leading-relaxed ${!notification.is_read ? 'font-medium' : ''} break-words`}>
                          {notification.message}
                        </p>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatTime(notification.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-10 text-center">
                  <Bell className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600" />
                  <h3 className="mt-4 text-lg font-medium">No updates</h3>
                  <p className="mt-2 text-gray-500 dark:text-gray-400 text-sm">
                    You haven't received any event updates yet
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendeeNotifications;
