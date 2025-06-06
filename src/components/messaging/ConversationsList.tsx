
import React from 'react';
import { MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useDirectMessages, Conversation } from '@/hooks/useDirectMessages';
import { formatDistanceToNow } from 'date-fns';

interface ConversationsListProps {
  onSelectConversation: (userId: string, userName: string, userPhoto?: string) => void;
}

export const ConversationsList: React.FC<ConversationsListProps> = ({ onSelectConversation }) => {
  const { conversations, loading } = useDirectMessages();

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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-connect-600" />
          Your Conversations
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {conversations.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400 px-6">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No conversations yet.</p>
            <p className="text-sm mt-1">Connect with other attendees to start messaging!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {conversations.map((conversation) => (
              <ConversationItem
                key={conversation.conversation_id}
                conversation={conversation}
                onClick={() => onSelectConversation(
                  conversation.other_user_id,
                  conversation.other_user_profile?.name || 'Unknown User',
                  conversation.other_user_profile?.photo_url
                )}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface ConversationItemProps {
  conversation: Conversation;
  onClick: () => void;
}

const ConversationItem: React.FC<ConversationItemProps> = ({ conversation, onClick }) => {
  const timeAgo = formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: true });

  return (
    <div
      onClick={onClick}
      className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
    >
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10 flex-shrink-0">
          {conversation.other_user_profile?.photo_url ? (
            <AvatarImage 
              src={conversation.other_user_profile.photo_url} 
              alt={conversation.other_user_profile?.name} 
            />
          ) : (
            <AvatarFallback className="bg-connect-100 text-connect-600 dark:bg-connect-900 dark:text-connect-300">
              {conversation.other_user_profile?.name?.charAt(0) || 'U'}
            </AvatarFallback>
          )}
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-medium text-gray-900 dark:text-white truncate">
              {conversation.other_user_profile?.name || 'Unknown User'}
            </h4>
            <div className="flex items-center gap-2">
              {conversation.unread_count > 0 && (
                <Badge variant="default" className="bg-connect-600">
                  {conversation.unread_count}
                </Badge>
              )}
              <span className="text-xs text-gray-500 dark:text-gray-400">{timeAgo}</span>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
            {conversation.is_sent_by_me ? 'You: ' : ''}{conversation.last_message}
          </p>
        </div>
      </div>
    </div>
  );
};
