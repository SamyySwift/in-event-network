-- Add social media links to announcements table
ALTER TABLE public.announcements ADD COLUMN twitter_link text;
ALTER TABLE public.announcements ADD COLUMN instagram_link text;
ALTER TABLE public.announcements ADD COLUMN facebook_link text;
ALTER TABLE public.announcements ADD COLUMN tiktok_link text;
ALTER TABLE public.announcements ADD COLUMN website_link text;