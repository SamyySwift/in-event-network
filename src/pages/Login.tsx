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
import { AlertCircle, Network, Eye, EyeOff } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { login, currentUser, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Handle redirect when user becomes authenticated
  // Add similar logic to Login.tsx for users who already have accounts
  useEffect(() => {
    console.log("Login component - Auth state:", { currentUser, isLoading });

    if (currentUser && !isLoading) {
      console.log(
        "User authenticated, checking for pending event...",
        currentUser
      );

      // Check for ticketing redirect first
      const redirectAfterLogin = localStorage.getItem('redirectAfterLogin');
      if (redirectAfterLogin && redirectAfterLogin.includes('/buy-tickets/')) {
        // Extract event key from the buy-tickets URL
        const eventKeyMatch = redirectAfterLogin.match(/\/buy-tickets\/([^\/\?]+)/);
        if (eventKeyMatch) {
          const eventKey = eventKeyMatch[1];
          // Store the ticketing URL for the attendee dashboard
          localStorage.setItem('pendingTicketingUrl', redirectAfterLogin);
          localStorage.removeItem('redirectAfterLogin');
          
          // Redirect to attendee my-tickets page
          navigate('/attendee/my-tickets', { replace: true });
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
      await login(email, password);
      console.log("Login successful");

      toast({
        title: "Welcome back!",
        description: "You have been successfully signed in.",
      });
    } catch (error: any) {
      console.error("Login error:", error);
      setErrorMessage(
        error.message || "Invalid email or password. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-connect-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {isSubmitting ? "Signing you in..." : "Loading..."}
          </p>
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
    <div className="min-h-screen  flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="flex justify-center mb-8">
        <Link to="/" className="flex items-center">
          <img src="/logo.png" alt="Kconect Logo" className="h-8 w-auto" />
          <span className="ml-2 font-semibold text-2xl bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            Kconect
          </span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Sign in to your account
            </CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your Connect account
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
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    to="/forgot-password"
                    className="text-sm font-medium text-connect-600 hover:text-connect-500"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isSubmitting}
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
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-cyan-400 to-purple-500"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Signing in..." : "Sign in"}
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
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Login;
