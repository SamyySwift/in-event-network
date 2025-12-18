import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Radio, Video, Users, Copy, CheckCircle, Loader2, ExternalLink, Sparkles, Wifi, WifiOff } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useAdminEventContext } from '@/hooks/useAdminEventContext';
import { useLiveStream } from '@/hooks/useLiveStream';

const AdminLiveBroadcast = () => {
  const { selectedEventId, selectedEvent } = useAdminEventContext();
  const { liveStreamUrl, isLive, updateLiveStream, isUpdating, isLoading } = useLiveStream(selectedEventId);
  
  const [roomName, setRoomName] = useState('');
  const [copied, setCopied] = useState(false);
  const [showMeeting, setShowMeeting] = useState(false);

  // Generate unique room name based on event
  useEffect(() => {
    if (selectedEvent && !liveStreamUrl) {
      const eventSlug = selectedEvent.name.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 20);
      const uniqueId = selectedEventId?.slice(0, 8);
      setRoomName(`kconect-${eventSlug}-${uniqueId}`);
    } else if (liveStreamUrl) {
      setRoomName(liveStreamUrl);
    }
  }, [selectedEvent, selectedEventId, liveStreamUrl]);

  const startMeeting = async () => {
    if (!roomName) {
      toast.error('Please enter a room name');
      return;
    }

    await updateLiveStream(
      { url: roomName, isLive: true },
      {
        onSuccess: () => {
          setShowMeeting(true);
          toast.success('Meeting started! Attendees can now join.');
        },
        onError: () => {
          toast.error('Failed to start meeting');
        },
      }
    );
  };

  const endMeeting = async () => {
    await updateLiveStream(
      { url: roomName, isLive: false },
      {
        onSuccess: () => {
          setShowMeeting(false);
          toast.success('Meeting ended');
        },
        onError: () => {
          toast.error('Failed to end meeting');
        },
      }
    );
  };

  const copyMeetingLink = () => {
    const link = `${window.location.origin}/attendee/broadcast`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success('Meeting link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const jitsiUrl = roomName ? `https://meet.jit.si/${roomName}` : '';

  if (!selectedEventId) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
            <Radio className="w-10 h-10 text-purple-500" />
          </div>
          <h2 className="text-xl font-bold mb-2">No Event Selected</h2>
          <p className="text-muted-foreground">Please select an event first to manage live broadcasts.</p>
        </motion.div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-pink-600 to-red-500 p-6 sm:p-8 text-white"
      >
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
            <Radio className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold">Live Broadcast</h1>
              {isLive && (
                <Badge className="bg-white/20 text-white border-white/30 animate-pulse">
                  <span className="w-2 h-2 bg-red-400 rounded-full mr-2 animate-pulse" />
                  LIVE
                </Badge>
              )}
            </div>
            <p className="text-white/80 text-sm sm:text-base">
              Create and manage live video meetings with your attendees using Jitsi Meet
            </p>
          </div>
          
          {/* Quick Stats */}
          <div className="flex gap-3">
            <div className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl text-center">
              <div className="text-2xl font-bold">{isLive ? '🔴' : '⚪'}</div>
              <div className="text-xs text-white/70">{isLive ? 'Live' : 'Offline'}</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Control Panel */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1 space-y-4"
        >
          {/* Status Card */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-muted/20">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                {isLive ? (
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <Wifi className="h-5 w-5 text-green-500" />
                  </div>
                ) : (
                  <div className="p-2 bg-muted rounded-lg">
                    <WifiOff className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <CardTitle className="text-base">Broadcast Status</CardTitle>
                  <CardDescription className="text-xs">
                    {isLive ? 'Your meeting is active' : 'Start a meeting to go live'}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Room Name Input */}
              <div className="space-y-2">
                <Label htmlFor="room-name" className="text-sm font-medium">Meeting Room Name</Label>
                <Input
                  id="room-name"
                  placeholder="Enter a unique room name"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                  disabled={isLive}
                  className="font-mono text-sm rounded-xl border-muted-foreground/20"
                />
                <p className="text-xs text-muted-foreground">
                  Only lowercase letters, numbers, and hyphens allowed
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                {!isLive ? (
                  <Button
                    onClick={startMeeting}
                    disabled={isUpdating || !roomName}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-xl shadow-lg"
                  >
                    {isUpdating ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Video className="w-4 h-4 mr-2" />
                    )}
                    Start Meeting
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={() => setShowMeeting(!showMeeting)}
                      variant="outline"
                      className="w-full rounded-xl"
                    >
                      <Video className="w-4 h-4 mr-2" />
                      {showMeeting ? 'Hide Meeting' : 'Show Meeting'}
                    </Button>
                    <Button
                      onClick={endMeeting}
                      variant="destructive"
                      disabled={isUpdating}
                      className="w-full rounded-xl"
                    >
                      {isUpdating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      End Meeting
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Share Card */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Share with Attendees
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={copyMeetingLink}
                variant="outline"
                disabled={!isLive}
                className="w-full rounded-xl"
              >
                {copied ? (
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4 mr-2" />
                )}
                {copied ? 'Link Copied!' : 'Copy Attendee Link'}
              </Button>
              {roomName && (
                <Button
                  variant="ghost"
                  onClick={() => window.open(jitsiUrl, '_blank')}
                  className="w-full text-muted-foreground rounded-xl"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open in New Tab
                </Button>
              )}
            </CardContent>
          </Card>

          {/* How it Works */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500/5 to-purple-500/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">How it works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                'Enter a unique room name or use the auto-generated one',
                'Click "Start Meeting" to begin broadcasting',
                'Attendees see a "Join Broadcast" banner in their dashboard',
                'Click "End Meeting" when done'
              ].map((step, index) => (
                <div key={index} className="flex gap-3 items-start">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs shrink-0">
                    {index + 1}
                  </span>
                  <p className="text-sm text-muted-foreground">{step}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Video Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card className="border-0 shadow-lg h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Meeting Preview
                </CardTitle>
                {isLive && roomName && (
                  <Badge variant="outline" className="font-mono text-xs">
                    {roomName}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {showMeeting && isLive && roomName ? (
                <div className="rounded-xl overflow-hidden border bg-black aspect-video shadow-inner">
                  <iframe
                    src={`https://meet.jit.si/${roomName}#config.prejoinPageEnabled=false&config.startWithVideoMuted=false&config.startWithAudioMuted=false&userInfo.displayName=${encodeURIComponent(selectedEvent?.name || 'Host')}`}
                    className="w-full h-full min-h-[400px] md:min-h-[500px]"
                    allow="camera; microphone; fullscreen; display-capture; autoplay"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="rounded-xl border-2 border-dashed border-muted-foreground/20 bg-muted/30 aspect-video flex flex-col items-center justify-center text-center p-8">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-4">
                    <Video className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    {isLive ? 'Meeting is Live' : 'No Active Meeting'}
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    {isLive 
                      ? 'Click "Show Meeting" to view the video conference here'
                      : 'Start a meeting to begin your live broadcast. Attendees will be notified automatically.'
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminLiveBroadcast;
