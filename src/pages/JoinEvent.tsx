
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const JoinEvent = () => {
  const [accessKey, setAccessKey] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleJoinEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast({
        title: "Error",
        description: "You must be logged in to join an event",
        variant: "destructive",
      });
      return;
    }

    if (!accessKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter an access key",
        variant: "destructive",
      });
      return;
    }

    setIsJoining(true);

    try {
      // Find the host with this access key
      const { data: hostData, error: hostError } = await supabase
        .from('profiles')
        .select('id, name')
        .eq('access_key', accessKey.trim())
        .eq('role', 'host')
        .single();

      if (hostError || !hostData) {
        toast({
          title: "Invalid Access Key",
          description: "The access key you entered is not valid. Please check and try again.",
          variant: "destructive",
        });
        return;
      }

      // Get all events for this host
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('id, name')
        .eq('host_id', hostData.id)
        .order('start_time', { ascending: false });

      if (eventsError) {
        console.error('Error fetching events:', eventsError);
        toast({
          title: "Error",
          description: "Failed to fetch events for this host",
          variant: "destructive",
        });
        return;
      }

      if (!eventsData || eventsData.length === 0) {
        toast({
          title: "No Events Found",
          description: `No events found for host ${hostData.name}. They may not have created any events yet.`,
          variant: "destructive",
        });
        return;
      }

      // Join all events for this host
      const participationPromises = eventsData.map(event => 
        supabase
          .from('event_participants')
          .upsert({
            user_id: currentUser.id,
            event_id: event.id,
          }, {
            onConflict: 'user_id,event_id'
          })
      );

      const results = await Promise.all(participationPromises);
      
      // Check if any failed
      const failures = results.filter(result => result.error);
      if (failures.length > 0) {
        console.error('Some participations failed:', failures);
        toast({
          title: "Partial Success",
          description: `Joined ${eventsData.length - failures.length} out of ${eventsData.length} events`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success!",
          description: `Successfully joined ${eventsData.length} event(s) hosted by ${hostData.name}`,
        });
      }

      // Navigate to attendee dashboard
      navigate('/attendee');

    } catch (error) {
      console.error('Error joining event:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-8">
          <img
            src="/logo-placeholder.svg"
            alt="Connect Logo"
            className="h-10 w-auto"
          />
          <span className="ml-2 font-semibold text-2xl text-connect-800">
            Connect
          </span>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Join Event
            </CardTitle>
            <p className="text-center text-muted-foreground">
              Enter the access key provided by your event host
            </p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleJoinEvent} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="accessKey">Access Key</Label>
                <Input
                  id="accessKey"
                  type="text"
                  placeholder="Enter 6-digit access key"
                  value={accessKey}
                  onChange={(e) => setAccessKey(e.target.value)}
                  maxLength={6}
                  className="text-center text-2xl tracking-widest font-mono"
                  disabled={isJoining}
                  required
                />
                <p className="text-sm text-muted-foreground text-center">
                  Get this code from your event organizer
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-connect-600 hover:bg-connect-700"
                disabled={isJoining}
              >
                {isJoining ? "Joining..." : "Join Event"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default JoinEvent;
