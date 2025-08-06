-- Create comprehensive notification triggers for attendee activities

-- Function to create direct message notifications
CREATE OR REPLACE FUNCTION create_direct_message_notification()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
  sender_name text;
BEGIN
  -- Get sender name
  SELECT name INTO sender_name 
  FROM profiles 
  WHERE id = NEW.sender_id;
  
  -- Create notification for recipient
  INSERT INTO notifications (
    user_id,
    title,
    message,
    type,
    related_id,
    is_read
  ) VALUES (
    NEW.recipient_id,
    'New Message',
    COALESCE(sender_name, 'Someone') || ' sent you a message',
    'direct_message',
    NEW.id,
    false
  );
  
  RETURN NEW;
END;
$function$;

-- Function to create group chat notifications
CREATE OR REPLACE FUNCTION create_group_chat_notification()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
  sender_name text;
  event_name text;
  participant_record RECORD;
BEGIN
  -- Get sender name and event name
  SELECT name INTO sender_name 
  FROM profiles 
  WHERE id = NEW.user_id;
  
  SELECT name INTO event_name 
  FROM events 
  WHERE id = NEW.event_id;
  
  -- Create notifications for all event participants except the sender
  FOR participant_record IN 
    SELECT user_id 
    FROM event_participants 
    WHERE event_id = NEW.event_id 
    AND user_id != NEW.user_id
  LOOP
    INSERT INTO notifications (
      user_id,
      title,
      message,
      type,
      related_id,
      is_read
    ) VALUES (
      participant_record.user_id,
      'New Group Message',
      COALESCE(sender_name, 'Someone') || ' posted in ' || COALESCE(event_name, 'the group chat'),
      'group_message',
      NEW.id,
      false
    );
  END LOOP;
  
  RETURN NEW;
END;
$function$;

-- Function to create connection accepted notifications
CREATE OR REPLACE FUNCTION create_connection_accepted_notification()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
  accepter_name text;
