
import React, { useState, useRef, useEffect } from 'react';
import { Send, Quote, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/contexts/AuthContext';
import { ChatMessage } from './ChatMessage';
import { QuotedMessage } from './QuotedMessage';

const ChatRoom = () => {
  const { currentUser } = useAuth();
  const { messages, loading, sendMessage } = useChat();
  const [newMessage, setNewMessage] = useState('');
  const [quotedMessage, setQuotedMessage] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-connect-600" />
          Global Chat Room
          <Badge variant="secondary" className="ml-auto">
            {messages.length} messages
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900">
          {messages.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No messages yet. Start the conversation!</p>
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
