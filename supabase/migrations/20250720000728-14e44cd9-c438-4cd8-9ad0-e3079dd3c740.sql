
-- Add team_member role to the existing role enum (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role' AND typelem = 0) THEN
        CREATE TYPE user_role AS ENUM ('host', 'attendee', 'team_member');
    ELSE
        -- Add team_member to existing enum if it doesn't exist
        BEGIN
            ALTER TYPE user_role ADD VALUE 'team_member';
        EXCEPTION
            WHEN duplicate_object THEN NULL;
        END;
    END IF;
END $$;

-- Update profiles table to use the enum (if column exists as text)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'profiles' AND column_name = 'role' 
               AND data_type = 'text') THEN
        -- Convert text role column to enum
        ALTER TABLE profiles ALTER COLUMN role TYPE user_role USING role::user_role;
    END IF;
END $$;

-- Ensure team_members table has proper constraints
ALTER TABLE team_members 
ADD CONSTRAINT team_members_active_expires_check 
CHECK (NOT is_active OR expires_at IS NULL OR expires_at > created_at);

-- Create index for better performance on team member lookups
CREATE INDEX IF NOT EXISTS idx_team_members_user_event_active 
ON team_members(user_id, event_id, is_active) 
WHERE is_active = true;

-- Create index for profile current_event_id lookups
CREATE INDEX IF NOT EXISTS idx_profiles_current_event 
ON profiles(current_event_id) 
WHERE current_event_id IS NOT NULL;

-- Update RLS policies for team members
DROP POLICY IF EXISTS "Team members can access admin features" ON events;
CREATE POLICY "Team members can access admin features" 
ON events FOR SELECT 
TO authenticated 
USING (
  host_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM team_members tm 
    WHERE tm.user_id = auth.uid() 
    AND tm.event_id = events.id 
    AND tm.is_active = true 
    AND (tm.expires_at IS NULL OR tm.expires_at > now())
  )
);

-- Ensure team members can view their assigned events
DROP POLICY IF EXISTS "Team members can view assigned events" ON team_members;
CREATE POLICY "Team members can view assigned events" 
ON team_members FOR SELECT 
TO authenticated 
USING (user_id = auth.uid());
