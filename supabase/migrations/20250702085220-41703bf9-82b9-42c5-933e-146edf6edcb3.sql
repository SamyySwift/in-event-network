-- Create function for admin-initiated attendee dashboard access
CREATE OR REPLACE FUNCTION public.grant_attendee_dashboard_access(
  attendee_user_id uuid,
  target_event_id uuid
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_admin_id uuid;
  result json;
BEGIN
  -- Get current admin user
  current_admin_id := auth.uid();
  
  IF current_admin_id IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'Admin not authenticated');
  END IF;

  -- Verify admin owns this event
  IF NOT EXISTS (
    SELECT 1 FROM events 
    WHERE id = target_event_id AND host_id = current_admin_id
  ) THEN
    RETURN json_build_object('success', false, 'message', 'Admin does not own this event');
  END IF;

  -- Verify attendee user exists
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = attendee_user_id
  ) THEN
    RETURN json_build_object('success', false, 'message', 'Attendee user not found');
  END IF;

  -- Add user to event participants if not already added
  INSERT INTO event_participants (event_id, user_id, joined_at)
  VALUES (target_event_id, attendee_user_id, now())
  ON CONFLICT (event_id, user_id) DO NOTHING;

  -- Update user's current event to ensure they have dashboard access
  UPDATE profiles 
  SET 
    current_event_id = target_event_id,
    role = 'attendee'
  WHERE id = attendee_user_id;

  RETURN json_build_object(
    'success', true, 
    'message', 'Successfully granted dashboard access',
    'event_id', target_event_id
  );
END;
$$;