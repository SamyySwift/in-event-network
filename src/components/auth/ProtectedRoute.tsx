
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'host' | 'attendee' | 'team_member';
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole,
  redirectTo = '/login'
}) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    console.log('ProtectedRoute check:', { 
      currentUser: currentUser?.email, 
      userRole: currentUser?.role,
      requiredRole,
      loading,
      path: location.pathname
    });
  }, [currentUser, requiredRole, loading, location.pathname]);

  // Show loading while checking authentication
  if (loading) {
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

  // For admin routes, allow both hosts and team members
  if (location.pathname.startsWith('/admin')) {
    if (currentUser.role === 'host' || currentUser.role === 'team_member') {
      console.log('Access granted to admin area for host/team member');
      return <>{children}</>;
    } else {
      console.log('Access denied to admin area - redirecting attendee');
      return <Navigate to="/attendee/dashboard" replace />;
    }
  }

  // For attendee routes, only allow attendees (not hosts or team members)
  if (location.pathname.startsWith('/attendee')) {
    if (currentUser.role === 'attendee') {
      console.log('Access granted to attendee area');
      return <>{children}</>;
    } else {
      console.log('Access denied to attendee area - redirecting admin');
      return <Navigate to="/admin/dashboard" replace />;
    }
  }

  // If specific role required, check if user has it
  if (requiredRole && currentUser.role !== requiredRole) {
    console.log(`Access denied: User role ${currentUser.role} != required ${requiredRole}`);
    
    // Redirect based on user's actual role
    const redirectPath = currentUser.role === 'host' || currentUser.role === 'team_member' ? '/admin/dashboard' : '/attendee/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  console.log('Access granted');
  return <>{children}</>;
};

export default ProtectedRoute;
