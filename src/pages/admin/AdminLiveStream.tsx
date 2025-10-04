import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Video, VideoOff, Send, Users } from 'lucide-react';
import { useAdminEventContext } from '@/hooks/useAdminEventContext';
import { useLiveStream } from '@/hooks/useLiveStream';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

const AdminLiveStream = () => {
  const { selectedEventId } = useAdminEventContext();
  const {
    activeStream,
    messages,
    broadcasting,
    startBroadcast,
    stopBroadcast,
    sendMessage,
  } = useLiveStream(selectedEventId || '');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleStartBroadcast = async () => {
    if (!title.trim()) return;
    const stream = await startBroadcast(title, description);
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
    setTitle('');
    setDescription('');
  };

  const handleSendMessage = () => {
    if (message.trim() && activeStream) {
      sendMessage(activeStream.id, message);
      setMessage('');
    }
  };

  useEffect(() => {
    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  if (!selectedEventId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Please select an event first</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2 mb-6">
        <h1 className="text-3xl font-bold">Live Stream</h1>
        <p className="text-muted-foreground">Broadcast live to your event attendees</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Broadcast Section */}
        <Card className="lg:col-span-2 p-6 space-y-4">
          <div className="aspect-video bg-muted rounded-lg relative overflow-hidden">
            {broadcasting ? (
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-4">
                  <VideoOff className="w-16 h-16 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground">No active broadcast</p>
                </div>
              </div>
            )}

            {broadcasting && activeStream && (
              <div className="absolute top-4 left-4 bg-destructive text-destructive-foreground px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                LIVE
              </div>
            )}
          </div>

          {!broadcasting ? (
            <div className="space-y-4">
              <Input
                placeholder="Stream Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <Textarea
                placeholder="Stream Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
              <Button
                onClick={handleStartBroadcast}
                className="w-full"
                size="lg"
                disabled={!title.trim()}
              >
                <Video className="mr-2 h-5 w-5" />
                Start Broadcasting
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <h3 className="font-semibold">{activeStream?.title}</h3>
                  {activeStream?.description && (
                    <p className="text-sm text-muted-foreground">{activeStream.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">Live</span>
                </div>
              </div>
              <Button
                onClick={stopBroadcast}
                variant="destructive"
                className="w-full"
                size="lg"
              >
                <VideoOff className="mr-2 h-5 w-5" />
                End Broadcast
              </Button>
            </div>
          )}
        </Card>

        {/* Live Chat Section */}
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold">Live Chat</h3>
          
          {activeStream ? (
            <>
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
            </>
          ) : (
            <div className="flex items-center justify-center h-[400px] text-muted-foreground">
              <p>Start a broadcast to enable chat</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AdminLiveStream;
