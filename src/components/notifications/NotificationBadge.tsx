import React from 'react';
import { Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NotificationBadgeProps {
  count: number;
  className?: string;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count,
  className,
  onClick,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  return (
    <Button
      variant="ghost"
      size={size === 'sm' ? 'sm' : 'icon'}
      onClick={onClick}
      className={cn('relative', sizeClasses[size], className)}
    >
      <Bell className={iconSizes[size]} />
      {count > 0 && (
        <Badge 
          variant="default"
          className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs min-w-[20px] bg-primary text-primary-foreground"
        >
          {count > 99 ? '99+' : count}
        </Badge>
      )}
    </Button>
  );
};