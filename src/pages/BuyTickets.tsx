
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogIn, UserPlus } from 'lucide-react';

export default function BuyTickets() {
  const { eventKey } = useParams<{ eventKey: string }>();
  const { currentUser, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && eventKey) {
      if (currentUser) {
        // User is logged in, redirect to their ticket page with the event key
        navigate(`/attendee/my-tickets?eventKey=${eventKey}`, { replace: true });
      } else {
        // Store the event key for after authentication
        sessionStorage.setItem('pendingEventCode', eventKey);
      }
    }
  }, [currentUser, isLoading, eventKey, navigate]);

  const handleLogin = () => {
    navigate('/login');
  };

  const handleRegister = () => {
    navigate('/register');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user is authenticated, they'll be redirected by the useEffect
  if (currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Redirecting to your tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="flex justify-center mb-8">
        <div className="flex items-center">
          <img src="/logo.png" alt="Kconect Logo" className="h-8 w-auto" />
          <span className="ml-2 font-semibold text-2xl bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            Kconect
          </span>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="shadow-xl">
          <CardContent className="py-8">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold mb-2">Authentication Required</h1>
              <p className="text-muted-foreground">
                Please sign in or create an account to purchase tickets for this event.
              </p>
            </div>

            <div className="space-y-4">
              <Button
                onClick={handleLogin}
                className="w-full"
                variant="outline"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </Button>
              
              <Button
                onClick={handleRegister}
                className="w-full bg-gradient-to-r from-cyan-400 to-purple-500"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Create Account
              </Button>
            </div>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              After signing in, you'll be redirected to complete your ticket purchase.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
