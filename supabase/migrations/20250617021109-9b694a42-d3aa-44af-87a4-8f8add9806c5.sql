
-- Create a function to get event attendees with their profile information
CREATE OR REPLACE FUNCTION get_event_attendees_with_profiles(p_event_id uuid)
RETURNS TABLE (
  id uuid,
  event_id uuid,
  user_id uuid,
  created_at timestamptz,
  joined_at timestamptz,
  name text,
  email text,
  role text,
  event_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ep.id,
    ep.event_id,
    ep.user_id,
    ep.created_at,
    ep.joined_at,
    p.name,
    p.email,
    p.role,
    e.name as event_name
  FROM event_participants ep
  LEFT JOIN profiles p ON ep.user_id = p.id
  LEFT JOIN events e ON ep.event_id = e.id
  WHERE ep.event_id = p_event_id;
END;
$$;
