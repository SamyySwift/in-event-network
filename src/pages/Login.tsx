import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
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
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
// module imports
import { AlertCircle, Network, Eye, EyeOff, Mail, Lock, Download } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FcGoogle } from "react-icons/fc";
import { motion } from "framer-motion";
import { usePWAInstall } from "@/hooks/usePWAInstall";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { login, signInWithGoogle, currentUser, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isInstallable, isInstalled, promptInstall } = usePWAInstall();

  const handleInstallClick = async () => {
    const installed = await promptInstall();
    if (!installed) {
      navigate("/install");
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const slideFromTop = {
    hidden: { 
      opacity: 0, 
      y: -30,
      scale: 0.95
    },
    show: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: { 
        duration: 0.6, 
        ease: [0.25, 0.46, 0.45, 0.94] // Custom easing for smooth feel
      } 
    },
  };

  const slideFromBottom = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.95
    },
    show: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: { 
        duration: 0.6, 
        ease: [0.25, 0.46, 0.45, 0.94]
      } 
    },
  };

  // Handle redirect when user becomes authenticated
  useEffect(() => {
    console.log("Login component - Auth state:", { currentUser, isLoading });

    if (currentUser && !isLoading) {
      console.log(
        "User authenticated, checking for pending event...",
        currentUser
      );

      // Check for ticketing redirect first
      // Replace the existing buy-tickets redirect logic (around lines 42-54) with:
      const redirectAfterLogin = localStorage.getItem("redirectAfterLogin");
      if (redirectAfterLogin && redirectAfterLogin.includes("/buy-tickets/")) {
        // Extract event key from the buy-tickets URL
        const eventKeyMatch = redirectAfterLogin.match(
          /\/buy-tickets\/([^\/\?]+)/
        );
        if (eventKeyMatch) {
          localStorage.removeItem("redirectAfterLogin");
          // Redirect directly to the buy-tickets page
          navigate(redirectAfterLogin, { replace: true });
          return;
        }
      }

      // Check if there's a pending event to join
      const pendingEventCode = sessionStorage.getItem("pendingEventCode");

      if (pendingEventCode && currentUser.role === "attendee") {
        console.log(
          "Found pending event code, attempting to join:",
          pendingEventCode
        );

        // Clear the stored code
        sessionStorage.removeItem("pendingEventCode");

        // Navigate to join the event
        navigate(`/join/${pendingEventCode}`, { replace: true });
        return;
      }

      // Normal redirect
      if (currentUser.role === "host") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/attendee", { replace: true });
      }
    }
  }, [currentUser, isLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage("Please fill in all fields");
      return;
    }

    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      console.log("Attempting login for:", email);

      // Get the result from login function
      const result = await login(email, password);

      if (result?.error) {
        console.error("Login error:", result.error);
        setErrorMessage(result.error.message || "Login failed");
        return;
      }

      console.log("Login successful");
      // The redirect will be handled by the useEffect when currentUser updates
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);

    try {
      setIsSubmitting(true);
      const { error } = await signInWithGoogle();

      if (error) {
        console.error("Google sign-in error:", error);
        setErrorMessage("Failed to sign in with Google. Please try again.");
      }
    } catch (error) {
      console.error("Google sign-in error:", error);
      setErrorMessage("An unexpected error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-connect-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render login form if user is already authenticated
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-blue-950 text-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="flex justify-center mb-8">
        <Link to="/" className="flex items-center">
          <img src="/logo.png" alt="Kconect Logo" className="h-8 w-auto" />
          <span className="ml-2 font-semibold text-2xl bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            Kconect
          </span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="bg-black/40 border border-white/10 backdrop-blur-xl shadow-2xl text-white">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Sign in to your account
            </CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your K-conect account
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
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
                
                {/* Email field - slides from top */}
                <motion.div variants={slideFromTop} className="space-y-2">
                  <Label htmlFor="email" className="text-white">
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
                      disabled={isSubmitting}
                      required
                      className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/60 transition-all duration-300 focus:scale-[1.02] focus:shadow-lg focus:shadow-cyan-500/20"
                    />
                  </div>
                </motion.div>

                {/* Password field - slides from bottom */}
                <motion.div variants={slideFromBottom} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-white">
                      Password
                    </Label>
                    <Link
                      to="/forgot-password"
                      className="text-sm font-medium text-cyan-400 hover:text-cyan-300"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60 pointer-events-none" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isSubmitting}
                      required
                      className="pl-10 pr-10 bg-white/5 border-white/20 text-white placeholder:text-white/60 transition-all duration-300 focus:scale-[1.02] focus:shadow-lg focus:shadow-purple-500/20"
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
              </motion.div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-cyan-400 to-purple-500 hover:from-cyan-500 hover:to-purple-600 transition-all duration-300 transform hover:scale-[1.02]"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Signing in..." : "Sign in"}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center"></div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 transition-all duration-300 transform hover:scale-[1.02]"
                onClick={handleGoogleSignIn}
                disabled={isSubmitting}
              >
                <FcGoogle className="mr-2 h-4 w-4" />
                Sign up with Google
              </Button>

              <div className="text-center text-sm">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="font-medium text-connect-600 hover:text-connect-500"
                >
                  Create one
                </Link>
              </div>

              {isInstallable && !isInstalled && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full bg-white/5 border-white/20 text-white hover:bg-white/10"
                  onClick={handleInstallClick}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Install App for faster access
                </Button>
              )}
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Login;

// Minimal eye icons to match the design reference
const EyeCuteOpen = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeCuteClosed = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M4 12c3 3 7 3 8 3 3 0 5-1 8-3" />
    <path d="M9 14l-1 2" />
    <path d="M12 14v2" />
    <path d="M15 14l1 2" />
  </svg>
);
