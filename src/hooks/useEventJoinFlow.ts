import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useJoinEvent } from './useJoinEvent';
import { useToast } from './use-toast';
import { 
  storeEventContext, 
  getStoredEventContext, 
  clearEventContext,
  getRedirectPath,
  hasPendingEvent 
} from '@/utils/eventRedirect';

export interface UseEventJoinFlowOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  showToasts?: boolean;
}

/**
 * Centralized hook for handling event joining flow across the application
 */
export const useEventJoinFlow = () => {
  const { currentUser } = useAuth();
  const { joinEvent, isJoining } = useJoinEvent();
  const { toast } = useToast();
  const navigate = useNavigate();

  /**
   * Handle event joining with consistent redirect logic
   */
  const handleEventJoin = useCallback(async (
    accessCode: string, 
    options: UseEventJoinFlowOptions = {}
  ) => {
    const { onSuccess, onError, showToasts = true } = options;
    
    console.log('useEventJoinFlow: Starting event join process with code:', accessCode);

    if (!currentUser) {
      console.log('useEventJoinFlow: User not authenticated, storing code and redirecting to register');
      storeEventContext({ accessCode });
      navigate(`/register?eventCode=${accessCode}&role=attendee`, { replace: true });
      return;
    }

    if (currentUser.role !== 'attendee') {
      console.log('useEventJoinFlow: User is not an attendee, redirecting to appropriate dashboard');
      const redirectPath = getRedirectPath(currentUser.role);
      navigate(redirectPath, { replace: true });
      return;
    }

    try {
      await joinEvent(accessCode, {
        onSuccess: (data: any) => {
          console.log('useEventJoinFlow: Event join successful:', data);
          
          if (showToasts) {
            toast({
              title: 'Successfully Joined Event!',
              description: `Welcome to ${data.event_name}. You can now connect with other attendees.`,
            });
          }

          // Clear any stored event context
          clearEventContext();

          // Call custom success callback or navigate to default
          if (onSuccess) {
            onSuccess(data);
          } else {
            console.log('useEventJoinFlow: Navigating to /attendee after successful join');
            navigate('/attendee', { replace: true });
          }
        },
        onError: (error: any) => {
          console.error('useEventJoinFlow: Event join failed:', error);
          
          if (showToasts) {
            toast({
              title: 'Failed to Join Event',
              description: error.message || 'Could not join the event. Please try again.',
              variant: 'destructive',
            });
          }

          if (onError) {
            onError(error);
          }
        },
        skipNavigation: true, // We handle navigation manually
      });
    } catch (error) {
      console.error('useEventJoinFlow: Unexpected error during event join:', error);
      
      if (showToasts) {
        toast({
          title: 'Error Joining Event',
          description: 'An unexpected error occurred. Please try again.',
          variant: 'destructive',
        });
      }

      if (onError) {
        onError(error);
      }
    }
  }, [currentUser, joinEvent, navigate, toast]);

  /**
   * Process any pending event joins after authentication
   */
  const processPendingEventJoin = useCallback(async (options: UseEventJoinFlowOptions = {}) => {
    console.log('useEventJoinFlow: Checking for pending event joins');
    
    if (!currentUser) {
      console.log('useEventJoinFlow: No user authenticated, cannot process pending events');
      return false;
    }

    const eventContext = getStoredEventContext();
    
    if (eventContext.accessCode && currentUser.role === 'attendee') {
      console.log('useEventJoinFlow: Found pending event code, processing join:', eventContext.accessCode);
      await handleEventJoin(eventContext.accessCode, options);
      return true;
    } else if (eventContext.redirectAfterLogin) {
      console.log('useEventJoinFlow: Found redirect after login, navigating:', eventContext.redirectAfterLogin);
      clearEventContext();
      navigate(eventContext.redirectAfterLogin, { replace: true });
      return true;
    }

    console.log('useEventJoinFlow: No pending events to process');
    return false;
  }, [currentUser, handleEventJoin, navigate]);

  /**
   * Get the appropriate redirect path for the current user
   */
  const getAppropriateRedirect = useCallback(() => {
    if (!currentUser) {
      return '/login';
    }

    const eventContext = getStoredEventContext();
    return getRedirectPath(currentUser.role, eventContext);
  }, [currentUser]);

  return {
    handleEventJoin,
    processPendingEventJoin,
    getAppropriateRedirect,
    isJoining,
    hasPendingEvent: hasPendingEvent(),
    clearEventContext,
  };
};