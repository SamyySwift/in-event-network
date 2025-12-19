import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Video, ArrowLeft, Circle, Users, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLiveStream } from '@/hooks/useLiveStream';
import { useAttendeeEventContext } from '@/contexts/AttendeeEventContext';
import AttendeeRouteGuard from '@/components/attendee/AttendeeRouteGuard';
import { AttendeeEventProvider } from '@/contexts/AttendeeEventContext';
import AppLayout from '@/components/layouts/AppLayout';
import { useAuth } from '@/contexts/AuthContext';

function AttendeeBroadcastContent() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { currentEventId } = useAttendeeEventContext();
  const { liveStreamUrl, isLive, isLoading } = useLiveStream(currentEventId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="p-4 rounded-full bg-primary/10"
        >
          <Video className="w-12 h-12 text-primary" />
        </motion.div>
      </div>
    );
  }

  if (!isLive || !liveStreamUrl) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/attendee')}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Live Broadcast</h1>
            <p className="text-muted-foreground text-sm">Join live meetings and broadcasts</p>
          </div>
        </div>

        {/* No Live Meeting State */}
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <motion.div
              animate={{ 
                scale: [1, 1.05, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="mb-6 p-6 rounded-full bg-muted"
            >
              <WifiOff className="w-16 h-16 text-muted-foreground" />
            </motion.div>
            
            <h2 className="text-xl font-semibold text-foreground mb-2">
              No Live Broadcast
            </h2>
            <p className="text-muted-foreground max-w-sm mb-6">
              There's no live meeting happening right now. Check back later or wait for the host to start a broadcast.
            </p>

            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-muted-foreground text-sm">
              <Circle className="w-2 h-2 text-destructive fill-destructive" />
              <span>Offline</span>
            </div>
          </CardContent>
        </Card>

        {/* Tips Card */}
        <Card>
          <CardContent className="py-4">
            <h3 className="font-medium text-foreground mb-3">While you wait</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                Check the event schedule for upcoming sessions
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                Connect with other attendees in the networking section
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                Browse announcements for updates
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    );
  }

  const displayName = currentUser?.name || 'Attendee';
  const jitsiUrl = `https://meet.jit.si/${liveStreamUrl}#config.prejoinPageEnabled=false&config.startWithVideoMuted=true&config.startWithAudioMuted=true&userInfo.displayName=${encodeURIComponent(displayName)}`;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/attendee')}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Live Broadcast</h1>
            <p className="text-muted-foreground text-sm">You're connected to the live meeting</p>
          </div>
        </div>

        {/* Live Indicator */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20">
          <motion.div
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Circle className="w-2.5 h-2.5 text-green-500 fill-green-500" />
          </motion.div>
          <span className="font-semibold text-green-600 dark:text-green-400 text-sm">LIVE</span>
          <Users className="w-4 h-4 text-green-600 dark:text-green-400" />
        </div>
      </div>

      {/* Jitsi Meeting Embed */}
      <Card className="overflow-hidden border-0 shadow-lg">
        <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-1">
          <div className="rounded-lg overflow-hidden bg-black">
            <iframe
              src={jitsiUrl}
              className="w-full aspect-video min-h-[300px] sm:min-h-[400px] md:min-h-[500px]"
              allow="camera; microphone; fullscreen; display-capture; autoplay"
              allowFullScreen
            />
          </div>
        </div>
      </Card>

      {/* Connection Status */}
      <Card>
        <CardContent className="py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-500/10">
                <Wifi className="w-4 h-4 text-green-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Connected</p>
                <p className="text-xs text-muted-foreground">Joined as {displayName}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/attendee')}
            >
              Leave Meeting
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AttendeeBroadcast() {
  return (
    <AttendeeEventProvider>
      <AttendeeRouteGuard>
        <AppLayout>
          <AttendeeBroadcastContent />
        </AppLayout>
      </AttendeeRouteGuard>
    </AttendeeEventProvider>
  );
}
