CREATE OR REPLACE FUNCTION public.join_event_by_access_key(access_code text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_event events%ROWTYPE;
  current_user_id uuid;
  current_user_role text;
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

  -- FIRST: Try to find event directly by event_key (QR code flow)
  SELECT * INTO target_event
  FROM events 
  WHERE event_key = access_code;
  
  -- FALLBACK: If not found by event_key, try to find host by access_key
  IF NOT FOUND THEN
    SELECT e.* INTO target_event
    FROM events e
    JOIN profiles p ON e.host_id = p.id
    WHERE p.access_key = access_code AND p.role = 'host'
    ORDER BY e.created_at DESC
    LIMIT 1;
  END IF;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'message', 'Invalid access code');
  END IF;

  -- Add user to event participants if not already added
  INSERT INTO event_participants (event_id, user_id, joined_at)
  VALUES (target_event.id, current_user_id, now())
  ON CONFLICT (event_id, user_id) DO NOTHING;

  -- Update user's current event
  UPDATE profiles 
  SET 
    current_event_id = target_event.id,
    role = CASE 
      WHEN public.is_admin_role(role) THEN role
      ELSE 'attendee'
    END
  WHERE id = current_user_id;

  RETURN json_build_object(
    'success', true, 
    'message', 'Successfully joined event',
    'event_id', target_event.id,
    'event_name', target_event.name
  );
END;
$$;