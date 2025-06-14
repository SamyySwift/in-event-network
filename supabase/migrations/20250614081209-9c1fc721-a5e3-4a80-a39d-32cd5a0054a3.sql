
-- Create function to notify admin when new attendees join
CREATE OR REPLACE FUNCTION public.create_attendee_join_notification()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
  admin_id uuid;
  attendee_name text;
  event_name text;
BEGIN
  -- Get the event host (admin) ID
  SELECT host_id INTO admin_id 
  FROM events 
  WHERE id = NEW.event_id;
  
  -- Get attendee name
  SELECT name INTO attendee_name 
  FROM profiles 
  WHERE id = NEW.user_id;
  
  -- Get event name
  SELECT name INTO event_name 
  FROM events 
  WHERE id = NEW.event_id;
  
  -- Create notification for admin
  IF admin_id IS NOT NULL THEN
    INSERT INTO notifications (
      user_id,
      title,
      message,
      type,
      related_id,
      is_read
    ) VALUES (
      admin_id,
      'New Attendee Joined',
      COALESCE(attendee_name, 'Someone') || ' has joined ' || COALESCE(event_name, 'your event'),
      'info',
      NEW.event_id,
      false
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create trigger for attendee joins
DROP TRIGGER IF EXISTS attendee_join_notification_trigger ON event_participants;
CREATE TRIGGER attendee_join_notification_trigger
  AFTER INSERT ON event_participants
  FOR EACH ROW EXECUTE FUNCTION create_attendee_join_notification();

-- Create function to notify admin when new questions are asked
CREATE OR REPLACE FUNCTION public.create_question_notification()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
  admin_id uuid;
  attendee_name text;
  event_name text;
BEGIN
  -- Get the event host (admin) ID
  SELECT host_id INTO admin_id 
  FROM events 
  WHERE id = NEW.event_id;
  
  -- Get attendee name (only if not anonymous)
  IF NOT NEW.is_anonymous THEN
    SELECT name INTO attendee_name 
    FROM profiles 
    WHERE id = NEW.user_id;
  END IF;
  
  -- Get event name
  SELECT name INTO event_name 
  FROM events 
  WHERE id = NEW.event_id;
  
  -- Create notification for admin
  IF admin_id IS NOT NULL THEN
    INSERT INTO notifications (
      user_id,
      title,
      message,
      type,
      related_id,
      is_read
    ) VALUES (
      admin_id,
      'New Question Posted',
      CASE 
        WHEN NEW.is_anonymous THEN 'An anonymous attendee has posted a new question'
        ELSE COALESCE(attendee_name, 'Someone') || ' has posted a new question'
      END || ' in ' || COALESCE(event_name, 'your event'),
      'info',
      NEW.id,
      false
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create trigger for new questions
DROP TRIGGER IF EXISTS question_notification_trigger ON questions;
CREATE TRIGGER question_notification_trigger
  AFTER INSERT ON questions
  FOR EACH ROW EXECUTE FUNCTION create_question_notification();

-- Create function to notify admin when polls are voted on
CREATE OR REPLACE FUNCTION public.create_poll_vote_notification()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
  admin_id uuid;
  voter_name text;
  poll_question text;
  event_id uuid;
BEGIN
  -- Get poll details and event info
  SELECT p.question, p.event_id INTO poll_question, event_id
  FROM polls p
  WHERE p.id = NEW.poll_id;
  
  -- Get the event host (admin) ID
  SELECT host_id INTO admin_id 
  FROM events 
  WHERE id = event_id;
  
  -- Get voter name
  SELECT name INTO voter_name 
  FROM profiles 
  WHERE id = NEW.user_id;
  
  -- Create notification for admin (limit to avoid spam - only notify on first few votes)
  IF admin_id IS NOT NULL THEN
    -- Check if this is among the first 5 votes for this poll
    IF (SELECT COUNT(*) FROM poll_votes WHERE poll_id = NEW.poll_id) <= 5 THEN
      INSERT INTO notifications (
        user_id,
        title,
        message,
        type,
        related_id,
        is_read
      ) VALUES (
        admin_id,
        'New Poll Vote',
        COALESCE(voter_name, 'Someone') || ' voted on your poll: ' || LEFT(COALESCE(poll_question, 'Poll'), 50) || CASE WHEN LENGTH(poll_question) > 50 THEN '...' ELSE '' END,
        'info',
        NEW.poll_id,
        false
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create trigger for poll votes
DROP TRIGGER IF EXISTS poll_vote_notification_trigger ON poll_votes;
CREATE TRIGGER poll_vote_notification_trigger
  AFTER INSERT ON poll_votes
  FOR EACH ROW EXECUTE FUNCTION create_poll_vote_notification();

-- Add RLS policies for notifications table
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;

-- Create policies for notifications
CREATE POLICY "Users can view their own notifications" 
  ON notifications 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
  ON notifications 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" 
  ON notifications 
  FOR INSERT 
  WITH CHECK (true);
