import React, { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useJoinEvent } from "@/hooks/useJoinEvent";
import { useEventByAccessCode } from "@/hooks/useEventByAccessCode";
import { AlertCircle, Network, Eye, EyeOff, Calendar, MapPin, User } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FcGoogle } from "react-icons/fc";
import { Badge } from "@/components/ui/badge";

const Register = () => {
  const [searchParams] = useSearchParams();
  const defaultRole = searchParams.get("role") || "attendee";
  const eventCode = searchParams.get("eventCode");

  // If coming from QR code, force attendee role and prevent admin registration
  const isFromQRCode = !!eventCode;
  const allowedRoles = isFromQRCode ? ["attendee"] : ["host", "attendee"];

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState<"host" | "attendee">(
    isFromQRCode ? "attendee" : (defaultRole as "host" | "attendee")
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isJoiningEvent, setIsJoiningEvent] = useState(false);

  const { register, signInWithGoogle, currentUser, isLoading } = useAuth();
  const { joinEvent } = useJoinEvent();
  const { data: eventData, isLoading: isLoadingEvent } = useEventByAccessCode(eventCode);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleGoogleSignUp = async () => {
    setErrorMessage(null);
    
    // Enhanced event code storage for OAuth flow with multiple storage keys and timestamp
    if (eventCode) {
      console.log("Storing event code for Google OAuth:", eventCode);
      const eventData = {
        code: eventCode,
        timestamp: Date.now(),
        role: role
      };
      
      // Store in multiple locations with different keys for reliability
      localStorage.setItem('pendingEventCode', eventCode);
      localStorage.setItem('googleOAuthEventCode', eventCode);
      localStorage.setItem('googleOAuthEventData', JSON.stringify(eventData));
      sessionStorage.setItem('pendingEventCode', eventCode);
      sessionStorage.setItem('googleOAuthEventCode', eventCode);
      
      console.log("Event code stored for OAuth. Data:", eventData);
    }
    
    try {
      setIsSubmitting(true);
      const { error } = await signInWithGoogle(role);
      
      if (error) {
        console.error("Google sign-up error:", error);
        setErrorMessage("Failed to sign up with Google. Please try again.");
      }
    } catch (error) {
      console.error("Google sign-up error:", error);
      setErrorMessage("An unexpected error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  // Store event code in both session and local storage when component mounts
  useEffect(() => {
    if (eventCode) {
      console.log("Storing event code in session and local storage:", eventCode);
      sessionStorage.setItem("pendingEventCode", eventCode);
      localStorage.setItem("pendingEventCode", eventCode); // Backup in localStorage
      console.log("Event code stored. SessionStorage:", sessionStorage.getItem("pendingEventCode"), "LocalStorage:", localStorage.getItem("pendingEventCode"));
    }
  }, [eventCode]);

  // Handle redirect when user becomes authenticated after registration
  useEffect(() => {
    console.log("Register component - Auth state:", { currentUser, isLoading, isSubmitting });

    // Only handle redirects for email/password registration, not Google auth
    // Google auth is handled by AuthCallback component
    const urlParams = new URLSearchParams(window.location.search);
    const isGoogleAuth = urlParams.get('code') || urlParams.get('state');
    if (isGoogleAuth) {
      console.log("Skipping register redirect - Google auth detected");
      return;
    }

    if (currentUser && !isLoading && !isSubmitting) {
      console.log(
        "User authenticated after email registration, checking for pending event...",
        currentUser
      );

      // Check for ticketing redirect first
      const redirectAfterLogin = localStorage.getItem('redirectAfterLogin');
      if (redirectAfterLogin && redirectAfterLogin.includes('/buy-tickets/')) {
        const eventKeyMatch = redirectAfterLogin.match(/\/buy-tickets\/([^\/\?]+)/);
        if (eventKeyMatch) {
          localStorage.removeItem('redirectAfterLogin');
          console.log("Redirecting to buy-tickets:", redirectAfterLogin);
          navigate(redirectAfterLogin, { replace: true });
          return;
        }
      }

      // Check if there's a pending event to join - check multiple sources
      const pendingEventCode =
        eventCode || 
        sessionStorage.getItem("pendingEventCode") || 
        localStorage.getItem("pendingEventCode");
      
      console.log("Checking for pending event code:", {
        eventCode,
        sessionStorage: sessionStorage.getItem("pendingEventCode"),
        localStorage: localStorage.getItem("pendingEventCode"),
        finalCode: pendingEventCode
      });

      if (pendingEventCode && currentUser.role === "attendee") {
        console.log(
          "Found pending event code, attempting to join:",
          pendingEventCode
        );
        setIsJoiningEvent(true);

        // Clear the stored codes from both storages
        sessionStorage.removeItem("pendingEventCode");
        localStorage.removeItem("pendingEventCode");
        console.log("Cleared event codes from storage");

        joinEvent(pendingEventCode, {
          onSuccess: (data: any) => {
            console.log("Successfully joined event after registration:", data);
            setIsJoiningEvent(false);
            console.log("Redirecting to attendee dashboard after event join");
            navigate("/attendee", { replace: true });
          },
          onError: (error: any) => {
            console.error("Failed to join event after registration:", error);
            setIsJoiningEvent(false);
            toast({
              title: "Account Created",
              description:
                "Your account was created, but we couldn't join the event. Please scan the QR code again.",
              variant: "destructive",
            });
            console.log("Redirecting to attendee dashboard after failed event join");
            navigate("/attendee", { replace: true });
          },
        });
      } else {
        // Normal redirect without event joining
        const redirectPath =
          currentUser.role === "host" ? "/admin" : "/attendee";
        console.log("Normal redirect to:", redirectPath);
        navigate(redirectPath, { replace: true });
      }
    }
  }, [currentUser, isLoading, isSubmitting, navigate, eventCode, joinEvent, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name || !email || !password || !confirmPassword) {
      setErrorMessage("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords don't match");
      return;
    }

    // Basic password validation
    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long");
      return;
    }

    try {
      setIsSubmitting(true);
      console.log("Attempting registration for:", email, "with role:", role);

      const { error } = await register(name, email, password, role);

      if (error) {
        console.error("Registration error:", error);
        // Handle specific Supabase error messages
        if (error.message.includes("email already registered")) {
          setErrorMessage(
            "This email is already registered. Please use a different email or try logging in."
          );
        } else {
          setErrorMessage(
            error.message || "Failed to create account. Please try again."
          );
        }
        return;
      }

      console.log("Registration successful");
      
      // Don't show a separate toast here for QR code registrations
      // The event joining success will show its own toast
      if (!eventCode) {
        toast({
          title: "Success",
          description: "Your account has been created successfully",
        });
      }

      // The redirect will be handled by the useEffect when currentUser updates
    } catch (error) {
      console.error("Registration error:", error);
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading during registration or event joining
  if (isSubmitting || isJoiningEvent) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-connect-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {isSubmitting ? "Creating your account..." : "Joining event..."}
          </p>
        </div>
      </div>
    );
  }

  // Don't render registration form if user is already authenticated
  if (currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-connect-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="flex justify-center mb-8">
        <Link to="/" className="flex items-center">
          <div className=" flex items-center justify-center">
            <img
              src="/logo.png"
              alt="Kconect Logo"
              className="h-8 w-auto object-cover"
            />
          </div>
          <span className="ml-2 font-semibold text-2xl bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            Kconect
          </span>
        </Link>
      </div>

      {/* Event Banner Section - Only show when coming from QR code */}
      {isFromQRCode && eventData && (
        <div className="sm:mx-auto sm:w-full sm:max-w-2xl mb-8">
          <Card className="overflow-hidden shadow-lg border-2 border-gradient-to-r from-cyan-400 to-purple-500">
            {eventData.banner_url && (
              <div className="h-48 w-full overflow-hidden">
                <img
                  src={eventData.banner_url}
                  alt={eventData.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <CardContent className="p-6">
              <div className="text-center">
                <Badge variant="secondary" className="mb-4 bg-gradient-to-r from-cyan-400 to-purple-500 text-white">
                  You're joining this event
                </Badge>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{eventData.name}</h2>
                {eventData.description && (
                  <p className="text-gray-600 mb-4 line-clamp-2">{eventData.description}</p>
                )}
                <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
                  {eventData.host_name && (
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>Hosted by {eventData.host_name}</span>
                    </div>
                  )}
                  {eventData.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{eventData.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(eventData.start_time).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Loading state for event data */}
      {isFromQRCode && isLoadingEvent && (
        <div className="sm:mx-auto sm:w-full sm:max-w-2xl mb-8">
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Create your account
            </CardTitle>
            <CardDescription className="text-center">
              Enter your information to create a Connect account
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {errorMessage && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>I want to:</Label>
                {isFromQRCode && (
                  <Alert className="bg-blue-50 border-blue-200">
                    <Network className="h-4 w-4" />
                    <AlertDescription>
                      You're registering to join an event. Your account will be set up as an attendee.
                    </AlertDescription>
                  </Alert>
                )}
                <RadioGroup
                  value={role}
                  onValueChange={(value) =>
                    setRole(value as "host" | "attendee")
                  }
                  className="flex flex-col space-y-2 mt-2"
                  disabled={isFromQRCode}
                >
                  {allowedRoles.includes("host") && (
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="host" id="host" disabled={isFromQRCode} />
                      <Label
                        htmlFor="host"
                        className={`font-normal cursor-pointer ${isFromQRCode ? 'text-muted-foreground' : ''}`}
                      >
                        Host events (organize networking events)
                      </Label>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="attendee" id="attendee" />
                    <Label
                      htmlFor="attendee"
                      className="font-normal cursor-pointer"
                    >
                      Join events (network with others)
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-cyan-400 to-purple-500"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating account..." : "Create Account"}
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>
              
              {/* Re-enabled Google OAuth for QR users by removing isFromQRCode-based disabling */}
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogleSignUp}
                disabled={isSubmitting}
              >
                <FcGoogle className="mr-2 h-4 w-4" />
                Sign up with Google
              </Button>
              
              <div className="text-center text-sm">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-medium text-connect-600 hover:text-connect-500"
                >
                  Sign in
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Register;
