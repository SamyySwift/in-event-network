
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function useTeamMemberAuth() {
  const { currentUser, updateUser } = useAuth();
  const [isTeamMember, setIsTeamMember] = useState(false);
  const [teamMemberEvent, setTeamMemberEvent] = useState<string | null>(null);
  const [allowedSections, setAllowedSections] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    checkTeamMemberStatus();
  }, [currentUser]);

  const checkTeamMemberStatus = async () => {
    if (!currentUser) return;

    try {
      // Check if user is an active team member
      const { data: teamMemberData, error } = await supabase
        .from('team_members')
        .select('event_id, allowed_sections, is_active, expires_at')
        .eq('user_id', currentUser.id)
        .eq('is_active', true)
        .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString())
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking team member status:', error);
        setLoading(false);
        return;
      }

      if (teamMemberData) {
        setIsTeamMember(true);
        setTeamMemberEvent(teamMemberData.event_id);
        setAllowedSections(teamMemberData.allowed_sections || []);
        
        // Ensure user has correct role and current event
        if (currentUser.role !== 'team_member' || currentUser.current_event_id !== teamMemberData.event_id) {
          await updateUser({
            role: 'team_member',
            current_event_id: teamMemberData.event_id
          });
        }
      } else {
        setIsTeamMember(false);
        setTeamMemberEvent(null);
        setAllowedSections([]);
      }
    } catch (error) {
      console.error('Error in team member auth check:', error);
    } finally {
      setLoading(false);
    }
  };

  const acceptInvitation = async (invitationData: any) => {
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    try {
      // Check if team member record already exists
      const { data: existingMember } = await supabase
        .from('team_members')
        .select('id')
        .eq('user_id', currentUser.id)
        .eq('event_id', invitationData.event_id)
        .single();

      if (!existingMember) {
        // Create team member record
        const { error: memberError } = await supabase
          .from('team_members')
          .insert({
            user_id: currentUser.id,
            admin_id: invitationData.admin_id,
            event_id: invitationData.event_id,
            allowed_sections: invitationData.allowed_sections,
            expires_at: invitationData.expires_at,
            joined_at: new Date().toISOString(),
            is_active: true,
          });

        if (memberError) throw memberError;
      }

      // Update profile with team member role and current event
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          role: 'team_member',
          current_event_id: invitationData.event_id,
          team_member_for_event: invitationData.event_id 
        })
        .eq('id', currentUser.id);

      if (profileError) throw profileError;

      // Mark invitation as accepted
      const { error: inviteError } = await supabase
        .from('team_invitations')
        .update({ 
          status: 'accepted',
          updated_at: new Date().toISOString()
        })
        .eq('id', invitationData.id);

      if (inviteError) throw inviteError;

      // Update local state
      await updateUser({
        role: 'team_member',
        current_event_id: invitationData.event_id
      });

      // Refresh team member status
      await checkTeamMemberStatus();

      return { success: true };
    } catch (error: any) {
      console.error('Error accepting invitation:', error);
      throw error;
    }
  };

  return {
    isTeamMember,
    teamMemberEvent,
    allowedSections,
    loading,
    acceptInvitation,
    checkTeamMemberStatus
  };
}
