
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

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

  useEffect(() => {
    console.log('🔐 ProtectedRoute check:', { 
      currentUser: currentUser?.email, 
      userRole: currentUser?.role,
      requiredRole,
      isLoading,
      path: location.pathname,
      willRedirect: requiredRole && currentUser?.role !== requiredRole
    });
  }, [currentUser, requiredRole, isLoading, location.pathname]);

  // Show loading while checking authentication
  if (isLoading) {
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
    console.error(`❌ Access denied for ${location.pathname}: User role "${currentUser.role}" != required "${requiredRole}"`);
    
    // Redirect based on user's actual role
    const redirectPath = currentUser.role === 'host' ? '/admin' : '/attendee';
    console.log(`🔄 Redirecting to ${redirectPath}`);
    return <Navigate to={redirectPath} replace />;
  }

  console.log('✅ Access granted to', location.pathname);
  return <>{children}</>;
};

export default ProtectedRoute;
