import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Image as ImageIcon, Sparkles, Minimize2, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  imageUrl?: string;
  timestamp: Date;
}

interface FloatingAIAssistantProps {
  eventId: string;
}

export const FloatingAIAssistant: React.FC<FloatingAIAssistantProps> = ({ eventId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: "👋 Hi! I'm your AI event assistant. Ask me anything about the event, sessions, speakers, or even request an image!",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isImageMode, setIsImageMode] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Convert messages to the format expected by the AI API
      const conversationHistory = [...messages, userMessage].map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

      const { data, error } = await supabase.functions.invoke('event-ai-assistant', {
        body: { 
          messages: conversationHistory,
          eventId,
          action: isImageMode ? 'generate_image' : 'chat'
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: data.message || data.reply || 'I apologize, but I encountered an error.',
        imageUrl: data.imageUrl,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      if (isImageMode) {
        setIsImageMode(false);
        toast.success('Image generated!');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to get response. Please try again.');
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 z-50 group"
        size="icon"
      >
        <Bot className="h-6 w-6 group-hover:scale-110 transition-transform" />
      </Button>
    );
  }

  return (
    <Card className={cn(
      "fixed bottom-4 right-4 shadow-2xl z-50 transition-all duration-300",
      isMinimized ? "w-72 h-14" : "w-80 sm:w-96 h-[450px] sm:h-[500px] flex flex-col"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          <div>
            <h3 className="font-semibold text-sm">AI Event Assistant</h3>
            {!isMinimized && (
              <p className="text-xs text-white/80">Ask me anything!</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-white/20 text-white"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-white/20 text-white"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex",
                    msg.type === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg p-3 space-y-2",
                      msg.type === 'user'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    )}
                  >
                    {msg.imageUrl && (
                      <img
                        src={msg.imageUrl}
                        alt="Generated"
                        className="rounded-lg w-full"
                      />
                    )}
                    <div className="text-sm whitespace-pre-wrap">
                      {msg.content.split(/(https?:\/\/[^\s]+)/g).map((part, i) => {
                        if (part.match(/^https?:\/\//)) {
                          return (
                            <a
                              key={i}
                              href={part}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={cn(
                                "underline hover:opacity-80 break-all",
                                msg.type === 'user' ? 'text-white' : 'text-blue-600'
                              )}
                            >
                              {part}
                            </a>
                          );
                        }
                        return <span key={i}>{part}</span>;
                      })}
                    </div>
                    <p className={cn(
                      "text-xs",
                      msg.type === 'user' ? 'text-white/70' : 'text-gray-500'
                    )}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg p-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Quick Actions */}
          <div className="px-4 pb-2 flex gap-2 flex-wrap">
            <Badge
              variant={isImageMode ? "default" : "outline"}
              className="cursor-pointer hover:bg-purple-100"
              onClick={() => {
                setIsImageMode(!isImageMode);
                if (!isImageMode) {
                  toast.info('Image mode active. Describe the image you want!');
                }
              }}
            >
              <ImageIcon className="h-3 w-3 mr-1" />
              {isImageMode ? 'Image Mode ON' : 'Generate Image'}
            </Badge>
          </div>

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isImageMode ? "Describe the image you want..." : "Ask me anything..."}
                className="flex-1"
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                size="icon"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isImageMode ? <ImageIcon className="h-4 w-4" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
            {isImageMode && (
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Image generation mode active
              </p>
            )}
          </div>
        </>
      )}
    </Card>
  );
};
