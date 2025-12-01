
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useGuestEventContext } from '@/contexts/GuestEventContext';
import { Loader } from 'lucide-react';

interface AttendeeRouteGuardProps {
  children: React.ReactNode;
  requireEvent?: boolean;
}

const AttendeeRouteGuard: React.FC<AttendeeRouteGuardProps> = ({ 
  children, 
  requireEvent = true 
}) => {
  const { currentUser, isLoading: authLoading } = useAuth();
  const { isGuestMode, isLoading: guestLoading } = useGuestEventContext();

  if (authLoading || guestLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Allow access if user is authenticated OR in guest mode
  const hasAccess = !!currentUser || isGuestMode;

  if (requireEvent && !hasAccess) {
    return <Navigate to="/scan" replace />;
  }

  return <>{children}</>;
};

export default AttendeeRouteGuard;
