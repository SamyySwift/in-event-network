// Top imports
import React, { useState, useRef } from "react";
import { Quote, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { QuotedMessage } from "./QuotedMessage";
import { AttendeeProfileModal } from "@/components/attendee/AttendeeProfileModal";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface ChatMessageProps {
  message: any;
  isOwn: boolean;
  onQuote: (message: any) => void;
  onConnect?: (userId: string) => void;
  onMessage?: (userId: string, userName: string, userPhoto?: string) => void;
  onDelete?: (id: string) => void | Promise<void>;
  points?: number;
  // NEW: room owner id for current room
  roomOwnerUserId?: string;
}

export const ChatMessage: React.FC<ChatMessageProps> = React.memo(({
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
  const timeAgo = formatDistanceToNow(new Date(message.created_at), {
    addSuffix: true,
  });

  const handleAvatarClick = () => {
    if (!isOwn && message.user_profile) {
      setShowProfileModal(true);
    }
  };

  // CHANGE: widen delete permission to include admins too (optional, but common)
  const { currentUser } = useAuth();
  const canDelete = isOwn || currentUser?.role === "host";

  // --- NEW: swipe-to-reply state/refs ---
  const [translateX, setTranslateX] = useState(0);
  const startXRef = useRef<number | null>(null);
  const isSwipingRef = useRef(false);
  const swipeTriggeredRef = useRef(false);
  const SWIPE_TRIGGER_PX = 60; // drag distance to trigger quote

  const onTouchStart = (e: React.TouchEvent) => {
    if (!onQuote) return;
    swipeTriggeredRef.current = false;
    isSwipingRef.current = true;
    startXRef.current = e.touches[0]?.clientX ?? null;
    setTranslateX(0);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!onQuote || !isSwipingRef.current || startXRef.current == null) return;
    const currentX = e.touches[0]?.clientX ?? 0;
    const deltaX = currentX - startXRef.current;

    // Allow swiping in from either side, but ignore tiny moves
    if (Math.abs(deltaX) < 2) return;

    // Only show movement in the direction “towards” reply:
    // For non-own messages, swipe right-to-left; for own, swipe left-to-right
    const intendedDir = isOwn ? -1 : 1;
    const adjusted = Math.max(0, intendedDir * deltaX);
    setTranslateX(adjusted);

    if (!swipeTriggeredRef.current && adjusted > SWIPE_TRIGGER_PX) {
      swipeTriggeredRef.current = true;
      onQuote?.(message);
    }
  };

  const onTouchEnd = () => {
    isSwipingRef.current = false;
    startXRef.current = null;
    // Snap back
    setTranslateX(0);
  };

  // Robust admin role detection (case-insensitive + common synonyms)
  // Derive admin from PROFILE role (messages don't store roles)
  const role = String(message.user_profile?.role ?? "").toLowerCase();
  const isFromAdmin = ["admin", "host", "organizer", "owner", "moderator"].includes(role);

  // NEW: mark if user is room owner to show badge
  const isRoomOwner = !!roomOwnerUserId && message.user_id === roomOwnerUserId;

  // Fix display name logic - only show "Admin" for actual admins
  const rawName = message.user_profile?.name ?? "";
  const displayName = rawName || (isFromAdmin ? "Admin" : isOwn ? "You" : "User");

  // Memoized achievements & styles based on points for performance  
  const achievement = React.useMemo(() => getAchievement(points ?? 0), [points]);
  const { medals, hasFireGlow, hasDiamond } = achievement;
  
  const avatarGlow = React.useMemo(() => 
    hasDiamond
      ? "ring-4 ring-cyan-300 shadow-lg animate-pulse"
      : hasFireGlow
      ? "ring-2 ring-orange-400 shadow-md animate-pulse"
      : medals > 0
      ? "ring-2 ring-yellow-300"
      : "", [hasDiamond, hasFireGlow, medals]);
      
  const bubbleExtra = React.useMemo(() => 
    hasDiamond
      ? "border-2 border-cyan-300 shadow-lg"
      : hasFireGlow
      ? "border-2 border-orange-300 shadow-md"
      : "", [hasDiamond, hasFireGlow]);

  // Basic image URL detector
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
      <div className={`flex gap-4 ${isOwn ? "flex-row-reverse" : ""} group animate-fade-in`}>
        {/* Avatar Section */}
        <div className="relative flex-shrink-0">
          <div className="relative">
            <Avatar
              className={`h-10 w-10 border-2 border-background shadow-lg ${
                !isOwn ? "cursor-pointer hover:scale-110 transition-all duration-300" : ""
              } ${avatarGlow}`}
              onClick={handleAvatarClick}
            >
              {message.user_profile?.photo_url ? (
                <AvatarImage
                  src={message.user_profile.photo_url}
                  alt={message.user_profile?.name}
                  className="object-cover"
                />
              ) : (
                <AvatarFallback className="bg-primary/20 text-primary font-bold border-0">
                  {message.user_profile?.name?.charAt(0) || "A"}
                </AvatarFallback>
              )}
            </Avatar>

            {/* Achievement Overlays */}
            {hasDiamond && (
              <>
                <div className="absolute -top-1 -right-1 text-sm animate-bounce">💎</div>
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400/20 to-blue-400/20 animate-pulse"></div>
              </>
            )}
            {!hasDiamond && hasFireGlow && (
              <div className="absolute -top-1 -right-1 text-sm animate-bounce">🔥</div>
            )}
            {medals > 0 && (
              <div className="absolute -bottom-1 -left-1 text-xs">
                {"🏆".repeat(Math.min(medals, 3))}
              </div>
            )}
          </div>
        </div>

        {/* Message Content */}
        <div className={`flex-1 min-w-0 ${isOwn ? "text-right" : ""} max-w-[80%]`}>
          {/* Message Header */}
          <div className={`flex items-center gap-2 mb-2 ${isOwn ? "justify-end" : ""}`}>
            <span
              onClick={!isOwn && message.user_profile ? handleAvatarClick : undefined}
              className={`text-sm font-semibold ${
                isOwn
                  ? "text-muted-foreground"
                  : "text-primary hover:text-primary/80 cursor-pointer"
              } truncate`}
            >
              {displayName}
            </span>
            
            {/* Room Owner Badge */}
            {isRoomOwner && (
              <Badge className="text-xs px-2 py-0.5 bg-amber-500 text-white border-0">
                👑 Room Owner
              </Badge>
            )}
            
            {/* Admin Badge */}
            {isFromAdmin && (
              <Badge className="text-xs px-2 py-0.5 bg-red-500 text-white border-0">
                ⚡ Admin
              </Badge>
            )}
            
            <span className="text-xs text-muted-foreground/60">• {timeAgo}</span>
            {typeof points === "number" && points > 0 && (
              <span className="text-xs text-muted-foreground/60">• {points} pts</span>
            )}
          </div>

          {/* Quoted Message Preview */}
          {message.quoted_message && (
            <div className={`mb-3 ${isOwn ? "ml-auto" : ""} max-w-full`}>
              <QuotedMessage message={message.quoted_message} compact />
            </div>
          )}

          {/* Main Message Bubble */}
          <div
            className={`relative group/bubble ${
              isOwn ? "ml-auto" : ""
            }`}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            style={{
              transform: translateX ? `translateX(${isOwn ? -translateX : translateX}px)` : undefined,
              transition: isSwipingRef.current ? "none" : "transform 200ms cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            <div
              className={`relative px-4 py-3 rounded-2xl backdrop-blur-xl border shadow-lg ${
                isOwn
                  ? "bg-primary text-primary-foreground border-primary/20 shadow-primary/20"
                  : "bg-background text-foreground border-border/20 shadow-border/20"
              } ${bubbleExtra} transition-all duration-300 hover:shadow-xl ${isOwn ? "hover:shadow-primary/30" : "hover:shadow-border/30"}`}
            >
              {/* Message Content */}
              {isImageUrl(message.content) ? (
                <a
                  href={message.content}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                  title="Open image in new tab"
                >
                  <img
                    src={message.content}
                    alt="Shared image"
                    className="max-h-64 max-w-full rounded-xl object-contain bg-muted/20 border border-border/20"
                    loading="lazy"
                  />
                </a>
              ) : (
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                  {message.content}
                </p>
              )}

              {/* Action Buttons */}
              <div className={`absolute ${isOwn ? "left-2" : "right-2"} top-2 flex flex-col gap-1 opacity-0 group-hover/bubble:opacity-100 transition-opacity duration-200`}>
                {/* Quote Button */}
                {onQuote && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onQuote(message)}
                    className="h-7 w-7 p-0 rounded-full bg-background/80 backdrop-blur-xl border border-border/20 hover:bg-background hover:scale-110 transition-all duration-200"
                    title="Quote message"
                  >
                    <Quote className="h-3 w-3" />
                  </Button>
                )}

                {/* Delete Button (for owners/admins) */}
                {canDelete && onDelete && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      if (confirm("Delete this message?")) onDelete(message.id);
                    }}
                    className="h-7 w-7 p-0 rounded-full bg-destructive/10 backdrop-blur-xl border border-destructive/20 text-destructive hover:bg-destructive/20 hover:scale-110 transition-all duration-200"
                    title="Delete message"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>

              {/* Diamond Special Effect */}
              {hasDiamond && (
                <div className="absolute -top-1 -right-1 text-xs animate-ping">
                  💎
                </div>
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
});

// Memoized achievement calculation for performance
const getAchievement = (pts: number) => {
  const medals = pts >= 50 ? 3 : pts >= 25 ? 2 : pts >= 10 ? 1 : 0;
  const hasFireGlow = pts >= 100;
  const hasDiamond = pts >= 250;
  return { medals, hasFireGlow, hasDiamond };
};
