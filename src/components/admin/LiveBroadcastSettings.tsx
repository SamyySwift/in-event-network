import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Radio, Youtube, Check, ExternalLink, AlertCircle, Copy, CheckCircle } from 'lucide-react';
import { useLiveStream, extractYouTubeVideoId } from '@/hooks/useLiveStream';
import { useAdminEventContext } from '@/hooks/useAdminEventContext';
import { toast } from 'sonner';

export const LiveBroadcastSettings = () => {
  const { selectedEventId } = useAdminEventContext();
  const { liveStreamUrl, isLive, updateLiveStream, isUpdating, isLoading } = useLiveStream(selectedEventId);
  
  const [url, setUrl] = useState('');
  const [localIsLive, setLocalIsLive] = useState(false);
  const [copied, setCopied] = useState(false);

  // Sync local state with fetched data
  useEffect(() => {
    setUrl(liveStreamUrl || '');
    setLocalIsLive(isLive);
  }, [liveStreamUrl, isLive]);

  const videoId = extractYouTubeVideoId(url);
  const isValidUrl = url === '' || videoId !== null;

  const handleSave = () => {
    if (!isValidUrl && url !== '') {
      toast.error('Please enter a valid YouTube URL');
      return;
    }

    updateLiveStream(
      { url: url || null, isLive: localIsLive },
      {
        onSuccess: () => {
          toast.success(localIsLive ? 'Stream is now live!' : 'Stream settings saved');
        },
        onError: (error) => {
          toast.error('Failed to update stream settings');
          console.error(error);
        },
      }
    );
  };

  const handleGoLive = () => {
    if (!url) {
      toast.error('Please enter a YouTube stream URL first');
      return;
    }
    if (!isValidUrl) {
      toast.error('Please enter a valid YouTube URL');
      return;
    }

    updateLiveStream(
      { url, isLive: true },
      {
        onSuccess: () => {
          setLocalIsLive(true);
          toast.success('🔴 You are now live!');
        },
        onError: (error) => {
          toast.error('Failed to go live');
          console.error(error);
        },
      }
    );
  };

  const handleEndStream = () => {
    updateLiveStream(
      { url, isLive: false },
      {
        onSuccess: () => {
          setLocalIsLive(false);
          toast.success('Stream ended');
        },
        onError: (error) => {
          toast.error('Failed to end stream');
          console.error(error);
        },
      }
    );
  };

  const copyStreamPageUrl = () => {
    const streamPageUrl = `${window.location.origin}/attendee/live`;
    navigator.clipboard.writeText(streamPageUrl);
    setCopied(true);
    toast.success('Stream page URL copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (!selectedEventId) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center">Please select an event first</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-500/10 rounded-lg">
            <Radio className="h-5 w-5 text-red-500" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">Live Broadcast</CardTitle>
              {localIsLive && (
                <Badge variant="destructive" className="animate-pulse">
                  🔴 LIVE
                </Badge>
              )}
            </div>
            <CardDescription>Stream live video to your attendees using YouTube Live</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* YouTube URL Input */}
        <div className="space-y-2">
          <Label htmlFor="stream-url" className="flex items-center gap-2">
            <Youtube className="h-4 w-4 text-red-500" />
            YouTube Live Stream URL
          </Label>
          <Input
            id="stream-url"
            placeholder="https://youtube.com/live/xxxxx or https://youtube.com/watch?v=xxxxx"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className={!isValidUrl ? 'border-red-500' : ''}
          />
          {!isValidUrl && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Please enter a valid YouTube URL
            </p>
          )}
          {videoId && (
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Check className="h-3 w-3 text-green-500" />
              Video ID: {videoId}
            </p>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <h4 className="font-medium text-sm">How to set up:</h4>
          <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
            <li>Go to <a href="https://studio.youtube.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">YouTube Studio <ExternalLink className="h-3 w-3" /></a></li>
            <li>Click "Create" → "Go live"</li>
            <li>Set up your stream and copy the live URL</li>
            <li>Paste the URL above and click "Go Live"</li>
          </ol>
        </div>

        {/* Live Toggle / Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t">
          <div className="flex items-center gap-3">
            <Switch
              checked={localIsLive}
              onCheckedChange={setLocalIsLive}
              disabled={!url || !isValidUrl}
            />
            <div>
              <p className="font-medium text-sm">Broadcast Status</p>
              <p className="text-xs text-muted-foreground">
                {localIsLive ? 'Attendees can watch your stream' : 'Stream is hidden from attendees'}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            {localIsLive ? (
              <Button
                variant="destructive"
                onClick={handleEndStream}
                disabled={isUpdating}
              >
                End Stream
              </Button>
            ) : (
              <Button
                onClick={handleGoLive}
                disabled={isUpdating || !url || !isValidUrl}
                className="bg-red-500 hover:bg-red-600"
              >
                <Radio className="h-4 w-4 mr-2" />
                Go Live
              </Button>
            )}
            <Button
              variant="outline"
              onClick={handleSave}
              disabled={isUpdating}
            >
              Save Settings
            </Button>
          </div>
        </div>

        {/* Stream Page URL */}
        {url && (
          <div className="pt-4 border-t">
            <Label className="text-sm text-muted-foreground mb-2 block">Stream Page URL (for sharing)</Label>
            <div className="flex gap-2">
              <Input
                value={`${window.location.origin}/attendee/live`}
                readOnly
                className="bg-muted/50"
              />
              <Button variant="outline" size="icon" onClick={copyStreamPageUrl}>
                {copied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
