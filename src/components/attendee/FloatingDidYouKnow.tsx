import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAttendeeContext } from "@/hooks/useAttendeeContext";
import { useAuth } from "@/contexts/AuthContext";

type DidYouKnowVariant = {
  id: string;
  message: string;
  ctaText: string;
  getHref: (args: { pathname: string; currentEventId: string | null }) => string;
};

function useDidYouKnowConfig(pathname: string, currentEventId: string | null) {
  // Map pathnames to one or more variants
  const variantsMap: Array<{
    match: (path: string) => boolean;
    variants: DidYouKnowVariant[];
  }> = [
    {
      match: (p) => p.startsWith("/attendee/networking"),
      variants: [
        {
          id: "networking",
          message:
            "🤝 Did you know you can connect with other attendees and build meaningful relationships here?",
          ctaText: "Go to Networking",
          getHref: () => "/attendee/networking",
        },
      ],
    },
    {
      match: (p) => p.startsWith("/attendee/polls") || p.startsWith("/live-polls"),
      variants: [
        {
          id: "polls",
          message:
            "📊 Did you know you can share your opinions and see live poll results instantly?",
          ctaText: "Join a Poll",
          getHref: () => "/attendee/polls",
        },
      ],
    },
    {
      match: (p) => p.startsWith("/attendee/announcements"),
      variants: [
        {
          id: "announcements",
          message:
            "📢 Did you know you’ll never miss an update with real-time announcements?",
          ctaText: "View Announcements",
          getHref: () => "/attendee/announcements",
        },
      ],
    },
    {
      match: (p) => p.startsWith("/attendee/schedule"),
      variants: [
        {
          id: "schedule",
          message:
            "📅 Did you know you can see all sessions, speakers, and updates in real time?",
          ctaText: "View Schedule",
          getHref: () => "/attendee/schedule",
        },
      ],
    },
    {
      match: (p) => p.startsWith("/attendee/suggestions"),
      // This app has Ratings under Suggestions. We surface both unique tips and randomly alternate them here.
      variants: [
        {
          id: "suggestions",
          message:
            "💡 Did you know you can drop suggestions to improve the event experience?",
          ctaText: "Give a Suggestion",
          getHref: () => "/attendee/suggestions",
        },
        {
          id: "ratings",
          message:
            "⭐ Did you know you can rate sessions and share feedback instantly?",
          ctaText: "Rate Now",
          getHref: () => "/attendee/suggestions#ratings",
        },
      ],
    },
    {
      match: (p) => p.startsWith("/attendee/questions") || p.startsWith("/live-questions"),
      variants: [
        {
          id: "qa",
          message:
            "❓ Did you know you can ask questions and upvote others in real time?",
          ctaText: "Go to Q&A",
          getHref: () => "/attendee/questions",
        },
      ],
    },
    {
      match: (p) => p.startsWith("/live-chat"),
      variants: [
        {
          id: "chat",
          message:
            "💬 Did you know you can join the chat room and share your thoughts with everyone?",
          ctaText: "Open Chat",
          getHref: ({ currentEventId }) =>
            currentEventId ? `/live-chat/${currentEventId}` : "/attendee/networking",
        },
      ],
    },
    {
      match: (p) => p === "/attendee" || p.startsWith("/attendee/"),
      // Default for other attendee pages: rotate among a few general tips
      variants: [
        {
          id: "networking-default",
          message:
            "🤝 Did you know you can connect with other attendees and build meaningful relationships?",
          ctaText: "Explore Networking",
          getHref: () => "/attendee/networking",
        },
        {
          id: "polls-default",
          message:
            "📊 Did you know you can share your opinions and see live poll results?",
          ctaText: "Discover Polls",
          getHref: () => "/attendee/polls",
        },
        {
          id: "announcements-default",
          message:
            "📢 Did you know you’ll get real-time updates from organizers?",
          ctaText: "See Announcements",
          getHref: () => "/attendee/announcements",
        },
      ],
    },
  ];

  // Global cross-feature variants to allow random tips on any page
  const globalVariants: DidYouKnowVariant[] = [
    {
      id: "networking",
      message:
        "🤝 Did you know you can connect with other attendees and build meaningful relationships here?",
      ctaText: "Go to Networking",
      getHref: () => "/attendee/networking",
    },
    {
      id: "polls",
      message:
        "📊 Did you know you can share your opinions and see live poll results instantly?",
      ctaText: "Join a Poll",
      getHref: () => "/attendee/polls",
    },
    {
      id: "announcements",
      message:
        "📢 Did you know you’ll never miss an update with real-time announcements?",
      ctaText: "View Announcements",
      getHref: () => "/attendee/announcements",
    },
    {
      id: "schedule",
      message:
        "📅 Did you know you can see all sessions, speakers, and updates in real time?",
      ctaText: "View Schedule",
      getHref: () => "/attendee/schedule",
    },
    {
      id: "suggestions",
      message:
        "💡 Did you know you can drop suggestions to improve the event experience?",
      ctaText: "Give a Suggestion",
      getHref: () => "/attendee/suggestions",
    },
    {
      id: "ratings",
      message:
        "⭐ Did you know you can rate sessions and share feedback instantly?",
      ctaText: "Rate Now",
      getHref: () => "/attendee/suggestions#ratings",
    },
    {
      id: "qa",
      message:
        "❓ Did you know you can ask questions and upvote others in real time?",
      ctaText: "Go to Q&A",
      getHref: () => "/attendee/questions",
    },
    {
      id: "chat",
      message:
        "💬 Did you know you can join the chat room and share your thoughts with everyone?",
      ctaText: "Open Chat",
      getHref: ({ currentEventId }) =>
        currentEventId ? `/live-chat/${currentEventId}` : "/attendee/networking",
    },
  ];

  const matched = variantsMap.find(({ match }) => match(pathname));

  // Merge page-specific variants (if any) with global variants and de-duplicate by id
  const mergedById = new Map<string, DidYouKnowVariant>();
  [...(matched?.variants ?? []), ...globalVariants].forEach((v) => mergedById.set(v.id, v));
  const variants = Array.from(mergedById.values());

  // Randomly select one variant for this page navigation
  const selected =
    variants.length > 0
      ? variants[Math.floor(Math.random() * variants.length)]
      : undefined;

  const ctaHref = selected?.getHref({ pathname, currentEventId }) ?? "/attendee";
  return selected
    ? {
        variantId: selected.id,
        message: selected.message,
        ctaText: selected.ctaText,
        ctaHref,
      }
    : null;
}

