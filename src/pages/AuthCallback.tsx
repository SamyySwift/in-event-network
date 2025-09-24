import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useJoinEvent } from '@/hooks/useJoinEvent';
import { useToast } from '@/hooks/use-toast';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { joinEvent } = useJoinEvent();
  const { toast } = useToast();
  const [isJoiningEvent, setIsJoiningEvent] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [startTime] = useState(Date.now());

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
          console.log('AuthCallback - Session found, waiting for user data...');
          
          // Wait for auth context to update with proper user data
          const checkUserAndRedirect = async (attempt = 1) => {
            const maxAttempts = 50; // 5 seconds max (50 * 100ms)
            const maxTime = 10000; // 10 seconds absolute max
            const elapsedTime = Date.now() - startTime;
            
            console.log(`AuthCallback - Attempt ${attempt}/${maxAttempts}, elapsed: ${elapsedTime}ms`);
            console.log('AuthCallback - currentUser:', currentUser);
            console.log('AuthCallback - currentUser?.role:', currentUser?.role);
            
            // If we have user data, proceed with redirect logic
            if (currentUser && currentUser.role) {
              console.log('AuthCallback - User data available, proceeding with redirects');
              
              // Check for ticket purchase redirect first
              const redirectAfterLogin = localStorage.getItem('redirectAfterLogin');
              if (redirectAfterLogin && redirectAfterLogin.includes('/buy-tickets/')) {
                console.log('AuthCallback - Redirecting to buy tickets');
                localStorage.removeItem('redirectAfterLogin');
                navigate(redirectAfterLogin, { replace: true });
                return;
              }
              
              // Enhanced event code detection with multiple fallbacks for OAuth flow
              let pendingEventCode = 
                sessionStorage.getItem('pendingEventCode') || 
                localStorage.getItem('pendingEventCode') ||
                localStorage.getItem('googleOAuthEventCode');

              // Try to get from stored OAuth event data
              if (!pendingEventCode) {
                try {
                  const storedEventData = localStorage.getItem('googleOAuthEventData');
                  if (storedEventData) {
                    const eventData = JSON.parse(storedEventData);
                    // Check if stored data is not too old (within last 10 minutes)
                    if (Date.now() - eventData.timestamp < 600000) {
                      pendingEventCode = eventData.code;
                      console.log('AuthCallback - Retrieved event code from OAuth data:', pendingEventCode);
                    }
                  }
                } catch (error) {
                  console.warn('AuthCallback - Failed to parse stored OAuth event data:', error);
                }
              }
              
              console.log('AuthCallback - Enhanced event code check:', {
                sessionStorage: sessionStorage.getItem('pendingEventCode'),
                localStorage: localStorage.getItem('pendingEventCode'), 
                googleOAuth: localStorage.getItem('googleOAuthEventCode'),
                finalCode: pendingEventCode
              });
              
              if (pendingEventCode && currentUser.role === 'attendee') {
                console.log('AuthCallback - Found pending event code, joining event');
                // Clear all stored event codes
                sessionStorage.removeItem('pendingEventCode');
                localStorage.removeItem('pendingEventCode');
                localStorage.removeItem('googleOAuthEventCode');
                localStorage.removeItem('googleOAuthEventData');
                
                setIsJoiningEvent(true);
                
                joinEvent(pendingEventCode, {
                  onSuccess: (data: any) => {
                    console.log('AuthCallback - Successfully joined event:', data);
                    setIsJoiningEvent(false);
                    navigate('/attendee/dashboard', { replace: true });
                  },
                  onError: (error: any) => {
                    console.error('AuthCallback - Failed to join event:', error);
                    setIsJoiningEvent(false);
                    toast({
                      title: "Account Created",
                      description: "Your account was created, but we couldn't join the event. Please scan the QR code again.",
                      variant: "destructive",
                    });
                    navigate('/attendee/dashboard', { replace: true });
                  }
                });
                return;
              }
              
              // Default redirect based on role
              const redirectPath = currentUser.role === 'host' ? '/admin' : '/attendee/dashboard';
              console.log('AuthCallback - Default redirect to:', redirectPath);
              navigate(redirectPath, { replace: true });
              return;
            }
            
            // If currentUser is explicitly null, auth context has loaded but no user found
            if (currentUser === null) {
              console.log('AuthCallback - No user found after auth, redirecting to login');
              navigate('/login', { replace: true });
              return;
            }
            
            // Check if we've exceeded time limits
            if (attempt >= maxAttempts || elapsedTime >= maxTime) {
              console.warn('AuthCallback - Timeout waiting for user data, trying fallback');
              
              // Fallback: Try to get user directly from Supabase
              try {
                const { data: { user }, error: userError } = await supabase.auth.getUser();
                if (userError) throw userError;
                
                if (user) {
                  console.log('AuthCallback - Fallback: Got user from Supabase directly:', user);
                  
                  // Get user profile to determine role
                  const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();
                  
                  const userRole = profile?.role;
                  console.log('AuthCallback - Fallback: User role from profile:', userRole);
                  
                  // Enhanced pending event code check for fallback
                  let pendingEventCode = 
                    sessionStorage.getItem('pendingEventCode') || 
                    localStorage.getItem('pendingEventCode') ||
                    localStorage.getItem('googleOAuthEventCode');

                  // Try OAuth event data as final fallback
                  if (!pendingEventCode) {
                    try {
                      const storedEventData = localStorage.getItem('googleOAuthEventData');
                      if (storedEventData) {
                        const eventData = JSON.parse(storedEventData);
                        if (Date.now() - eventData.timestamp < 600000) {
                          pendingEventCode = eventData.code;
                        }
                      }
                    } catch (error) {
                      console.warn('AuthCallback - Fallback: Failed to parse OAuth event data:', error);
                    }
                  }
                  
                  if (pendingEventCode && userRole === 'attendee') {
                    console.log('AuthCallback - Fallback: Found pending event, redirecting to attendee with toast');
                    sessionStorage.removeItem('pendingEventCode');
                    localStorage.removeItem('pendingEventCode');
                    localStorage.removeItem('googleOAuthEventCode');
                    localStorage.removeItem('googleOAuthEventData');
                    
                    toast({
                      title: "Authentication Complete",
                      description: "Please scan the QR code again to join the event.",
                    });
                  }
                  
                  // Redirect based on actual user role
                  const redirectPath = userRole === 'host' ? '/admin' : '/attendee/dashboard';
                  console.log('AuthCallback - Fallback: Redirecting to:', redirectPath);
                  navigate(redirectPath, { replace: true });
                } else {
                  console.warn('AuthCallback - Fallback: No user found, redirecting to login');
                  navigate('/login', { replace: true });
                }
              } catch (fallbackError) {
                console.error('AuthCallback - Fallback failed:', fallbackError);
                navigate('/login?error=auth_timeout');
              }
              return;
            }
            
            // Still loading, try again with exponential backoff
            const delay = Math.min(100 + (attempt * 10), 500); // Max 500ms delay
            setRetryCount(attempt);
            setTimeout(() => checkUserAndRedirect(attempt + 1), delay);
          };
          
          await checkUserAndRedirect();
        } else {
          console.log('AuthCallback - No session found');
          navigate('/login?error=no_session');
        }
      } catch (error) {
        console.error('AuthCallback - Unexpected error:', error);
        navigate('/login?error=unexpected');
      }
    };

    handleAuthCallback();
  }, [navigate, currentUser, joinEvent, toast, startTime]);

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