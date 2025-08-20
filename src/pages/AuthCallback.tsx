import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useEventJoinFlow } from '@/hooks/useEventJoinFlow';
import { useToast } from '@/hooks/use-toast';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { processPendingEventJoin, getAppropriateRedirect } = useEventJoinFlow();
  const { toast } = useToast();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          navigate('/login?error=auth_failed');
          return;
        }

        if (data.session) {
          // Wait for auth context to update with proper user data
          const checkUserAndRedirect = async () => {
            if (currentUser && currentUser.role) {
              console.log('AuthCallback: User authenticated, processing any pending events...');
              
              try {
                // Try to process any pending event joins or redirects
                const hadPendingAction = await processPendingEventJoin({
                  onSuccess: (data: any) => {
                    console.log('AuthCallback: Successfully joined event after auth:', data);
                  },
                  onError: (error: any) => {
                    console.error('AuthCallback: Failed to join event after Google auth:', error);
                    // Still navigate to attendee dashboard even if event join fails
                    navigate('/attendee', { replace: true });
                  }
                });

                // If no pending actions, do normal redirect
                if (!hadPendingAction) {
                  console.log('AuthCallback: No pending actions, doing normal redirect');
                  const redirectPath = getAppropriateRedirect();
                  navigate(redirectPath, { replace: true });
                }
              } catch (error) {
                console.error('AuthCallback: Error processing authentication:', error);
                // Fallback to normal redirect
                const redirectPath = getAppropriateRedirect();
                navigate(redirectPath, { replace: true });
              }
            } else if (currentUser === null) {
              // Auth context has been updated but no user found
              navigate('/login', { replace: true });
            } else {
              // Still loading, check again
              setTimeout(checkUserAndRedirect, 100);
            }
          };
          
          checkUserAndRedirect();
        } else {
          navigate('/login?error=no_session');
        }
      } catch (error) {
        console.error('Unexpected error in auth callback:', error);
        navigate('/login?error=unexpected');
      }
    };

    handleAuthCallback();
  }, [navigate, currentUser]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-connect-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing sign-in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;