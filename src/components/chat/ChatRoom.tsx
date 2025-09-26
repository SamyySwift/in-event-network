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
    <div className="w-full">
      {/* Modern Navigation */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
        <div className="px-4 pb-4">
          <TabsList className="grid w-full grid-cols-3 bg-background/30 backdrop-blur-xl rounded-2xl p-1.5 border border-border/20">
            <TabsTrigger 
              value="chat" 
              className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/90 data-[state=active]:to-accent/90 data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg font-semibold transition-all duration-300"
            >
              💬 Chat
            </TabsTrigger>
            <TabsTrigger 
              value="rooms" 
              className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/90 data-[state=active]:to-accent/90 data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg font-semibold transition-all duration-300"
            >
              🏠 Rooms
            </TabsTrigger>
            <TabsTrigger 
              value="topics" 
              className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/90 data-[state=active]:to-accent/90 data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg font-semibold transition-all duration-300"
            >
              ✨ Topics
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Chat Content - Independent Container */}
        <TabsContent value="chat" className="m-0">
          <div className="h-[75vh] max-h-[800px] flex flex-col relative overflow-hidden">
            {/* Ultra Modern Background with Glassmorphism */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-background to-accent/3 opacity-60"></div>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-accent/10"></div>
            <div className="absolute inset-0 backdrop-blur-3xl bg-background/40 border border-border/20 rounded-3xl shadow-2xl"></div>
            
            {/* Chat Container */}
            <div className="relative z-10 h-full flex flex-col rounded-3xl overflow-hidden">
              {/* Ultra Modern Header */}
              <div className="relative p-6 bg-gradient-to-r from-background/80 via-background/60 to-background/80 backdrop-blur-xl border-b border-border/10">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 opacity-50"></div>
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl blur-lg animate-pulse"></div>
                      <div className="relative p-3 bg-gradient-to-br from-primary/10 to-accent/10 backdrop-blur-xl rounded-2xl border border-border/20">
                        <MessageCircle className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        {selectedRoom ? selectedRoom.name : 'Live Chat'}
                      </h1>
                      <p className="text-sm text-muted-foreground/80 font-medium">
                        {messages.length} message{messages.length !== 1 ? 's' : ''} • {Object.keys(participantPoints).length} participants
                      </p>
                    </div>
                  </div>
                  {selectedRoom && (
                    <Button 
                      onClick={() => setSelectedRoom(null)}
                      variant="outline"
                      size="sm"
                      className="rounded-2xl bg-background/50 backdrop-blur-xl border-border/20 hover:bg-background/80 hover:scale-105 transition-all duration-300"
                    >
                      ← Global Chat
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex-1 flex flex-col min-h-0 px-6">
                {/* Messages Container */}
                <div
                  ref={scrollAreaRef}
                  className="flex-1 overflow-y-auto space-y-4 py-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border/20 hover:scrollbar-thumb-border/40"
                  style={{ 
                    touchAction: 'pan-y',
                    WebkitOverflowScrolling: 'touch',
                    overscrollBehavior: 'contain',
                  }}
                  onScroll={handleScroll}
                >
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full py-20 text-center">
                      <div className="relative mb-6">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl blur-2xl animate-pulse"></div>
                        <div className="relative p-6 bg-gradient-to-br from-muted/50 to-muted/30 backdrop-blur-xl rounded-3xl border border-border/20">
                          <MessageCircle className="h-12 w-12 text-muted-foreground/60" />
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-foreground mb-2">Start the conversation</h3>
                      <p className="text-muted-foreground max-w-sm">Be the first to share your thoughts and connect with others!</p>
                    </div>
                  ) : (
                    <>
                      {messages.map((message) => (
                        <div key={message.id} className="animate-fade-in">
                          <ChatMessage
                            message={message}
                            isOwn={message.user_id === currentUser?.id}
                            onQuote={handleQuoteMessage}
                            onDelete={(id) => deleteMessage(id)}
                            points={participantPoints[message.user_id] ?? 0}
                            roomOwnerUserId={selectedRoom?.created_by}
                          />
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>

                {/* Floating Scroll Button */}
                {isUserScrolling && (
                  <Button
                    onClick={scrollToBottom}
                    size="icon"
                    className="fixed bottom-32 right-8 rounded-full bg-gradient-to-r from-primary to-accent shadow-2xl border-0 hover:scale-110 transition-all duration-300 z-20"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                )}

                {/* Quote Preview */}
                {quotedMessage && (
                  <div className="mb-4 p-4 bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-xl rounded-2xl border border-border/20 shadow-lg">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        💬 Replying to {quotedMessage.user_profile?.name}
                      </span>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => setQuotedMessage(null)} 
                        className="h-8 w-8 p-0 rounded-full hover:bg-muted/50 hover:scale-110 transition-all duration-200"
                      >
                        ✕
                      </Button>
                    </div>
                    <QuotedMessage message={quotedMessage} compact />
                  </div>
                )}

                {/* Ultra Modern Message Input */}
                <div className="py-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 rounded-3xl blur-xl"></div>
                    <div className="relative flex gap-3 items-end bg-background/80 backdrop-blur-xl border border-border/20 rounded-3xl p-4 shadow-xl">
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
                        className="shrink-0 rounded-2xl h-12 w-12 bg-gradient-to-br from-muted/50 to-muted/30 hover:from-muted/70 hover:to-muted/50 hover:scale-110 transition-all duration-300 border border-border/20"
                      >
                        {uploadingImage ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <ImageIcon className="h-5 w-5" />
                        )}
                      </Button>

                      <div className="flex-1 min-h-0">
                        <Input
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Share your thoughts..."
                          className="border-0 focus-visible:ring-0 bg-transparent text-base p-0 placeholder:text-muted-foreground/60 font-medium"
                          maxLength={500}
                        />
                        {newMessage.length > 400 && (
                          <div className="text-xs text-muted-foreground/60 mt-2 font-medium">
                            {newMessage.length}/500 characters
                          </div>
                        )}
                      </div>
                      
                      <Button 
                        onClick={handleSendMessage} 
                        disabled={!newMessage.trim()} 
                        size="icon"
                        className="rounded-2xl h-12 w-12 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 disabled:opacity-50 shadow-lg hover:scale-110 transition-all duration-300 border-0"
                      >
                        <Send className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Rooms Content - Independent Container */}
        <TabsContent value="rooms" className="m-0">
          <div className="min-h-[75vh] max-h-[800px] relative overflow-hidden">
            {/* Modern Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-background to-accent/3 opacity-60"></div>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-accent/10"></div>
            <div className="absolute inset-0 backdrop-blur-3xl bg-background/40 border border-border/20 rounded-3xl shadow-2xl"></div>
            
            <div className="relative z-10 h-full p-6 rounded-3xl overflow-hidden">
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
          </div>
        </TabsContent>

        {/* Topics Content - Independent Container */}
        <TabsContent value="topics" className="m-0">
          <div className="min-h-[75vh] max-h-[800px] relative overflow-hidden">
            {/* Modern Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-background to-accent/3 opacity-60"></div>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-accent/10"></div>
            <div className="absolute inset-0 backdrop-blur-3xl bg-background/40 border border-border/20 rounded-3xl shadow-2xl"></div>
            
            <div className="relative z-10 h-full p-6 rounded-3xl overflow-hidden">
              <div className="h-full overflow-y-auto">
                <TopicsBoard />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
export default ChatRoom;