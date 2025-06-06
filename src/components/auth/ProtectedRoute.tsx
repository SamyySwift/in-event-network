
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'host' | 'attendee';
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole,
  redirectTo = '/login'
}) => {
  const { currentUser, isLoading } = useAuth();
  const location = useLocation();
  const [hasEventAccess, setHasEventAccess] = useState<boolean | null>(null);
  const [checkingAccess, setCheckingAccess] = useState(false);

  useEffect(() => {
    console.log('ProtectedRoute check:', { 
      currentUser: currentUser?.email, 
      userRole: currentUser?.role,
      requiredRole,
      isLoading,
      path: location.pathname
    });
  }, [currentUser, requiredRole, isLoading, location.pathname]);

  // Check if attendee has joined an event
  useEffect(() => {
    const checkEventAccess = async () => {
      if (!currentUser || currentUser.role !== 'attendee' || requiredRole !== 'attendee') {
        setHasEventAccess(true); // Not an attendee or not checking attendee access
        return;
      }

      setCheckingAccess(true);
      
      try {
        const { data, error } = await supabase
          .from('event_participants')
          .select('id')
          .eq('user_id', currentUser.id)
          .limit(1);

        if (error) {
          console.error('Error checking event access:', error);
          setHasEventAccess(false);
        } else {
          setHasEventAccess(data && data.length > 0);
        }
      } catch (error) {
        console.error('Error checking event access:', error);
        setHasEventAccess(false);
      } finally {
        setCheckingAccess(false);
      }
    };

    if (currentUser && !isLoading) {
      checkEventAccess();
    }
  }, [currentUser, requiredRole, isLoading]);

  // Show loading while checking authentication or event access
  if (isLoading || (requiredRole === 'attendee' && checkingAccess)) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-connect-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {isLoading ? 'Checking authentication...' : 'Verifying event access...'}
          </p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!currentUser) {
    console.log('No user found, redirecting to login');
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // If specific role required, check if user has it
  if (requiredRole && currentUser.role !== requiredRole) {
    console.log(`Access denied: User role ${currentUser.role} != required ${requiredRole}`);
    
    // Redirect based on user's actual role
    const redirectPath = currentUser.role === 'host' ? '/admin' : '/attendee';
    return <Navigate to={redirectPath} replace />;
  }

  // For attendees, check if they have joined an event
  if (requiredRole === 'attendee' && hasEventAccess === false) {
    console.log('Attendee has not joined any event, redirecting to join page');
    return <Navigate to="/join" replace />;
  }

  // If attendee access is still being checked, show loading
  if (requiredRole === 'attendee' && hasEventAccess === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-connect-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying event access...</p>
        </div>
      </div>
    );
  }

  console.log('Access granted');
  return <>{children}</>;
};

export default ProtectedRoute;
