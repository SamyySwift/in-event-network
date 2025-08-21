-- Update the handle_new_user function to respect the role from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Extract role from metadata, default to 'attendee' if not specified
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data->>'name', 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'attendee')
  );
  RETURN NEW;
END;
$$;