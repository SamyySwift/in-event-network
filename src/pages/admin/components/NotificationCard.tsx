
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Info, AlertTriangle, CheckCircle, Clock, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

interface NotificationCardProps {
  notification: {
    id: string;
    title: string;
    message: string;
    type: string;
    is_read: boolean;
    created_at: string;
  };
  isMarking?: boolean;
  onMarkAsRead?: (id: string) => void;
}

const getNotificationIcon = (type: string) => {
  switch(type) {
    case "info":
      return <Info size={18} className="text-blue-500" />;
    case "warning":
      return <AlertTriangle size={18} className="text-amber-500" />;
    case "success":
      return <CheckCircle size={18} className="text-emerald-500" />;
    default:
      return <Bell size={18} className="text-gray-500" />;
  }
};

const getNotificationBadge = (type: string) => {
  switch(type) {
    case "info":
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Info</Badge>;
    case "warning":
      return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">Warning</Badge>;
    case "success":
      return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200">Success</Badge>;
    default:
      return <Badge>Default</Badge>;
  }
};

const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  isMarking,
  onMarkAsRead
}) => {
  const timeAgo = formatDistanceToNow(new Date(notification.created_at), { addSuffix: true });

  return (
    <Card className={`glass-card transition-all duration-200 hover:shadow-xl overflow-x-auto ${
      !notification.is_read
        ? 'border-l-4 border-l-primary shadow-md'
        : ''
    }`}>
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row gap-4 p-4 sm:p-6 items-start sm:items-center">
          <div className={`rounded-full p-3 self-center sm:self-auto mb-2 sm:mb-0
            ${notification.type === 'info' ? 'bg-blue-100'
              : notification.type === 'warning' ? 'bg-amber-100'
              : notification.type === 'success' ? 'bg-emerald-100'
              : 'bg-gray-100'
            }`
          }>
            {getNotificationIcon(notification.type)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between mb-1">
              <h3 className="font-medium text-lg truncate">{notification.title}</h3>
              <div className="flex items-center mt-1 sm:mt-0 gap-2 flex-wrap">
                {getNotificationBadge(notification.type)}
                <div className="flex items-center text-muted-foreground text-xs">
                  <Clock size={14} className="mr-1" />
                  {timeAgo}
                </div>
              </div>
            </div>
            <p className="text-muted-foreground text-sm break-words">{notification.message}</p>
          </div>
          {!notification.is_read && !!onMarkAsRead && (
            <div className="flex-shrink-0 flex items-center justify-end w-full sm:w-auto">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onMarkAsRead(notification.id)}
                disabled={isMarking}
                className="h-8 bg-accent/30 hover:bg-accent w-full sm:w-auto"
              >
                <Check size={14} className="mr-1" />
                {isMarking ? 'Marking...' : 'Mark read'}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationCard;
