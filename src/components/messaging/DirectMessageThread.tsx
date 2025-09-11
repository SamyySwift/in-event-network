
// Top-level imports section
import React, { useState, useRef, useEffect } from 'react';
import { Send, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useDirectMessages, DirectMessage } from '@/hooks/useDirectMessages';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { useNetworking } from '@/hooks/useNetworking';
import { useAuth } from '@/contexts/AuthContext';

interface DirectMessageThreadProps {
  recipientId?: string;
  recipientName?: string;
  recipientPhoto?: string;
  onBack: () => void;
  conversation?: {
    userId: string;
    userName: string;
    userPhoto?: string;
  };
}

export const DirectMessageThread: React.FC<DirectMessageThreadProps> = ({
  recipientId,
  recipientName,
  recipientPhoto,
  onBack,
  conversation
}) => {
  // Use conversation props if available, otherwise use direct props
  const actualRecipientId = conversation?.userId || recipientId;
  const actualRecipientName = conversation?.userName || recipientName || 'Unknown User';
  const actualRecipientPhoto = conversation?.userPhoto || recipientPhoto;

  const { messages, loading, sendMessage } = useDirectMessages(actualRecipientId);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Add networking and auth context to reflect connection status
  const { getConnectionStatus, acceptConnectionRequest, declineConnectionRequest } = useNetworking();
  const { currentUser } = useAuth();

  const connectionStatus = actualRecipientId ? getConnectionStatus(actualRecipientId) : undefined;
  const isPending = connectionStatus?.status === 'pending';
  const isRejected = connectionStatus?.status === 'rejected';
  const isRequester = connectionStatus?.requester_id === currentUser?.id;

  const mySentCount = messages.filter(m => m.sender_id === currentUser?.id).length;
  const hasUsedIntroMessage = mySentCount > 0;

  // Can send if:
  // - No connection yet (first message allowed)
  // - Accepted connection
  // - Pending AND I am requester AND I haven't used my one introductory message
  const canSendNow =
    !connectionStatus ||
    connectionStatus?.status === 'accepted' ||
    (isPending && isRequester && !hasUsedIntroMessage);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !actualRecipientId) return;
    await sendMessage(actualRecipientId, newMessage);
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Add safety check for required props
  if (!actualRecipientId) {
    return (
      <Card className="h-[600px] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400">No conversation selected</p>
          <Button variant="outline" onClick={onBack} className="mt-4">
            Back to Conversations
          </Button>
        </div>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="h-[600px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-connect-600"></div>
      </Card>
    );
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Avatar className="h-8 w-8">
            {actualRecipientPhoto ? (
              <AvatarImage src={actualRecipientPhoto} alt={actualRecipientName} />
            ) : (
              <AvatarFallback className="bg-connect-100 text-connect-600 dark:bg-connect-900 dark:text-connect-300">
                {actualRecipientName.charAt(0).toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>
          <h3 className="font-medium text-gray-900 dark:text-white">{actualRecipientName}</h3>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Connection Status Banner */}
        {(isPending || isRejected) && (
          <div className="px-4 py-3 border-b bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200">
            {isPending && (
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="text-sm">
                  {isRequester ? (
                    hasUsedIntroMessage ? (
                      <span>
                        Connection request pending. You've sent your introductory message. You'll be able to continue once your request is accepted.
                      </span>
                    ) : (
                      <span>
                        Connection request pending. You can send one introductory message while you wait.
                      </span>
                    )
                  ) : (
                    <span>
                      Connection request pending from {actualRecipientName}. Accept to start messaging.
                    </span>
                  )}
                </div>
                {!isRequester && connectionStatus && (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="default"
                      className="bg-connect-600 hover:bg-connect-700"
                      onClick={() => acceptConnectionRequest(connectionStatus.id)}
                    >
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => declineConnectionRequest(connectionStatus.id)}
                    >
                      Decline
                    </Button>
                  </div>
                )}
              </div>
            )}
            {isRejected && (
              <div className="text-sm">
                Connection request was declined. Messaging is blocked until a new connection request is initiated and accepted.
              </div>
            )}
          </div>
        )}

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900">
          {messages.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => (
              <DirectMessageBubble
                key={message.id}
                message={message}
                isOwn={message.sender_id === actualRecipientId ? false : true}
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

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
              disabled={!canSendNow}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || !canSendNow}
              className="bg-connect-600 hover:bg-connect-700"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface DirectMessageBubbleProps {
  message: DirectMessage;
  isOwn: boolean;
}

const DirectMessageBubble: React.FC<DirectMessageBubbleProps> = ({ message, isOwn }) => {
  const timeAgo = formatDistanceToNow(new Date(message.created_at), { addSuffix: true });
  const profile = isOwn ? message.sender_profile : message.recipient_profile;
  const profileName = profile?.name || 'Unknown User';
  const isFromAdmin = profile?.role === 'host' || profile?.role === 'admin';

  return (
    <div className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}>
      <Avatar className="h-8 w-8 flex-shrink-0">
        {profile?.photo_url ? (
          <AvatarImage src={profile.photo_url} alt={profileName} />
        ) : (
          <AvatarFallback className="bg-connect-100 text-connect-600 dark:bg-connect-900 dark:text-connect-300 text-sm">
            {profileName.charAt(0).toUpperCase()}
          </AvatarFallback>
        )}
      </Avatar>

      <div className={`flex-1 min-w-0 ${isOwn ? 'text-right' : ''}`}>
        <div className={`flex items-center gap-2 mb-1 ${isOwn ? 'justify-end' : ''}`}>
          {isFromAdmin && (
            <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
              Admin
            </Badge>
          )}
          <span className="text-xs text-gray-500 dark:text-gray-400">{timeAgo}</span>
        </div>

        <div
          className={`rounded-lg px-3 py-2 break-words max-w-[80%] ${
            isOwn
              ? 'bg-connect-600 text-white ml-auto'
              : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
          } ${isOwn ? 'ml-auto' : ''}`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    </div>
  );
};
