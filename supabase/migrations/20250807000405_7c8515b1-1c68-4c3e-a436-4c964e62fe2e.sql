-- Fix the notifications type constraint to allow all the notification types we use
ALTER TABLE notifications DROP CONSTRAINT notifications_type_check;

-- Add updated constraint with all the notification types we need
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check 
CHECK (type = ANY (ARRAY[
  'general',
  'announcement', 
  'connection',
  'connection_accepted',
  'message',
  'direct_message',
  'group_message',
  'system',
  'poll_created',
  'schedule_update',
  'facility_update'
]));