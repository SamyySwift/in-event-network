import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Radio, Video, Users, Copy, CheckCircle, Loader2, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useAdminEventContext } from '@/hooks/useAdminEventContext';
import { useLiveStream } from '@/hooks/useLiveStream';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

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
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <Radio className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Please select an event first to manage live broadcasts.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AdminPageHeader
      title="Live Broadcast"
      description="Create and manage live video meetings with your attendees using Jitsi Meet"
    >

      {/* Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-2 border-red-200 dark:border-red-900/50">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <Radio className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    Broadcast Status
                    {isLive && (
                      <Badge variant="destructive" className="animate-pulse">
                        🔴 LIVE
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {isLive ? 'Your meeting is active - attendees can join now' : 'Start a meeting to broadcast to attendees'}
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Room Name Input */}
            <div className="space-y-2">
              <Label htmlFor="room-name">Meeting Room Name</Label>
              <Input
                id="room-name"
                placeholder="Enter a unique room name"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                disabled={isLive}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                This creates a unique Jitsi Meet room. Only lowercase letters, numbers, and hyphens allowed.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              {!isLive ? (
                <Button
                  onClick={startMeeting}
                  disabled={isUpdating || !roomName}
                  className="bg-red-500 hover:bg-red-600"
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
                  >
                    <Video className="w-4 h-4 mr-2" />
                    {showMeeting ? 'Hide Meeting' : 'Show Meeting'}
                  </Button>
                  <Button
                    onClick={endMeeting}
                    variant="destructive"
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : null}
                    End Meeting
                  </Button>
                </>
              )}
              <Button
                onClick={copyMeetingLink}
                variant="outline"
                disabled={!isLive}
              >
                {copied ? (
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4 mr-2" />
                )}
                Copy Attendee Link
              </Button>
              {roomName && (
                <Button
                  variant="ghost"
                  onClick={() => window.open(jitsiUrl, '_blank')}
                  className="text-muted-foreground"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open in New Tab
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Jitsi Meeting Embed */}
      {showMeeting && isLive && roomName && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Live Meeting
                </CardTitle>
                <Badge variant="outline" className="font-mono text-xs">
                  {roomName}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg overflow-hidden border bg-black aspect-video">
                <iframe
                  src={`https://meet.jit.si/${roomName}#config.prejoinPageEnabled=false&config.startWithVideoMuted=false&config.startWithAudioMuted=false&userInfo.displayName=${encodeURIComponent(selectedEvent?.name || 'Host')}`}
                  className="w-full h-full min-h-[400px] md:min-h-[500px]"
                  allow="camera; microphone; fullscreen; display-capture; autoplay"
                  allowFullScreen
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Instructions */}
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-base">How it works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div className="flex gap-3">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs shrink-0">1</span>
            <p>Enter a unique room name or use the auto-generated one</p>
          </div>
          <div className="flex gap-3">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs shrink-0">2</span>
            <p>Click "Start Meeting" to begin broadcasting</p>
          </div>
          <div className="flex gap-3">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs shrink-0">3</span>
            <p>Attendees will see a "Join Broadcast" option in their dashboard and can join instantly</p>
          </div>
          <div className="flex gap-3">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs shrink-0">4</span>
            <p>Click "End Meeting" when you're done - attendees will be notified</p>
          </div>
        </CardContent>
      </Card>
    </AdminPageHeader>
  );
};

export default AdminLiveBroadcast;
