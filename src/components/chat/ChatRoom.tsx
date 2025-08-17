
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, MessageCircle, AlertCircle, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/contexts/AuthContext';
import { useAttendeeEventContext } from '@/contexts/AttendeeEventContext';
import { ChatMessage } from './ChatMessage';
import { QuotedMessage } from './QuotedMessage';

const ChatRoom = () => {
  const { currentUser } = useAuth();
  const { currentEventId, hasJoinedEvent } = useAttendeeEventContext();
  const { messages, loading, sendMessage } = useChat();
  const [newMessage, setNewMessage] = useState('');
  const [quotedMessage, setQuotedMessage] = useState<any>(null);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollViewportRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (scrollViewportRef.current) {
      scrollViewportRef.current.scrollTop = scrollViewportRef.current.scrollHeight;
    }
    setShowScrollButton(false);
  }, []);

  const handleScroll = useCallback(() => {
    if (!scrollViewportRef.current) return;
    
    const viewport = scrollViewportRef.current;
    const scrollTop = viewport.scrollTop;
    const scrollHeight = viewport.scrollHeight;
    const clientHeight = viewport.clientHeight;
    
    // Check if user is near the bottom (within 100px)
    const nearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setIsNearBottom(nearBottom);
    setShowScrollButton(!nearBottom && messages.length > 0);
  }, [messages.length]);

  // Set up scroll listener
  useEffect(() => {
    const viewport = scrollViewportRef.current;
    if (!viewport) return;

    viewport.addEventListener('scroll', handleScroll);
    return () => viewport.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Smart auto-scroll: only scroll to bottom if user is near bottom or it's a new message from current user
  useEffect(() => {
    if (messages.length === 0) return;
    
    const lastMessage = messages[messages.length - 1];
    const isOwnMessage = lastMessage?.user_id === currentUser?.id;
    
    // Auto-scroll if user is near bottom OR if it's their own message
    if (isNearBottom || isOwnMessage) {
      setTimeout(scrollToBottom, 100);
    } else {
      setShowScrollButton(true);
    }
  }, [messages, isNearBottom, currentUser?.id, scrollToBottom]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    await sendMessage(newMessage, quotedMessage?.id);
    setNewMessage('');
    setQuotedMessage(null);
  };

  const handleQuoteMessage = (message: any) => {
    setQuotedMessage(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Show message if user hasn't joined an event
  if (!hasJoinedEvent || !currentEventId) {
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

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-connect-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-[600px] flex flex-col">
      {/* New Stylish Header */}
      <div className="flex flex-col items-center p-4 border-b bg-gradient-to-r from-primary-50 via-white to-primary-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-t-md">
        <div className="flex items-center gap-3">
          <MessageCircle className="h-7 w-7 text-connect-600 dark:text-connect-300" />
          <span className="font-bold text-lg md:text-xl text-gray-900 dark:text-white">Event Chat</span>
        </div>
        <div className="mt-2">
          <Badge variant="secondary" className="text-xs font-medium">{messages.length} messages</Badge>
        </div>
      </div>

      <CardContent className="flex-1 flex flex-col p-0 relative">
        {/* Messages Area */}
        <div className="flex-1 bg-gray-50 dark:bg-gray-900 overflow-hidden">
          <div 
            ref={scrollViewportRef}
            className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600"
          >
            <div className="p-4 space-y-3">
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
                  />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>

        {/* Scroll to Bottom Button */}
        {showScrollButton && (
          <Button
            onClick={scrollToBottom}
            className="absolute bottom-20 right-4 rounded-full h-10 w-10 p-0 bg-primary hover:bg-primary/90 shadow-lg z-10"
            size="sm"
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
        )}

        {/* Quote Preview */}
        {quotedMessage && (
          <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border-t">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Replying to {quotedMessage.user_profile?.name}
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
        <div className="p-4 border-t bg-white dark:bg-gray-800">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1"
              maxLength={500}
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="bg-connect-600 hover:bg-connect-700"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Press Enter to send • {newMessage.length}/500
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatRoom;
