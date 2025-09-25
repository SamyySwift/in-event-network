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
    <div className="fixed inset-0 md:relative md:inset-auto h-screen md:h-[85vh] flex flex-col bg-gradient-to-br from-background/95 via-background/90 to-background/85 backdrop-blur-xl border border-white/10 dark:border-white/5 shadow-2xl md:rounded-3xl overflow-hidden">
      {/* Modern WhatsApp-style Header */}
      <div className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 backdrop-blur-md border-b border-white/10 dark:border-white/5">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-50" />
        <div className="relative flex items-center justify-between px-4 py-3 md:px-6 md:py-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-primary" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background" />
            </div>
            <div className="flex flex-col">
              <h2 className="font-semibold text-foreground text-sm md:text-base">
                {selectedRoom ? selectedRoom.name : 'Event Chat'}
              </h2>
              <p className="text-xs text-muted-foreground">
                {messages.length} messages • online
              </p>
            </div>
          </div>

          {/* Tab Pills - Mobile optimized */}
          <div className="flex bg-white/10 dark:bg-black/10 backdrop-blur-sm rounded-2xl p-1 border border-white/20 dark:border-white/10">
            {(['chat', 'rooms', 'topics'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 text-xs font-medium rounded-xl transition-all duration-200 ${
                  activeTab === tab
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/10'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 min-h-0 relative">
        {activeTab === 'chat' && (
          <div className="h-full flex flex-col">
            {/* Room Info Bar */}
            {selectedRoom && (
              <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-white/5 to-transparent backdrop-blur-sm border-b border-white/5">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full shadow-sm" 
                    style={{ backgroundColor: selectedRoom.color || '#3b82f6' }} 
                  />
                  <span className="text-sm font-medium text-foreground">{selectedRoom.name}</span>
                </div>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => setSelectedRoom(null)}
                  className="text-xs h-7 px-3 rounded-full hover:bg-white/10"
                >
                  Back to Global
                </Button>
              </div>
            )}

            {/* Messages Area - WhatsApp-style */}
            <div className="relative flex-1 overflow-hidden">
              {/* Chat Background Pattern */}
              <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(circle_at_center,_var(--foreground)_1px,_transparent_1px)] bg-[length:20px_20px]" />
              
              <div
                ref={scrollAreaRef}
                className="h-full overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20 hover:scrollbar-thumb-white/30 px-4 py-6"
                style={{ 
                  touchAction: 'pan-y',
                  WebkitOverflowScrolling: 'touch',
                  overscrollBehavior: 'contain',
                }}
                onScroll={handleScroll}
              >
                <div className="space-y-4 min-h-full flex flex-col justify-end">
                  {messages.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center py-12">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                          <MessageCircle className="h-10 w-10 text-primary/50" />
                        </div>
                        <h3 className="text-lg font-medium text-foreground mb-2">No messages yet</h3>
                        <p className="text-muted-foreground">Start the conversation and break the ice!</p>
                      </div>
                    </div>
                  ) : (
                    messages.map((message, index) => (
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
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Scroll to Bottom Fab */}
              {isUserScrolling && (
                <div className="absolute bottom-6 right-6 z-10">
                  <Button
                    onClick={scrollToBottom}
                    size="icon"
                    className="w-12 h-12 rounded-full bg-primary/90 hover:bg-primary shadow-lg shadow-primary/25 backdrop-blur-sm border border-white/10"
                  >
                    <ArrowDown className="h-5 w-5" />
                  </Button>
                </div>
              )}
            </div>

            {/* Quote Preview - Modern Style */}
            {quotedMessage && (
              <div className="mx-4 mb-2 p-3 rounded-2xl bg-gradient-to-r from-primary/10 to-primary/5 backdrop-blur-sm border border-white/10 animate-slide-in-right">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-primary">
                    Replying to {quotedMessage.user_profile?.name}
                  </span>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => setQuotedMessage(null)} 
                    className="h-6 w-6 p-0 rounded-full hover:bg-white/10"
                  >
                    ×
                  </Button>
                </div>
                <QuotedMessage message={quotedMessage} compact />
              </div>
            )}

            {/* Modern Input Area - WhatsApp Style */}
            <div className="p-4 bg-gradient-to-t from-background/50 to-transparent backdrop-blur-sm">
              <div className="relative flex items-end gap-3 p-2 rounded-3xl bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-md border border-white/20 dark:border-white/10 shadow-lg">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/gif,image/webp,image/svg+xml"
                  className="hidden"
                  onChange={handleImageChange}
                />
                
                {/* Attachment Button */}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="shrink-0 w-10 h-10 rounded-full hover:bg-white/10 transition-all duration-200"
                >
                  {uploadingImage ? (
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  ) : (
                    <ImageIcon className="h-5 w-5 text-muted-foreground" />
                  )}
                </Button>

                {/* Message Input */}
                <div className="flex-1 max-h-32 overflow-y-auto">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className="border-0 bg-transparent focus-visible:ring-0 text-foreground placeholder:text-muted-foreground resize-none text-base"
                    maxLength={500}
                  />
                </div>

                {/* Send Button */}
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  size="icon"
                  className="shrink-0 w-10 h-10 rounded-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Character Count */}
              {newMessage.length > 400 && (
                <div className="text-xs text-muted-foreground mt-2 text-center">
                  {newMessage.length}/500 characters
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'rooms' && (
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
        )}

        {activeTab === 'topics' && (
          <div className="h-full flex flex-col">
            <div className="hidden md:flex items-center gap-3 p-4 border-b border-white/10">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <span className="font-semibold text-foreground">Topics</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <TopicsBoard />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default ChatRoom;