// Register component (partial)
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
import {
  AlertCircle,
  Network,
  Eye,
  EyeOff,
  Calendar,
  MapPin,
  User,
  Mail,
  Lock,
  Briefcase,
  Users,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FcGoogle } from "react-icons/fc";
import { Badge } from "@/components/ui/badge";
import { useEventById } from "@/hooks/useEventById";
import { motion } from "framer-motion";

// Animation variants for smooth slide-in effects
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const slideFromTop = {
  hidden: {
    y: -30,
    opacity: 0,
    scale: 0.95,
  },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
      duration: 0.6,
    },
  },
};

const slideFromBottom = {
  hidden: {
    y: 30,
    opacity: 0,
    scale: 0.95,
  },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
      duration: 0.6,
    },
  },
};

const Register = () => {
  const [searchParams] = useSearchParams();
  const defaultRole = searchParams.get("role") || "attendee";
  const eventCode = searchParams.get("eventCode");
  const eventIdParam = searchParams.get("eventId");

  // Determine QR context using URL or stored code (persists across reloads)
  const effectiveEventCode =
    eventCode ||
    sessionStorage.getItem("pendingEventCode") ||
    localStorage.getItem("pendingEventCode");

  // If coming from QR code, force attendee role and prevent admin registration
  const effectiveEventId =
    eventIdParam ||
    sessionStorage.getItem("pendingEventId") ||
    localStorage.getItem("pendingEventId");
  const isFromQRCode = !!(effectiveEventCode || effectiveEventId);
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

  // Persist event details during the whole registration flow
  type BannerEventData = {
    id: string;
    name: string;
    banner_url: string | null;
    logo_url: string | null;
    description: string | null;
    start_time: string;
    end_time: string;
    location: string | null;
    host_name: string | null;
  };
  const [stickyEventData, setStickyEventData] =
    useState<BannerEventData | null>(null);

  const { register, signInWithGoogle, currentUser, isLoading } = useAuth();
  const { joinEvent } = useJoinEvent();
  const {
    data: eventDataByCode,
    isLoading: isLoadingByCode,
    error: eventErrorByCode,
  } = useEventByAccessCode(effectiveEventCode);
  const {
    data: eventDataById,
    isLoading: isLoadingById,
    error: eventErrorById,
  } = useEventById(effectiveEventId);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Debug logging for event banner
  console.log('Register - Debug:', {
    eventCode,
    effectiveEventCode,
    isFromQRCode,
    eventDataByCode,
    isLoadingByCode,
    eventErrorByCode,
  });

  const handleGoogleSignUp = async () => {
    setErrorMessage(null);

    // Enhanced event code storage for OAuth flow with multiple storage keys and timestamp
    if (effectiveEventCode) {
      console.log("Storing event code for Google OAuth:", effectiveEventCode);
      const eventData = {
        code: effectiveEventCode,
        timestamp: Date.now(),
        role: role,
      };

      // Store in multiple locations with different keys for reliability
      localStorage.setItem("pendingEventCode", effectiveEventCode);
      localStorage.setItem("googleOAuthEventCode", effectiveEventCode);
      localStorage.setItem("googleOAuthEventData", JSON.stringify(eventData));
      sessionStorage.setItem("pendingEventCode", effectiveEventCode);
      sessionStorage.setItem("googleOAuthEventCode", effectiveEventCode);

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
    if (effectiveEventCode) {
      console.log(
        "Storing event code in session and local storage:",
        effectiveEventCode
      );
      sessionStorage.setItem("pendingEventCode", effectiveEventCode);
      localStorage.setItem("pendingEventCode", effectiveEventCode);
    }
    if (effectiveEventId) {
      console.log(
        "Storing event id in session and local storage:",
        effectiveEventId
      );
      sessionStorage.setItem("pendingEventId", effectiveEventId);
      localStorage.setItem("pendingEventId", effectiveEventId);
    }
  }, [effectiveEventCode, effectiveEventId]);

  // Lock in the first successfully fetched event data so the banner never disappears
  useEffect(() => {
    const candidate = eventDataByCode || eventDataById;
    if (candidate && !stickyEventData) {
      console.log("Setting sticky event data:", candidate);
      setStickyEventData(candidate);
    }
  }, [eventDataByCode, eventDataById, stickyEventData]);

  // Handle redirect when user becomes authenticated after registration
  useEffect(() => {
    console.log("Register component - Auth state:", {
      currentUser,
      isLoading,
      isSubmitting,
    });

    // Only handle redirects for email/password registration, not Google auth
    // Google auth is handled by AuthCallback component
    const urlParams = new URLSearchParams(window.location.search);
    const isGoogleAuth = urlParams.get("code") || urlParams.get("state");
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
      const redirectAfterLogin = localStorage.getItem("redirectAfterLogin");
      if (redirectAfterLogin && redirectAfterLogin.includes("/buy-tickets/")) {
        const eventKeyMatch = redirectAfterLogin.match(
          /\/buy-tickets\/([^\/\?]+)/
        );
        if (eventKeyMatch) {
          localStorage.removeItem("redirectAfterLogin");
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
        finalCode: pendingEventCode,
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
            console.log(
              "Redirecting to attendee dashboard after failed event join"
            );
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
  }, [
    currentUser,
    isLoading,
    isSubmitting,
    navigate,
    eventCode,
    joinEvent,
    toast,
  ]);

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


  // Don't render registration form if user is already authenticated
  if (currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-blue-950 text-white flex flex-col justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-white/80">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  // Determine which event data to show - prioritize sticky data, then any loaded data
  const currentEventData = eventDataByCode || eventDataById;
  const banner = stickyEventData || currentEventData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-blue-950 text-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
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
      {/* Event Banner Section - Show when coming from QR code and we have event data */}
      {isFromQRCode && banner && (
        <div className="sm:mx-auto sm:w-full sm:max-w-2xl mb-8">
          <Card className="overflow-hidden shadow-lg bg-black/40 border border-white/10 backdrop-blur-xl text-white">
            {banner.banner_url && (
              <div className="h-48 w-full overflow-hidden">
                <img
                  src={banner.banner_url}
                  alt={banner.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <CardContent className="p-6">
              <div className="text-center">
                <Badge
                  variant="secondary"
                  className="mb-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white"
                >
                  You're joining this event
                </Badge>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {banner.name}
                </h2>
                {banner.description && (
                  <p className="text-white/70 mb-4 line-clamp-2">
                    {banner.description}
                  </p>
                )}
                <div className="flex flex-wrap justify-center gap-4 text-sm text-white/60">
                  {banner.host_name && (
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>Hosted by {banner.host_name}</span>
                    </div>
                  )}
                  {banner.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{banner.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(banner.start_time).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Loading state for event data - only show if we don't have any event data yet */}
      {isFromQRCode && !banner && (isLoadingByCode || isLoadingById) && (
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
        <Card className="shadow-2xl bg-black/40 border border-white/10 backdrop-blur-xl text-white">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Create your account
            </CardTitle>
            <CardDescription className="text-center text-white/70">
              Enter your information to create a K-conect account
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-4"
              >
                {errorMessage && (
                  <motion.div variants={slideFromTop}>
                    <Alert
                      variant="destructive"
                      className="bg-white/10 border-white/20 text-white"
                    >
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{errorMessage}</AlertDescription>
                    </Alert>
                  </motion.div>
                )}

                {/* Name field - slides from top */}
                <motion.div variants={slideFromTop} className="space-y-2">
                  <Label
                    htmlFor="name"
                    className="text-white flex items-center gap-2"
                  >
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60 pointer-events-none" />
                    <Input
                      id="name"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/60 transition-all duration-300 focus:scale-[1.02] focus:shadow-lg focus:shadow-cyan-500/20"
                    />
                  </div>
                </motion.div>

                {/* Email field - slides from bottom */}
                <motion.div variants={slideFromBottom} className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-white flex items-center gap-2"
                  >
                    Email address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60 pointer-events-none" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/60 transition-all duration-300 focus:scale-[1.02] focus:shadow-lg focus:shadow-purple-500/20"
                    />
                  </div>
                </motion.div>

                {/* Password field - slides from top */}
                <motion.div variants={slideFromTop} className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-white flex items-center gap-2"
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60 pointer-events-none" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pl-10 pr-10 bg-white/5 border-white/20 text-white placeholder:text-white/60 transition-all duration-300 focus:scale-[1.02] focus:shadow-lg focus:shadow-cyan-500/20"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeCuteOpen className="h-4 w-4 text-white/70 hover:text-white/90" />
                      ) : (
                        <EyeCuteClosed className="h-4 w-4 text-white/70 hover:text-white/90" />
                      )}
                    </button>
                  </div>
                </motion.div>

                {/* Confirm Password field - slides from bottom */}
                <motion.div variants={slideFromBottom} className="space-y-2">
                  <Label
                    htmlFor="confirm-password"
                    className="text-white flex items-center gap-2"
                  >
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60 pointer-events-none" />
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="pl-10 pr-10 bg-white/5 border-white/20 text-white placeholder:text-white/60 transition-all duration-300 focus:scale-[1.02] focus:shadow-lg focus:shadow-purple-500/20"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={
                        showConfirmPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeCuteOpen className="h-4 w-4 text-white/70 hover:text-white/90" />
                      ) : (
                        <EyeCuteClosed className="h-4 w-4 text-white/70 hover:text-white/90" />
                      )}
                    </button>
                  </div>
                </motion.div>

                {/* Role Selection - slides from top */}
                <motion.div variants={slideFromTop} className="space-y-2">
                  <Label className="text-white flex items-center gap-2">
                    <Network className="h-4 w-4" /> I want to:
                  </Label>
                  {isFromQRCode && (
                    <Alert className="bg-white/10 border-white/20 text-white">
                      <Network className="h-4 w-4" />
                      <AlertDescription>
                        You're registering to join an event. Your account will be
                        set up as an attendee.
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
                        <RadioGroupItem
                          value="host"
                          id="host"
                          disabled={isFromQRCode}
                        />
                        <Label
                          htmlFor="host"
                          className={`font-normal cursor-pointer flex items-center gap-2 ${
                            isFromQRCode ? "text-white/50" : "text-white"
                          }`}
                        >
                          <Briefcase className="h-4 w-4" />
                          Host events (organize networking events)
                        </Label>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="attendee" id="attendee" />
                      <Label
                        htmlFor="attendee"
                        className="font-normal cursor-pointer text-white flex items-center gap-2"
                      >
                        <Users className="h-4 w-4" />
                        Join events (network with others)
                      </Label>
                    </div>
                  </RadioGroup>
                </motion.div>
              </motion.div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-[1.02]"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating account..." : "Create Account"}
              </Button>
              <div className="relative">
                <div className="absolute inset-0 flex items-center"></div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className=" px-2 text-white/60 rounded-3xl">
                    Or continue with
                  </span>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 transition-all duration-300 transform hover:scale-[1.02]"
                onClick={handleGoogleSignUp}
                disabled={isSubmitting}
              >
                <FcGoogle className="mr-2 h-4 w-4" />
                Sign up with Google
              </Button>
              <div className="text-center text-sm text-white/80">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-medium text-cyan-400 hover:text-cyan-300"
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

// Custom minimal eye icons used for password visibility toggles
const EyeCuteOpen = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    className={className}
  >
    <path
      d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity="0.8"
    />
    <circle cx="12" cy="12" r="3" fill="currentColor" />
  </svg>
);

const EyeCuteClosed = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    className={className}
  >
    <path
      d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity="0.8"
    />
    <path
      d="M3 3l18 18"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);
