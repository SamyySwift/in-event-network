
-- Add foreign key constraint between event_participants.user_id and profiles.id
ALTER TABLE public.event_participants 
ADD CONSTRAINT fk_event_participants_user_profile 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add foreign key constraint between event_participants.event_id and events.id  
ALTER TABLE public.event_participants 
ADD CONSTRAINT fk_event_participants_event 
FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;
