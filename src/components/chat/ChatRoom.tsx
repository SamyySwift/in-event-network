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
const ChatRoom = ({
  eventId
}: {
  eventId?: string;
}) => {
  const {
    currentUser
  } = useAuth();
  const {
    currentEventId,
    hasJoinedEvent
  } = useAttendeeEventContext();
  // NEW: room selection and tab state
  const [activeTab, setActiveTab] = useState<'chat' | 'rooms' | 'topics'>('chat');
  const [selectedRoom, setSelectedRoom] = useState<{
    id: string;
    name: string;
    color?: string | null;
    created_by?: string;
  } | null>(null);

  // Adjust useChat to include selected room id
  const {
    messages,
    loading,
    sendMessage,
    deleteMessage,
    participantPoints
  } = useChat(eventId, selectedRoom?.id || undefined);
  const [newMessage, setNewMessage] = useState('');
  const [quotedMessage, setQuotedMessage] = useState<any>(null);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const previousMessageCount = useRef(messages.length);
  const {
    toast
  } = useToast();
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
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
    const {
      scrollTop,
      scrollHeight,
      clientHeight
    } = e.currentTarget;
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
      toast({
        title: 'Unsupported file type',
        description: 'Please upload PNG, JPG, GIF, WEBP, or SVG.',
        variant: 'destructive'
      });
      e.target.value = '';
      return;
    }
    if (file.size > maxBytes) {
      toast({
        title: 'File too large',
        description: 'Your bucket limit is 1MB. Please upload an image under 1MB.',
        variant: 'destructive'
      });
      e.target.value = '';
      return;
    }
    const activeEventId = eventId ?? currentEventId;
    if (!activeEventId || !currentUser?.id) {
      toast({
        title: 'Cannot upload',
        description: 'You must be in an event and logged in to share images.',
        variant: 'destructive'
      });
      e.target.value = '';
      return;
    }
    try {
      setUploadingImage(true);
      const ext = (file.name.split('.').pop() || 'png').toLowerCase();
      const path = `${activeEventId}/${currentUser.id}/${Date.now()}.${ext}`;
      const {
        error: uploadError
      } = await supabase.storage.from('chat-uploads').upload(path, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type
      });
      if (uploadError) throw uploadError;
      const {
        data
      } = supabase.storage.from('chat-uploads').getPublicUrl(path);
      await sendMessage(data.publicUrl, quotedMessage?.id);
      toast({
        title: 'Image shared',
        description: 'Your image has been uploaded to the chat.'
      });
      setQuotedMessage(null);
      setIsUserScrolling(false);
      setTimeout(scrollToBottom, 100);
    } catch (err: any) {
      toast({
        title: 'Upload failed',
        description: err?.message || 'Please try again or choose a smaller image.',
        variant: 'destructive'
      });
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };
  if (!eventId && (!hasJoinedEvent || !currentEventId)) {
    return <Card>
        <CardContent className="p-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You need to scan into an event to access the chat room. Please scan the QR code provided by the event organizer.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>;
  }
  return <div className="h-[80vh] md:h-[700px] flex flex-col bg-gradient-to-br from-background/95 via-background/90 to-background/95 backdrop-blur-xl border border-border/20 rounded-2xl shadow-2xl overflow-hidden">
      {/* Main Content Area with Tabs */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <Tabs value={activeTab} onValueChange={v => setActiveTab(v as any)} className="flex-1 flex flex-col min-h-0 h-full">
          {/* Modern Header with Floating Navigation */}
          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 md:p-6 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 border-b border-border/10">
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
            
            {/* Floating Pill Navigation */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <div className="bg-background/80 backdrop-blur-xl border border-border/20 rounded-full p-1 shadow-lg">
                <TabsList className="bg-transparent border-0 h-8 p-0">
                  <TabsTrigger value="chat" className="rounded-full px-3 py-1 text-xs font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm">
                    Chat
                  </TabsTrigger>
                  <TabsTrigger value="rooms" className="rounded-full px-3 py-1 text-xs font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm">
                    Rooms
                  </TabsTrigger>
                  <TabsTrigger value="topics" className="rounded-full px-3 py-1 text-xs font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm">
                    Topics
                  </TabsTrigger>
                </TabsList>
              </div>
              
              {selectedRoom && <Button size="sm" variant="outline" onClick={() => setSelectedRoom(null)} className="rounded-full bg-background/50 backdrop-blur border-border/20 hover:bg-background/80 h-8 px-3 text-xs">
                  Back to Global
                </Button>}
            </div>
          </div>
          
          {/* Chat Content */}
          <TabsContent value="chat" className="flex-1 min-h-0 m-0 flex flex-col">
            {/* Messages Area */}
            <div 
              className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth scrollbar-thin scrollbar-thumb-muted/50 scrollbar-track-transparent"
              onScroll={handleScroll}
              ref={scrollAreaRef}
            >
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                  <MessageCircle className="h-8 w-8 mb-2 opacity-50" />
                  <p className="text-sm">No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    isOwn={message.user_id === currentUser?.id}
                    onQuote={handleQuoteMessage}
                    onDelete={deleteMessage}
                  />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Area */}
            <div className="border-t border-border/10 bg-background/50 backdrop-blur p-4">
              {quotedMessage && (
                <div className="mb-3 relative">
                  <QuotedMessage message={quotedMessage} compact />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setQuotedMessage(null)}
                    className="absolute -top-1 -right-1 h-6 w-6 p-0 rounded-full bg-background/80 hover:bg-background"
                  >
                    ×
                  </Button>
                </div>
              )}
              
              <div className="flex items-end gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="shrink-0 rounded-xl border-border/20 hover:bg-accent/50"
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
                    placeholder="Type your message..."
                    className="pr-12 rounded-xl border-border/20 bg-background/50 backdrop-blur focus:bg-background focus:border-primary/20"
                  />
                  <Button
                    size="sm"
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || uploadingImage}
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="rooms" className="flex-1 min-h-0 m-0">
            <RoomsPanel eventId={eventId ?? currentEventId} onEnterRoom={roomId => {
            supabase.from('chat_rooms').select('id,name,color,created_by').eq('id', roomId).single().then(({
              data
            }) => {
              if (data) setSelectedRoom({
                id: data.id,
                name: data.name,
                color: data.color,
                created_by: data.created_by
              });
            });
            setActiveTab('chat');
          }} />
          </TabsContent>

          <TabsContent value="topics" className="flex-1 min-h-0 m-0">
            <TopicsBoard className="p-4" />
          </TabsContent>
        </Tabs>
      </div>
    </div>;
};
export default ChatRoom;