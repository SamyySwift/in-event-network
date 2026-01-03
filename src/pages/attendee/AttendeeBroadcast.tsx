import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Video, ArrowLeft, Circle, Users, Wifi, WifiOff, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLiveStream, isJitsiStream } from '@/hooks/useLiveStream';
import { useAttendeeEventContext } from '@/contexts/AttendeeEventContext';
import AttendeeRouteGuard from '@/components/attendee/AttendeeRouteGuard';
import { AttendeeEventProvider } from '@/contexts/AttendeeEventContext';
import { useAuth } from '@/contexts/AuthContext';
import { usePiP } from '@/contexts/PiPContext';

function AttendeeBroadcastContent() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { currentEventId } = useAttendeeEventContext();
  const { liveStreamUrl, isLive, isLoading } = useLiveStream(currentEventId);
  const { showJitsiPiP, isVisible, streamType, setFullscreen } = usePiP();

  const displayName = currentUser?.name || 'Attendee';

  // If Jitsi PiP is already active, just show a message
  const isJitsiPiPActive = isVisible && streamType === 'jitsi';

  // Auto-join meeting on page load
  useEffect(() => {
    if (isLive && liveStreamUrl && isJitsiStream(liveStreamUrl) && currentEventId && !isLoading) {
      // Only auto-join if not already in Jitsi PiP
      if (!isVisible || streamType !== 'jitsi') {
        showJitsiPiP(currentEventId, liveStreamUrl);
      }
      // Always go fullscreen when visiting broadcast page
      setFullscreen(true);
    }
  }, [isLive, liveStreamUrl, currentEventId, isVisible, streamType, showJitsiPiP, setFullscreen, isLoading]);

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
            <h1 className="text-2xl font-bold text-foreground">Live Session</h1>
            <p className="text-muted-foreground text-sm">Join live sessions and interactive meetings</p>
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

  // If Jitsi PiP is already active, show a "return to meeting" view
  if (isJitsiPiPActive) {
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
            <h1 className="text-2xl font-bold text-foreground">Live Session</h1>
            <p className="text-muted-foreground text-sm">You're in PiP mode</p>
          </div>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-6 p-6 rounded-full bg-green-500/10">
              <Video className="w-16 h-16 text-green-500" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Meeting in Picture-in-Picture
            </h2>
            <p className="text-muted-foreground max-w-sm mb-6">
              Your live meeting is running in the floating player. Look for the green-bordered video in the corner of your screen.
            </p>
            <p className="text-sm text-muted-foreground">
              Click the expand button on the floating player to return to fullscreen.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleOpenMeeting = () => {
    if (!currentEventId || !liveStreamUrl || !isJitsiStream(liveStreamUrl)) return;

    // Ensure player exists
    if (!isVisible || streamType !== 'jitsi') {
      showJitsiPiP(currentEventId, liveStreamUrl);
    }

    // Expand existing player (keeps the same meeting session)
    setFullscreen(true);
  };

  const handleMinimizeToPiP = () => {
    if (!currentEventId || !liveStreamUrl || !isJitsiStream(liveStreamUrl)) return;

    // Ensure player exists then minimize
    if (!isVisible || streamType !== 'jitsi') {
      showJitsiPiP(currentEventId, liveStreamUrl);
    }

    setFullscreen(false);
    navigate('/attendee');
  };

  return (
    <div className="space-y-4">
      {/* Header (mobile friendly) */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/attendee')}
            className="rounded-full shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">Live Session</h1>
            <p className="text-muted-foreground text-sm">Join the live session</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="default" size="sm" onClick={handleOpenMeeting} className="gap-2">
            <Video className="w-4 h-4" />
            Open meeting
          </Button>

          <Button variant="outline" size="sm" onClick={handleMinimizeToPiP} className="gap-2">
            <Minimize2 className="w-4 h-4" />
            PiP
          </Button>

          <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-green-500/10 border border-green-500/20">
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
      </div>

      {/* Meeting status card (fits mobile) */}
      <Card>
        <CardContent className="py-4 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">Ready to join</p>
              <p className="text-xs text-muted-foreground truncate">You will join as {displayName}</p>
            </div>
            <div className="shrink-0 flex items-center gap-2">
              <div className="p-2 rounded-full bg-green-500/10">
                <Wifi className="w-4 h-4 text-green-500" />
              </div>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            Tap <strong>Open meeting</strong> to watch in full screen. Tap <strong>PiP</strong> to keep it floating while you navigate.
          </div>
        </CardContent>
      </Card>

      {/* Web Join Instructions */}
      <Card>
        <CardContent className="py-4">
          <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
            <Video className="w-4 h-4 text-primary" />
            How to Join via Web Browser
          </h4>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="leading-relaxed">
              For the best experience, allow camera/mic when prompted.
            </p>
            <ul className="list-disc list-inside space-y-1.5">
              <li><strong>Enable Camera/Microphone:</strong> Click “Allow” when your browser prompts you.</li>
              <li><strong>Full Screen:</strong> Use <strong>Open meeting</strong> for full screen viewing.</li>
              <li><strong>Picture-in-Picture:</strong> Use <strong>PiP</strong> to keep the meeting while browsing.</li>
            </ul>
            <p className="text-xs text-muted-foreground/80 mt-3 italic">
              Tip: Chrome, Firefox, or Edge works best.
            </p>
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