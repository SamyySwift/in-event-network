import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useGuestEventContext } from '@/contexts/GuestEventContext';
import { AttendeeEventProvider } from '@/contexts/AttendeeEventContext';
import AppLayout from '@/components/layouts/AppLayout';
import GuestAttendeeLayout from '@/components/attendee/GuestAttendeeLayout';
import AuthRequiredPrompt from '@/components/auth/AuthRequiredPrompt';
import { Loader } from 'lucide-react';

interface GuestAwareRouteProps {
  children: React.ReactNode;
  requiresAuth?: boolean;
  featureName?: string;
}

/**
 * Route wrapper that handles both authenticated attendees and guest users
 * - If user is authenticated as attendee: uses full AppLayout with AttendeeEventProvider
 * - If user is in guest mode (scanned QR): uses GuestAttendeeLayout
 * - If requiresAuth and not authenticated: shows auth prompt
 * - If neither: redirects to /scan
 */
const GuestAwareRoute: React.FC<GuestAwareRouteProps> = ({ 
  children, 
  requiresAuth = false,
  featureName = 'this feature'
}) => {
  const { currentUser, isLoading: authLoading } = useAuth();
  const { isGuestMode, isLoading: guestLoading } = useGuestEventContext();

  // Show loading while checking auth state
  if (authLoading || guestLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Authenticated attendee - use full experience
  if (currentUser?.role === 'attendee') {
    return (
      <AttendeeEventProvider>
        <AppLayout>{children}</AppLayout>
      </AttendeeEventProvider>
    );
  }

  // Host trying to access attendee routes - redirect to admin
  if (currentUser?.role === 'host') {
    return <Navigate to="/admin" replace />;
  }

  // Guest mode (scanned QR but not logged in)
  if (isGuestMode) {
    // If this route requires auth, show the auth prompt
    if (requiresAuth) {
      return (
        <GuestAttendeeLayout>
          <AuthRequiredPrompt feature={featureName} />
        </GuestAttendeeLayout>
      );
    }
    // Otherwise show the page in guest mode
    return <GuestAttendeeLayout>{children}</GuestAttendeeLayout>;
  }

  // No auth and no guest mode - redirect to scan page
  return <Navigate to="/scan" replace />;
};

export default GuestAwareRoute;

