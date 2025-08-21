import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useJoinEvent } from '@/hooks/useJoinEvent';
import { useToast } from '@/hooks/use-toast';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { joinEvent } = useJoinEvent();
  const { toast } = useToast();
  const [isJoiningEvent, setIsJoiningEvent] = useState(false);

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
          const checkUserAndRedirect = () => {
            if (currentUser && currentUser.role) {
              console.log('AuthCallback - currentUser:', currentUser);
              console.log('AuthCallback - currentUser.role:', currentUser.role);
              
              // Check for ticket purchase redirect first
              const redirectAfterLogin = localStorage.getItem('redirectAfterLogin');
              if (redirectAfterLogin && redirectAfterLogin.includes('/buy-tickets/')) {
                localStorage.removeItem('redirectAfterLogin');
                navigate(redirectAfterLogin, { replace: true });
                return;
              }
              
              // Check for pending event code (from QR scan) - check both storage locations
              const pendingEventCode = sessionStorage.getItem('pendingEventCode') || localStorage.getItem('pendingEventCode');
              console.log('AuthCallback - pendingEventCode from storage:', pendingEventCode);
              console.log('AuthCallback - sessionStorage pendingEventCode:', sessionStorage.getItem('pendingEventCode'));
              console.log('AuthCallback - localStorage pendingEventCode:', localStorage.getItem('pendingEventCode'));
              if (pendingEventCode && currentUser.role === 'attendee') {
                // Clear from both storage locations
                sessionStorage.removeItem('pendingEventCode');
                localStorage.removeItem('pendingEventCode');
                
                // Set joining state to true before starting event join
                setIsJoiningEvent(true);
                
                joinEvent(pendingEventCode, {
                  onSuccess: (data: any) => {
                    setIsJoiningEvent(false);
                    toast({
                      title: "Welcome!",
                      description: `Account created and joined ${data?.event_name || 'event'} successfully!`,
                    });
                    navigate('/attendee', { replace: true });
                  },
                  onError: (error: any) => {
                    setIsJoiningEvent(false);
                    console.error('Failed to join event after Google auth:', error);
                    toast({
                      title: "Account Created",
                      description: "Your account was created, but we couldn't join the event. Please scan the QR code again.",
                      variant: "destructive",
                    });
                    navigate('/attendee', { replace: true });
                  }
                });
                return;
              }
              
              // Default redirect based on role
              const redirectPath = currentUser.role === 'host' ? '/admin' : '/attendee';
              navigate(redirectPath, { replace: true });
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
        <p className="text-gray-600">
          {isJoiningEvent ? "Joining event..." : "Completing sign-in..."}
        </p>
      </div>
    </div>
  );
};

export default AuthCallback;