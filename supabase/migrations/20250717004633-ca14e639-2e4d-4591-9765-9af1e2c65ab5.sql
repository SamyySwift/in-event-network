
-- Create enum for dashboard sections
CREATE TYPE dashboard_section AS ENUM (
  'dashboard',
  'events', 
  'tickets',
  'checkin',
  'attendees',
  'speakers',
  'announcements',
  'schedule',
  'polls',
  'facilities',
  'rules',
  'questions',
  'suggestions',
  'notifications',
  'sponsors',
  'vendor-hub',
  'settings'
);

-- Create team_invitations table
CREATE TABLE team_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  allowed_sections dashboard_section[] NOT NULL DEFAULT '{}',
  expires_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'revoked')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(admin_id, email, event_id)
);

-- Create team_members table
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  allowed_sections dashboard_section[] NOT NULL DEFAULT '{}',
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  invited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  joined_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, event_id)
);

-- Add team_member role to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS team_member_for_event UUID REFERENCES events(id);

-- Enable RLS
ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for team_invitations
CREATE POLICY "Admins can manage their team invitations"
  ON team_invitations
  FOR ALL
  USING (admin_id = auth.uid());

CREATE POLICY "Public can view valid invitations by token"
  ON team_invitations
  FOR SELECT
  USING (status = 'pending' AND (expires_at IS NULL OR expires_at > now()));

-- RLS Policies for team_members
CREATE POLICY "Admins can manage their team members"
  ON team_members
  FOR ALL
  USING (admin_id = auth.uid());

CREATE POLICY "Team members can view their own record"
  ON team_members
  FOR SELECT
  USING (user_id = auth.uid());

-- Function to generate unique invite token
CREATE OR REPLACE FUNCTION generate_invite_token()
RETURNS TEXT AS $$
DECLARE
  token TEXT;
  exists_check BOOLEAN;
BEGIN
  LOOP
    token := encode(gen_random_bytes(32), 'base64url');
    SELECT EXISTS(SELECT 1 FROM team_invitations WHERE token = token) INTO exists_check;
    IF NOT exists_check THEN
      RETURN token;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user is admin for event
CREATE OR REPLACE FUNCTION is_admin_for_event(event_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM events 
    WHERE id = event_uuid AND host_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check team member permissions
CREATE OR REPLACE FUNCTION has_section_access(section_name TEXT, target_event_id UUID DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
  current_event UUID;
  member_sections dashboard_section[];
BEGIN
  -- Get user role and current event
  SELECT role, current_event_id INTO user_role, current_event
  FROM profiles WHERE id = auth.uid();
  
  -- Use target_event_id if provided, otherwise use current_event
  current_event := COALESCE(target_event_id, current_event);
  
  -- Full admins (hosts) have access to everything
  IF user_role = 'host' THEN
    RETURN TRUE;
  END IF;
  
  -- Check if user is a team member with access to this section
  SELECT allowed_sections INTO member_sections
  FROM team_members 
  WHERE user_id = auth.uid() 
    AND event_id = current_event
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > now());
    
  IF member_sections IS NOT NULL THEN
    RETURN section_name::dashboard_section = ANY(member_sections);
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update trigger for team_invitations
CREATE OR REPLACE FUNCTION update_team_invitations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER team_invitations_updated_at
  BEFORE UPDATE ON team_invitations
  FOR EACH ROW EXECUTE FUNCTION update_team_invitations_updated_at();

-- Update trigger for team_members  
CREATE OR REPLACE FUNCTION update_team_members_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER team_members_updated_at
  BEFORE UPDATE ON team_members
  FOR EACH ROW EXECUTE FUNCTION update_team_members_updated_at();
