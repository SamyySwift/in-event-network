
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAttendeeEventContext } from '@/contexts/AttendeeEventContext';
import { Loader } from 'lucide-react';

interface AttendeeRouteGuardProps {
  children: React.ReactNode;
  requireEvent?: boolean;
}

const AttendeeRouteGuard: React.FC<AttendeeRouteGuardProps> = ({ 
  children, 
  requireEvent = true 
}) => {
  const { hasJoinedEvent, isLoading } = useAttendeeEventContext();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (requireEvent && !hasJoinedEvent) {
    return <Navigate to="/scan" replace />;
  }

  return <>{children}</>;
};

export default AttendeeRouteGuard;
