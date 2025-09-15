// ChatRoom component
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, MessageCircle, AlertCircle, Sparkles, Image as ImageIcon, Loader2 } from 'lucide-react';
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

const ChatRoom = ({ eventId }: { eventId?: string }) => {
  const { currentUser } = useAuth();
  const { currentEventId, hasJoinedEvent } = useAttendeeEventContext();
  const { messages, loading, sendMessage, deleteMessage, participantPoints } = useChat(eventId);
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

  const [mobileView, setMobileView] = useState<'chat' | 'topics'>('chat');
  const isAdminOverride = !!eventId;

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
    <Card className="h-[70vh] md:h-[600px] flex flex-col">
      {/* Header */}
      <div className="flex flex-col items-center p-4 border-b bg-gradient-to-r from-primary-50 via-white to-primary-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-t-md">
        <div className="flex items-center gap-3">
          <MessageCircle className="h-7 w-7 text-connect-600 dark:text-connect-300" />
          <span className="font-bold text-lg md:text-xl text-gray-900 dark:text-white">Event Chat</span>
        </div>
        <div className="mt-2">
          <Badge variant="secondary" className="text-xs font-medium">{messages.length} messages</Badge>
        </div>
        {!isAdminOverride && (
          <div className="mt-3 md:hidden">
            <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <Button size="sm" variant={mobileView === 'chat' ? 'default' : 'ghost'} className={mobileView === 'chat' ? 'bg-connect-600 text-white' : ''} onClick={() => setMobileView('chat')}>Chat</Button>
              <Button size="sm" variant={mobileView === 'topics' ? 'default' : 'ghost'} className={mobileView === 'topics' ? 'bg-connect-600 text-white' : ''} onClick={() => setMobileView('topics')}>Topics</Button>
            </div>
          </div>
        )}
      </div>

      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden min-h-0">
        <div className="flex-1 flex flex-col md:grid md:grid-cols-3 md:divide-x md:divide-gray-200 dark:md:divide-gray-700 min-h-0">
          {/* Chat Column */}
          <div className={`flex-1 flex flex-col ${mobileView === 'chat' ? 'block' : 'hidden'} md:flex md:col-span-2 min-h-0`}>
            <div
              ref={scrollAreaRef}
              className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 scroll-smooth"
              style={{ scrollbarWidth: 'thin', scrollbarColor: 'hsl(var(--border)) transparent' }}
              onScroll={handleScroll}
            >
              <div className="p-4 space-y-3 min-h-full">
                {messages.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No messages yet. Start the conversation with your fellow attendees!</p>
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
                    />
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Quote Preview */}
            {quotedMessage && (
              <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border-t">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    Replying to {quotedMessage.user_profile?.name}
                  </span>
                  <Button size="sm" variant="ghost" onClick={() => setQuotedMessage(null)} className="h-6 w-6 p-0">×</Button>
                </div>
                <QuotedMessage message={quotedMessage} compact />
              </div>
            )}

            {/* Message Input */}
            <div className="p-4 border-t bg-white dark:bg-gray-800">
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/gif,image/webp,image/svg+xml"
                  className="hidden"
                  onChange={handleImageChange}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="shrink-0"
                  title="Upload image"
                >
                  {uploadingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
                </Button>

                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1"
                  maxLength={500}
                />
                <Button onClick={handleSendMessage} disabled={!newMessage.trim()} className="bg-connect-600 hover:bg-connect-700">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-xs text-gray-500 mt-1">Press Enter to send • {newMessage.length}/500</div>
            </div>
          </div>

          {/* Topics Column */}
          {!isAdminOverride && (
            <div className={`flex-1 ${mobileView === 'topics' ? 'block' : 'hidden'} md:block md:col-span-1 bg-white dark:bg-gray-800 min-h-0`}>
              <div className="h-full flex flex-col">
                <div className="hidden md:flex items-center gap-2 p-4 border-b bg-white dark:bg-gray-800">
                  <Sparkles className="h-5 w-5 text-connect-600 dark:text-connect-300" />
                  <span className="font-semibold text-gray-900 dark:text-white">Topics</span>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  <TopicsBoard />
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
export default ChatRoom;
