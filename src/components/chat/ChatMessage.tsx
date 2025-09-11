
import React, { useState } from 'react';
import { Quote, Clock, Trash2 } from 'lucide-react'; // added Trash2
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { QuotedMessage } from './QuotedMessage';
import { AttendeeProfileModal } from '@/components/attendee/AttendeeProfileModal';

interface ChatMessageProps {
  message: any;
  isOwn: boolean;
  onQuote: (message: any) => void;
  onConnect?: (userId: string) => void;
  onMessage?: (userId: string, userName: string, userPhoto?: string) => void;
  canDelete?: boolean;                 // added
  onDelete?: (message: any) => Promise<void>; // added
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ 
  message, 
  isOwn, 
  onQuote, 
  onConnect, 
  onMessage,
  canDelete,          // added
  onDelete            // added
}) => {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const timeAgo = formatDistanceToNow(new Date(message.created_at), { addSuffix: true });

  const handleAvatarClick = () => {
    if (!isOwn && message.user_profile) {
      setShowProfileModal(true);
    }
  };

  return (
    <>
      <div className={`flex gap-3 group ${isOwn ? 'flex-row-reverse' : ''}`}>
        <Avatar 
          className={`h-8 w-8 flex-shrink-0 ${!isOwn ? 'cursor-pointer hover:ring-2 hover:ring-connect-500 transition-all' : ''}`}
          onClick={handleAvatarClick}
        >
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

          {/* Delete Button (when allowed) */}
          {canDelete && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete?.(message)}
              className={`absolute ${isOwn ? '-left-8' : '-right-8'} bottom-0 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0`}
            >
              <Trash2 className="h-4 w-4 text-red-600" />
            </Button>
          )}
        </div>
      </div>
    </div>

    {/* Profile Modal */}
    <AttendeeProfileModal
      isOpen={showProfileModal}
      onClose={() => setShowProfileModal(false)}
      attendee={message.user_profile ? {
        id: message.user_id,
        name: message.user_profile.name,
        email: message.user_profile.email,
        photo_url: message.user_profile.photo_url,
        bio: message.user_profile.bio,
        niche: message.user_profile.niche,
        location: message.user_profile.location,
        company: message.user_profile.company,
        links: message.user_profile.links
      } : null}
      onConnect={onConnect}
      onMessage={onMessage}
    />
    </>
  );
};
