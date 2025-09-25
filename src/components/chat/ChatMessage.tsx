import React, { useState } from "react";
import { Quote, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { QuotedMessage } from "./QuotedMessage";
import { AttendeeProfileModal } from "@/components/attendee/AttendeeProfileModal";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";

interface ChatMessageProps {
  message: any;
  isOwn: boolean;
  onQuote: (message: any) => void;
  onConnect?: (userId: string) => void;
  onMessage?: (userId: string, userName: string, userPhoto?: string) => void;
  onDelete?: (id: string) => void | Promise<void>;
  points?: number;
  roomOwnerUserId?: string;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isOwn,
  onQuote,
  onConnect,
  onMessage,
  onDelete,
  points,
  roomOwnerUserId,
}) => {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const { currentUser } = useAuth();
  
  const timeAgo = formatDistanceToNow(new Date(message.created_at), {
    addSuffix: true,
  });

  const handleAvatarClick = () => {
    if (!isOwn && message.user_profile) {
      setShowProfileModal(true);
    }
  };

  const canDelete = isOwn || currentUser?.role === "host";

  // Role detection
  const role = String(message.user_profile?.role ?? "").toLowerCase();
  const isFromAdmin = ["admin", "host", "organizer", "owner", "moderator"].includes(role);
  const isRoomOwner = !!roomOwnerUserId && message.user_id === roomOwnerUserId;

  // Display name
  const rawName = message.user_profile?.name ?? "";
  const isRawNameUnknownUser = ["unknown user", "unknow user", "unknown"].includes(
    rawName.trim().toLowerCase()
  );
  const displayName = isRawNameUnknownUser
    ? "Admin"
    : (rawName || (isFromAdmin ? "Admin" : isOwn ? "You" : "Admin"));

  // Image detection
  const isImageUrl = (s: string) => {
    if (!s) return false;
    try {
      const url = new URL(s);
      return /\.(png|jpe?g|gif|webp|svg)$/i.test(url.pathname);
    } catch {
      return false;
    }
  };

  return (
    <>
      <div className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""} group transition-all duration-200`}>
        {/* Avatar */}
        <div className="flex-shrink-0">
          <Avatar
            className={`h-9 w-9 ${
              !isOwn ? "cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all" : ""
            }`}
            onClick={handleAvatarClick}
          >
            {message.user_profile?.photo_url ? (
              <AvatarImage
                src={message.user_profile.photo_url}
                alt={message.user_profile?.name}
                className="object-cover"
              />
            ) : (
              <AvatarFallback className="bg-muted text-foreground font-medium">
                {message.user_profile?.name?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            )}
          </Avatar>
        </div>

        {/* Message Content */}
        <div className={`flex-1 min-w-0 max-w-[85%] ${isOwn ? "items-end" : "items-start"} flex flex-col`}>
          {/* Header Info */}
          <div className={`flex items-baseline gap-2 mb-1 ${isOwn ? "flex-row-reverse" : ""}`}>
            <span
              onClick={!isOwn && message.user_profile ? handleAvatarClick : undefined}
              className={`text-sm font-semibold ${
                isOwn
                  ? "text-foreground"
                  : "text-primary hover:underline cursor-pointer"
              } truncate`}
            >
              {displayName}
            </span>
            
            {/* Badges */}
            {isFromAdmin && (
              <Badge variant="destructive" className="text-xs px-1.5 py-0">
                Admin
              </Badge>
            )}
            {isRoomOwner && (
              <Badge variant="outline" className="text-xs px-1.5 py-0">
                Owner
              </Badge>
            )}
            
            <span className="text-xs text-muted-foreground">
              {timeAgo}
            </span>
          </div>

          {/* Quoted Message */}
          {message.quoted_message && (
            <div className={`mb-2 ${isOwn ? "ml-auto" : ""} max-w-full`}>
              <QuotedMessage message={message.quoted_message} compact />
            </div>
          )}

          {/* Message Bubble */}
          <div
            className={`relative group/message rounded-2xl px-4 py-2.5 max-w-full break-words ${
              isOwn
                ? "bg-primary text-primary-foreground rounded-br-md"
                : "bg-muted text-foreground rounded-bl-md border border-border"
            }`}
          >
            {isImageUrl(message.content) ? (
              <a
                href={message.content}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <img
                  src={message.content}
                  alt="Shared image"
                  className="max-h-60 max-w-full rounded-lg object-contain bg-background"
                  loading="lazy"
                />
              </a>
            ) : (
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {message.content}
              </p>
            )}

            {/* Action Buttons */}
            <div className={`absolute -top-8 ${isOwn ? "left-0" : "right-0"} opacity-0 group-hover:opacity-100 transition-opacity bg-background border border-border rounded-full px-1 py-1 shadow-sm`}>
              {onQuote && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onQuote(message)}
                  className="h-6 w-6 p-0 hover:bg-muted"
                >
                  <Quote className="h-3 w-3" />
                </Button>
              )}
              
              {canDelete && onDelete && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    if (confirm("Delete this message?")) onDelete(message.id);
                  }}
                  className="h-6 w-6 p-0 text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Modal */}
      <AttendeeProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        attendee={
          message.user_profile
            ? {
                id: message.user_id,
                name: message.user_profile.name,
                email: message.user_profile.email,
                photo_url: message.user_profile.photo_url,
                bio: message.user_profile.bio,
                niche: message.user_profile.niche,
                location: message.user_profile.location,
                company: message.user_profile.company,
                links: message.user_profile.links,
              }
            : null
        }
        onConnect={onConnect}
        onMessage={onMessage}
      />
    </>
  );
};