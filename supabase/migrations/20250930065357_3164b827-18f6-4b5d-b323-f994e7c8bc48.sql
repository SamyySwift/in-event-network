-- Create room_members table to track users in each chat room
CREATE TABLE IF NOT EXISTS public.room_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(room_id, user_id)
);

-- Enable RLS
ALTER TABLE public.room_members ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view room members for rooms in events they're part of
CREATE POLICY "Users can view room members in their events"
ON public.room_members
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.chat_rooms cr
    JOIN public.event_participants ep ON cr.event_id = ep.event_id
    WHERE cr.id = room_members.room_id
    AND ep.user_id = auth.uid()
  )
);

-- Policy: Users can join rooms in events they're part of
CREATE POLICY "Users can join rooms in their events"
ON public.room_members
FOR INSERT
WITH CHECK (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.chat_rooms cr
    JOIN public.event_participants ep ON cr.event_id = ep.event_id
    WHERE cr.id = room_members.room_id
    AND ep.user_id = auth.uid()
  )
);

-- Policy: Users can leave rooms they've joined
CREATE POLICY "Users can leave rooms"
ON public.room_members
FOR DELETE
USING (user_id = auth.uid());

-- Create index for better query performance
CREATE INDEX idx_room_members_room_id ON public.room_members(room_id);
CREATE INDEX idx_room_members_user_id ON public.room_members(user_id);