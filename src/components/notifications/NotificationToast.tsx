import React from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface NotificationToastProps {
  title: string;
  message: string;
  type?: 'direct_message' | 'group_message' | 'connection' | 'announcement' | 'schedule_update' | 'facility_update' | 'poll_created';
  onView?: () => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  title,
  message,
  type = 'general',
  onView
}) => {
  const getIcon = () => {
    switch (type) {
      case 'direct_message':
        return '💬';
      case 'group_message':
        return '👥';
      case 'connection':
        return '🤝';
      case 'announcement':
        return '📢';
      case 'schedule_update':
        return '📅';
      case 'facility_update':
        return '🏢';
      case 'poll_created':
        return '📊';
      default:
        return '🔔';
    }
  };

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-card border">
      <div className="text-xl flex-shrink-0">
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground line-clamp-2">{message}</p>
        {onView && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onView}
            className="mt-2 h-6 px-2 text-xs"
          >
            View
          </Button>
        )}
      </div>
    </div>
  );
};

export const showNotificationToast = (props: NotificationToastProps) => {
  toast.custom(() => <NotificationToast {...props} />);
};