-- Update the join_event_by_access_key function to prevent admins from joining events
CREATE OR REPLACE FUNCTION public.join_event_by_access_key(access_code text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  host_profile profiles%ROWTYPE;
  target_event events%ROWTYPE;
  current_user_id uuid;
  current_user_role text;
  result json;
BEGIN
  -- Get current user
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'User not authenticated');
  END IF;

  -- Get current user's role
  SELECT role INTO current_user_role 
  FROM profiles 
  WHERE id = current_user_id;

  -- Prevent admins/hosts from joining events
  IF current_user_role = 'host' THEN
    RETURN json_build_object(
      'success', false, 
      'message', 'Admin accounts cannot join events. Please sign out to join as an attendee.'
    );
  END IF;

  -- Find the host with this access key
  SELECT * INTO host_profile 
  FROM profiles 
  WHERE access_key = access_code AND role = 'host';
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'message', 'Invalid access code');
  END IF;

  -- Find the most recent event for this host
  SELECT * INTO target_event
  FROM events 
  WHERE host_id = host_profile.id
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'message', 'No events found for this host');
  END IF;

  -- Add user to event participants if not already added
  INSERT INTO event_participants (event_id, user_id, joined_at)
  VALUES (target_event.id, current_user_id, now())
  ON CONFLICT (event_id, user_id) DO NOTHING;

  -- Update user's current event and ensure they're an attendee
  -- This ensures consistency between event_participants and profiles.current_event_id
  UPDATE profiles 
  SET 
    current_event_id = target_event.id,
    role = 'attendee'
  WHERE id = current_user_id;

  RETURN json_build_object(
    'success', true, 
    'message', 'Successfully joined event',
    'event_id', target_event.id,
    'event_name', target_event.name
  );
END;
$$;