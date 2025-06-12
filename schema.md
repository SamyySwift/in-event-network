-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.advertisements (
id uuid NOT NULL DEFAULT gen_random_uuid(),
title text NOT NULL,
description text,
image_url text,
sponsor_name text NOT NULL,
sponsor_logo text,
link_url text,
display_order integer DEFAULT 0,
is_active boolean DEFAULT true,
start_date timestamp with time zone,
end_date timestamp with time zone,
created_by uuid,
created_at timestamp with time zone NOT NULL DEFAULT now(),
CONSTRAINT advertisements_pkey PRIMARY KEY (id),
CONSTRAINT advertisements_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id)
);
CREATE TABLE public.announcements (
id uuid NOT NULL DEFAULT gen_random_uuid(),
title text NOT NULL,
content text NOT NULL,
priority text DEFAULT 'normal'::text CHECK (priority = ANY (ARRAY['high'::text, 'normal'::text, 'low'::text])),
send_immediately boolean DEFAULT false,
image_url text,
created_by uuid,
created_at timestamp with time zone NOT NULL DEFAULT now(),
updated_at timestamp with time zone NOT NULL DEFAULT now(),
event_id uuid,
CONSTRAINT announcements_pkey PRIMARY KEY (id),
CONSTRAINT announcements_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id),
CONSTRAINT announcements_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id)
);
CREATE TABLE public.chat_messages (
id uuid NOT NULL DEFAULT gen_random_uuid(),
user_id uuid NOT NULL,
content text NOT NULL,
quoted_message_id uuid,
created_at timestamp with time zone NOT NULL DEFAULT now(),
updated_at timestamp with time zone NOT NULL DEFAULT now(),
event_id uuid,
CONSTRAINT chat_messages_pkey PRIMARY KEY (id),
CONSTRAINT chat_messages_quoted_message_id_fkey FOREIGN KEY (quoted_message_id) REFERENCES public.chat_messages(id),
CONSTRAINT chat_messages_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id)
);
CREATE TABLE public.connections (
id uuid NOT NULL DEFAULT gen_random_uuid(),
requester_id uuid,
recipient_id uuid,
status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'accepted'::text, 'rejected'::text])),
created_at timestamp with time zone DEFAULT now(),
updated_at timestamp with time zone DEFAULT now(),
CONSTRAINT connections_pkey PRIMARY KEY (id),
CONSTRAINT connections_requester_id_fkey FOREIGN KEY (requester_id) REFERENCES public.profiles(id),
CONSTRAINT connections_recipient_id_fkey FOREIGN KEY (recipient_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.direct_messages (
id uuid NOT NULL DEFAULT gen_random_uuid(),
sender_id uuid NOT NULL,
recipient_id uuid NOT NULL,
content text NOT NULL,
is_read boolean NOT NULL DEFAULT false,
created_at timestamp with time zone NOT NULL DEFAULT now(),
updated_at timestamp with time zone NOT NULL DEFAULT now(),
CONSTRAINT direct_messages_pkey PRIMARY KEY (id),
CONSTRAINT direct_messages_recipient_id_fkey FOREIGN KEY (recipient_id) REFERENCES public.profiles(id),
CONSTRAINT direct_messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.event_participants (
id uuid NOT NULL DEFAULT gen_random_uuid(),
user_id uuid NOT NULL,
event_id uuid NOT NULL,
joined_at timestamp with time zone NOT NULL DEFAULT now(),
created_at timestamp with time zone NOT NULL DEFAULT now(),
CONSTRAINT event_participants_pkey PRIMARY KEY (id),
CONSTRAINT event_participants_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
CONSTRAINT event_participants_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id),
CONSTRAINT fk_event_participants_user_id FOREIGN KEY (user_id) REFERENCES public.profiles(id),
CONSTRAINT fk_event_participants_event_id FOREIGN KEY (event_id) REFERENCES public.events(id)
);
CREATE TABLE public.events (
id uuid NOT NULL DEFAULT gen_random_uuid(),
name text NOT NULL,
description text,
start_time timestamp with time zone NOT NULL,
end_time timestamp with time zone NOT NULL,
location text,
banner_url text,
logo_url text,
website text,
host_id uuid,
created_at timestamp with time zone NOT NULL DEFAULT now(),
updated_at timestamp with time zone NOT NULL DEFAULT now(),
event_key character varying,
CONSTRAINT events_pkey PRIMARY KEY (id),
CONSTRAINT events_host_id_fkey FOREIGN KEY (host_id) REFERENCES auth.users(id)
);
CREATE TABLE public.facilities (
id uuid NOT NULL DEFAULT gen_random_uuid(),
name text NOT NULL,
description text,
location text,
rules text,
image_url text,
icon_type text DEFAULT 'building'::text CHECK (icon_type = ANY (ARRAY['building'::text, 'wifi'::text, 'parking'::text, 'coffee'::text, 'restaurant'::text, 'conference'::text, 'photography'::text, 'music'::text, 'entertainment'::text, 'gaming'::text, 'health'::text, 'shopping'::text, 'restroom'::text, 'accommodation'::text])),
created_at timestamp with time zone DEFAULT now(),
updated_at timestamp with time zone DEFAULT now(),
contact_type text DEFAULT 'none'::text,
contact_info text,
created_by uuid,
event_id uuid NOT NULL,
CONSTRAINT facilities_pkey PRIMARY KEY (id),
CONSTRAINT facilities_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id),
CONSTRAINT facilities_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id)
);
CREATE TABLE public.media_files (
id uuid NOT NULL DEFAULT gen_random_uuid(),
filename text NOT NULL,
original_name text NOT NULL,
file_type text NOT NULL,
file_size bigint,
url text NOT NULL,
uploaded_by uuid,
description text,
tags ARRAY,
created_at timestamp with time zone DEFAULT now(),
updated_at timestamp with time zone DEFAULT now(),
CONSTRAINT media_files_pkey PRIMARY KEY (id),
CONSTRAINT media_files_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES auth.users(id)
);
CREATE TABLE public.messages (
id uuid NOT NULL DEFAULT gen_random_uuid(),
sender_id uuid,
recipient_id uuid,
content text NOT NULL,
created_at timestamp with time zone DEFAULT now(),
read_at timestamp with time zone,
CONSTRAINT messages_pkey PRIMARY KEY (id),
CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.profiles(id),
CONSTRAINT messages_recipient_id_fkey FOREIGN KEY (recipient_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.notifications (
id uuid NOT NULL DEFAULT gen_random_uuid(),
user_id uuid,
title text NOT NULL,
message text NOT NULL,
type text DEFAULT 'general'::text CHECK (type = ANY (ARRAY['general'::text, 'announcement'::text, 'connection'::text, 'message'::text, 'system'::text])),
related_id uuid,
is_read boolean DEFAULT false,
created_at timestamp with time zone DEFAULT now(),
CONSTRAINT notifications_pkey PRIMARY KEY (id),
CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.poll_votes (
id uuid NOT NULL DEFAULT gen_random_uuid(),
poll_id uuid,
user_id uuid,
option_id text NOT NULL,
created_at timestamp with time zone NOT NULL DEFAULT now(),
CONSTRAINT poll_votes_pkey PRIMARY KEY (id),
CONSTRAINT poll_votes_poll_id_fkey FOREIGN KEY (poll_id) REFERENCES public.polls(id),
CONSTRAINT poll_votes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.polls (
id uuid NOT NULL DEFAULT gen_random_uuid(),
question text NOT NULL,
options jsonb NOT NULL,
start_time timestamp with time zone NOT NULL,
end_time timestamp with time zone NOT NULL,
is_active boolean DEFAULT true,
show_results boolean DEFAULT false,
display_as_banner boolean DEFAULT false,
created_by uuid,
created_at timestamp with time zone NOT NULL DEFAULT now(),
updated_at timestamp with time zone DEFAULT now(),
event_id uuid,
CONSTRAINT polls_pkey PRIMARY KEY (id),
CONSTRAINT polls_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id),
CONSTRAINT polls_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id)
);
CREATE TABLE public.profiles (
id uuid NOT NULL,
name text,
email text,
role text CHECK (role = ANY (ARRAY['host'::text, 'attendee'::text, 'admin'::text])),
photo_url text,
bio text,
niche text,
twitter_link text,
facebook_link text,
linkedin_link text,
instagram_link text,
snapchat_link text,
tiktok_link text,
github_link text,
website_link text,
created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
networking_preferences ARRAY,
tags ARRAY,
company text,
access_key character varying UNIQUE,
current_event_id uuid,
CONSTRAINT profiles_pkey PRIMARY KEY (id),
CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id),
CONSTRAINT profiles_current_event_id_fkey FOREIGN KEY (current_event_id) REFERENCES public.events(id)
);
CREATE TABLE public.questions (
id uuid NOT NULL DEFAULT gen_random_uuid(),
content text NOT NULL,
user_id uuid,
event_id uuid,
session_id uuid,
is_anonymous boolean DEFAULT false,
is_answered boolean DEFAULT false,
response text,
upvotes integer DEFAULT 0,
answered_at timestamp with time zone,
answered_by uuid,
response_created_at timestamp with time zone,
created_at timestamp with time zone DEFAULT now(),
updated_at timestamp with time zone DEFAULT now(),
CONSTRAINT questions_pkey PRIMARY KEY (id),
CONSTRAINT questions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
CONSTRAINT questions_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id),
CONSTRAINT questions_answered_by_fkey FOREIGN KEY (answered_by) REFERENCES auth.users(id)
);
CREATE TABLE public.rules (
id uuid NOT NULL DEFAULT gen_random_uuid(),
title text NOT NULL,
content text NOT NULL,
category text,
priority text DEFAULT 'medium'::text,
created_by uuid,
created_at timestamp with time zone DEFAULT now(),
updated_at timestamp with time zone DEFAULT now(),
event_id uuid,
CONSTRAINT rules_pkey PRIMARY KEY (id),
CONSTRAINT rules_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id)
);
CREATE TABLE public.schedule_items (
id uuid NOT NULL DEFAULT gen_random_uuid(),
title text NOT NULL,
description text,
start_time timestamp with time zone NOT NULL,
end_time timestamp with time zone NOT NULL,
location text,
type text DEFAULT 'general'::text,
priority text DEFAULT 'medium'::text,
event_id uuid NOT NULL,
created_by uuid,
created_at timestamp with time zone NOT NULL DEFAULT now(),
updated_at timestamp with time zone NOT NULL DEFAULT now(),
CONSTRAINT schedule_items_pkey PRIMARY KEY (id)
);
CREATE TABLE public.speakers (
id uuid NOT NULL DEFAULT gen_random_uuid(),
name text NOT NULL,
title text,
company text,
bio text NOT NULL,
photo_url text,
session_title text,
session_time timestamp with time zone,
twitter_link text,
linkedin_link text,
website_link text,
created_at timestamp with time zone NOT NULL DEFAULT now(),
updated_at timestamp with time zone NOT NULL DEFAULT now(),
created_by uuid,
event_id uuid,
CONSTRAINT speakers_pkey PRIMARY KEY (id),
CONSTRAINT speakers_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id),
CONSTRAINT speakers_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id)
);
CREATE TABLE public.suggestions (
id uuid NOT NULL DEFAULT gen_random_uuid(),
content text NOT NULL,
user_id uuid,
event_id uuid,
type text DEFAULT 'suggestion'::text CHECK (type = ANY (ARRAY['suggestion'::text, 'rating'::text])),
rating integer CHECK (rating >= 1 AND rating <= 5),
status text DEFAULT 'new'::text CHECK (status = ANY (ARRAY['new'::text, 'reviewed'::text, 'implemented'::text])),
created_at timestamp with time zone DEFAULT now(),
updated_at timestamp with time zone DEFAULT now(),
CONSTRAINT suggestions_pkey PRIMARY KEY (id),
CONSTRAINT suggestions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
