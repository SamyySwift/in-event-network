import React, { useState } from "react";
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
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Register = () => {
  const [searchParams] = useSearchParams();
  const defaultRole = searchParams.get("role") || "attendee";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"host" | "attendee">(
    defaultRole as "host" | "attendee"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

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
      const { error } = await register(name, email, password, role);

      if (error) {
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

      // Success - redirect based on user role
      const redirectPath = role === "host" ? "/admin" : "/attendee/onboarding";
      // console.log("Redirecting to:", redirectPath);
      navigate(redirectPath);

      toast({
        title: "Success",
        description: "Your account has been created successfully",
      });
    } catch (error) {
      console.error("Registration error:", error);
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="flex justify-center mb-8">
        <Link to="/" className="flex items-center">
          <img
            src="/logo-placeholder.svg"
            alt="Connect Logo"
            className="h-10 w-auto"
          />
          <span className="ml-2 font-semibold text-2xl text-connect-800">
            Connect
          </span>
        </Link>
      </div>

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
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>I want to:</Label>
                <RadioGroup
                  value={role}
                  onValueChange={(value) =>
                    setRole(value as "host" | "attendee")
                  }
                  className="flex flex-col space-y-2 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="host" id="host" />
                    <Label
                      htmlFor="host"
                      className="font-normal cursor-pointer"
                    >
                      Host events (organize networking events)
                    </Label>
                  </div>
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
                className="w-full bg-connect-600 hover:bg-connect-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating account..." : "Create Account"}
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