export const FloatingDidYouKnow: React.FC = () => {
  const { currentUser } = useAuth();
  const { context } = useAttendeeContext();
  const currentEventId = context?.currentEventId ?? null;

  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;

  // Randomly decide to show on each navigation, unless user already dismissed per page during this session
  const [open, setOpen] = useState(false);

  const config = useMemo(
    () => useDidYouKnowConfig(pathname, currentEventId),
    [pathname, currentEventId]
  );

  // Unique session key per route so dismissal doesn't follow to other pages
  const sessionKey = useMemo(
    () => `didyouknow:dismissed:${pathname}`,
    [pathname]
  );

  useEffect(() => {
    if (!currentUser || currentUser.role !== "attendee") {
      setOpen(false);
      return;
    }

    // If dismissed this session on this page, do not show
    const dismissed = sessionStorage.getItem(sessionKey);
    if (dismissed === "1") {
      setOpen(false);
      return;
    }

    // Show randomly on navigation to avoid interrupting every time
    // 60% chance to show
    const shouldShow = Math.random() < 0.6 && !!config;
    setOpen(shouldShow);
  }, [pathname, sessionKey, config, currentUser]);

  if (!config || !open) return null;

  return (
    <div
      className="
        fixed z-50 
        right-4 bottom-24 
        sm:right-6 sm:bottom-6
        max-w-[92vw] sm:max-w-sm
      "
      role="status"
      aria-live="polite"
    >
      <div className="rounded-xl shadow-lg border bg-white dark:bg-gray-800 dark:border-gray-700 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <p className="text-sm sm:text-base text-gray-900 dark:text-gray-100">
              {config.message}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => {
                  navigate(config.ctaHref);
                  // keep it open on navigation; next page decides randomly again
                }}
                className="text-xs sm:text-sm"
              >
                {config.ctaText}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  sessionStorage.setItem(sessionKey, "1");
                  setOpen(false);
                }}
                className="text-xs sm:text-sm"
              >
                Dismiss
              </Button>
            </div>
          </div>
          <button
            aria-label="Dismiss"
            onClick={() => {
              sessionStorage.setItem(sessionKey, "1");
              setOpen(false);
            }}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FloatingDidYouKnow;