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
              // Check for ticket purchase redirect first
              const redirectAfterLogin = localStorage.getItem('redirectAfterLogin');
              if (redirectAfterLogin && redirectAfterLogin.includes('/buy-tickets/')) {
                localStorage.removeItem('redirectAfterLogin');
                navigate(redirectAfterLogin, { replace: true });
                return;
              }
              
               // Check for pending event code (use localStorage for better persistence)
               const pendingEventCode = localStorage.getItem('pendingEventCode');
               if (pendingEventCode && currentUser.role === 'attendee') {
                 console.log('Found pending event code after OAuth, attempting to join:', pendingEventCode);
                 setIsJoiningEvent(true);
                 
                 // Clear the stored code
                 localStorage.removeItem('pendingEventCode');
                 // Also clean up OAuth flag
                 localStorage.removeItem('googleOAuthInProgress');
                 
                 // Join the event after OAuth completion
                  joinEvent(pendingEventCode, {
                    onSuccess: (data: any) => {
                      console.log('Successfully joined event after OAuth:', data);
                      setIsJoiningEvent(false);
                      // Navigate to index page which will handle the success message
                      navigate('/index', { replace: true });
                    },
                   onError: (error: any) => {
                     console.error('Failed to join event after OAuth:', error);
                     setIsJoiningEvent(false);
                     toast({
                       title: 'Account Created',
                       description: 'Your account was created successfully. Please scan the QR code again to join the event.',
                       variant: 'default',
                     });
                     navigate('/attendee/dashboard', { replace: true });
                   }
                 });
                 return;
               }
               
               // Clean up OAuth flag if no event to join
               localStorage.removeItem('googleOAuthInProgress');
              
              // Default redirect based on role
              const redirectPath = currentUser.role === 'host' ? '/admin' : '/attendee/dashboard';
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
  }, [navigate, currentUser, joinEvent, toast]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-connect-600 mx-auto mb-4"></div>
        <p className="text-gray-600">
          {isJoiningEvent ? 'Joining event...' : 'Completing sign-in...'}
        </p>
      </div>
    </div>
  );
};

export default AuthCallback;