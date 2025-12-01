import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, LogIn, UserPlus } from 'lucide-react';
import { useGuestEventContext } from '@/contexts/GuestEventContext';

interface AuthRequiredPromptProps {
  feature: string;
  description?: string;
}

const AuthRequiredPrompt: React.FC<AuthRequiredPromptProps> = ({ 
  feature, 
  description 
}) => {
  const navigate = useNavigate();
  const { guestEventId } = useGuestEventContext();

  const handleLogin = () => {
    // Store the current path to redirect back after login
    sessionStorage.setItem('redirectAfterAuth', window.location.pathname);
    navigate('/login');
  };

  const handleRegister = () => {
    // Store the current path to redirect back after registration
    sessionStorage.setItem('redirectAfterAuth', window.location.pathname);
    // Pass event context if available
    const params = new URLSearchParams();
    params.set('role', 'attendee');
    if (guestEventId) {
      params.set('eventId', guestEventId);
    }
    navigate(`/register?${params.toString()}`);
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Sign In Required</CardTitle>
          <CardDescription className="text-base">
            {description || `To access ${feature}, please sign in or create an account.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleLogin} 
            className="w-full" 
            size="lg"
          >
            <LogIn className="mr-2 h-5 w-5" />
            Sign In
          </Button>
          <Button 
            onClick={handleRegister} 
            variant="outline" 
            className="w-full" 
            size="lg"
          >
            <UserPlus className="mr-2 h-5 w-5" />
            Create Account
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            You can continue browsing the event schedule, facilities, rules, and polls without signing in.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthRequiredPrompt;
