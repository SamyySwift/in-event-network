-- Fix role for mj@gmail.com user who should be admin/host
UPDATE profiles 
SET role = 'host' 
WHERE email = 'mj@gmail.com';

-- Also let's add some helpful functions for debugging role issues in the future
CREATE OR REPLACE FUNCTION public.debug_user_role(user_email text)
RETURNS TABLE(
  user_id uuid,
  email text,
  role text,
  name text,
  created_at timestamptz
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT id, email, role, name, created_at 
  FROM profiles 
  WHERE email = user_email;
$$;

-- Function to safely update user roles (can be called by admins)
CREATE OR REPLACE FUNCTION public.admin_update_user_role(
  target_email text,
  new_role text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_user profiles%ROWTYPE;
  current_user_role text;
BEGIN
  -- Check if current user is a host/admin
  SELECT role INTO current_user_role 
  FROM profiles 
  WHERE id = auth.uid();
  
  IF current_user_role != 'host' THEN
    RETURN json_build_object('success', false, 'message', 'Only hosts can update user roles');
  END IF;
  
  -- Validate the new role
  IF new_role NOT IN ('host', 'attendee') THEN
    RETURN json_build_object('success', false, 'message', 'Invalid role. Must be host or attendee');
  END IF;
  
  -- Update the user role
  UPDATE profiles 
  SET role = new_role, updated_at = now()
  WHERE email = target_email
  RETURNING * INTO updated_user;
  
  IF updated_user.id IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'User not found');
  END IF;
  
  RETURN json_build_object(
    'success', true, 
    'message', 'Role updated successfully',
    'user', json_build_object(
      'id', updated_user.id,
      'email', updated_user.email,
      'role', updated_user.role,
      'name', updated_user.name
    )
  );
END;
$$;