
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Key, Loader, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const JoinEvent = () => {
  const [eventKey, setEventKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleJoinEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!eventKey || eventKey.length !== 6) {
      toast.error('Please enter a valid 6-digit event key');
      return;
    }

    if (!currentUser) {
      // Redirect to login if not authenticated
      navigate('/login?redirect=/join');
      return;
    }

    setIsLoading(true);

    try {
      // Check if the event key exists
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('id, name, description, start_time, end_time')
        .eq('event_key', eventKey.toUpperCase())
        .single();

      if (eventError || !event) {
        toast.error('Invalid event key. Please check and try again.');
        setIsLoading(false);
        return;
      }

      // Check if user is already a participant
      const { data: existingParticipant } = await supabase
        .from('event_participants')
        .select('id')
        .eq('event_id', event.id)
        .eq('user_id', currentUser.id)
        .single();

      if (!existingParticipant) {
        // Add user as event participant
        const { error: participantError } = await supabase
          .from('event_participants')
          .insert({
            event_id: event.id,
            user_id: currentUser.id
          });

        if (participantError) {
          console.error('Error adding participant:', participantError);
          toast.error('Failed to join event. Please try again.');
          setIsLoading(false);
          return;
        }
      }

      toast.success(`Successfully joined ${event.name}!`);
      
      // Redirect to attendee dashboard
      navigate('/attendee');
      
    } catch (error) {
      console.error('Error joining event:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
    setEventKey(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-connect-600 rounded-full flex items-center justify-center mb-4">
            <Key className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Join Event</h1>
          <p className="text-gray-600 mt-2">
            Enter your 6-digit event key to access the event
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Event Access</CardTitle>
            <CardDescription>
              Enter the event key provided by your event organizer
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleJoinEvent} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="event-key">Event Key</Label>
                <Input
                  id="event-key"
                  type="text"
                  value={eventKey}
                  onChange={handleKeyChange}
                  placeholder="000000"
                  className="text-center text-2xl font-mono tracking-widest"
                  maxLength={6}
                  autoComplete="off"
                />
                <p className="text-sm text-muted-foreground">
                  Enter the 6-digit number provided by your event organizer
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || eventKey.length !== 6}
              >
                {isLoading ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Joining Event...
                  </>
                ) : (
                  <>
                    Join Event
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Don't have an account?
              </p>
              <Button 
                variant="link" 
                onClick={() => navigate('/register')}
                className="text-connect-600"
              >
                Create Account
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="text-gray-600"
          >
            ← Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default JoinEvent;
