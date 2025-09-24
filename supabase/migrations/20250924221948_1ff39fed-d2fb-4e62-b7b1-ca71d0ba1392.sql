-- 1) Helpers to detect admin roles
CREATE OR REPLACE FUNCTION public.is_admin_role(role_text text)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT lower(coalesce(role_text, '')) IN ('host','admin','organizer');
$$;

CREATE OR REPLACE FUNCTION public.is_admin_user(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_admin_role(role) FROM public.profiles WHERE id = user_uuid;
$$;

-- 2) Prevent accidental admin role downgrades at the DB layer
CREATE OR REPLACE FUNCTION public.prevent_admin_role_downgrade()
RETURNS trigger
LANGUAGE plpgsql
AS $fn$
BEGIN
  IF public.is_admin_role(OLD.role) AND NOT public.is_admin_role(NEW.role) THEN
    -- Keep the existing admin role; avoid silent downgrades
    NEW.role := OLD.role;
  END IF;
  RETURN NEW;
END;
$fn$;

DROP TRIGGER IF EXISTS trg_prevent_admin_role_downgrade ON public.profiles;
CREATE TRIGGER trg_prevent_admin_role_downgrade
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_admin_role_downgrade();

-- 3) Update join_event_by_access_key to not downgrade admin roles
CREATE OR REPLACE FUNCTION public.join_event_by_access_key(access_code text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
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

  -- Update user's current event and only set role to attendee if user is not admin already
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
$function$;

-- 4) Update grant_attendee_dashboard_access to not downgrade admin roles
CREATE OR REPLACE FUNCTION public.grant_attendee_dashboard_access(attendee_user_id uuid, target_event_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
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

  -- Update user's current event and only set role to attendee if user is not admin already
  UPDATE profiles 
  SET 
    current_event_id = target_event_id,
    role = CASE 
      WHEN public.is_admin_role(role) THEN role
      ELSE 'attendee'
    END
  WHERE id = attendee_user_id;

  RETURN json_build_object(
    'success', true, 
    'message', 'Successfully granted dashboard access',
    'event_id', target_event_id
  );
END;
$function$;