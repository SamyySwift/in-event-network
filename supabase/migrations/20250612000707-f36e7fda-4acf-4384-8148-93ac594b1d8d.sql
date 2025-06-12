
-- Fix existing data inconsistencies between event_participants and profiles.current_event_id
-- Update profiles.current_event_id to match the most recent event from event_participants
UPDATE profiles 
SET current_event_id = (
  SELECT ep.event_id 
  FROM event_participants ep 
  WHERE ep.user_id = profiles.id 
  ORDER BY ep.joined_at DESC 
  LIMIT 1
)
WHERE id IN (
  SELECT DISTINCT user_id 
  FROM event_participants
);

-- Create a trigger to keep profiles.current_event_id synchronized with event_participants
CREATE OR REPLACE FUNCTION sync_current_event_on_join()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the user's current_event_id when they join an event
  UPDATE profiles 
  SET current_event_id = NEW.event_id 
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger that fires when a user joins an event
DROP TRIGGER IF EXISTS sync_current_event_trigger ON event_participants;
CREATE TRIGGER sync_current_event_trigger
  AFTER INSERT ON event_participants
  FOR EACH ROW
  EXECUTE FUNCTION sync_current_event_on_join();

-- Add validation trigger to prevent inconsistencies
CREATE OR REPLACE FUNCTION validate_event_consistency()
RETURNS TRIGGER AS $$
BEGIN
  -- When updating current_event_id, ensure user is actually a participant
  IF NEW.current_event_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM event_participants 
      WHERE user_id = NEW.id AND event_id = NEW.current_event_id
    ) THEN
      RAISE EXCEPTION 'User must be a participant in the event before setting as current event';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create validation trigger for profiles table
DROP TRIGGER IF EXISTS validate_current_event_trigger ON profiles;
CREATE TRIGGER validate_current_event_trigger
  BEFORE UPDATE OF current_event_id ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION validate_event_consistency();
