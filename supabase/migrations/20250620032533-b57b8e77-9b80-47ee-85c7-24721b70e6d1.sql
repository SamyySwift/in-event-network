
-- Fix 1: Enable RLS on event_participants table
ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;

-- Fix 2: Drop and recreate public_profiles view without SECURITY DEFINER
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles AS
SELECT 
    id,
    name,
    bio,
    niche,
    company,
    photo_url,
    role,
    networking_preferences,
    tags,
    twitter_link,
    linkedin_link,
    github_link,
    instagram_link,
    website_link,
    created_at
FROM public.profiles
WHERE user_can_see_profile(id);

-- Fix 3: Drop and recreate conversations view without SECURITY DEFINER
DROP VIEW IF EXISTS public.conversations;

CREATE VIEW public.conversations AS
WITH ranked_messages AS (
  SELECT 
    CASE 
      WHEN sender_id < recipient_id 
      THEN sender_id || '_' || recipient_id
      ELSE recipient_id || '_' || sender_id
    END as conversation_id,
    CASE 
      WHEN sender_id = auth.uid() THEN recipient_id
      ELSE sender_id
    END as other_user_id,
    content as last_message,
    created_at as last_message_at,
    sender_id = auth.uid() as is_sent_by_me,
    CASE WHEN sender_id = auth.uid() THEN 0 ELSE 1 END as unread_weight,
    ROW_NUMBER() OVER (
      PARTITION BY CASE 
        WHEN sender_id < recipient_id 
        THEN sender_id || '_' || recipient_id
        ELSE recipient_id || '_' || sender_id
      END 
      ORDER BY created_at DESC
    ) as rn
  FROM public.direct_messages
  WHERE sender_id = auth.uid() OR recipient_id = auth.uid()
),
unread_counts AS (
  SELECT 
    CASE 
      WHEN sender_id < recipient_id 
      THEN sender_id || '_' || recipient_id
      ELSE recipient_id || '_' || sender_id
    END as conversation_id,
    COUNT(*) as unread_count
  FROM public.direct_messages
  WHERE recipient_id = auth.uid() AND is_read = false
  GROUP BY CASE 
    WHEN sender_id < recipient_id 
    THEN sender_id || '_' || recipient_id
    ELSE recipient_id || '_' || sender_id
  END
)
SELECT 
  rm.conversation_id,
  rm.other_user_id,
  rm.last_message,
  rm.last_message_at,
  rm.is_sent_by_me,
  COALESCE(uc.unread_count, 0) as unread_count
FROM ranked_messages rm
LEFT JOIN unread_counts uc ON rm.conversation_id = uc.conversation_id
WHERE rm.rn = 1;
