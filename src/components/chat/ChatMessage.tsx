
import React from 'react';
import { Quote, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { QuotedMessage } from './QuotedMessage';

interface ChatMessageProps {
  message: any;
  isOwn: boolean;
  onQuote: (message: any) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, isOwn, onQuote }) => {
  const timeAgo = formatDistanceToNow(new Date(message.created_at), { addSuffix: true });

  return (
    <div className={`flex gap-3 group ${isOwn ? 'flex-row-reverse' : ''}`}>
      <Avatar className="h-8 w-8 flex-shrink-0">
        {message.user_profile?.photo_url ? (
          <AvatarImage src={message.user_profile.photo_url} alt={message.user_profile?.name} />
        ) : (
          <AvatarFallback className="bg-connect-100 text-connect-600 dark:bg-connect-900 dark:text-connect-300 text-sm">
            {message.user_profile?.name?.charAt(0) || 'U'}
          </AvatarFallback>
        )}
      </Avatar>

      <div className={`flex-1 min-w-0 ${isOwn ? 'text-right' : ''}`}>
        <div className={`flex items-center gap-2 mb-1 ${isOwn ? 'justify-end' : ''}`}>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {message.user_profile?.name || 'Unknown User'}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {timeAgo}
          </span>
        </div>

        <div className={`relative ${isOwn ? 'ml-8' : 'mr-8'}`}>
          {/* Quoted Message */}
          {message.quoted_message && (
            <div className="mb-2">
              <QuotedMessage message={message.quoted_message} />
            </div>
          )}

          {/* Main Message */}
          <div
            className={`rounded-lg px-3 py-2 break-words ${
              isOwn
                ? 'bg-connect-600 text-white ml-auto'
                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
            } max-w-[80%] ${isOwn ? 'ml-auto' : ''}`}
          >
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          </div>

          {/* Quote Button */}
          {!isOwn && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onQuote(message)}
              className="absolute -right-8 top-0 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
            >
              <Quote className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
