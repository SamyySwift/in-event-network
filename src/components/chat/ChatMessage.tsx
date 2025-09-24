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

  // Compute display name using profile; map unknown-name variants to Admin
  const rawName = message.user_profile?.name ?? "";
  const isRawNameUnknownUser = ["unknown user", "unknow user", "unknown"].includes(
    rawName.trim().toLowerCase()
  );
  const displayName = isRawNameUnknownUser
    ? "Admin"
    : (rawName || (isFromAdmin ? "Admin" : isOwn ? "You" : "Admin"));

  // NEW: achievements & styles based on points
  const { medals, hasFireGlow, hasDiamond } = getAchievement(points ?? 0);
  const avatarGlow = hasDiamond
    ? "ring-4 ring-cyan-300 shadow-[0_0_16px_rgba(103,232,249,0.9)] animate-pulse"
    : hasFireGlow
    ? "ring-2 ring-orange-400 shadow-[0_0_12px_rgba(251,146,60,0.7)] animate-pulse"
    : medals > 0
    ? "ring-2 ring-yellow-300"
    : "";
  const bubbleExtra = hasDiamond
    ? "border-2 border-cyan-300 shadow-[0_0_24px_rgba(103,232,249,0.6)]"
    : hasFireGlow
    ? "border-2 border-orange-300 shadow-[0_0_20px_rgba(251,146,60,0.45)]"
    : "";

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
      <div className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""} group`}>
        {/* Avatar and main container */}
        <div className="relative">
          <Avatar
            className={`h-8 w-8 flex-shrink-0 ${
              !isOwn ? "cursor-pointer hover:ring-2 hover:ring-connect-500 transition-all" : ""
            } ${avatarGlow}`}
            onClick={handleAvatarClick}
          >
            {message.user_profile?.photo_url ? (
              <AvatarImage
                src={message.user_profile.photo_url}
                alt={message.user_profile?.name}
              />
            ) : (
              <AvatarFallback className="bg-connect-100 text-connect-600 dark:bg-connect-900 dark:text-connect-300 text-sm">
                {message.user_profile?.name?.charAt(0) || "A"}
              </AvatarFallback>
            )}
          </Avatar>

          {/* overlay rewards near avatar */}
          {hasDiamond && (
            <>
              <span className="absolute -top-1 -right-1 text-xs animate-bounce">💎</span>
              <span className="pointer-events-none absolute -left-2 -bottom-2 text-[10px] text-cyan-400/80 animate-ping">
                💎
              </span>
            </>
          )}
          {!hasDiamond && hasFireGlow && (
            <span className="absolute -top-1 -right-1 text-xs animate-bounce">🔥</span>
          )}
          {medals > 0 && (
            <span className="absolute -bottom-2 left-0 text-[10px] leading-none select-none">
              {"🎖️".repeat(medals)}
            </span>
          )}
        </div>

        <div className={`flex-1 min-w-0 ${isOwn ? "text-right" : ""} relative`}>
          <div className={`flex items-center gap-2 mb-1 ${isOwn ? "justify-end" : ""}`}>
            <span
              onClick={!isOwn && message.user_profile ? handleAvatarClick : undefined}
              role={!isOwn && message.user_profile ? "button" : undefined}
              className={`text-xs font-semibold ${
                isOwn
                  ? "text-gray-800 dark:text-gray-200"
                  : "text-connect-700 dark:text-connect-300 hover:underline"
              } ${!isOwn && message.user_profile ? "cursor-pointer" : ""} truncate max-w-[60%]`}
              title={displayName}
            >
              {displayName}
            </span>
            {/* NEW: Room Owner badge right by the name (in-room) */}
            {isRoomOwner && (
              <Badge variant="secondary" className="uppercase tracking-wide text-[10px] px-2 py-0.5">
                Room Owner
              </Badge>
            )}
            <span className="text-xs text-gray-500 dark:text-gray-400">• {timeAgo}</span>
            {typeof points === "number" && (
              <span className="text-[10px] text-gray-400">({points} pts)</span>
            )}
          </div>

          {/* Admin label above the message bubble */}
          {isFromAdmin && (
            <div className={`mb-1 ${isOwn ? "ml-auto" : ""}`}>
              <Badge variant="destructive" className="uppercase tracking-wide text-[10px] px-2 py-0.5">
                Admin
              </Badge>
            </div>
          )}

          {/* Quoted preview (if any) */}
          {message.quoted_message && (
            <div className={`mb-1 ${isOwn ? "ml-auto" : ""} max-w=[80%]`}>
              <QuotedMessage message={message.quoted_message} compact />
            </div>
          )}

          {/* Main Message */}
          <div
            className={`relative rounded-lg px-3 py-2 break-words ${
              isOwn
                ? "bg-connect-600 text-white ml-auto pl-10"
                : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 pr-10"
            } max-w-[80%] ${isOwn ? "ml-auto" : ""} ${bubbleExtra}`}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            style={{
              transform: translateX ? `translateX(${isOwn ? -translateX : translateX}px)` : undefined,
              transition: isSwipingRef.current ? "none" : "transform 150ms ease",
            }}
          >
            {isImageUrl(message.content) ? (
              <a
                href={message.content}
                target="_blank"
                rel="noopener noreferrer"
                className={`block ${isOwn ? "ml-auto" : ""}`}
                title="Open image in new tab"
              >
                <img
                  src={message.content}
                  alt="Shared image"
                  className="max-h-64 max-w-full rounded-md border border-gray-200 dark:border-gray-700 object-contain bg-white"
                  loading="lazy"
                />
              </a>
            ) : (
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
            )}

            {/* Quote Button (allow quoting any message) */}
            {onQuote && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onQuote(message)}
                className={`absolute ${isOwn ? "left-1" : "right-1"} top-1 z-10 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity h-8 w-8 p-0`}
                title="Quote to reply"
                aria-label="Quote to reply"
              >
                <Quote className="h-4 w-4" />
              </Button>
            )}

            {/* 删除按钮：右上角，hover 显示；移动端默认可见 */}
            {canDelete && onDelete && (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => { if (confirm("Delete this message?")) onDelete(message.id); }}
                    className="absolute right-1 top-1 z-10 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity h-6 w-6 p-0 text-destructive"
                    title="Delete message"
                    aria-label="Delete message"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            )}

            {/* diamond sparkle near the bubble */}
            {hasDiamond && (
              <span
                className={`absolute ${isOwn ? "left-1" : "right-1"} -bottom-2 text-xs text-cyan-400/90 animate-ping select-none`}
              >
                💎
              </span>
            )}
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

// function getAchievement (top-level helper)
const getAchievement = (pts: number) => {
  const medals = pts >= 50 ? 3 : pts >= 25 ? 2 : pts >= 10 ? 1 : 0;
  const hasFireGlow = pts >= 100;
  const hasDiamond = pts >= 250;
  return { medals, hasFireGlow, hasDiamond };
};
