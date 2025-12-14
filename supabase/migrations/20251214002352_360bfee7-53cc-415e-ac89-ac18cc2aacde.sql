-- Add whatsapp_number column to profiles table for WhatsApp messaging preference
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;