
import React, { useState } from 'react';
import { Quote, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { QuotedMessage } from './QuotedMessage';
import { AttendeeProfileModal } from '@/components/attendee/AttendeeProfileModal';
import { Badge } from '@/components/ui/badge';
import { Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface ChatMessageProps {
  message: any;
  isOwn: boolean;
  onQuote: (message: any) => void;
  onConnect?: (userId: string) => void;
  onMessage?: (userId: string, userName: string, userPhoto?: string) => void;
  onDelete?: (id: string) => void | Promise<void>;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ 
  message, 
  isOwn, 
  onQuote, 
  onConnect, 
  onMessage,
  onDelete
}) => {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const timeAgo = formatDistanceToNow(new Date(message.created_at), { addSuffix: true });

  const handleAvatarClick = () => {
    if (!isOwn && message.user_profile) {
      setShowProfileModal(true);
    }
  };
  const { currentUser } = useAuth();
  const canDelete = isOwn || currentUser?.role === 'host';
  const isFromAdmin = message.user_profile?.role === 'host' || message.user_profile?.role === 'admin';

  return (
    <>
      <div className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''} group`}>
        {/* Avatar and main container */}
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
          {!isOwn && isFromAdmin && (
            <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Admin</Badge>
          )}
          <span className="text-xs text-gray-500 dark:text-gray-400">{timeAgo}</span>
        </div>

        {/* NEW: quoted preview (if this message is replying to another) */}
        {message.quoted_message && (
          <div className={`mb-1 ${isOwn ? 'ml-auto' : ''} max-w-[80%]`}>
            <QuotedMessage message={message.quoted_message} compact />
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

        {/* Quote Button (allow quoting any message) */}
        {onQuote && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onQuote(message)}
            className={`absolute ${isOwn ? '-left-8' : '-right-8'} top-0 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0`}
            title="Quote to reply"
          >
            <Quote className="h-4 w-4" />
          </Button>
        )}

        {/* Delete Button (owner or admin) */}
        {canDelete && onDelete && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              if (confirm('Delete this message?')) onDelete(message.id);
            }}
            className={`absolute ${isOwn ? '-left-8' : '-right-8'} top-8 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 text-destructive`}
            title="Delete message"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
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
}
