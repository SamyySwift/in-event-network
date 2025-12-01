import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, LogIn, UserPlus } from "lucide-react";

interface AuthPromptProps {
  title?: string;
  description?: string;
  feature?: string;
}

const AuthPrompt: React.FC<AuthPromptProps> = ({ 
  title = "Sign In Required",
  description = "Please sign in to access this feature",
  feature = "this feature"
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground text-center">
            To use {feature}, you need to create an account or sign in to your existing account.
          </p>
          <div className="flex flex-col gap-2">
            <Button 
              onClick={() => navigate("/register?role=attendee")} 
              className="w-full"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Create Account
            </Button>
            <Button 
              onClick={() => navigate("/login")} 
              variant="outline"
              className="w-full"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Sign In
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPrompt;
