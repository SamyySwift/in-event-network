
-- Update create_question_notification() to use 'general' as notification type
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
      'general',
      NEW.id,
      false
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Update create_attendee_join_notification() to use 'general' as notification type
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
      'general',
      NEW.event_id,
      false
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Update create_poll_vote_notification() to use 'general' as notification type
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
        'general',
        NEW.poll_id,
        false
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;