BEGIN
  -- Only create notification when status changes to accepted
  IF NEW.status = 'accepted' AND (OLD.status IS NULL OR OLD.status != 'accepted') THEN
    -- Get accepter name (recipient who accepted)
    SELECT name INTO accepter_name 
    FROM profiles 
    WHERE id = NEW.recipient_id;
    
    -- Create notification for the original requester
    INSERT INTO notifications (
      user_id,
      title,
      message,
      type,
      related_id,
      is_read
    ) VALUES (
      NEW.requester_id,
      'Connection Accepted',
      COALESCE(accepter_name, 'Someone') || ' accepted your connection request',
      'connection_accepted',
      NEW.id,
      false
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Function to create announcement notifications
CREATE OR REPLACE FUNCTION create_announcement_notification()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
  participant_record RECORD;
  event_name text;
BEGIN
  -- Get event name
  SELECT name INTO event_name 
  FROM events 
  WHERE id = NEW.event_id;
  
  -- Create notifications for all event participants
  FOR participant_record IN 
    SELECT user_id 
    FROM event_participants 
    WHERE event_id = NEW.event_id
  LOOP
    INSERT INTO notifications (
      user_id,
      title,
      message,
      type,
      related_id,
      is_read
    ) VALUES (
      participant_record.user_id,
      'New Announcement',
      'New announcement in ' || COALESCE(event_name, 'your event') || ': ' || LEFT(NEW.title, 50),
      'announcement',
      NEW.id,
      false
    );
  END LOOP;
  
  RETURN NEW;
END;
$function$;

-- Function to create schedule update notifications
CREATE OR REPLACE FUNCTION create_schedule_update_notification()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
  participant_record RECORD;
  event_name text;
  notification_message text;
BEGIN
  -- Get event name
  SELECT name INTO event_name 
  FROM events 
  WHERE id = NEW.event_id;
  
  -- Determine if it's a new item or update
  IF TG_OP = 'INSERT' THEN
    notification_message := 'New schedule item added: ' || LEFT(NEW.title, 50);
  ELSE
    notification_message := 'Schedule item updated: ' || LEFT(NEW.title, 50);
  END IF;
  
  -- Create notifications for all event participants
  FOR participant_record IN 
    SELECT user_id 
    FROM event_participants 
    WHERE event_id = NEW.event_id
  LOOP
    INSERT INTO notifications (
      user_id,
      title,
      message,
      type,
      related_id,
      is_read
    ) VALUES (
      participant_record.user_id,
      'Schedule Update',
      notification_message || ' in ' || COALESCE(event_name, 'your event'),
      'schedule_update',
      NEW.id,
      false
    );
  END LOOP;
  
  RETURN NEW;
END;
$function$;

-- Function to create facility update notifications
CREATE OR REPLACE FUNCTION create_facility_update_notification()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
  participant_record RECORD;
  event_name text;
  notification_message text;
BEGIN
  -- Get event name
  SELECT name INTO event_name 
  FROM events 
  WHERE id = NEW.event_id;
  
  -- Determine if it's a new facility or update
  IF TG_OP = 'INSERT' THEN
    notification_message := 'New facility added: ' || LEFT(NEW.name, 50);
  ELSE
    notification_message := 'Facility updated: ' || LEFT(NEW.name, 50);
  END IF;
  
  -- Create notifications for all event participants
  FOR participant_record IN 
    SELECT user_id 
    FROM event_participants 
    WHERE event_id = NEW.event_id
  LOOP
    INSERT INTO notifications (
      user_id,
      title,
      message,
      type,
      related_id,
      is_read
    ) VALUES (
      participant_record.user_id,
      'Facility Update',
      notification_message || ' in ' || COALESCE(event_name, 'your event'),
      'facility_update',
      NEW.id,
      false
    );
  END LOOP;
  
  RETURN NEW;
END;
$function$;

-- Function to create poll notifications
CREATE OR REPLACE FUNCTION create_poll_notification()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
  participant_record RECORD;
  event_name text;
BEGIN
  -- Get event name
  SELECT name INTO event_name 
  FROM events 
  WHERE id = NEW.event_id;
  
  -- Create notifications for all event participants
  FOR participant_record IN 
    SELECT user_id 
    FROM event_participants 
    WHERE event_id = NEW.event_id
  LOOP
    INSERT INTO notifications (
      user_id,
      title,
      message,
      type,
      related_id,
      is_read
    ) VALUES (
      participant_record.user_id,
      'New Poll',
      'New poll available in ' || COALESCE(event_name, 'your event') || ': ' || LEFT(NEW.question, 50),
      'poll_created',
      NEW.id,
      false
    );
  END LOOP;
  
  RETURN NEW;
END;
$function$;

-- Create triggers for direct messages
DROP TRIGGER IF EXISTS trigger_direct_message_notification ON direct_messages;
CREATE TRIGGER trigger_direct_message_notification
  AFTER INSERT ON direct_messages
  FOR EACH ROW EXECUTE FUNCTION create_direct_message_notification();

-- Create triggers for group chat messages
DROP TRIGGER IF EXISTS trigger_group_chat_notification ON chat_messages;
CREATE TRIGGER trigger_group_chat_notification
  AFTER INSERT ON chat_messages
  FOR EACH ROW EXECUTE FUNCTION create_group_chat_notification();

-- Create triggers for connection acceptance
DROP TRIGGER IF EXISTS trigger_connection_accepted_notification ON connections;
CREATE TRIGGER trigger_connection_accepted_notification
  AFTER UPDATE ON connections
  FOR EACH ROW EXECUTE FUNCTION create_connection_accepted_notification();

-- Create triggers for announcements
DROP TRIGGER IF EXISTS trigger_announcement_notification ON announcements;
CREATE TRIGGER trigger_announcement_notification
  AFTER INSERT ON announcements
  FOR EACH ROW EXECUTE FUNCTION create_announcement_notification();

-- Create triggers for schedule updates
DROP TRIGGER IF EXISTS trigger_schedule_insert_notification ON schedule_items;
CREATE TRIGGER trigger_schedule_insert_notification
  AFTER INSERT ON schedule_items
  FOR EACH ROW EXECUTE FUNCTION create_schedule_update_notification();

DROP TRIGGER IF EXISTS trigger_schedule_update_notification ON schedule_items;
CREATE TRIGGER trigger_schedule_update_notification
  AFTER UPDATE ON schedule_items
  FOR EACH ROW EXECUTE FUNCTION create_schedule_update_notification();

-- Create triggers for facility updates
DROP TRIGGER IF EXISTS trigger_facility_insert_notification ON facilities;
CREATE TRIGGER trigger_facility_insert_notification
  AFTER INSERT ON facilities
  FOR EACH ROW EXECUTE FUNCTION create_facility_update_notification();

DROP TRIGGER IF EXISTS trigger_facility_update_notification ON facilities;
CREATE TRIGGER trigger_facility_update_notification
  AFTER UPDATE ON facilities
  FOR EACH ROW EXECUTE FUNCTION create_facility_update_notification();

-- Create triggers for poll creation
DROP TRIGGER IF EXISTS trigger_poll_notification ON polls;
CREATE TRIGGER trigger_poll_notification
  AFTER INSERT ON polls
  FOR EACH ROW EXECUTE FUNCTION create_poll_notification();

-- Enable realtime for notifications table
ALTER TABLE notifications REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;