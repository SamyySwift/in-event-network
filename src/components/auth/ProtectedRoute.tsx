
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

  useEffect(() => {
    console.log('ProtectedRoute check:', { 
      currentUser: currentUser?.email, 
      userRole: currentUser?.role,
      requiredRole,
      isLoading,
      path: location.pathname
    });

    // Only check event access for attendee protected routes
    const checkEventAccess = async () => {
      if (currentUser?.role === 'attendee' && requiredRole === 'attendee') {
        try {
          const { data, error } = await supabase
            .from('event_participants')
            .select('id')
            .eq('user_id', currentUser.id)
            .limit(1);

          if (error) {
            console.error('Error checking event participation:', error);
            setHasEventAccess(false);
            return;
          }

          const hasAccess = data && data.length > 0;
          console.log('Attendee event access check:', hasAccess);
          setHasEventAccess(hasAccess);
        } catch (error) {
          console.error('Error in event access check:', error);
          setHasEventAccess(false);
        }
      } else {
        // Hosts or non-attendee-specific routes don't need event access
        setHasEventAccess(true);
      }
    };

    if (currentUser && !isLoading) {
      checkEventAccess();
    }
  }, [currentUser, isLoading, requiredRole]);

  // Show loading while checking authentication or event access (only for attendee routes)
  if (isLoading || (currentUser && requiredRole === 'attendee' && currentUser.role === 'attendee' && hasEventAccess === null)) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-connect-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
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

  // For attendees accessing attendee routes, check if they have joined an event
  if (currentUser.role === 'attendee' && requiredRole === 'attendee' && !hasEventAccess) {
    console.log('Attendee has not joined an event, redirecting to join page');
    return <Navigate to="/join" replace />;
  }

  console.log('Access granted');
  return <>{children}</>;
};

export default ProtectedRoute;
