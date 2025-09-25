// ChatRoom component
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, MessageCircle, AlertCircle, Sparkles, Image as ImageIcon, Loader2, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/contexts/AuthContext';
import { useAttendeeEventContext } from '@/contexts/AttendeeEventContext';
import { ChatMessage } from './ChatMessage';
import { QuotedMessage } from './QuotedMessage';
import TopicsBoard from '@/components/topics/TopicsBoard';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
// NEW:
import RoomsPanel from '@/components/chat/RoomsPanel';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const ChatRoom = ({ eventId }: { eventId?: string }) => {
  const { currentUser } = useAuth();
  const { currentEventId, hasJoinedEvent } = useAttendeeEventContext();
  // NEW: room selection and tab state
  const [activeTab, setActiveTab] = useState<'chat' | 'rooms' | 'topics'>('chat');
  const [selectedRoom, setSelectedRoom] = useState<{ id: string; name: string; color?: string | null; created_by?: string } | null>(null);

  // Adjust useChat to include selected room id
  const { messages, loading, sendMessage, deleteMessage, participantPoints } = useChat(eventId, selectedRoom?.id || undefined);

  const [newMessage, setNewMessage] = useState('');
  const [quotedMessage, setQuotedMessage] = useState<any>(null);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const previousMessageCount = useRef(messages.length);
  const { toast } = useToast();

  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const hasNewMessages = messages.length > previousMessageCount.current;
    previousMessageCount.current = messages.length;
    if (hasNewMessages && !isUserScrolling) {
      setTimeout(scrollToBottom, 100);
    }
  }, [messages, isUserScrolling, scrollToBottom]);

  // Debounced scroll handler for better performance
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 10;
    
    // Use requestAnimationFrame to debounce scroll updates
    requestAnimationFrame(() => {
      setIsUserScrolling(!isAtBottom);
    });
  }, []);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    await sendMessage(newMessage, quotedMessage?.id);
    setNewMessage('');
    setQuotedMessage(null);
    setIsUserScrolling(false);
    setTimeout(scrollToBottom, 100);
  };

  const handleQuoteMessage = (message: any) => setQuotedMessage(message);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'image/svg+xml'];
    const maxBytes = 1 * 1024 * 1024;

    if (!allowed.includes(file.type)) {
      toast({ title: 'Unsupported file type', description: 'Please upload PNG, JPG, GIF, WEBP, or SVG.', variant: 'destructive' });
      e.target.value = '';
      return;
    }
    if (file.size > maxBytes) {
      toast({ title: 'File too large', description: 'Your bucket limit is 1MB. Please upload an image under 1MB.', variant: 'destructive' });
      e.target.value = '';
      return;
    }

    const activeEventId = eventId ?? currentEventId;
    if (!activeEventId || !currentUser?.id) {
      toast({ title: 'Cannot upload', description: 'You must be in an event and logged in to share images.', variant: 'destructive' });
      e.target.value = '';
      return;
    }

    try {
      setUploadingImage(true);
      const ext = (file.name.split('.').pop() || 'png').toLowerCase();
      const path = `${activeEventId}/${currentUser.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('chat-uploads').upload(path, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type,
      });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('chat-uploads').getPublicUrl(path);
      await sendMessage(data.publicUrl, quotedMessage?.id);

      toast({ title: 'Image shared', description: 'Your image has been uploaded to the chat.' });
      setQuotedMessage(null);
      setIsUserScrolling(false);
      setTimeout(scrollToBottom, 100);
    } catch (err: any) {
      toast({ title: 'Upload failed', description: err?.message || 'Please try again or choose a smaller image.', variant: 'destructive' });
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  

  if (!eventId && (!hasJoinedEvent || !currentEventId)) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You need to scan into an event to access the chat room. Please scan the QR code provided by the event organizer.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="h-[80vh] md:h-[700px] flex flex-col bg-gradient-to-br from-background/95 via-background/90 to-background/95 backdrop-blur-xl border border-border/20 rounded-2xl shadow-2xl overflow-hidden">
      {/* Modern Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 md:p-6 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 border-b border-border/10">
        <div className="flex items-center gap-3 mb-3 sm:mb-0">
          <div className="p-2 rounded-xl bg-primary/10 backdrop-blur">
            <MessageCircle className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-lg text-foreground">
              {selectedRoom ? selectedRoom.name : 'Event Chat'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {messages.length} message{messages.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        {selectedRoom && (
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => setSelectedRoom(null)}
            className="rounded-full bg-background/50 backdrop-blur border-border/20 hover:bg-background/80"
          >
            Back to Global
          </Button>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex-1 flex flex-col min-h-0">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col min-h-0">
          <div className="p-4 pb-2">
            <TabsList className="grid w-full grid-cols-3 bg-muted/50 backdrop-blur rounded-xl p-1">
              <TabsTrigger value="chat" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                Chat
              </TabsTrigger>
              <TabsTrigger value="rooms" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                Rooms
              </TabsTrigger>
              <TabsTrigger value="topics" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                Topics
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="chat" className="flex-1 min-h-0 m-0">
            <div className="flex-1 flex flex-col min-h-0">
              {/* Messages Area */}
              <div
                ref={scrollAreaRef}
                className="flex-1 min-h-0 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border/20 hover:scrollbar-thumb-border/40"
                style={{ 
                  touchAction: 'pan-y',
                  WebkitOverflowScrolling: 'touch',
                  overscrollBehavior: 'contain',
                }}
                onScroll={handleScroll}
              >
                <div className="p-4 space-y-4 min-h-full">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                      <div className="p-4 rounded-2xl bg-muted/20 backdrop-blur mb-4">
                        <MessageCircle className="h-8 w-8 text-muted-foreground/60" />
                      </div>
                      <h3 className="font-medium text-foreground mb-2">No messages yet</h3>
                      <p className="text-sm text-muted-foreground">Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <ChatMessage
                        key={message.id}
                        message={message}
                        isOwn={message.user_id === currentUser?.id}
                        onQuote={handleQuoteMessage}
                        onDelete={(id) => deleteMessage(id)}
                        points={participantPoints[message.user_id] ?? 0}
                        roomOwnerUserId={selectedRoom?.created_by}
                      />
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Floating Scroll Button */}
                {isUserScrolling && (
                  <Button
                    type="button"
                    size="icon"
                    variant="secondary"
                    onClick={scrollToBottom}
                    className="fixed bottom-24 right-6 rounded-full shadow-lg bg-background/90 backdrop-blur border-border/20 hover:bg-accent/90 z-10"
                    title="Jump to latest"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Quote Preview */}
              {quotedMessage && (
                <div className="mx-4 mb-2 p-3 bg-muted/30 backdrop-blur rounded-xl border border-border/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-primary">
                      Replying to {quotedMessage.user_profile?.name}
                    </span>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => setQuotedMessage(null)} 
                      className="h-6 w-6 p-0 rounded-full hover:bg-muted/50"
                    >
                      ×
                    </Button>
                  </div>
                  <QuotedMessage message={quotedMessage} compact />
                </div>
              )}

              {/* Message Composer */}
              <div className="p-4 bg-gradient-to-t from-background/50 to-transparent backdrop-blur">
                <div className="flex gap-3 items-end bg-background/80 backdrop-blur border border-border/20 rounded-2xl p-3 shadow-sm">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/gif,image/webp,image/svg+xml"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="shrink-0 rounded-xl h-10 w-10 hover:bg-muted/50"
                    title="Upload image"
                  >
                    {uploadingImage ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ImageIcon className="h-4 w-4" />
                    )}
                  </Button>

                  <div className="flex-1 min-h-0">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      className="border-0 focus-visible:ring-0 bg-transparent text-base resize-none min-h-0 p-0"
                      maxLength={500}
                    />
                    {newMessage.length > 400 && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {newMessage.length}/500
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    onClick={handleSendMessage} 
                    disabled={!newMessage.trim()} 
                    size="icon"
                    className="rounded-xl h-10 w-10 bg-primary hover:bg-primary/90 disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="rooms" className="flex-1 min-h-0 m-0">
            <div className="h-full p-4">
              <RoomsPanel
                eventId={eventId ?? currentEventId}
                onEnterRoom={(roomId) => {
                  supabase.from('chat_rooms').select('id,name,color,created_by').eq('id', roomId).single().then(({ data }) => {
                    if (data) setSelectedRoom({ id: data.id, name: data.name, color: data.color, created_by: data.created_by });
                  });
                  setActiveTab('chat');
                }}
              />
            </div>
          </TabsContent>

          <TabsContent value="topics" className="flex-1 min-h-0 m-0">
            <div className="h-full flex flex-col">
              <div className="flex items-center gap-3 p-4 pb-2">
                <div className="p-2 rounded-xl bg-accent/10 backdrop-blur">
                  <Sparkles className="h-4 w-4 text-accent-foreground" />
                </div>
                <h3 className="font-semibold text-foreground">Discussion Topics</h3>
              </div>
              <div className="flex-1 overflow-y-auto px-4 pb-4">
                <TopicsBoard />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
export default ChatRoom;