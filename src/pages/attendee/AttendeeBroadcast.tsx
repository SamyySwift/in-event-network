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

      {/* Jitsi Meeting Embed - Extended Size */}
      <Card className="overflow-hidden border-0 shadow-xl">
        <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-1.5">
          <div className="rounded-xl overflow-hidden bg-black">
            <iframe
              src={jitsiUrl}
              className="w-full min-h-[400px] sm:min-h-[500px] md:min-h-[600px] lg:min-h-[700px]"
              style={{ aspectRatio: '16/10' }}
              allow="camera; microphone; fullscreen; display-capture; autoplay"
              allowFullScreen
            />
          </div>
        </div>
      </Card>

      {/* Connection Status & Web Join Instructions */}
      <Card>
        <CardContent className="py-4 space-y-4">
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

          {/* Web Join Instructions */}
          <div className="border-t pt-4">
            <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
              <Video className="w-4 h-4 text-primary" />
              How to Join via Web Browser
            </h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="leading-relaxed">
                You're viewing the live broadcast directly in your web browser. To participate fully:
              </p>
              <ul className="list-disc list-inside space-y-1.5 ml-2">
                <li><strong>Enable Camera/Microphone:</strong> Click the camera and microphone icons in the video player to turn them on. Your browser may ask for permission — click "Allow".</li>
                <li><strong>Full Screen:</strong> Click the expand icon in the bottom-right corner of the video for a better viewing experience.</li>
                <li><strong>Raise Hand:</strong> Use the raise hand feature in the meeting controls to get the host's attention.</li>
                <li><strong>Chat:</strong> Use the chat panel within the video player to send messages to other participants.</li>
              </ul>
              <p className="text-xs text-muted-foreground/80 mt-3 italic">
                Tip: For the best experience, use Chrome, Firefox, or Edge browser. Safari users may need to enable camera/microphone access in Safari Preferences → Websites.
              </p>
            </div>
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
        <AttendeeBroadcastContent />
      </AttendeeRouteGuard>
    </AttendeeEventProvider>
  );
}
