import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useJoinEvent } from "@/hooks/useJoinEvent";
import { useToast } from "@/hooks/use-toast";

function AuthCallback() {
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
          console.error("Auth callback error:", error);
          navigate("/login?error=auth_failed");
          return;
        }

        if (data.session) {
          console.log("AuthCallback - Session found, waiting for user data...");

          // Wait for auth context to update with proper user data
          const checkUserAndRedirect = async (attempt = 1) => {
            const maxAttempts = 50; // 5 seconds max (50 * 100ms)
            const maxTime = 10000; // 10 seconds absolute max
            const elapsedTime = Date.now() - startTime;

            console.log(
              `AuthCallback - Attempt ${attempt}/${maxAttempts}, elapsed: ${elapsedTime}ms`
            );
            console.log("AuthCallback - currentUser:", currentUser);
            console.log("AuthCallback - currentUser?.role:", currentUser?.role);

            // Enhanced debugging for Google OAuth flow
            console.log("AuthCallback - Debug info:", {
              currentUser,
              userRole: currentUser?.role,
              sessionStorageEventCode:
                sessionStorage.getItem("pendingEventCode"),
              localStorageEventCode: localStorage.getItem("pendingEventCode"),
              googleOAuthEventCode: localStorage.getItem(
                "googleOAuthEventCode"
              ),
              googleOAuthEventData: localStorage.getItem(
                "googleOAuthEventData"
              ),
              pendingGoogleRole: localStorage.getItem("pendingGoogleRole"),
              urlParams: Object.fromEntries(
                new URLSearchParams(window.location.search)
              ),
              currentUrl: window.location.href,
            });

            // If we have user data, proceed with redirect logic
            if (currentUser && currentUser.role) {
              console.log(
                "AuthCallback - User data available, proceeding with redirects"
              );

              // Check for ticket purchase redirect first
              const redirectAfterLogin =
                localStorage.getItem("redirectAfterLogin");
              if (
                redirectAfterLogin &&
                redirectAfterLogin.includes("/buy-tickets/")
              ) {
                localStorage.removeItem("redirectAfterLogin");
                navigate(redirectAfterLogin, { replace: true });
                return;
              }

              // Enhanced event code detection with multiple fallbacks for OAuth flow
              let pendingEventCode =
                sessionStorage.getItem("pendingEventCode") ||
                localStorage.getItem("pendingEventCode") ||
                localStorage.getItem("googleOAuthEventCode");

              // Try to get from URL parameters (in case it was passed through OAuth)
              if (!pendingEventCode) {
                const urlParams = new URLSearchParams(window.location.search);
                pendingEventCode = urlParams.get("eventCode");
                if (pendingEventCode) {
                  console.log(
                    "AuthCallback - Retrieved event code from URL params:",
                    pendingEventCode
                  );
                }
              }

              // Try to get from stored OAuth event data
              if (!pendingEventCode) {
                try {
                  const storedEventData = localStorage.getItem(
                    "googleOAuthEventData"
                  );
                  if (storedEventData) {
                    const eventData = JSON.parse(storedEventData);
                    // Check if stored data is not too old (within last 10 minutes)
                    if (Date.now() - eventData.timestamp < 600000) {
                      pendingEventCode = eventData.code;
                      console.log(
                        "AuthCallback - Retrieved event code from OAuth data:",
                        pendingEventCode
                      );
                    }
                  }
                } catch (error) {
                  console.warn(
                    "AuthCallback - Failed to parse stored OAuth event data:",
                    error
                  );
                }
              }

              console.log("AuthCallback - Enhanced event code check:", {
                sessionStorage: sessionStorage.getItem("pendingEventCode"),
                localStorage: localStorage.getItem("pendingEventCode"),
                googleOAuth: localStorage.getItem("googleOAuthEventCode"),
                urlParams: new URLSearchParams(window.location.search).get(
                  "eventCode"
                ),
                finalCode: pendingEventCode,
              });

              if (pendingEventCode && currentUser.role === "attendee") {
                console.log(
                  "AuthCallback - Found pending event code, joining event"
                );
                // Clear all stored event codes
                sessionStorage.removeItem("pendingEventCode");
                localStorage.removeItem("pendingEventCode");
                localStorage.removeItem("googleOAuthEventCode");
                localStorage.removeItem("googleOAuthEventData");

                setIsJoiningEvent(true);

                joinEvent(pendingEventCode, {
                  onSuccess: (data: any) => {
                    console.log(
                      "AuthCallback - Successfully joined event:",
                      data
                    );
                    setIsJoiningEvent(false);
                    navigate("/attendee", { replace: true });
                  },
                  onError: (error: any) => {
                    console.error(
                      "AuthCallback - Failed to join event:",
                      error
                    );
                    setIsJoiningEvent(false);
                    toast({
                      title: "Account Created",
                      description:
                        "Your account was created, but we couldn't join the event. Please scan the QR code again.",
                      variant: "destructive",
                    });
                    navigate("/attendee", { replace: true });
                  },
                });
                return;
              }

              // Clean up any remaining Google OAuth storage
              localStorage.removeItem("pendingGoogleRole");
              localStorage.removeItem("googleOAuthEventCode");
              localStorage.removeItem("googleOAuthEventData");

              // Default redirect based on role - ENSURE we always redirect to the correct dashboard
              const redirectPath =
                currentUser.role === "host" ? "/admin" : "/attendee";
              console.log(
                "AuthCallback - Default redirect to:",
                redirectPath,
                "for role:",
                currentUser.role
              );
              navigate(redirectPath, { replace: true });
              return;
            }

            // If currentUser is explicitly null, auth context has loaded but no user found
            if (currentUser === null) {
              console.log(
                "AuthCallback - No user found after auth, redirecting to login"
              );
              navigate("/login", { replace: true });
              return;
            }

            // Check if we've exceeded time limits
            if (attempt >= maxAttempts || elapsedTime >= maxTime) {
              console.warn(
                "AuthCallback - Timeout waiting for user data, trying direct Supabase fallback"
              );

              // Enhanced fallback: Try to get user directly from Supabase and ensure profile exists
              try {
                const {
                  data: { user },
                  error: userError,
                } = await supabase.auth.getUser();
                if (userError) throw userError;

                if (user) {
                  console.log(
                    "AuthCallback - Fallback: Got user from Supabase directly:",
                    user
                  );

                  // Get or create user profile to determine role
                  let { data: profile, error: profileError } = await supabase
                    .from("profiles")
                    .select("role")
                    .eq("id", user.id)
                    .single();

                  // If profile doesn't exist, create it with pending role
                  if (profileError && profileError.code === "PGRST116") {
                    console.log(
                      "AuthCallback - Fallback: Profile not found, creating new profile"
                    );
                    const pendingRole =
                      (localStorage.getItem("pendingGoogleRole") as
                        | "host"
                        | "attendee") || "attendee";

                    const newProfile = {
                      id: user.id,
                      name:
                        user.user_metadata?.full_name ||
                        user.email?.split("@")[0] ||
                        "",
                      email: user.email || "",
                      role: pendingRole,
                      photo_url: user.user_metadata?.avatar_url || null,
                    };

                    const { error: insertError } = await supabase
                      .from("profiles")
                      .insert(newProfile);

                    if (insertError) {
                      console.error(
                        "AuthCallback - Fallback: Error creating profile:",
                        insertError
                      );
                      throw insertError;
                    }

                    profile = { role: pendingRole };
                    console.log(
                      "AuthCallback - Fallback: Created new profile with role:",
                      pendingRole
                    );
                  }

                  const userRole = profile?.role || "attendee";
                  console.log(
                    "AuthCallback - Fallback: User role from profile:",
                    userRole
                  );

                  // Enhanced pending event code check for fallback
                  let pendingEventCode =
                    sessionStorage.getItem("pendingEventCode") ||
                    localStorage.getItem("pendingEventCode") ||
                    localStorage.getItem("googleOAuthEventCode");

                  // Try OAuth event data as final fallback
                  if (!pendingEventCode) {
                    try {
                      const storedEventData = localStorage.getItem(
                        "googleOAuthEventData"
                      );
                      if (storedEventData) {
                        const eventData = JSON.parse(storedEventData);
                        if (Date.now() - eventData.timestamp < 600000) {
                          pendingEventCode = eventData.code;
                        }
                      }
                    } catch (error) {
                      console.warn(
                        "AuthCallback - Fallback: Failed to parse OAuth event data:",
                        error
                      );
                    }
                  }

                  if (pendingEventCode && userRole === "attendee") {
                    console.log(
                      "AuthCallback - Fallback: Found pending event, clearing storage and showing toast"
                    );
                    sessionStorage.removeItem("pendingEventCode");
                    localStorage.removeItem("pendingEventCode");
                    localStorage.removeItem("googleOAuthEventCode");
                    localStorage.removeItem("googleOAuthEventData");

                    toast({
                      title: "Authentication Complete",
                      description:
                        "Please scan the QR code again to join the event.",
                    });
                  }

                  // Clean up Google OAuth storage
                  localStorage.removeItem("pendingGoogleRole");
                  localStorage.removeItem("googleOAuthEventCode");
                  localStorage.removeItem("googleOAuthEventData");

                  // Redirect based on actual user role - CRITICAL: Always redirect to dashboard
                  const redirectPath =
                    userRole === "host" ? "/admin" : "/attendee";
                  console.log(
                    "AuthCallback - Fallback: Redirecting to:",
                    redirectPath,
                    "for role:",
                    userRole
                  );
                  navigate(redirectPath, { replace: true });
                } else {
                  console.warn(
                    "AuthCallback - Fallback: No user found, redirecting to login"
                  );
                  navigate("/login", { replace: true });
                }
              } catch (fallbackError) {
                console.error("AuthCallback - Fallback failed:", fallbackError);
                // Last resort: redirect to login with error
                navigate("/login?error=auth_timeout", { replace: true });
              }
              return;
            }

            // Still loading, try again with exponential backoff
            const delay = Math.min(100 + attempt * 10, 500); // Max 500ms delay
            setRetryCount(attempt);
            setTimeout(() => checkUserAndRedirect(attempt + 1), delay);
          };

          await checkUserAndRedirect();
        } else {
          console.log("AuthCallback - No session found");
          navigate("/login?error=no_session", { replace: true });
        }
      } catch (error) {
        console.error("AuthCallback - Unexpected error:", error);
        navigate("/login?error=unexpected", { replace: true });
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
        {retryCount > 10 && (
          <p className="text-sm text-gray-500 mt-2">
            Still processing... (attempt {retryCount})
          </p>
        )}
      </div>
    </div>
  );
}

export default AuthCallback;
