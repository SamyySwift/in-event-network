import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Video, Send, Users } from 'lucide-react';
import { useAttendeeContext } from '@/hooks/useAttendeeContext';
import { useLiveStream } from '@/hooks/useLiveStream';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const AttendeeLiveStream = () => {
  const { context } = useAttendeeContext();
  const currentEventId = context?.currentEventId || null;
  
  console.log('AttendeeLiveStream - context:', context);
  console.log('AttendeeLiveStream - currentEventId:', currentEventId);
  const {
    activeStream,
    messages,
    loading,
    joinStream,
    sendMessage,
  } = useLiveStream(currentEventId);

  const [message, setMessage] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    if (activeStream && videoRef.current && !joined) {
      joinStream(activeStream.id, videoRef.current);
      setJoined(true);
    }
  }, [activeStream, joinStream, joined]);

  const handleSendMessage = () => {
    if (message.trim() && activeStream) {
      sendMessage(activeStream.id, message);
      setMessage('');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!currentEventId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Please join an event first</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Live Stream</h1>
        <p className="text-muted-foreground">Watch live broadcasts from your event</p>
      </div>

      {!activeStream ? (
        <Card className="p-12">
          <div className="text-center space-y-4">
            <Video className="w-16 h-16 mx-auto text-muted-foreground" />
            <div>
              <h3 className="text-xl font-semibold mb-2">No Active Stream</h3>
              <p className="text-muted-foreground">
                There are no live broadcasts at the moment. Check back later!
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Section */}
          <Card className="lg:col-span-2 p-6 space-y-4">
            <div className="aspect-video bg-muted rounded-lg relative overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />

              <div className="absolute top-4 left-4 bg-destructive text-destructive-foreground px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                LIVE
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-semibold">{activeStream.title}</h3>
              {activeStream.description && (
                <p className="text-muted-foreground">{activeStream.description}</p>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>Watching live</span>
              </div>
            </div>
          </Card>

          {/* Live Chat Section */}
          <Card className="p-6 space-y-4">
            <h3 className="font-semibold">Live Chat</h3>
            
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className="flex gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={msg.profiles?.photo_url || undefined} />
                      <AvatarFallback>
                        {msg.profiles?.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{msg.profiles?.name || 'Anonymous'}</p>
                      <p className="text-sm text-muted-foreground">{msg.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="flex gap-2">
              <Input
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button onClick={handleSendMessage} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AttendeeLiveStream;
