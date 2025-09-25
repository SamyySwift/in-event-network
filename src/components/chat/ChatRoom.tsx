import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, MessageCircle, AlertCircle, Sparkles, Image as ImageIcon, Loader2, ArrowDown, Users, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import RoomsPanel from '@/components/chat/RoomsPanel';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useIsMobile } from '@/hooks/use-mobile';

const ChatRoom = ({ eventId }: { eventId?: string }) => {
  const { currentUser } = useAuth();
  const { currentEventId, hasJoinedEvent } = useAttendeeEventContext();
  const [activeTab, setActiveTab] = useState<'chat' | 'rooms' | 'topics'>('chat');
  const [selectedRoom, setSelectedRoom] = useState<{ id: string; name: string; color?: string | null; created_by?: string } | null>(null);

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
  const isMobile = useIsMobile();

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

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 10;
    setIsUserScrolling(!isAtBottom);
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
      <div className="flex items-center justify-center h-full p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You need to scan into an event to access the chat room. Please scan the QR code provided by the event organizer.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Modern Mobile Header */}
      <div className="flex-shrink-0 border-b border-border bg-card">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {selectedRoom ? (
                <>
                  <Hash className="h-5 w-5 text-muted-foreground" />
                  <span className="font-semibold text-foreground truncate max-w-[150px]">
                    {selectedRoom.name}
                  </span>
                </>
              ) : (
                <>
                  <MessageCircle className="h-5 w-5 text-primary" />
                  <span className="font-semibold text-foreground">Event Chat</span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs px-2 py-1">
              {messages.length}
            </Badge>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex-shrink-0 border-b border-border">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-muted/30">
            <TabsTrigger value="chat" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Chat
            </TabsTrigger>
            <TabsTrigger value="rooms" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Rooms
            </TabsTrigger>
            <TabsTrigger value="topics" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Topics
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 flex flex-col min-h-0">
            <TabsContent value="chat" className="flex-1 min-h-0 m-0">
              <div className="flex-1 flex flex-col min-h-0">
                {selectedRoom && (
                  <div className="flex items-center justify-between p-3 border-b border-border bg-muted/30">
                    <div className="flex items-center gap-2">
                      <span 
                        className="h-3 w-3 rounded-full" 
                        style={{ backgroundColor: selectedRoom.color || 'hsl(var(--primary))' }} 
                      />
                      <span className="text-sm font-medium">{selectedRoom.name}</span>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => setSelectedRoom(null)}>
                      Back to Global
                    </Button>
                  </div>
                )}

                {/* Messages Container */}
                <div
                  ref={scrollAreaRef}
                  className="flex-1 overflow-y-auto bg-background"
                  onScroll={handleScroll}
                >
                  <div className="p-3 space-y-4">
                    {messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No messages yet</p>
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

                  {/* Jump to latest button */}
                  {isUserScrolling && (
                    <Button
                      size="icon"
                      variant="secondary"
                      onClick={scrollToBottom}
                      className="fixed right-4 bottom-20 z-10 rounded-full shadow-lg"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* Quote Preview */}
                {quotedMessage && (
                  <div className="border-t border-border bg-muted/30 p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">
                        Replying to {quotedMessage.user_profile?.name || 'Unknown'}
                      </span>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => setQuotedMessage(null)}
                        className="h-6 w-6 p-0"
                      >
                        ×
                      </Button>
                    </div>
                    <QuotedMessage message={quotedMessage} compact />
                  </div>
                )}

                {/* Message Input */}
                <div className="border-t border-border bg-card p-3">
                  <div className="flex items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                      className="flex-shrink-0"
                    >
                      {uploadingImage ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ImageIcon className="h-4 w-4" />
                      )}
                    </Button>

                    <div className="flex-1 relative">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type a message..."
                        className="pr-12 rounded-full"
                        maxLength={500}
                      />
                      <Button
                        size="icon"
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {isMobile && (
                    <div className="text-xs text-muted-foreground mt-2 text-center">
                      {newMessage.length}/500
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="rooms" className="flex-1 min-h-0 m-0">
              <div className="h-full overflow-y-auto">
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
                <div className="flex items-center gap-2 p-4 border-b border-border">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Topics</span>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  <TopicsBoard />
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default ChatRoom;